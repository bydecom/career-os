// ---------------------------------------------------------------------------
// Continuation detection — lightweight query-understanding for multi-turn QA.
// Not NLU: regex heuristics only. Known limitation: Vietnamese pronouns
// ("đó/nó") are common outside anaphora — acceptable for v1 demo.
// ---------------------------------------------------------------------------

const PRONOUN_RE = /\b(này|đó|nó|ấy|it|this|that|these|those)\b/i;
const COMPARISON_RE = /\b(so với|so sánh|còn.*thì|vs\.?|versus|compare[d]?)\b/i;

/**
 * Continuation if: (a) pronoun + no metadata anchors this turn, OR
 * (b) comparison/resume phrase (always needs prior focus even when a new
 * entity also matched — e.g. "So với RabbitMQ thì sao?").
 */
export function detectContinuation(question: string, metadataMatchCount: number): boolean {
  if (COMPARISON_RE.test(question)) return true;
  return PRONOUN_RE.test(question) && metadataMatchCount === 0;
}
