import type { CandidateNode, RetrievalEngine } from './types.js';

// ---------------------------------------------------------------------------
// Knowledge Trace — presentation projection over retrieved candidates.
// Zero LLM. IR-independent: only needs candidateNodes + anchorNodes.
// Direct Matches = metadata-certain anchors (not "most important").
// ---------------------------------------------------------------------------

export interface KnowledgeTraceOptions {
  /** Max Direct Matches (anchors). Default 3. */
  directQuota?: number;
  /** Max Supporting Context nodes. Default 6. */
  supportingQuota?: number;
  /** Max names listed under Additional Context. Default 10. */
  additionalNameLimit?: number;
}

export interface KnowledgeTraceNode {
  id: string;
  type: string;
  name: string;
  score: number;
  engines: RetrievalEngine[];
}

export interface KnowledgeTrace {
  directMatches: KnowledgeTraceNode[];
  supportingContext: KnowledgeTraceNode[];
  additionalContext: { count: number; names: string[] };
}

const DEFAULTS: Required<KnowledgeTraceOptions> = {
  directQuota: 3,
  supportingQuota: 6,
  additionalNameLimit: 10,
};

function toTraceNode(node: CandidateNode): KnowledgeTraceNode {
  return {
    id: node.id,
    type: node.type,
    name: node.name,
    score: node.score,
    engines: node.engines,
  };
}

function byScoreDesc(a: CandidateNode, b: CandidateNode): number {
  return b.score - a.score;
}

/**
 * Projects candidate + anchor nodes into a recruiter-readable Knowledge Trace.
 * Overflow is disclosed as Additional Context — never hard-deleted.
 */
export function buildKnowledgeTrace(
  candidateNodes: CandidateNode[],
  anchorNodes: CandidateNode[],
  options: KnowledgeTraceOptions = {},
): KnowledgeTrace {
  const { directQuota, supportingQuota, additionalNameLimit } = { ...DEFAULTS, ...options };

  const candidateById = new Map(candidateNodes.map((n) => [n.id, n]));
  const anchorsInCandidates = anchorNodes
    .map((a) => candidateById.get(a.id))
    .filter((n): n is CandidateNode => n !== undefined)
    .sort(byScoreDesc);

  const directMatches = anchorsInCandidates.slice(0, directQuota).map(toTraceNode);
  const directIds = new Set(directMatches.map((n) => n.id));

  const remaining = candidateNodes
    .filter((n) => !directIds.has(n.id))
    .sort(byScoreDesc);

  const supportingContext = remaining.slice(0, supportingQuota).map(toTraceNode);
  const overflow = remaining.slice(supportingQuota);

  return {
    directMatches,
    supportingContext,
    additionalContext: {
      count: overflow.length,
      names: overflow.slice(0, additionalNameLimit).map((n) => n.name),
    },
  };
}
