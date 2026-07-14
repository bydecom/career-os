import type { LlmUsage } from '../../types.js';

// ---------------------------------------------------------------------------
// Gemini REST JSON → normalized ChatResult pieces.
// ---------------------------------------------------------------------------

export interface GeminiGenerateContentResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

export function extractText(data: GeminiGenerateContentResponse): string {
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
}

export function toLlmUsage(
  meta: GeminiGenerateContentResponse['usageMetadata'] | undefined,
  provider: string,
  model: string
): LlmUsage | undefined {
  if (!meta) return undefined;
  const inputTokens = meta.promptTokenCount;
  const outputTokens = meta.candidatesTokenCount;
  return {
    inputTokens,
    outputTokens,
    totalTokens:
      meta.totalTokenCount ??
      (inputTokens !== undefined && outputTokens !== undefined ? inputTokens + outputTokens : undefined),
    provider,
    model,
  };
}
