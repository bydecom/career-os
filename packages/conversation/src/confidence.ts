import type { RetrievalEngine } from './types.js';

// ---------------------------------------------------------------------------
// Retrieval confidence — weighted sum of engines on selected nodes.
// This is retrieval confidence, not answer-quality confidence.
// Labels (High/Medium/Low) are render-only.
// ---------------------------------------------------------------------------

export const ENGINE_CONFIDENCE_WEIGHTS: Record<RetrievalEngine, number> = {
  metadata: 0.45,
  /** Session carry-over — near graph certainty; the prior turn already verified this focus. */
  context: 0.35,
  graph: 0.3,
  bm25: 0.15,
  vector: 0.1,
};

export function scoreConfidence(engines: Iterable<RetrievalEngine>): number {
  const unique = new Set(engines);
  let score = 0;
  for (const engine of unique) {
    score += ENGINE_CONFIDENCE_WEIGHTS[engine] ?? 0;
  }
  return Math.min(1, score);
}

export type ConfidenceLabel = 'High' | 'Medium' | 'Low';

export function formatConfidenceLabel(score: number): ConfidenceLabel {
  if (score >= 0.7) return 'High';
  if (score >= 0.4) return 'Medium';
  return 'Low';
}
