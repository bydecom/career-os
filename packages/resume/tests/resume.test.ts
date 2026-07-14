import { describe, it, expect } from 'vitest';
import { NodeType, EdgeType } from '@career-os/ontology';
import type { KnowledgeGraph, KnowledgeNode, KnowledgeEdge } from '@career-os/ontology';
import { projectResume, formatDiagnostics, renderMarkdown } from '../src/index.js';

function node(
  id: string,
  type: NodeType,
  name: string,
  metadata: Record<string, unknown>,
  raw: string
): KnowledgeNode<any> {
  return {
    id,
    type,
    name,
    metadata: { schemaVersion: '1', status: 'active', ...metadata },
    body: { raw, sections: [] },
    source: { filePath: `${id}.md`, lineStart: 1, lineEnd: 1 },
  };
}

function edge(source: string, target: string, type = EdgeType.USES): KnowledgeEdge {
  return {
    id: `${source}->${target}`,
    sourceNode: source,
    targetNode: target,
    type,
    metadata: { confidence: 1, source: 'wiki-link', createdBy: 'test' },
  };
}

const profile = node(
  'me',
  NodeType.Profile,
  'Bang Thai Minh',
  { headline: 'Software Developer', email: '', website: '' },
  '## Summary\n\nBuilds deterministic systems.\n'
);

const expA = node(
  'exp-a',
  NodeType.Experience,
  'Role A',
  { role: 'Dev', company: 'acme', startDate: '2025-01-01', endDate: '2025-06-01' },
  '## Overview\n\nFirst job.\n'
);

const expB = node(
  'exp-b',
  NodeType.Experience,
  'Role B',
  { role: 'Senior', company: 'acme', startDate: '2025-01-01' },
  '## Overview\n\nSame start date, later id wins tie by id ASC so exp-a before exp-b when dates equal... wait DESC date then ASC id.\n'
);

const company = node('acme', NodeType.Company, 'Acme Corp', {}, '');

const redis = node('redis', NodeType.Technology, 'Redis', { category: 'data' }, '');
const docker = node('docker', NodeType.Technology, 'Docker', { category: 'infra' }, '');
const nodejs = node('nodejs', NodeType.Technology, 'Node.js', { category: 'backend' }, '');

const projectRaw = `## Overview

> Interview-friendly one-liner: "Shipped a hardened checkout."

## Architecture

Should never appear in resume.

## Key Decisions

- Used Redis for stock reservation
- Kept VNPay IPN synchronous

## Metrics

- 132+ production deployments
- 53+ money-path tests
`;

const projZ = node(
  'proj-z',
  NodeType.Project,
  'Project Z',
  { role: 'Dev', period: '2026', updated: '2026-06-01' },
  projectRaw
);

const projA = node(
  'proj-a',
  NodeType.Project,
  'Project A',
  { role: 'Dev', period: '2026', updated: '2026-07-01' },
  projectRaw
);

function graph(extra: { nodes?: KnowledgeNode[]; edges?: KnowledgeEdge[] } = {}): KnowledgeGraph {
  return {
    nodes: [
      profile,
      expA,
      expB,
      company,
      redis,
      docker,
      nodejs,
      projZ,
      projA,
      ...(extra.nodes ?? []),
    ],
    edges: [
      edge('proj-a', 'redis'),
      edge('proj-a', 'docker'),
      edge('proj-a', 'nodejs'),
      edge('proj-z', 'redis'),
      edge('proj-z', 'docker'),
      ...(extra.edges ?? []),
    ],
  };
}

describe('projectResume (master)', () => {
  it('requires exactly one profile', () => {
    expect(() =>
      projectResume({ nodes: [expA], edges: [] })
    ).toThrow(/exactly one active profile/);
  });

  it('sorts experiences by startDate DESC then id ASC', () => {
    const { ir } = projectResume(graph());
    expect(ir.experiences.map((e) => e.id)).toEqual(['exp-a', 'exp-b']);
  });

  it('sorts projects by updated DESC then id ASC', () => {
    const { ir } = projectResume(graph());
    expect(ir.projects.map((p) => p.id)).toEqual(['proj-a', 'proj-z']);
  });

  it('dedupes skills across projects and sorts by name', () => {
    const { ir } = projectResume(graph());
    expect(ir.skills.map((s) => s.id)).toEqual(['docker', 'nodejs', 'redis']);
    expect(ir.skills.map((s) => s.name)).toEqual(['Docker', 'Node.js', 'Redis']);
  });

  it('keeps short body fields and skips Architecture', () => {
    const { ir } = projectResume(graph());
    const p = ir.projects[0]!;
    expect(p.summary).toContain('hardened checkout');
    expect(p.keyDecisions).toHaveLength(2);
    expect(p.metrics[0]).toContain('132+');
    expect(p.summary).not.toContain('Architecture');
    expect(JSON.stringify(p)).not.toContain('Should never appear');
  });

  it('emits diagnostics warnings for empty profile fields and missing education', () => {
    const { diagnostics } = projectResume(graph());
    expect(diagnostics.profileOk).toBe(true);
    expect(diagnostics.projectCount).toBe(2);
    expect(diagnostics.skillCount).toBe(3);
    expect(diagnostics.warnings.some((w) => w.message.includes('education missing'))).toBe(true);
    expect(diagnostics.warnings.some((w) => w.message.includes('profile.website empty'))).toBe(
      true
    );
    expect(formatDiagnostics(diagnostics)).toContain('Warnings');
  });

  it('rejects tailored scope for now', () => {
    expect(() => projectResume(graph(), { scope: 'tailored' })).toThrow(/not implemented/);
  });
});

describe('renderMarkdown', () => {
  it('renders stable master markdown with profile and skills', () => {
    const { ir } = projectResume(graph());
    const md = renderMarkdown(ir);
    expect(md).toContain('# Bang Thai Minh');
    expect(md).toContain('## Skills');
    expect(md).toContain('Docker, Node.js, Redis');
    expect(md).toContain('scope: master');
    expect(md).not.toContain('Should never appear');
  });
});
