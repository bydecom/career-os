// ---------------------------------------------------------------------------
// Reciprocal Rank Fusion (RRF) — merges ranked lists from Metadata, Graph,
// BM25, and (eventually) Vector retrieval into one unified score.
//
// Implements the exact formula from ADR-0006:
//
//   FinalScore(N) = sum over engines of Weight_engine / (k + Rank_engine(N))
//
// Weights per ADR-0006: Metadata 4.0, Graph 3.0, BM25 1.0, Vector 1.0.
// Rank is 1-based (the top result of an engine has Rank = 1).
// ---------------------------------------------------------------------------

export type RetrievalEngine = 'metadata' | 'graph' | 'bm25' | 'vector' | 'context';

export const ENGINE_WEIGHTS: Record<RetrievalEngine, number> = {
  metadata: 4.0,
  /**
   * Session carry-over focus. Must outrank graph expansion of the same seed
   * (graph=3.0), otherwise PPR neighbors flood topK and the focus node itself
   * never enters retrieve results — budget cannot save what retrieval dropped.
   */
  context: 3.5,
  graph: 3.0,
  bm25: 1.0,
  vector: 1.0,
};

export interface RankedList {
  engine: RetrievalEngine;
  /** Node IDs in rank order (index 0 = rank 1, highest confidence/score first). */
  nodeIds: string[];
}

export interface FusedResult {
  nodeId: string;
  score: number;
  /** Which engines contributed to this node's score, and at what rank. */
  contributions: { engine: RetrievalEngine; rank: number; contribution: number }[];
}

export interface RrfOptions {
  /** RRF rank-offset constant. Default 60 (a common default from the RRF literature). */
  k?: number;
}

/**
 * Fuses multiple ranked lists into a single ranking using weighted RRF.
 * Nodes appearing in multiple lists accumulate score from each — this is
 * what makes RRF naturally boost cross-engine-verified nodes (ADR-0006).
 */
export function fuseRankings(rankedLists: RankedList[], options: RrfOptions = {}): FusedResult[] {
  const { k = 60 } = options;
  const scores = new Map<string, FusedResult>();

  for (const list of rankedLists) {
    const weight = ENGINE_WEIGHTS[list.engine];
    list.nodeIds.forEach((nodeId, index) => {
      const rank = index + 1;
      const contribution = weight / (k + rank);

      const existing = scores.get(nodeId);
      if (existing) {
        existing.score += contribution;
        existing.contributions.push({ engine: list.engine, rank, contribution });
      } else {
        scores.set(nodeId, {
          nodeId,
          score: contribution,
          contributions: [{ engine: list.engine, rank, contribution }],
        });
      }
    });
  }

  return Array.from(scores.values()).sort((a, b) => b.score - a.score);
}
