import type { ChatRequest } from '../../types.js';
import { mapThinkingToGeminiBudget } from './thinkingMapper.js';

// ---------------------------------------------------------------------------
// ChatRequest (port) → Gemini REST JSON (adapter-private).
// ---------------------------------------------------------------------------

const DEFAULT_SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
];

export function toGeminiRequest(request: ChatRequest): Record<string, unknown> {
  const generationConfig: Record<string, unknown> = {
    temperature: request.temperature ?? 0.2,
  };
  if (request.maxTokens !== undefined) generationConfig.maxOutputTokens = request.maxTokens;
  if (request.topP !== undefined) generationConfig.topP = request.topP;
  if (request.topK !== undefined) generationConfig.topK = request.topK;

  const budget = mapThinkingToGeminiBudget(request.thinking);
  if (budget !== undefined) {
    generationConfig.thinkingConfig = { thinkingBudget: budget };
  }

  // tools / toolChoice intentionally ignored until tool calling ships.
  // Gemini functionDeclarations format must never leak into ChatRequest.

  return {
    systemInstruction: { parts: [{ text: request.system }] },
    contents: [{ role: 'user', parts: [{ text: request.user }] }],
    generationConfig,
    safetySettings: DEFAULT_SAFETY_SETTINGS,
  };
}
