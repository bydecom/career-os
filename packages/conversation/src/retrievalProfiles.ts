import { InterviewIntent } from './interviewIntent.js';

// ---------------------------------------------------------------------------
// RetrievalProfile — fixed recipe per InterviewIntent (lookup, not agent).
// nodeType values match packages/ontology NodeType string values (lowercase).
// No Alternative type in ontology — ENGINEERING_DECISION uses Decision + Technology.
// ---------------------------------------------------------------------------

export interface SectionSpec {
  /** Ontology node type string, e.g. 'project', 'technology'. */
  nodeType: string;
  /**
   * Preferred retrieval sources. Pipe-separated for multi-source preference
   * (e.g. 'metadata|context'). KnowledgeQueryBuilder uses 'graph' sections
   * to build nodeTypeFilter; other vias guide documentation / future passes.
   */
  via: string;
}

export interface RetrievalProfile {
  sections: SectionSpec[];
  budget: { topK: number; maxChars?: number };
  /** Filename under services/llm/prompts/ — empty = generic verbalize. */
  promptTemplate: string;
}

const GENERIC_PROFILE: RetrievalProfile = {
  sections: [
    { nodeType: 'project', via: 'metadata|context' },
    { nodeType: 'technology', via: 'graph' },
    { nodeType: 'decision', via: 'graph' },
  ],
  budget: { topK: 8 },
  promptTemplate: '',
};

export const RETRIEVAL_PROFILES: Record<InterviewIntent, RetrievalProfile> = {
  [InterviewIntent.INTRODUCTION]: {
    sections: [
      { nodeType: 'person', via: 'metadata' },
      { nodeType: 'profile', via: 'metadata' },
      { nodeType: 'experience', via: 'graph' },
    ],
    budget: { topK: 6 },
    promptTemplate: 'introduction.md',
  },
  [InterviewIntent.PROJECT_STORY]: {
    sections: [
      { nodeType: 'project', via: 'metadata|context' },
      { nodeType: 'technology', via: 'graph' },
      { nodeType: 'decision', via: 'graph' },
      { nodeType: 'evidence', via: 'bm25|vector' },
    ],
    budget: { topK: 8 },
    promptTemplate: 'project_story.md',
  },
  [InterviewIntent.TECH_DISCUSSION]: {
    sections: [
      { nodeType: 'technology', via: 'metadata|context' },
      { nodeType: 'project', via: 'graph' },
      { nodeType: 'decision', via: 'graph' },
    ],
    budget: { topK: 6 },
    promptTemplate: 'technology.md',
  },
  [InterviewIntent.ENGINEERING_DECISION]: {
    sections: [
      { nodeType: 'decision', via: 'metadata|context' },
      { nodeType: 'technology', via: 'graph' },
      { nodeType: 'evidence', via: 'bm25|vector' },
    ],
    budget: { topK: 6 },
    promptTemplate: 'decision.md',
  },
  // Phase 1b placeholders — same generic recipe until dedicated profiles land.
  [InterviewIntent.COMPARE]: GENERIC_PROFILE,
  [InterviewIntent.ARCHITECTURE]: {
    sections: [
      { nodeType: 'project', via: 'metadata|context' },
      { nodeType: 'pattern', via: 'graph' },
      { nodeType: 'technology', via: 'graph' },
      { nodeType: 'decision', via: 'graph' },
    ],
    budget: { topK: 8 },
    promptTemplate: '',
  },
  [InterviewIntent.FOLLOW_UP]: GENERIC_PROFILE,
  [InterviewIntent.CLARIFICATION]: GENERIC_PROFILE,
  [InterviewIntent.CHALLENGE]: {
    sections: [
      { nodeType: 'evidence', via: 'metadata|bm25|vector' },
      { nodeType: 'project', via: 'context|graph' },
      { nodeType: 'decision', via: 'graph' },
    ],
    budget: { topK: 6 },
    promptTemplate: '',
  },
  [InterviewIntent.RECOMMENDATION]: GENERIC_PROFILE,
  [InterviewIntent.UNKNOWN]: GENERIC_PROFILE,
};

export function getRetrievalProfile(intent: InterviewIntent): RetrievalProfile {
  return RETRIEVAL_PROFILES[intent] ?? GENERIC_PROFILE;
}
