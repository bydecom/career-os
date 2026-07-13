import { describe, it, expect } from 'vitest';
import { NodeType, EdgeType } from '@career-os/ontology';
import type { KnowledgeGraph, KnowledgeNode, KnowledgeEdge } from '@career-os/ontology';
import { Retriever } from '../src/retrieve.js';

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

function makeEdge(id: string, sourceNode: string, targetNode: string, type: EdgeType): KnowledgeEdge {
  return {
    id,
    sourceNode,
    targetNode,
    type,
    metadata: { confidence: 1, source: 'wiki-link', createdBy: 'test' },
  };
}

// A small fixture graph mirroring the shape of the real career-data graph:
// a Technology used by a Project, plus an unrelated pair.
const graph: KnowledgeGraph = {
  nodes: [
    makeNode('rabbitmq', 'RabbitMQ', 'A message broker for decoupling services via async queues.', ['message broker']),
    makeNode(
      'ecommerce-platform',
      'E-commerce Platform',
      'Full-stack platform. Async workers cut admin latency from 2s to 10ms using a message queue.'
    ),
    makeNode('redis', 'Redis', 'In-memory cache to reduce database load.'),
    makeNode('phaser', 'Phaser', 'A 2D game framework used for a match-3 puzzle game.'),
  ],
  edges: [makeEdge('e1', 'ecommerce-platform', 'rabbitmq', EdgeType.USES)],
};

describe('Retriever.retrieve', () => {
  const retriever = new Retriever(graph);

  it('anchors on a metadata match and expands to the connected project via graph traversal', () => {
    const results = retriever.retrieve('Why did you use RabbitMQ?');

    const ids = results.map((r) => r.node.id);
    expect(ids[0]).toBe('rabbitmq'); // exact anchor always ranks first (Metadata weight 4.0)
    expect(ids).toContain('ecommerce-platform'); // reached via graph expansion (USES edge)
  });

  it('resolves a multi-word alias to its anchor node', () => {
    const results = retriever.retrieve('what message broker did you use in production');

    expect(results[0]?.node.id).toBe('rabbitmq');
  });

  it('falls back to BM25 lexical search when no metadata anchor is found', () => {
    const results = retriever.retrieve('reduce database load with caching');

    expect(results[0]?.node.id).toBe('redis');
  });

  it('does not return unrelated nodes for a narrow, unrelated query', () => {
    const results = retriever.retrieve('2D game framework');

    const ids = results.map((r) => r.node.id);
    expect(ids).toContain('phaser');
    expect(ids).not.toContain('rabbitmq');
  });

  it('attaches a human-readable explanation to every result', () => {
    const results = retriever.retrieve('RabbitMQ');

    for (const result of results) {
      expect(result.explanation.reasons.length).toBeGreaterThan(0);
    }
  });

  it('respects the topK option', () => {
    const results = retriever.retrieve('platform', { topK: 1 });

    expect(results).toHaveLength(1);
  });

  it('returns an empty array for a query matching nothing', () => {
    const results = retriever.retrieve('completely unrelated nonsense zzz');

    expect(results).toEqual([]);
  });
});
