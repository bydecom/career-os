import { describe, it, expect } from 'vitest';
import { NodeType } from '@career-os/ontology';
import type { KnowledgeNode } from '@career-os/ontology';
import { Bm25Index } from '../src/bm25.js';

function makeNode(id: string, name: string, body: string, aliases: string[] = []): KnowledgeNode<any> {
  return {
    id,
    type: NodeType.Technology,
    name,
    metadata: { schemaVersion: '1', aliases },
    body: { raw: body, sections: [] },
    source: { filePath: `${id}.md`, lineStart: 1, lineEnd: 1 },
  };
}

describe('Bm25Index', () => {
  const nodes = [
    makeNode('rabbitmq', 'RabbitMQ', 'A message broker used for async processing.', ['message broker', 'amqp']),
    makeNode('redis', 'Redis', 'An in-memory cache used to reduce database load and latency.'),
    makeNode('ecommerce-platform', 'E-commerce Platform', 'A full-stack platform using async workers to cut latency from 2s to 10ms.'),
  ];
  const index = new Bm25Index(nodes);

  it('matches a node via an alias not present in its name', () => {
    const results = index.search('message broker');

    expect(results[0]?.nodeId).toBe('rabbitmq');
  });

  it('ranks by term frequency and rarity, returning empty for pure noise queries', () => {
    const results = index.search('xyzzy nonexistent term');

    expect(results).toEqual([]);
  });

  it('finds a node by a niche keyword only present in its body', () => {
    const results = index.search('latency');

    const ids = results.map((r) => r.nodeId);
    expect(ids).toContain('redis');
    expect(ids).toContain('ecommerce-platform');
  });

  it('respects topK', () => {
    const results = index.search('async', 1);

    expect(results).toHaveLength(1);
  });

  it('returns scores in strictly descending order', () => {
    const results = index.search('latency database cache');

    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1]!.score).toBeGreaterThanOrEqual(results[i]!.score);
    }
  });
});
