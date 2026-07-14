import type { LlmProvider } from './types.js';
import { GeminiProvider } from './providers/gemini.js';

// ---------------------------------------------------------------------------
// Factory — business layer never `new GeminiProvider(...)` directly.
// ---------------------------------------------------------------------------

export type ProviderKind = 'gemini';

export interface CreateProviderOptions {
  provider: ProviderKind;
  apiKey?: string;
  model?: string;
}

export function createProvider(options: CreateProviderOptions): LlmProvider {
  switch (options.provider) {
    case 'gemini': {
      const apiKey = options.apiKey ?? process.env.GEMINI_API_KEY ?? '';
      return new GeminiProvider({ apiKey, model: options.model });
    }
    default: {
      const _exhaustive: never = options.provider;
      throw new Error(`Unknown LLM provider: ${String(_exhaustive)}`);
    }
  }
}
