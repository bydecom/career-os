import {
  InterviewIntent,
  isInterviewIntent,
} from '@career-os/conversation';

// ---------------------------------------------------------------------------
// Rule-first intent classifier. Returns null when unsure → Phase 5 LLM fallback.
// ---------------------------------------------------------------------------

export interface ClassifyRuleContext {
  hasMetadataAnchor: boolean;
  isContinuation: boolean;
  lastIntent?: InterviewIntent | string;
}

function asIntent(value: string | undefined): InterviewIntent | undefined {
  if (!value) return undefined;
  return isInterviewIntent(value) ? value : undefined;
}

/**
 * Deterministic rules over the question + session hints.
 * Returns null when no rule fires with enough confidence (ambiguous open questions).
 */
export function classifyIntentByRule(
  question: string,
  context: ClassifyRuleContext,
): InterviewIntent | null {
  const q = question.toLowerCase().trim();

  // Explicit challenge / evidence probes
  if (/hallucin|evidence|invent|fake|prove|true\b|verified/.test(q)) {
    return InterviewIntent.CHALLENGE;
  }

  // Comparison
  if (/compare|vs\.?|versus|difference|so với|so sánh/.test(q)) {
    return InterviewIntent.COMPARE;
  }

  // Architecture
  if (/architect|how does|pipeline|compile|\bir\b|system design|high[- ]level/.test(q)) {
    return InterviewIntent.ARCHITECTURE;
  }

  // Introduction / about me
  if (
    /\b(introduce yourself|tell me about yourself|who are you|giới thiệu|bản thân|about you)\b/.test(
      q,
    )
  ) {
    return InterviewIntent.INTRODUCTION;
  }

  // Engineering decision / tradeoff
  if (
    /\b(why did you|why choose|trade[- ]?off|decision|thay vì|vì sao chọn|lựa chọn)\b/.test(q)
  ) {
    return InterviewIntent.ENGINEERING_DECISION;
  }

  // Tech discussion (named stack / skill keywords)
  if (
    /\b(skill|tech|stack|typescript|python|redis|rabbitmq|nodejs|react|qdrant|gemini)\b/.test(q)
  ) {
    return InterviewIntent.TECH_DISCUSSION;
  }

  // Explicit project story cues
  if (
    /\b(project|dự án|tell me about|walk me through|what did you build|career[\s-]?os|graphrag)\b/.test(
      q,
    )
  ) {
    return InterviewIntent.PROJECT_STORY;
  }

  // Continuation with prior intent — inherit rather than guess
  if (context.isContinuation) {
    const last = asIntent(context.lastIntent);
    if (last && last !== InterviewIntent.UNKNOWN) {
      return InterviewIntent.FOLLOW_UP;
    }
  }

  // Bare pronoun follow-ups without prior intent → clarification
  if (context.isContinuation && !context.hasMetadataAnchor) {
    return InterviewIntent.CLARIFICATION;
  }

  // Short / vague without anchors — ask LLM (Phase 5) or UNKNOWN
  if (q.length < 12 && !context.hasMetadataAnchor) {
    return null;
  }

  // Default project story when we have an entity anchor
  if (context.hasMetadataAnchor) {
    return InterviewIntent.PROJECT_STORY;
  }

  // Ambiguous — let LLM planner decide if wired; else UNKNOWN at call site
  return null;
}

/**
 * Resolve final intent: rule result, with continuation fallback to lastIntent
 * when the rule returned a generic FOLLOW_UP / null-ish default.
 */
export function resolveInterviewIntent(
  question: string,
  context: ClassifyRuleContext,
  llmFallback?: InterviewIntent | null,
): InterviewIntent {
  const ruled = classifyIntentByRule(question, context);

  if (ruled === InterviewIntent.FOLLOW_UP) {
    const last = asIntent(context.lastIntent);
    if (last) return last;
  }

  if (ruled !== null) return ruled;

  if (llmFallback && isInterviewIntent(llmFallback)) {
    return llmFallback;
  }

  // Continuation without rule hit → keep last intent
  if (context.isContinuation) {
    const last = asIntent(context.lastIntent);
    if (last) return last;
  }

  return InterviewIntent.UNKNOWN;
}
