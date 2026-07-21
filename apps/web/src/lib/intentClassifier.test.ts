import { describe, it, expect } from 'vitest';
import { InterviewIntent } from '@career-os/conversation';
import { classifyIntentByRule, resolveInterviewIntent } from './intentClassifier.js';

describe('classifyIntentByRule', () => {
  const base = { hasMetadataAnchor: false, isContinuation: false };

  it('maps core English / Vietnamese cues to MVP intents', () => {
    expect(classifyIntentByRule('Tell me about yourself', base)).toBe(
      InterviewIntent.INTRODUCTION,
    );
    expect(classifyIntentByRule('Giới thiệu về bản thân', base)).toBe(
      InterviewIntent.INTRODUCTION,
    );
    expect(classifyIntentByRule('Tell me about CareerOS', base)).toBe(
      InterviewIntent.PROJECT_STORY,
    );
    expect(classifyIntentByRule('Why did you use Redis?', base)).toBe(
      InterviewIntent.ENGINEERING_DECISION,
    );
    expect(classifyIntentByRule('How does the pipeline compile IR?', base)).toBe(
      InterviewIntent.ARCHITECTURE,
    );
    expect(classifyIntentByRule('So với RabbitMQ thì sao?', base)).toBe(InterviewIntent.COMPARE);
    expect(classifyIntentByRule('Tell me about TypeScript', base)).toBe(
      InterviewIntent.TECH_DISCUSSION,
    );
    expect(classifyIntentByRule('Does this hallucinate?', base)).toBe(InterviewIntent.CHALLENGE);
  });

  it('returns null for short ambiguous questions without anchors', () => {
    expect(classifyIntentByRule('Hmm?', base)).toBeNull();
  });

  it('inherits last intent on continuation when rule says FOLLOW_UP', () => {
    const intent = resolveInterviewIntent(
      'Dự án này có gì đặc biệt?',
      {
        hasMetadataAnchor: false,
        isContinuation: true,
        lastIntent: InterviewIntent.PROJECT_STORY,
      },
      null,
    );
    expect(intent).toBe(InterviewIntent.PROJECT_STORY);
  });

  it('uses LLM fallback when rule returns null', () => {
    const intent = resolveInterviewIntent(
      'Hmm?',
      base,
      InterviewIntent.CLARIFICATION,
    );
    expect(intent).toBe(InterviewIntent.CLARIFICATION);
  });
});
