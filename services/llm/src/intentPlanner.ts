import {
  InterviewIntent,
  isInterviewIntent,
} from '@career-os/conversation';
import type { LlmProvider, RecentTurn } from './types.js';

// ---------------------------------------------------------------------------
// LLM intent planner — structured fallback ONLY when rule classifier returns null.
// Never chooses retrieval itself; output is validated against InterviewIntent enum.
// ---------------------------------------------------------------------------

export interface LlmPlannerOutput {
  intent: InterviewIntent;
  entity?: string;
  confidence: number;
  needClarification: boolean;
}

const PLANNER_SYSTEM = `You classify interview questions into exactly one InterviewIntent.

Allowed intents (return exactly one string):
INTRODUCTION, PROJECT_STORY, TECH_DISCUSSION, ENGINEERING_DECISION, COMPARE,
ARCHITECTURE, FOLLOW_UP, CLARIFICATION, CHALLENGE, RECOMMENDATION, UNKNOWN

Respond with JSON only:
{"intent":"<ENUM>","entity":"<optional entity name or null>","confidence":0.0-1.0,"needClarification":false}

Rules:
- Prefer UNKNOWN over inventing an intent.
- needClarification=true only when the question is too vague to answer without asking back.
- entity is optional; leave null if unsure.`;

function parsePlannerJson(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1]!.trim() : trimmed;
  return JSON.parse(raw);
}

/**
 * Ask the LLM for a structured intent. Invalid / unknown enums → UNKNOWN.
 * Entity is returned as a string hint only; callers must validate via MetadataIndex.
 */
export async function classifyIntentByLlm(
  question: string,
  recentTurns: RecentTurn[],
  provider: LlmProvider,
): Promise<LlmPlannerOutput> {
  const history =
    recentTurns.length > 0
      ? recentTurns.map((t) => `Q: ${t.question}\nA: ${t.answer.slice(0, 200)}`).join('\n')
      : '(none)';

  const user = [
    `Recent turns:`,
    history,
    ``,
    `Current question: ${question}`,
    ``,
    `Return JSON only.`,
  ].join('\n');

  try {
    const result = await provider.complete({
      system: PLANNER_SYSTEM,
      user,
      temperature: 0,
      thinking: 'minimal',
    });
    const parsed = parsePlannerJson(result.text) as Record<string, unknown>;
    const intentRaw = parsed.intent;
    const intent = isInterviewIntent(intentRaw) ? intentRaw : InterviewIntent.UNKNOWN;
    const confidence =
      typeof parsed.confidence === 'number' && Number.isFinite(parsed.confidence)
        ? Math.min(1, Math.max(0, parsed.confidence))
        : 0;
    const needClarification = parsed.needClarification === true;
    const entity =
      typeof parsed.entity === 'string' && parsed.entity.trim() ? parsed.entity.trim() : undefined;

    return { intent, entity, confidence, needClarification };
  } catch {
    return {
      intent: InterviewIntent.UNKNOWN,
      confidence: 0,
      needClarification: false,
    };
  }
}
