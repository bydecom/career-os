import { describe, it, expect, afterEach } from 'vitest';
import { NodeType, EdgeType } from '@career-os/ontology';
import type { KnowledgeGraph, KnowledgeNode, KnowledgeEdge } from '@career-os/ontology';
import { GraphStore } from '../src/graphStore.js';

function makeNode(id: string, type: NodeType = NodeType.Technology): KnowledgeNode<any> {
  return {
    id,
    type,
    name: id,
    metadata: { schemaVersion: '1' },
    body: { raw: `body of ${id}`, sections: [] },
    source: { filePath: `${id}.md`, lineStart: 1, lineEnd: 1 },
  };
}

function makeEdge(id: string, sourceNode: string, targetNode: string, type = EdgeType.USES): KnowledgeEdge {
  return {
    id,
    sourceNode,
    targetNode,
    type,
    metadata: { confidence: 1, source: 'wiki-link', createdBy: 'test' },
  };
}

describe('GraphStore', () => {
  let store: GraphStore;

  afterEach(() => {
    store?.close();
  });

  it('round-trips a full graph through write() and readAll()', () => {
    store = new GraphStore(':memory:');
    const graph: KnowledgeGraph = {
      nodes: [makeNode('a'), makeNode('b')],
      edges: [makeEdge('e1', 'a', 'b')],
    };

    store.write(graph);
    const result = store.readAll();

    expect(result.nodes.map((n) => n.id).sort()).toEqual(['a', 'b']);
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0]).toMatchObject({ sourceNode: 'a', targetNode: 'b' });
  });

  it('preserves the full node shape (body, metadata) across the round trip', () => {
    store = new GraphStore(':memory:');
    store.write({ nodes: [makeNode('a')], edges: [] });

    const node = store.getNode('a');

    expect(node?.body.raw).toBe('body of a');
    expect(node?.metadata).toEqual({ schemaVersion: '1' });
  });

  it('write() atomically replaces the previous graph (old data does not linger)', () => {
    store = new GraphStore(':memory:');
    store.write({ nodes: [makeNode('old')], edges: [] });
    store.write({ nodes: [makeNode('new')], edges: [] });

    const result = store.readAll();

    expect(result.nodes.map((n) => n.id)).toEqual(['new']);
  });

  it('getNodesByType filters correctly', () => {
    store = new GraphStore(':memory:');
    store.write({
      nodes: [makeNode('proj', NodeType.Project), makeNode('tech', NodeType.Technology)],
      edges: [],
    });

    const projects = store.getNodesByType(NodeType.Project);

    expect(projects.map((n) => n.id)).toEqual(['proj']);
  });

  it('getEdgesForNode respects the direction filter', () => {
    store = new GraphStore(':memory:');
    store.write({
      nodes: [makeNode('a'), makeNode('b'), makeNode('c')],
      edges: [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'c', 'a')],
    });

    expect(store.getEdgesForNode('a', 'out').map((e) => e.id)).toEqual(['e1']);
    expect(store.getEdgesForNode('a', 'in').map((e) => e.id)).toEqual(['e2']);
    expect(store.getEdgesForNode('a', 'both')).toHaveLength(2);
  });

  it('rolls back the transaction if a write fails midway (no partial graph)', () => {
    store = new GraphStore(':memory:');
    store.write({ nodes: [makeNode('a')], edges: [] });

    // Duplicate node ids violate the PRIMARY KEY, forcing an error mid-transaction.
    expect(() =>
      store.write({ nodes: [makeNode('b'), makeNode('b')], edges: [] })
    ).toThrow();

    // Rollback should leave the graph either as the pre-write state or empty,
    // but never in a half-written 'b' state.
    const result = store.readAll();
    expect(result.nodes.some((n) => n.id === 'b')).toBe(false);
  });
});
