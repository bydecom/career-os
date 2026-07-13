import { describe, it, expect, vi, afterEach } from 'vitest';
import { QdrantVectorIndex } from '../src/qdrant.js';

describe('QdrantVectorIndex', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates the collection only when it does not already exist', async () => {
    const calls: { url: string; method?: string }[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        calls.push({ url, method: init?.method });
        if ((init?.method ?? 'GET') === 'GET') return { ok: true, json: async () => ({}) };
        return { ok: true, json: async () => ({}) };
      })
    );

    const index = new QdrantVectorIndex({ url: 'http://localhost:6333', collection: 'nodes', vectorSize: 3 });
    await index.ensureCollection();

    expect(calls).toHaveLength(1); // GET succeeded, so no PUT was made
  });

  it('upserts points with numeric ids and nodeId in the payload', async () => {
    let capturedBody: any;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        capturedBody = JSON.parse(init!.body as string);
        return { ok: true, json: async () => ({}) };
      })
    );

    const index = new QdrantVectorIndex({ url: 'http://localhost:6333', collection: 'nodes', vectorSize: 3 });
    await index.upsert([{ id: 0, nodeId: 'rabbitmq', vector: [0.1, 0.2, 0.3] }]);

    expect(capturedBody.points[0]).toMatchObject({ id: 0, payload: { nodeId: 'rabbitmq' } });
  });

  it('does not make a request when upserting an empty list', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const index = new QdrantVectorIndex({ url: 'http://localhost:6333', collection: 'nodes', vectorSize: 3 });
    await index.upsert([]);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('maps search results back to nodeId + score', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          result: [
            { id: 0, score: 0.91, payload: { nodeId: 'rabbitmq' } },
            { id: 1, score: 0.5, payload: { nodeId: 'redis' } },
          ],
        }),
      }))
    );

    const index = new QdrantVectorIndex({ url: 'http://localhost:6333', collection: 'nodes', vectorSize: 3 });
    const matches = await index.search([0.1, 0.2, 0.3], 5);

    expect(matches).toEqual([
      { nodeId: 'rabbitmq', score: 0.91 },
      { nodeId: 'redis', score: 0.5 },
    ]);
  });

  it('throws a descriptive error on a failed request', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 404, text: async () => 'collection not found' }))
    );

    const index = new QdrantVectorIndex({ url: 'http://localhost:6333', collection: 'nodes', vectorSize: 3 });

    await expect(index.upsert([{ id: 0, nodeId: 'a', vector: [1] }])).rejects.toThrow(/404/);
  });
});
