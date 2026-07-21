import { describe, it, expect } from 'vitest';
import { buildKnowledgeTrace } from '../src/knowledgeTrace.js';
import type { CandidateNode } from '../src/types.js';

function node(
  id: string,
  score: number,
  engines: CandidateNode['engines'] = ['bm25'],
  type = 'technology',
): CandidateNode {
  return {
    id,
    type,
    name: id,
    excerpt: `${id} body`,
    score,
    engines,
  };
}

describe('buildKnowledgeTrace', () => {
  it('puts anchors ∩ candidates into Direct Matches, sorted by score, capped by directQuota', () => {
    const candidates = [
      node('a', 0.9, ['metadata']),
      node('b', 0.8, ['metadata']),
      node('c', 0.7, ['metadata']),
      node('d', 0.6, ['metadata']),
      node('e', 0.5, ['bm25']),
    ];
    const anchors = [node('d', 0.6, ['metadata']), node('a', 0.9, ['metadata']), node('c', 0.7, ['metadata']), node('b', 0.8, ['metadata'])];

    const trace = buildKnowledgeTrace(candidates, anchors, { directQuota: 3, supportingQuota: 6 });

    expect(trace.directMatches.map((n) => n.id)).toEqual(['a', 'b', 'c']);
    expect(trace.directMatches).toHaveLength(3);
  });

  it('fills Supporting Context from non-direct candidates without type buckets', () => {
    const candidates = [
      node('redis', 0.9, ['metadata'], 'technology'),
      node('decision-x', 0.5, ['graph'], 'decision'),
      node('project-y', 0.4, ['bm25'], 'project'),
      node('rabbit', 0.3, ['vector'], 'technology'),
    ];
    const anchors = [node('redis', 0.9, ['metadata'], 'technology')];

    const trace = buildKnowledgeTrace(candidates, anchors);

    expect(trace.directMatches.map((n) => n.id)).toEqual(['redis']);
    expect(trace.supportingContext.map((n) => n.id)).toEqual(['decision-x', 'project-y', 'rabbit']);
    expect(trace.additionalContext.count).toBe(0);
  });

  it('puts overflow beyond supportingQuota into Additional Context with names', () => {
    const candidates = [
      node('anchor', 1, ['metadata']),
      ...Array.from({ length: 8 }, (_, i) => node(`extra-${i}`, 0.5 - i * 0.01, ['bm25'])),
    ];
    const anchors = [node('anchor', 1, ['metadata'])];

    const trace = buildKnowledgeTrace(candidates, anchors, {
      directQuota: 1,
      supportingQuota: 3,
      additionalNameLimit: 2,
    });

    expect(trace.supportingContext).toHaveLength(3);
    expect(trace.additionalContext.count).toBe(5);
    expect(trace.additionalContext.names).toEqual(['extra-3', 'extra-4']);
  });

  it('respects options override for quotas', () => {
    const candidates = [
      node('a1', 0.9, ['metadata']),
      node('a2', 0.8, ['metadata']),
      node('s1', 0.7, ['bm25']),
      node('s2', 0.6, ['bm25']),
    ];
    const anchors = [node('a1', 0.9, ['metadata']), node('a2', 0.8, ['metadata'])];

    const trace = buildKnowledgeTrace(candidates, anchors, {
      directQuota: 1,
      supportingQuota: 1,
      additionalNameLimit: 10,
    });

    expect(trace.directMatches.map((n) => n.id)).toEqual(['a1']);
    expect(trace.supportingContext.map((n) => n.id)).toEqual(['a2']);
    expect(trace.additionalContext.count).toBe(2);
    expect(trace.additionalContext.names).toEqual(['s1', 's2']);
  });

  it('handles empty anchors and empty candidates safely', () => {
    expect(buildKnowledgeTrace([], [])).toEqual({
      directMatches: [],
      supportingContext: [],
      additionalContext: { count: 0, names: [] },
    });

    const candidates = [node('only', 0.5, ['bm25'])];
    const trace = buildKnowledgeTrace(candidates, []);
    expect(trace.directMatches).toEqual([]);
    expect(trace.supportingContext.map((n) => n.id)).toEqual(['only']);
  });

  it('ignores anchors that are not in candidateNodes', () => {
    const candidates = [node('kept', 0.5, ['bm25'])];
    const anchors = [node('missing', 0.9, ['metadata'])];
    const trace = buildKnowledgeTrace(candidates, anchors);
    expect(trace.directMatches).toEqual([]);
    expect(trace.supportingContext.map((n) => n.id)).toEqual(['kept']);
  });
});
