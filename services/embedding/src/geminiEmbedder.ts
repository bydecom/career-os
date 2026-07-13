// ---------------------------------------------------------------------------
// Gemini Embedding Provider — plain fetch against the Generative Language
// REST API, deliberately avoiding the @google/generative-ai SDK to keep this
// service's runtime dependency count at zero (matches @career-os/ontology's
// "zero runtime dependencies" philosophy).
//
// Model: text-embedding-004 (768-dim), Google's standard text embedding model.
// Docs: https://ai.google.dev/api/embeddings
// ---------------------------------------------------------------------------

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'text-embedding-004';

export interface GeminiEmbedderOptions {
  apiKey: string;
  model?: string;
  /** Max texts per batchEmbedContents call. Gemini's API caps this at 100. */
  batchSize?: number;
}

export interface EmbeddingResult {
  /** The original input text, echoed back for traceability. */
  text: string;
  vector: number[];
}

export class GeminiEmbedder {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly batchSize: number;

  constructor(options: GeminiEmbedderOptions) {
    if (!options.apiKey) {
      throw new Error('GeminiEmbedder requires an apiKey (set GEMINI_API_KEY).');
    }
    this.apiKey = options.apiKey;
    this.model = options.model ?? DEFAULT_MODEL;
    this.batchSize = options.batchSize ?? 100;
  }

  async embed(text: string): Promise<number[]> {
    const [result] = await this.embedBatch([text]);
    return result!.vector;
  }

  async embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];

    for (let i = 0; i < texts.length; i += this.batchSize) {
      const chunk = texts.slice(i, i + this.batchSize);
      const url = `${API_BASE}/models/${this.model}:batchEmbedContents?key=${this.apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: chunk.map((text) => ({
            model: `models/${this.model}`,
            content: { parts: [{ text }] },
          })),
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Gemini embedding request failed (${response.status}): ${body}`);
      }

      const data = (await response.json()) as { embeddings: { values: number[] }[] };
      chunk.forEach((text, index) => {
        results.push({ text, vector: data.embeddings[index]!.values });
      });
    }

    return results;
  }
}
