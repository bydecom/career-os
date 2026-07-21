import type { ConversationIR } from '@career-os/conversation';
import { formatConfidenceLabel, promptRenderer } from '@career-os/conversation';
import type { ChatRequest, LlmProvider, VerbalizeResult } from './types.js';

// ---------------------------------------------------------------------------
// verbalize — LLM turns ConversationIR into natural language.
// It must not invent facts outside the provided IR.
// ---------------------------------------------------------------------------

export const VERBALIZE_SYSTEM_PROMPT = `You are speaking AS the candidate whose knowledge base this is — first person ("I"), not a third-party AI describing them.

Every claim you make must be grounded in the ConversationIR (Intermediate Representation) below — that IR is your memory of what you actually did.

CRITICAL — language:
- Match the language of the CURRENT question only.
- English question → answer entirely in English. Vietnamese question → answer entirely in Vietnamese.
- Do NOT follow the language of prior turns, ConversationIR excerpts, or node names when it conflicts with the current question.
- Never mix languages in the answer body.

Rules:
1. Use ONLY facts present in the ConversationIR below. Speak in first person as the candidate.
2. If the package lacks evidence for the question, say clearly (still in first person) that you don't have verified evidence for that in your knowledge base — do not guess.
3. Do not invent projects, metrics, employers, or technologies not present in the IR.
4. Prefer citing node ids or names from the package when making claims.
5. Do not produce a separate "reasoning" section — reasoning is already computed deterministically by the system.
6. Keep the answer concise and evidence-first.`;

export interface RecentTurn {
  question: string;
  answer: string;
}

export interface VerbalizeOptions {
  temperature?: number;
  maxTokens?: number;
  thinking?: ChatRequest['thinking'];
  /** When true, uses provider.stream and concatenates deltas. Default false. */
  stream?: boolean;
  /** Called for each streamed delta (CLI prints live). */
  onDelta?: (text: string) => void;
  /** Prior turns in this session — conversational continuity only, not new facts. */
  recentTurns?: RecentTurn[];
}

/** Lightweight script detector — enough to pin answer language for Gemini. */
export function detectQuestionLanguage(question: string): 'vi' | 'en' {
  // Latin Vietnamese letters with diacritics, or common standalone Vietnamese words.
  if (/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(question)) {
    return 'vi';
  }
  if (/\b(là|của|với|không|gì|này|đó|sao|thế|cho|tôi|bạn|dự án|có)\b/i.test(question)) {
    return 'vi';
  }
  return 'en';
}

function languageDirective(lang: 'vi' | 'en'): string {
  return lang === 'vi'
    ? 'Answer language: Vietnamese. Write the entire answer in Vietnamese.'
    : 'Answer language: English. Write the entire answer in English — do not use Vietnamese.';
}

/**
 * Shared user-prompt builder for verbalize() and the interview Runtime Trace.
 * Single source of truth so stage 'prompt' always matches what the LLM receives.
 */
export function buildVerbalizeUserPrompt(
  ir: ConversationIR,
  recentTurns?: RecentTurn[],
): string {
  const label = formatConfidenceLabel(ir.confidence);
  const lang = detectQuestionLanguage(ir.question);
  const conversationBlock =
    recentTurns && recentTurns.length > 0
      ? [
          `Conversation so far (context only — do NOT copy its language):`,
          ...recentTurns.map(
            (t) => `Q: ${t.question}\nA: ${t.answer.length > 300 ? `${t.answer.slice(0, 299)}…` : t.answer}`,
          ),
          ``,
        ]
      : [];

  return [
    ...conversationBlock,
    `Retrieval Confidence: ${label} (${ir.confidence.toFixed(2)})`,
    ``,
    `Question: ${ir.question}`,
    languageDirective(lang),
    ``,
    `Verbalize the following ConversationIR. Do not add facts that are not present.`,
    ``,
    promptRenderer.toMarkdown(ir),
  ].join('\n');
}

/**
 * TODO(#8): verbalize() currently lives in services/llm but imports ConversationIR.
 * Acceptable for v1 (single call site). Move beside conversation runtime when
 * resume/portfolio share the same orchestration — do not split packages for YAGNI.
 */
export async function verbalize(
  ir: ConversationIR,
  provider: LlmProvider,
  options: VerbalizeOptions = {},
): Promise<VerbalizeResult> {
  const user = buildVerbalizeUserPrompt(ir, options.recentTurns);

  const request: ChatRequest = {
    system: VERBALIZE_SYSTEM_PROMPT,
    user,
    temperature: options.temperature ?? 0.2,
    maxTokens: options.maxTokens,
    thinking: options.thinking ?? 'minimal',
  };

  if (options.stream) {
    let answer = '';
    let usage: VerbalizeResult['usage'];
    for await (const chunk of provider.stream(request)) {
      if (chunk.type === 'delta') {
        answer += chunk.text;
        options.onDelta?.(chunk.text);
      } else if (chunk.type === 'done') {
        usage = chunk.usage;
      }
    }
    if (!answer.trim()) {
      throw new Error('LLM stream returned an empty response.');
    }
    return {
      answer: answer.trim(),
      provider: provider.name,
      model: provider.model,
      usage,
    };
  }

  const result = await provider.complete(request);
  return {
    answer: result.text,
    provider: provider.name,
    model: provider.model,
    usage: result.usage,
  };
}
