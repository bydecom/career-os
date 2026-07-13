import { describe, it, expect } from 'vitest';
import { NodeType } from '@career-os/ontology';
import type { KnowledgeNode } from '@career-os/ontology';
import { buildGraph } from '../src/builder/index.js';
import type { NodeWithLinks } from '../src/builder/index.js';

function makeNode(id: string, aliases: string[] = []): KnowledgeNode<any> {
  return {
    id,
    type: NodeType.Technology,
    name: id,
    metadata: { schemaVersion: '1', aliases },
    body: { raw: '', sections: [] },
    source: { filePath: `${id}.md`, lineStart: 1, lineEnd: 1 },
  };
}

describe('buildGraph', () => {
  it('creates an edge for each resolvable wiki-link', () => {
    const items: NodeWithLinks[] = [
      {
        node: makeNode('a'),
        wikiLinks: [{ raw: 'b', target: 'b', section: 'used-in' }],
      },
      { node: makeNode('b'), wikiLinks: [] },
    ];

    const result = buildGraph(items, Date.now());

    expect(result.graph.edges).toHaveLength(1);
    expect(result.graph.edges[0]).toMatchObject({ sourceNode: 'a', targetNode: 'b' });
    expect(result.statistics.totalNodes).toBe(2);
    expect(result.statistics.totalEdges).toBe(1);
  });

  it('does not create an edge for unresolved wiki-links (left to ontology validator)', () => {
    const items: NodeWithLinks[] = [
      { node: makeNode('a'), wikiLinks: [{ raw: 'ghost', target: 'ghost', section: 'body' }] },
    ];

    const result = buildGraph(items, Date.now());

    expect(result.graph.edges).toHaveLength(0);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'BROKEN_LINK' })
    );
  });

  it('resolves wiki-links through aliases', () => {
    const items: NodeWithLinks[] = [
      { node: makeNode('a'), wikiLinks: [{ raw: 'bee', target: 'bee', section: 'body' }] },
      { node: makeNode('b', ['bee']), wikiLinks: [] },
    ];

    const result = buildGraph(items, Date.now());

    expect(result.graph.edges).toHaveLength(1);
    expect(result.graph.edges[0]).toMatchObject({ sourceNode: 'a', targetNode: 'b' });
  });

  it('never creates a self-loop edge', () => {
    const items: NodeWithLinks[] = [
      { node: makeNode('a'), wikiLinks: [{ raw: 'a', target: 'a', section: 'body' }] },
    ];

    const result = buildGraph(items, Date.now());

    expect(result.graph.edges).toHaveLength(0);
  });

  it('deduplicates edges with the same source-type-target triple', () => {
    const items: NodeWithLinks[] = [
      {
        node: makeNode('a'),
        wikiLinks: [
          { raw: 'b', target: 'b', section: 'used-in' },
          { raw: 'b', target: 'b', section: 'used-in' },
        ],
      },
      { node: makeNode('b'), wikiLinks: [] },
    ];

    const result = buildGraph(items, Date.now());

    expect(result.graph.edges).toHaveLength(1);
  });
});
