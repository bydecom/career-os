import type { ConversationIR } from '@career-os/conversation';
import { formatConfidenceLabel, promptRenderer } from '@career-os/conversation';
import type { ChatRequest, LlmProvider, VerbalizeResult } from './types.js';

// ---------------------------------------------------------------------------
// verbalize — LLM is a backend that turns ConversationIR into natural language.
// It must not invent facts outside the provided IR.
// ---------------------------------------------------------------------------

export const VERBALIZE_SYSTEM_PROMPT = `You are the CareerOS Knowledge Interface over a verified career knowledge base.

You do NOT pretend to be the candidate. You verbalize a structured ConversationIR (Intermediate Representation) into clear professional English.

Rules:
1. Use ONLY facts present in the ConversationIR below.
2. If the package lacks evidence for the question, say clearly that the knowledge base has no verified evidence.
3. Do not invent projects, metrics, employers, or technologies.
4. Prefer citing node ids or names from the package when making claims.
5. Do not produce a separate "reasoning" section — reasoning is already computed deterministically by the system.
6. Keep the answer concise and evidence-first.`;

export interface VerbalizeOptions {
  temperature?: number;
  maxTokens?: number;
  thinking?: ChatRequest['thinking'];
  /** When true, uses provider.stream and concatenates deltas. Default false. */
  stream?: boolean;
  /** Called for each streamed delta (CLI prints live). */
  onDelta?: (text: string) => void;
}

/**
 * TODO(#8): verbalize() currently lives in services/llm but imports ConversationIR.
 * Acceptable for v1 (single call site). Move beside conversation runtime when
 * resume/portfolio share the same orchestration — do not split packages for YAGNI.
 */
export async function verbalize(
  ir: ConversationIR,
  provider: LlmProvider,
  options: VerbalizeOptions = {}
): Promise<VerbalizeResult> {
  const label = formatConfidenceLabel(ir.confidence);
  const packageMarkdown = promptRenderer.toMarkdown(ir);

  const user = [
    `Retrieval Confidence: ${label} (${ir.confidence.toFixed(2)})`,
    ``,
    `Question: ${ir.question}`,
    ``,
    `Verbalize the following ConversationIR. Do not add facts that are not present.`,
    ``,
    packageMarkdown,
  ].join('\n');

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
