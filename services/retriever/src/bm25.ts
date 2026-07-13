import type { KnowledgeNode } from '@career-os/ontology';
import { tokenize } from './tokenize.js';

// ---------------------------------------------------------------------------
// BM25 — lexical search over the Knowledge Graph nodes.
//
// Per ADR-0005, BM25's job in the hybrid pipeline is catching niche keywords
// (acronyms, specific tool names) that Metadata Lookup and Graph Traversal
// might miss. We index at the NODE level (name + aliases + tags + body.raw),
// not the section level, so this is unaffected by the currently-empty
// `section.content` bug in the compiler's parser.
//
// Standard Robertson/Sparck-Jones BM25 with the conventional defaults
// (k1 = 1.5, b = 0.75) used by Lucene/Elasticsearch.
// ---------------------------------------------------------------------------

export interface Bm25Options {
  k1?: number;
  b?: number;
}

export interface Bm25Match {
  nodeId: string;
  score: number;
}

interface IndexedDocument {
  nodeId: string;
  termFrequency: Map<string, number>;
  length: number;
}

const DEFAULTS: Required<Bm25Options> = { k1: 1.5, b: 0.75 };

function documentText(node: KnowledgeNode<any>): string {
  const aliases = node.metadata.aliases ?? [];
  const tags = node.metadata.tags ?? [];
  return [node.name, ...aliases, ...tags, node.body.raw].join(' ');
}

export class Bm25Index {
  private readonly options: Required<Bm25Options>;
  private readonly documents: IndexedDocument[] = [];
  private readonly documentFrequency = new Map<string, number>();
  private averageLength = 0;

  constructor(nodes: KnowledgeNode<any>[], options: Bm25Options = {}) {
    this.options = { ...DEFAULTS, ...options };
    this.build(nodes);
  }

  private build(nodes: KnowledgeNode<any>[]): void {
    let totalLength = 0;

    for (const node of nodes) {
      const tokens = tokenize(documentText(node));
      const termFrequency = new Map<string, number>();
      for (const token of tokens) {
        termFrequency.set(token, (termFrequency.get(token) ?? 0) + 1);
      }

      this.documents.push({ nodeId: node.id, termFrequency, length: tokens.length });
      totalLength += tokens.length;

      for (const term of termFrequency.keys()) {
        this.documentFrequency.set(term, (this.documentFrequency.get(term) ?? 0) + 1);
      }
    }

    this.averageLength = this.documents.length > 0 ? totalLength / this.documents.length : 0;
  }

  private inverseDocumentFrequency(term: string): number {
    const n = this.documents.length;
    const df = this.documentFrequency.get(term) ?? 0;
    // BM25 IDF with +1 smoothing to keep the score non-negative even when df == n.
    return Math.log((n - df + 0.5) / (df + 0.5) + 1);
  }

  /** Returns nodes matching `query`, ranked by BM25 score descending. Zero-score docs are omitted. */
  search(query: string, topK = 10): Bm25Match[] {
    const queryTerms = tokenize(query);
    if (queryTerms.length === 0 || this.documents.length === 0) return [];

    const { k1, b } = this.options;
    const results: Bm25Match[] = [];

    for (const doc of this.documents) {
      let score = 0;
      for (const term of queryTerms) {
        const tf = doc.termFrequency.get(term) ?? 0;
        if (tf === 0) continue;
        const idf = this.inverseDocumentFrequency(term);
        const numerator = tf * (k1 + 1);
        const denominator = tf + k1 * (1 - b + b * (doc.length / (this.averageLength || 1)));
        score += idf * (numerator / denominator);
      }
      if (score > 0) results.push({ nodeId: doc.nodeId, score });
    }

    return results.sort((a, b2) => b2.score - a.score).slice(0, topK);
  }
}
