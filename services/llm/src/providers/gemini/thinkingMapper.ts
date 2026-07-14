  import type { ThinkingLevel } from '../../types.js';

  // ---------------------------------------------------------------------------
  // Gemini-only mapping: abstract ThinkingLevel → thinkingBudget.
  // Other providers (OpenAI reasoning_effort, etc.) get their own mapper.
  // ---------------------------------------------------------------------------

  const BUDGET: Record<ThinkingLevel, number> = {
    none: 0,
    minimal: 1024,
    medium: 8192,
    high: 24576,
  };

  export function mapThinkingToGeminiBudget(level: ThinkingLevel | undefined): number | undefined {
    if (level === undefined) return undefined;
    return BUDGET[level];
  }
