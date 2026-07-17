// ---------------------------------------------------------------------------
// Qdrant Vector Store — plain fetch against Qdrant's REST API. Zero SDK
// dependency, matching the rest of this monorepo's "zero unnecessary runtime
// deps" convention (see @career-os/ontology, @career-os/embedding).
//
// Docs: https://qdrant.tech/documentation/concepts/points/
// ---------------------------------------------------------------------------

export interface QdrantVectorIndexOptions {
  url: string;
  apiKey?: string;
  collection: string;
  /** Dimensionality of the vectors (768 for gemini-embedding-2 Matryoshka). */
  vectorSize: number;
}

export interface VectorPoint {
  /**
   * Qdrant point IDs must be an unsigned integer or UUID — arbitrary slugs
   * like "rabbitmq" are not accepted. Callers pass a stable numeric id
   * (e.g. the node's index in the compiled graph) alongside the real nodeId,
   * which is stored in the payload and is what `search()` returns.
   */
  id: number;
  nodeId: string;
  vector: number[];
}

export interface VectorMatch {
  nodeId: string;
  score: number;
}

export class QdrantVectorIndex {
  private readonly url: string;
  private readonly apiKey?: string;
  private readonly collection: string;
  private readonly vectorSize: number;

  constructor(options: QdrantVectorIndexOptions) {
    this.url = options.url.replace(/\/$/, '');
    this.apiKey = options.apiKey;
    this.collection = options.collection;
    this.vectorSize = options.vectorSize;
  }

  private headers(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) headers['api-key'] = this.apiKey;
    return headers;
  }

  private async request(path: string, init: RequestInit): Promise<any> {
    const response = await fetch(`${this.url}${path}`, {
      ...init,
      headers: { ...this.headers(), ...(init.headers ?? {}) },
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Qdrant request to ${path} failed (${response.status}): ${body}`);
    }
    return response.json();
  }

  /** Creates the collection if it doesn't already exist. Safe to call repeatedly. */
  async ensureCollection(): Promise<void> {
    const existing = await fetch(`${this.url}/collections/${this.collection}`, { headers: this.headers() });
    if (existing.ok) return;

    await this.request(`/collections/${this.collection}`, {
      method: 'PUT',
      body: JSON.stringify({ vectors: { size: this.vectorSize, distance: 'Cosine' } }),
    });
  }

  async upsert(points: VectorPoint[]): Promise<void> {
    if (points.length === 0) return;
    await this.request(`/collections/${this.collection}/points`, {
      method: 'PUT',
      body: JSON.stringify({
        points: points.map((p) => ({
          id: p.id,
          vector: p.vector,
          payload: { nodeId: p.nodeId },
        })),
      }),
    });
  }

  async search(vector: number[], topK = 10): Promise<VectorMatch[]> {
    const result = await this.request(`/collections/${this.collection}/points/search`, {
      method: 'POST',
      body: JSON.stringify({ vector, limit: topK, with_payload: true }),
    });
    return (result.result as { id: string; score: number; payload: { nodeId: string } }[]).map((r) => ({
      nodeId: r.payload.nodeId,
      score: r.score,
    }));
  }
}
