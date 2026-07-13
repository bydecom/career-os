import { describe, it, expect } from 'vitest';
import { NodeType, EdgeType } from '@career-os/ontology';
import type { KnowledgeGraph, KnowledgeNode, KnowledgeEdge } from '@career-os/ontology';
import { buildAdjacency } from '../src/adjacency.js';

function makeNode(id: string): KnowledgeNode<any> {
  return {
    id,
    type: NodeType.Technology,
    name: id,
    metadata: { schemaVersion: '1' },
    body: { raw: '', sections: [] },
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

describe('buildAdjacency', () => {
  it('indexes every node id, including orphans with no edges', () => {
    const graph: KnowledgeGraph = {
      nodes: [makeNode('a'), makeNode('b'), makeNode('orphan')],
      edges: [makeEdge('e1', 'a', 'b')],
    };

    const adjacency = buildAdjacency(graph);

    expect(adjacency.nodeIds).toEqual(new Set(['a', 'b', 'orphan']));
  });

  it('builds forward adjacency from sourceNode to targetNode', () => {
    const graph: KnowledgeGraph = {
      nodes: [makeNode('a'), makeNode('b')],
      edges: [makeEdge('e1', 'a', 'b')],
    };

    const adjacency = buildAdjacency(graph);

    expect(adjacency.forward.get('a')).toEqual([{ nodeId: 'b', edge: graph.edges[0] }]);
    expect(adjacency.forward.get('b')).toBeUndefined();
  });

  it('builds reverse adjacency from targetNode to sourceNode', () => {
    const graph: KnowledgeGraph = {
      nodes: [makeNode('a'), makeNode('b')],
      edges: [makeEdge('e1', 'a', 'b')],
    };

    const adjacency = buildAdjacency(graph);

    expect(adjacency.reverse.get('b')).toEqual([{ nodeId: 'a', edge: graph.edges[0] }]);
    expect(adjacency.reverse.get('a')).toBeUndefined();
  });

  it('supports multiple edges between the same pair of nodes', () => {
    const graph: KnowledgeGraph = {
      nodes: [makeNode('a'), makeNode('b')],
      edges: [makeEdge('e1', 'a', 'b', EdgeType.USES), makeEdge('e2', 'a', 'b', EdgeType.RELATED_TO)],
    };

    const adjacency = buildAdjacency(graph);

    expect(adjacency.forward.get('a')).toHaveLength(2);
  });
});
