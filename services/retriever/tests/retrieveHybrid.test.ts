import { describe, it, expect } from 'vitest';
import { NodeType, EdgeType } from '@career-os/ontology';
import type { KnowledgeGraph, KnowledgeNode, KnowledgeEdge } from '@career-os/ontology';
import { Retriever } from '../src/retrieve.js';
import type { TextEmbedder, VectorSearcher } from '../src/retrieve.js';

function makeNode(id: string, name: string, body: string): KnowledgeNode<any> {
  return {
    id,
    type: NodeType.Technology,
    name,
    metadata: { schemaVersion: '1' },
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

const graph: KnowledgeGraph = {
  nodes: [
    makeNode('kafka-alternative', 'Message Queueing Concept', 'Decoupling producers and consumers with queues.'),
    makeNode('rabbitmq', 'RabbitMQ', 'A message broker.'),
    makeNode('unrelated', 'Unrelated Node', 'Nothing to do with messaging.'),
  ],
  edges: [makeEdge('e1', 'rabbitmq', 'kafka-alternative', EdgeType.IS_A)],
};

const fakeEmbedder: TextEmbedder = {
  async embed(_text: string) {
    return [0.1, 0.2, 0.3];
  },
};

function fakeVectorSearcher(matches: { nodeId: string; score: number }[]): VectorSearcher {
  return { async search() { return matches; } };
}

describe('Retriever.retrieveHybrid', () => {
  it('includes vector-only matches that no other engine would have surfaced', async () => {
    const retriever = new Retriever(graph);
    const vectorSearcher = fakeVectorSearcher([{ nodeId: 'kafka-alternative', score: 0.95 }]);

    const { results } = await retriever.retrieveHybrid('do you know about async decoupled queues', fakeEmbedder, vectorSearcher);

    expect(results.map((r) => r.node.id)).toContain('kafka-alternative');
    expect(results[0]!.explanation.reasons.some((r) => r.includes('semantic'))).toBe(true);
  });

  it('still lets a metadata anchor outrank a vector-only match (ADR-0006 weighting)', async () => {
    const retriever = new Retriever(graph);
    const vectorSearcher = fakeVectorSearcher([{ nodeId: 'unrelated', score: 0.99 }]);

    const { results } = await retriever.retrieveHybrid('RabbitMQ', fakeEmbedder, vectorSearcher);

    expect(results[0]!.node.id).toBe('rabbitmq');
  });

  it('propagates embedder errors instead of silently degrading to deterministic-only results', async () => {
    const retriever = new Retriever(graph);
    const failingEmbedder: TextEmbedder = {
      async embed() {
        throw new Error('embedding API down');
      },
    };

    await expect(
      retriever.retrieveHybrid('RabbitMQ', failingEmbedder, fakeVectorSearcher([]))
    ).rejects.toThrow('embedding API down');
  });
});
