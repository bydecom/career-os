import type { RetrievalProfile, SectionSpec } from '@career-os/conversation';

// ---------------------------------------------------------------------------
// KnowledgeQueryBuilder — translates RetrievalProfile → Retriever options.
// One fuse pass; nodeTypeFilter only constrains graph expansion (Phase 2).
// ---------------------------------------------------------------------------

export type { SectionSpec };

export interface QueryPlan {
  entityQuery: string;
  /** Graph-expansion type filter (ontology lowercase strings). */
  nodeTypeFilters: string[];
  carryOverNodeIds?: string[];
}

/**
 * Build a single retrieve plan from the profile.
 * Sections with via containing 'graph' contribute to nodeTypeFilters.
 * recruiterInterest (optional) reorders filters — higher interest first for
 * tie-break visibility when budget truncates; does not change RRF weights.
 */
export function buildQueryPlan(
  question: string,
  profile: RetrievalProfile,
  carryOverNodeIds: string[] | undefined,
  recruiterInterest?: Record<string, number>,
): QueryPlan {
  const graphTypes = profile.sections
    .filter((s) => s.via.includes('graph'))
    .map((s) => s.nodeType);

  // Dedupe preserving first-seen order from profile
  const seen = new Set<string>();
  let nodeTypeFilters: string[] = [];
  for (const t of graphTypes) {
    if (!seen.has(t)) {
      seen.add(t);
      nodeTypeFilters.push(t);
    }
  }

  if (recruiterInterest && Object.keys(recruiterInterest).length > 0) {
    nodeTypeFilters = [...nodeTypeFilters].sort((a, b) => {
      const ia = recruiterInterest[a] ?? 0;
      const ib = recruiterInterest[b] ?? 0;
      if (ib !== ia) return ib - ia;
      return nodeTypeFilters.indexOf(a) - nodeTypeFilters.indexOf(b);
    });
  }

  return {
    entityQuery: question,
    nodeTypeFilters,
    carryOverNodeIds,
  };
}
