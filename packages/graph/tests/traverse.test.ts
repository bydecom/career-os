import { describe, it, expect } from 'vitest';
import { NodeType, EdgeType } from '@career-os/ontology';
import type { KnowledgeGraph, KnowledgeNode, KnowledgeEdge } from '@career-os/ontology';
import { buildAdjacency } from '../src/adjacency.js';
import { traverseByEdgeType } from '../src/traverse.js';

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

function makeEdge(id: string, sourceNode: string, targetNode: string, type: EdgeType): KnowledgeEdge {
  return {
    id,
    sourceNode,
    targetNode,
    type,
    metadata: { confidence: 1, source: 'wiki-link', createdBy: 'test' },
  };
}

describe('traverseByEdgeType', () => {
  it('returns just the start node when it has no edges', () => {
    const graph: KnowledgeGraph = { nodes: [makeNode('a')], edges: [] };
    const adjacency = buildAdjacency(graph);

    const result = traverseByEdgeType(adjacency, 'a');

    expect(result).toEqual([{ nodeId: 'a', depth: 0 }]);
  });

  it('returns an empty array for an unknown start node', () => {
    const graph: KnowledgeGraph = { nodes: [makeNode('a')], edges: [] };
    const adjacency = buildAdjacency(graph);

    expect(traverseByEdgeType(adjacency, 'ghost')).toEqual([]);
  });

  it('follows the ontology reasoning spine: Technology --ENABLES--> Decision --IMPLEMENTS--> Project', () => {
    const graph: KnowledgeGraph = {
      nodes: [makeNode('redis'), makeNode('redis-cache-decision'), makeNode('e-commerce'), makeNode('unrelated')],
      edges: [
        makeEdge('e1', 'redis', 'redis-cache-decision', EdgeType.ENABLES),
        makeEdge('e2', 'redis-cache-decision', 'e-commerce', EdgeType.IMPLEMENTS),
        makeEdge('e3', 'redis', 'unrelated', EdgeType.RELATED_TO),
      ],
    };
    const adjacency = buildAdjacency(graph);

    const result = traverseByEdgeType(adjacency, 'redis', {
      edgeTypes: [EdgeType.ENABLES, EdgeType.IMPLEMENTS],
    });

    const ids = result.map((hop) => hop.nodeId);
    expect(ids).toContain('redis-cache-decision');
    expect(ids).toContain('e-commerce');
    expect(ids).not.toContain('unrelated');
  });

  it('respects maxDepth', () => {
    const graph: KnowledgeGraph = {
      nodes: [makeNode('a'), makeNode('b'), makeNode('c')],
      edges: [makeEdge('e1', 'a', 'b', EdgeType.USES), makeEdge('e2', 'b', 'c', EdgeType.USES)],
    };
    const adjacency = buildAdjacency(graph);

    const result = traverseByEdgeType(adjacency, 'a', { maxDepth: 1 });

    expect(result.map((hop) => hop.nodeId)).toEqual(['a', 'b']);
  });

  it('walks reverse edges when direction is bidirectional', () => {
    const graph: KnowledgeGraph = {
      nodes: [makeNode('project'), makeNode('technology')],
      edges: [makeEdge('e1', 'project', 'technology', EdgeType.USES)],
    };
    const adjacency = buildAdjacency(graph);

    const result = traverseByEdgeType(adjacency, 'technology', { direction: 'bidirectional' });

    expect(result.map((hop) => hop.nodeId)).toContain('project');
  });
});
