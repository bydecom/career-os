import { describe, it, expect } from 'vitest';
import { validateFrontmatter } from '../src/validator/schemas.js';
import { validateOntology, inferEdgeType } from '../src/validator/ontology.js';
import { EdgeType, NodeType } from '@career-os/ontology';
import type { KnowledgeNode, KnowledgeGraph } from '@career-os/ontology';

function makeNode(overrides: Partial<KnowledgeNode<any>> = {}): KnowledgeNode<any> {
  return {
    id: 'node-a',
    type: NodeType.Technology,
    name: 'Node A',
    metadata: { schemaVersion: '1', aliases: [] },
    body: { raw: '', sections: [] },
    source: { filePath: 'node-a.md', lineStart: 1, lineEnd: 1 },
    ...overrides,
  };
}

describe('validateFrontmatter', () => {
  it('accepts valid technology frontmatter and applies defaults', () => {
    const result = validateFrontmatter(
      { id: 'react', type: 'technology', name: 'React' },
      'react.md'
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('active');
      expect(result.data.aliases).toEqual([]);
    }
  });

  it('rejects an unknown node type', () => {
    const result = validateFrontmatter(
      { id: 'x', type: 'not-a-real-type', name: 'X' },
      'x.md'
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.join(' ')).toMatch(/type must be one of/);
    }
  });

  it('rejects experience nodes missing required fields (role, company, startDate)', () => {
    const result = validateFrontmatter(
      { id: 'job-a', type: 'experience', name: 'Job A' },
      'job-a.md'
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('role'))).toBe(true);
      expect(result.errors.some((e) => e.includes('company'))).toBe(true);
      expect(result.errors.some((e) => e.includes('startDate'))).toBe(true);
    }
  });

  it('accepts experience nodes when all required fields are present', () => {
    const result = validateFrontmatter(
      {
        id: 'job-b',
        type: 'experience',
        name: 'Job B',
        role: 'Engineer',
        company: 'acme',
        startDate: '2020-01-01',
      },
      'job-b.md'
    );

    expect(result.success).toBe(true);
  });

  it('falls back to BaseMetadataSchema for node types with no specific schema', () => {
    const result = validateFrontmatter(
      { id: 'p1', type: 'pattern', name: 'Some Pattern' },
      'p1.md'
    );

    expect(result.success).toBe(true);
  });
});

describe('inferEdgeType', () => {
  it('maps known section headings to their semantic edge type', () => {
    expect(inferEdgeType('Chosen Solution')).toBe(EdgeType.USES);
    expect(inferEdgeType('Used In')).toBe(EdgeType.USES);
    expect(inferEdgeType('Depends On')).toBe(EdgeType.DEPENDS_ON);
    expect(inferEdgeType('Problem')).toBe(EdgeType.SOLVES);
    expect(inferEdgeType('Evidence')).toBe(EdgeType.VALIDATES);
    expect(inferEdgeType('Part Of')).toBe(EdgeType.PART_OF);
  });

  it('falls back to RELATED_TO for unknown section headings', () => {
    expect(inferEdgeType('Some Random Heading')).toBe(EdgeType.RELATED_TO);
    expect(inferEdgeType('body')).toBe(EdgeType.RELATED_TO);
  });
});

describe('validateOntology', () => {
  it('flags a wiki-link that does not resolve to any known node or alias', () => {
    const nodeA = makeNode({ id: 'node-a' });
    const graph: KnowledgeGraph = { nodes: [nodeA], edges: [] };
    const wikiLinksByNodeId = new Map([
      ['node-a', [{ raw: 'missing-node', target: 'missing-node', section: 'body' }]],
    ]);

    const result = validateOntology(graph, wikiLinksByNodeId);

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ level: 'warning', code: 'BROKEN_LINK' })
    );
  });

  it('resolves wiki-links against aliases, not just canonical ids', () => {
    const nodeA = makeNode({ id: 'node-a', metadata: { schemaVersion: '1', aliases: ['alias-a'] } });
    const nodeB = makeNode({ id: 'node-b', name: 'Node B' });
    const graph: KnowledgeGraph = { nodes: [nodeA, nodeB], edges: [] };
    const wikiLinksByNodeId = new Map([
      ['node-b', [{ raw: 'alias-a', target: 'alias-a', section: 'body' }]],
    ]);

    const result = validateOntology(graph, wikiLinksByNodeId);

    expect(result.diagnostics.filter((d) => d.code === 'BROKEN_LINK')).toHaveLength(0);
  });

  it('detects duplicate node ids as errors', () => {
    const nodeA = makeNode({ id: 'dup' });
    const nodeB = makeNode({ id: 'dup', name: 'Node B' });
    const graph: KnowledgeGraph = { nodes: [nodeA, nodeB], edges: [] };

    const result = validateOntology(graph, new Map());

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ level: 'error', code: 'DUPLICATE_ID' })
    );
  });

  it('detects alias conflicts between two different nodes as errors', () => {
    const nodeA = makeNode({ id: 'node-a', metadata: { schemaVersion: '1', aliases: ['shared'] } });
    const nodeB = makeNode({ id: 'node-b', name: 'Node B', metadata: { schemaVersion: '1', aliases: ['shared'] } });
    const graph: KnowledgeGraph = { nodes: [nodeA, nodeB], edges: [] };

    const result = validateOntology(graph, new Map());

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ level: 'error', code: 'ALIAS_CONFLICT' })
    );
  });

  it('flags nodes with zero edges as orphans (info-level only)', () => {
    const nodeA = makeNode({ id: 'lonely-node' });
    const graph: KnowledgeGraph = { nodes: [nodeA], edges: [] };

    const result = validateOntology(graph, new Map());

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ level: 'info', code: 'ORPHAN_NODE' })
    );
  });

  it('does not flag connected nodes as orphans', () => {
    const nodeA = makeNode({ id: 'node-a' });
    const nodeB = makeNode({ id: 'node-b', name: 'Node B' });
    const graph: KnowledgeGraph = {
      nodes: [nodeA, nodeB],
      edges: [
        {
          id: 'e1',
          sourceNode: 'node-a',
          targetNode: 'node-b',
          type: EdgeType.RELATED_TO,
          metadata: { confidence: 1, source: 'wiki-link', createdBy: 'test' },
        },
      ],
    };

    const result = validateOntology(graph, new Map());

    expect(result.diagnostics.filter((d) => d.code === 'ORPHAN_NODE')).toHaveLength(0);
  });
});
