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

function tryKeep(
  node: CandidateNode,
  kept: CandidateNode[],
  seen: Set<string>,
  used: number,
  topK: number,
  maxChars: number,
  maxExcerptChars: number,
): { kept: boolean; used: number } {
  if (kept.length >= topK) return { kept: false, used };
  if (seen.has(node.id)) return { kept: false, used };

  const excerpt = truncate(node.excerpt, maxExcerptChars);
  if (used + excerpt.length > maxChars && kept.length > 0) {
    return { kept: false, used };
  }

  seen.add(node.id);
  kept.push({ ...node, excerpt });
  return { kept: true, used: used + excerpt.length };
}

/**
 * Applies a deterministic budget to ConversationIR.
 *
 * Anchors (metadata / context engines) are reserved first so a low-scoring
 * carry-over focus node cannot be silently dropped by BM25 flood, then the
 * remaining topK slots fill by score order. Character budget still applies.
 */
export function applyBudget(ir: ConversationIR, options: BudgetOptions = {}): ConversationIR {
  const { topK, maxChars, maxExcerptChars } = { ...DEFAULTS, ...options };

  const seen = new Set<string>();
  const kept: CandidateNode[] = [];
  let used = 0;

  const anchorIds = new Set(ir.anchorNodes.map((n) => n.id));
  const candidateById = new Map(ir.candidateNodes.map((n) => [n.id, n]));

  // Pass 1: reserve every anchor that still appears in candidates.
  for (const anchor of ir.anchorNodes) {
    const node = candidateById.get(anchor.id) ?? anchor;
    const result = tryKeep(node, kept, seen, used, topK, maxChars, maxExcerptChars);
    used = result.used;
  }

  // Pass 2: fill remaining topK by existing score order.
  for (const node of ir.candidateNodes) {
    if (kept.length >= topK) break;
    if (anchorIds.has(node.id) && seen.has(node.id)) continue;
    const result = tryKeep(node, kept, seen, used, topK, maxChars, maxExcerptChars);
    used = result.used;
  }

  const keptIds = new Set(kept.map((n) => n.id));
  const anchorNodes = ir.anchorNodes
    .filter((n) => keptIds.has(n.id))
    .map((n) => kept.find((k) => k.id === n.id)!);

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
