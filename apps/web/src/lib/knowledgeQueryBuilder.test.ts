import { describe, it, expect } from 'vitest';
import { InterviewIntent, RETRIEVAL_PROFILES } from '@career-os/conversation';
import { buildQueryPlan } from './knowledgeQueryBuilder.js';

describe('buildQueryPlan', () => {
  it('collects graph nodeTypes for PROJECT_STORY', () => {
    const plan = buildQueryPlan(
      'Dự án này có gì đặc biệt?',
      RETRIEVAL_PROFILES[InterviewIntent.PROJECT_STORY],
      ['career-os'],
    );
    expect(plan.entityQuery).toBe('Dự án này có gì đặc biệt?');
    expect(plan.carryOverNodeIds).toEqual(['career-os']);
    // Project/Evidence are not via graph — only Technology + Decision
    expect(plan.nodeTypeFilters).toEqual(['technology', 'decision']);
  });

  it('sorts nodeTypeFilters by recruiterInterest when provided', () => {
    const plan = buildQueryPlan(
      'q',
      RETRIEVAL_PROFILES[InterviewIntent.PROJECT_STORY],
      undefined,
      { decision: 5, technology: 1 },
    );
    expect(plan.nodeTypeFilters[0]).toBe('decision');
    expect(plan.nodeTypeFilters[1]).toBe('technology');
  });
});
