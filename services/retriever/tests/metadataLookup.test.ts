import { describe, it, expect } from 'vitest';
import { NodeType } from '@career-os/ontology';
import type { KnowledgeNode } from '@career-os/ontology';
import { MetadataIndex } from '../src/metadataLookup.js';

function makeNode(id: string, name: string, aliases: string[] = []): KnowledgeNode<any> {
  return {
    id,
    type: NodeType.Technology,
    name,
    metadata: { schemaVersion: '1', aliases },
    body: { raw: '', sections: [] },
    source: { filePath: `${id}.md`, lineStart: 1, lineEnd: 1 },
  };
}

describe('MetadataIndex', () => {
  const nodes = [
    makeNode('rabbitmq', 'RabbitMQ', ['message broker', 'amqp']),
    makeNode('redis', 'Redis', ['cache']),
  ];
  const index = new MetadataIndex(nodes);

  it('matches by exact node id', () => {
    expect(index.lookup('rabbitmq')[0]).toMatchObject({ nodeId: 'rabbitmq', matchedField: 'id' });
  });

  it('matches by node name case-insensitively, embedded in a sentence', () => {
    const matches = index.lookup('Why did you use RabbitMQ in that project?');

    expect(matches.map((m) => m.nodeId)).toContain('rabbitmq');
  });

  it('matches by a multi-word alias', () => {
    const matches = index.lookup('why use a message broker here');

    expect(matches.some((m) => m.nodeId === 'rabbitmq' && m.matchedField === 'alias')).toBe(true);
  });

  it('matches by a single-word alias token', () => {
    const matches = index.lookup('tell me about your cache layer');

    expect(matches.map((m) => m.nodeId)).toContain('redis');
  });

  it('returns an empty array when nothing matches', () => {
    expect(index.lookup('completely unrelated topic')).toEqual([]);
  });

  it('deduplicates when both id/name and alias would match the same node', () => {
    const matches = index.lookup('rabbitmq message broker');

    expect(matches.filter((m) => m.nodeId === 'rabbitmq')).toHaveLength(1);
  });
});
