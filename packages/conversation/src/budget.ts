import type { ConversationIR, CandidateNode } from './types.js';
import { scoreConfidence } from './confidence.js';

// ---------------------------------------------------------------------------
// Budget pass — truncate / topK / dedupe for Phase 3A.
// This is NOT a Knowledge Optimizer pass (that is v2+ / Evaluation-driven).
// ---------------------------------------------------------------------------

export interface BudgetOptions {
  topK?: number;
  /** Max total characters across all excerpts. Default 6000. */
  maxChars?: number;
  /** Max characters per node excerpt. Default 400. */
  maxExcerptChars?: number;
}

const DEFAULTS: Required<BudgetOptions> = {
  topK: 8,
  maxChars: 6000,
  maxExcerptChars: 400,
};

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

/**
 * Applies a deterministic budget to ConversationIR.
 * Preserves score order; recomputes confidence from remaining engines.
 */
export function applyBudget(ir: ConversationIR, options: BudgetOptions = {}): ConversationIR {
  const { topK, maxChars, maxExcerptChars } = { ...DEFAULTS, ...options };

  const seen = new Set<string>();
  const kept: CandidateNode[] = [];
  let used = 0;

  for (const node of ir.candidateNodes) {
    if (kept.length >= topK) break;
    if (seen.has(node.id)) continue;
    seen.add(node.id);

    const excerpt = truncate(node.excerpt, maxExcerptChars);
    if (used + excerpt.length > maxChars && kept.length > 0) break;

    kept.push({ ...node, excerpt });
    used += excerpt.length;
  }

  const keptIds = new Set(kept.map((n) => n.id));
  const anchorNodes = ir.anchorNodes.filter((n) => keptIds.has(n.id)).map((n) => {
    const match = kept.find((k) => k.id === n.id)!;
    return match;
  });

  const edges = ir.edges.filter((e) => keptIds.has(e.source) && keptIds.has(e.target));
  const retrievalTrace = ir.retrievalTrace.map((step) => ({
    ...step,
    selected: keptIds.has(step.nodeId),
  }));

  // Rebuild sections from kept nodes (same grouping rules as builder).
  const byHeading = new Map<string, string[]>();
  const headingFor = (type: string) => {
    switch (type) {
      case 'project':
        return 'Projects';
      case 'technology':
        return 'Technologies';
      case 'experience':
        return 'Experiences';
      case 'company':
        return 'Companies';
      case 'decision':
        return 'Decisions';
      default:
        return 'Other';
    }
  };
  for (const node of kept) {
    const heading = headingFor(node.type);
    const lines = byHeading.get(heading) ?? [];
    lines.push(`### ${node.name} (\`${node.id}\`)\n${node.excerpt}`);
    byHeading.set(heading, lines);
  }
  const order = ['Projects', 'Technologies', 'Experiences', 'Companies', 'Decisions', 'Other'];
  const sections = order
    .filter((h) => byHeading.has(h))
    .map((heading) => ({ heading, body: byHeading.get(heading)!.join('\n\n') }));

  return {
    question: ir.question,
    confidence: scoreConfidence(kept.flatMap((n) => n.engines)),
    anchorNodes,
    candidateNodes: kept,
    edges,
    sections,
    retrievalTrace,
    tokenBudgetHint: used,
  };
}
