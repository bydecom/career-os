import { describe, it, expect } from 'vitest';
import { NodeType, EdgeType } from '@career-os/ontology';
import type { KnowledgeGraph, KnowledgeNode, KnowledgeEdge } from '@career-os/ontology';
import { buildAdjacency } from '../src/adjacency.js';
import { personalizedPageRank } from '../src/ppr.js';

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

describe('personalizedPageRank', () => {
  it('returns an empty score map when no seed matches a known node', () => {
    const graph: KnowledgeGraph = { nodes: [makeNode('a')], edges: [] };
    const adjacency = buildAdjacency(graph);

    const { scores } = personalizedPageRank(adjacency, ['unknown']);

    expect(scores.size).toBe(0);
  });

  it('gives the seed node the highest score among unconnected nodes', () => {
    const graph: KnowledgeGraph = {
      nodes: [makeNode('seed'), makeNode('isolated')],
      edges: [],
    };
    const adjacency = buildAdjacency(graph);

    const { scores } = personalizedPageRank(adjacency, ['seed']);

    expect(scores.get('seed')!).toBeGreaterThan(scores.get('isolated') ?? 0);
  });

  it('propagates score to nodes reachable via outgoing edges (forward direction)', () => {
    // project --USES--> technology
    const graph: KnowledgeGraph = {
      nodes: [makeNode('project'), makeNode('technology'), makeNode('unrelated')],
      edges: [makeEdge('e1', 'project', 'technology')],
    };
    const adjacency = buildAdjacency(graph);

    const { scores } = personalizedPageRank(adjacency, ['project'], { direction: 'forward' });

    expect(scores.get('technology')!).toBeGreaterThan(scores.get('unrelated') ?? 0);
  });

  it('bidirectional PPR reaches nodes that only point AT the seed (incoming edges)', () => {
    // project --USES--> technology (seed = technology, only reachable via reverse edge)
    const graph: KnowledgeGraph = {
      nodes: [makeNode('project'), makeNode('technology'), makeNode('unrelated')],
      edges: [makeEdge('e1', 'project', 'technology')],
    };
    const adjacency = buildAdjacency(graph);

    const forwardOnly = personalizedPageRank(adjacency, ['technology'], { direction: 'forward' });
    const bidirectional = personalizedPageRank(adjacency, ['technology'], { direction: 'bidirectional' });

    // Forward-only PPR from `technology` cannot reach `project` (no outgoing edges from technology).
    expect(forwardOnly.scores.get('project') ?? 0).toBe(0);
    // Bidirectional PPR walks the incoming edge and reaches `project`.
    expect(bidirectional.scores.get('project')!).toBeGreaterThan(0);
    expect(bidirectional.scores.get('project')!).toBeGreaterThan(bidirectional.scores.get('unrelated') ?? 0);
  });

  it('conserves total probability mass across iterations (approximately sums to 1)', () => {
    const graph: KnowledgeGraph = {
      nodes: [makeNode('a'), makeNode('b'), makeNode('c')],
      edges: [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'b', 'c'), makeEdge('e3', 'c', 'a')],
    };
    const adjacency = buildAdjacency(graph);

    const { scores } = personalizedPageRank(adjacency, ['a']);
    const total = Array.from(scores.values()).reduce((sum, s) => sum + s, 0);

    expect(total).toBeCloseTo(1, 1);
  });
});
