import type { KnowledgeGraph, KnowledgeNode } from '@career-os/ontology';
import { buildAdjacency, personalizedPageRank } from '@career-os/graph';
import type { Adjacency } from '@career-os/graph';
import { MetadataIndex } from './metadataLookup.js';
import type { MetadataMatch } from './metadataLookup.js';
import { Bm25Index } from './bm25.js';
import { fuseRankings } from './rrf.js';
import type { RankedList } from './rrf.js';

// ---------------------------------------------------------------------------
// retrieve() — the Hybrid Retrieval orchestrator implementing Progressive
// Certainty Retrieval end to end (ADR-0004, ADR-0005, ADR-0006):
//
//   Query -> Metadata Lookup (anchor) -> Graph PPR (expand) -> BM25 (lexical)
//         -> [optional: Vector Search] -> Reciprocal Rank Fusion
//         -> ranked KnowledgeNode[] with explanation
//
// Vector Search is optional and async (it calls out to an embedding API +
// Qdrant), so it's exposed as a separate `retrieveHybrid()` method. The
// synchronous `retrieve()` — Metadata + Graph + BM25 only — stays available
// for callers (and tests) that don't need or want the network round-trip.
// ---------------------------------------------------------------------------

export interface RetrievalExplanation {
  nodeId: string;
  score: number;
  /** Human-readable reasons this node was retrieved, one per contributing engine. */
  reasons: string[];
  /** Engines that contributed to this node's fused score (for ConversationIR / logs). */
  engines: RankedList['engine'][];
}

export interface RetrieveResult {
  node: KnowledgeNode<any>;
  explanation: RetrievalExplanation;
}

/** Per-engine raw matches before fusion — used by query logs, ConversationIR, and the Runtime Trace UI. */
export interface RetrievalBreakdown {
  metadata: MetadataMatch[];
  graph: { nodeId: string; score: number }[];
  bm25: { nodeId: string; score: number }[];
  vector: { nodeId: string; score: number }[];
}

export interface RetrieveOutcome {
  results: RetrieveResult[];
  retrieval: RetrievalBreakdown;
}

export interface RetrieveOptions {
  /** Max number of results to return. Default 10. */
  topK?: number;
  /** Max number of BM25 candidates considered before fusion. Default 20. */
  bm25TopK?: number;
  /** Max number of graph PPR candidates considered before fusion. Default 20. */
  graphTopK?: number;
  /**
   * Node IDs carried over from the previous turn's focus (session context).
   * Seeded into PPR alongside metadata anchors and fused as the `context` engine.
   */
  carryOverNodeIds?: string[];
}

/** Structurally-typed so @career-os/retriever doesn't need a hard dependency on @career-os/embedding. */
export interface TextEmbedder {
  embed(text: string): Promise<number[]>;
}

/** Structurally-typed so @career-os/retriever's public API doesn't leak the QdrantVectorIndex type directly. */
export interface VectorSearcher {
  search(vector: number[], topK?: number): Promise<{ nodeId: string; score: number }[]>;
}

export interface HybridRetrieveOptions extends RetrieveOptions {
  /** Max number of vector search candidates considered before fusion. Default 20. */
  vectorTopK?: number;
}

const DEFAULTS = { topK: 10, bm25TopK: 20, graphTopK: 20 } as const;

interface RankedLists {
  metadataMatches: MetadataMatch[];
  metadataList: RankedList;
  graphList: RankedList;
  graphScored: { nodeId: string; score: number }[];
  bm25List: RankedList;
  bm25Scored: { nodeId: string; score: number }[];
  contextList: RankedList;
}

export class Retriever {
  private readonly nodesById: Map<string, KnowledgeNode<any>>;
  private readonly adjacency: Adjacency;
  private readonly metadataIndex: MetadataIndex;
  private readonly bm25Index: Bm25Index;

  constructor(private readonly graph: KnowledgeGraph) {
    this.nodesById = new Map(graph.nodes.map((n) => [n.id, n]));
    this.adjacency = buildAdjacency(graph);
    this.metadataIndex = new MetadataIndex(graph.nodes);
    this.bm25Index = new Bm25Index(graph.nodes);
  }

  /** Deterministic path only: Metadata Lookup + Graph PPR + BM25. No network calls. */
  retrieve(query: string, options: RetrieveOptions = {}): RetrieveOutcome {
    const { topK } = { ...DEFAULTS, ...options };
    const {
      metadataMatches,
      metadataList,
      graphList,
      graphScored,
      bm25List,
      bm25Scored,
      contextList,
    } = this.computeRankedLists(query, options);

    const fused = fuseRankings([metadataList, graphList, bm25List, contextList]);
    return {
      results: this.toResults(fused, topK, metadataMatches),
      retrieval: {
        metadata: metadataMatches,
        graph: graphScored,
        bm25: bm25Scored,
        vector: [],
      },
    };
  }

  /**
   * Sync Metadata Lookup only — used by the ask pipeline to decide continuation
   * before choosing retrieve() / retrieveHybrid(), so carry-over never forces a
   * second embed + Qdrant round-trip.
   */
  checkAnchors(query: string): MetadataMatch[] {
    return this.metadataIndex.lookup(query);
  }

  /**
   * Full pipeline including Vector Search (ADR-0005). Requires an embedder
   * (to turn the query into a vector) and a vector searcher (Qdrant). If
   * either embedding or the vector search call fails, the error is not
   * swallowed — deterministic Metadata/Graph/BM25 results still won by
   * outranking fuzzy matches per ADR-0006, but a broken vector backend
   * should be visible to the caller rather than silently degrading.
   */
  async retrieveHybrid(
    query: string,
    embedder: TextEmbedder,
    vectorSearcher: VectorSearcher,
    options: HybridRetrieveOptions = {}
  ): Promise<RetrieveOutcome> {
    const { topK, vectorTopK = 20 } = { ...DEFAULTS, ...options };
    const {
      metadataMatches,
      metadataList,
      graphList,
      graphScored,
      bm25List,
      bm25Scored,
      contextList,
    } = this.computeRankedLists(query, options);

    const queryVector = await embedder.embed(query);
    const vectorMatches = await vectorSearcher.search(queryVector, vectorTopK);
    const vectorList: RankedList = { engine: 'vector', nodeIds: vectorMatches.map((m) => m.nodeId) };

    const fused = fuseRankings([metadataList, graphList, bm25List, vectorList, contextList]);
    return {
      results: this.toResults(fused, topK, metadataMatches),
      retrieval: {
        metadata: metadataMatches,
        graph: graphScored,
        bm25: bm25Scored,
        vector: vectorMatches,
      },
    };
  }

  private computeRankedLists(query: string, options: RetrieveOptions): RankedLists {
    const { bm25TopK, graphTopK, carryOverNodeIds = [] } = { ...DEFAULTS, ...options };

    // Step 1: Metadata Lookup (the deterministic anchor).
    const metadataMatches = this.metadataIndex.lookup(query);
    const metadataList: RankedList = { engine: 'metadata', nodeIds: metadataMatches.map((m) => m.nodeId) };

    // Session carry-over — only keep ids that still exist in the graph.
    const validCarryOver = carryOverNodeIds.filter((id) => this.nodesById.has(id));
    const contextList: RankedList = { engine: 'context', nodeIds: validCarryOver };

    // Step 2: Graph PPR, seeded from metadata anchors + carry-over focus.
    const seedIds = Array.from(
      new Set([...metadataMatches.map((m) => m.nodeId), ...validCarryOver]),
    );
    let graphList: RankedList = { engine: 'graph', nodeIds: [] };
    let graphScored: { nodeId: string; score: number }[] = [];
    if (seedIds.length > 0) {
      const { scores } = personalizedPageRank(this.adjacency, seedIds, {
        direction: 'bidirectional',
      });
      const seedSet = new Set(seedIds);
      graphScored = Array.from(scores.entries())
        .filter(([nodeId]) => !seedSet.has(nodeId)) // graph rank is for *expansion*, not re-ranking the seed itself
        .sort((a, b) => b[1] - a[1])
        .slice(0, graphTopK)
        .map(([nodeId, score]) => ({ nodeId, score }));
      graphList = { engine: 'graph', nodeIds: graphScored.map((g) => g.nodeId) };
    }

    // Step 3: BM25 lexical search (always runs, catches niche keywords).
    const bm25Matches = this.bm25Index.search(query, bm25TopK);
    const bm25List: RankedList = { engine: 'bm25', nodeIds: bm25Matches.map((m) => m.nodeId) };

    return {
      metadataMatches,
      metadataList,
      graphList,
      graphScored,
      bm25List,
      bm25Scored: bm25Matches,
      contextList,
    };
  }

  private toResults(
    fused: ReturnType<typeof fuseRankings>,
    topK: number,
    metadataMatches: MetadataMatch[]
  ): RetrieveResult[] {
    return fused
      .slice(0, topK)
      .map((result) => {
        const node = this.nodesById.get(result.nodeId);
        if (!node) return null;
        return {
          node,
          explanation: {
            nodeId: result.nodeId,
            score: result.score,
            reasons: result.contributions.map((c) => this.describeContribution(c, result.nodeId, metadataMatches)),
            engines: result.contributions.map((c) => c.engine),
          },
        };
      })
      .filter((r): r is RetrieveResult => r !== null);
  }

  private describeContribution(
    contribution: { engine: RankedList['engine']; rank: number; contribution: number },
    nodeId: string,
    metadataMatches: MetadataMatch[]
  ): string {
    switch (contribution.engine) {
      case 'metadata': {
        const match = metadataMatches.find((m) => m.nodeId === nodeId);
        return `matched ${match?.matchedField ?? 'metadata'} "${match?.matchedTerm ?? ''}" (rank ${contribution.rank})`;
      }
      case 'graph':
        return `reached via graph traversal from the anchor node (rank ${contribution.rank})`;
      case 'context':
        return `carried over as active focus from the previous turn (rank ${contribution.rank})`;
      case 'bm25':
        return `lexical keyword match (rank ${contribution.rank})`;
      case 'vector':
        return `semantic similarity match (rank ${contribution.rank})`;
      default:
        return `matched via ${contribution.engine} (rank ${contribution.rank})`;
    }
  }
}
