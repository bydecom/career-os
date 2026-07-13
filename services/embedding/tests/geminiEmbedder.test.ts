import { describe, it, expect, vi, afterEach } from 'vitest';
import { GeminiEmbedder } from '../src/geminiEmbedder.js';

function mockFetchOnce(embeddings: number[][]) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ embeddings: embeddings.map((values) => ({ values })) }),
    text: async () => '',
  });
}

describe('GeminiEmbedder', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('throws when constructed without an apiKey', () => {
    expect(() => new GeminiEmbedder({ apiKey: '' })).toThrow(/apiKey/);
  });

  it('embeds a single text and returns its vector', async () => {
    vi.stubGlobal('fetch', mockFetchOnce([[0.1, 0.2, 0.3]]));
    const embedder = new GeminiEmbedder({ apiKey: 'test-key' });

    const vector = await embedder.embed('RabbitMQ is a message broker');

    expect(vector).toEqual([0.1, 0.2, 0.3]);
  });

  it('embeds a batch of texts, preserving order', async () => {
    vi.stubGlobal('fetch', mockFetchOnce([[1, 0], [0, 1]]));
    const embedder = new GeminiEmbedder({ apiKey: 'test-key' });

    const results = await embedder.embedBatch(['a', 'b']);

    expect(results.map((r) => r.text)).toEqual(['a', 'b']);
    expect(results.map((r) => r.vector)).toEqual([[1, 0], [0, 1]]);
  });

  it('chunks requests larger than batchSize into multiple calls', async () => {
    const fetchMock = mockFetchOnce([[1, 1]]);
    vi.stubGlobal('fetch', fetchMock);
    const embedder = new GeminiEmbedder({ apiKey: 'test-key', batchSize: 1 });

    await embedder.embedBatch(['a', 'b', 'c']);

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('throws a descriptive error when the API responds with a non-OK status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 429, text: async () => 'rate limited' })
    );
    const embedder = new GeminiEmbedder({ apiKey: 'test-key' });

    await expect(embedder.embed('x')).rejects.toThrow(/429/);
  });
});
