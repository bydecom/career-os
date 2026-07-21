import { describe, it, expect } from 'vitest';
import { InterviewIntent, RETRIEVAL_PROFILES, getRetrievalProfile } from '../src/index.js';

describe('InterviewIntent + RetrievalProfiles', () => {
  it('has a profile for every enum value', () => {
    for (const intent of Object.values(InterviewIntent)) {
      const profile = getRetrievalProfile(intent);
      expect(profile.sections.length).toBeGreaterThan(0);
      expect(profile.budget.topK).toBeGreaterThan(0);
    }
  });

  it('PROJECT_STORY includes project + graph technology/decision', () => {
    const p = RETRIEVAL_PROFILES[InterviewIntent.PROJECT_STORY];
    expect(p.sections.map((s) => s.nodeType)).toEqual([
      'project',
      'technology',
      'decision',
      'evidence',
    ]);
    expect(p.promptTemplate).toBe('project_story.md');
  });

  it('ENGINEERING_DECISION does not invent Alternative node type', () => {
    const types = RETRIEVAL_PROFILES[InterviewIntent.ENGINEERING_DECISION].sections.map(
      (s) => s.nodeType,
    );
    expect(types).not.toContain('alternative');
    expect(types).toContain('decision');
    expect(types).toContain('technology');
  });
});
