import type { KnowledgeGraph } from '@career-os/ontology';
import { scoreConfidence } from './confidence.js';
import type {
  CandidateNode,
  ConversationEdge,
  ConversationIR,
  ConversationSection,
  RetrieveHit,
  RetrievalEngine,
  RetrievalTraceStep,
} from './types.js';

// ---------------------------------------------------------------------------
// Builder — assemble ConversationIR from retrieve hits + graph edges.
// Does not truncate (that's budget.ts) and does not render prompts.
// ---------------------------------------------------------------------------

const EXCERPT_CHARS = 400;

function excerptOf(raw: string, max = EXCERPT_CHARS): string {
  const trimmed = raw.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function enginesOf(hit: RetrieveHit): RetrievalEngine[] {
  return hit.explanation.engines ?? [];
}

function toCandidate(hit: RetrieveHit): CandidateNode {
  return {
    id: hit.node.id,
    type: hit.node.type,
    name: hit.node.name,
    excerpt: excerptOf(hit.node.body.raw),
    score: hit.explanation.score,
    engines: enginesOf(hit),
  };
}

function sectionHeading(type: string): string {
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
}

function buildSections(candidates: CandidateNode[]): ConversationSection[] {
  const byHeading = new Map<string, string[]>();
  for (const node of candidates) {
    const heading = sectionHeading(node.type);
    const lines = byHeading.get(heading) ?? [];
    lines.push(`### ${node.name} (\`${node.id}\`)\n${node.excerpt}`);
    byHeading.set(heading, lines);
  }

  const order = ['Projects', 'Technologies', 'Experiences', 'Companies', 'Decisions', 'Other'];
  const sections: ConversationSection[] = [];
  for (const heading of order) {
    const lines = byHeading.get(heading);
    if (lines?.length) sections.push({ heading, body: lines.join('\n\n') });
  }
  return sections;
}

function relatedEdges(graph: KnowledgeGraph, selectedIds: Set<string>): ConversationEdge[] {
  return graph.edges
    .filter((e) => selectedIds.has(e.sourceNode) && selectedIds.has(e.targetNode))
    .map((e) => ({ source: e.sourceNode, target: e.targetNode, type: e.type }));
}

export interface BuildConversationOptions {
  /** Max candidates before budget pass. Default 12. */
  topK?: number;
}

/**
 * Builds ConversationIR from ranked retrieve hits.
 * Anchor nodes = hits whose engines include 'metadata'.
 */
export function buildConversationIR(
  question: string,
  hits: RetrieveHit[],
  graph: KnowledgeGraph,
  options: BuildConversationOptions = {}
): ConversationIR {
  const topK = options.topK ?? 12;
  const selected = hits.slice(0, topK);
  const candidateNodes = selected.map(toCandidate);
  // Anchors = deterministic metadata hits OR session carry-over (context engine).
  const anchorNodes = candidateNodes.filter(
    (n) => n.engines.includes('metadata') || n.engines.includes('context'),
  );
  const selectedIds = new Set(candidateNodes.map((n) => n.id));

  const retrievalTrace: RetrievalTraceStep[] = hits.map((hit, index) => ({
    nodeId: hit.node.id,
    name: hit.node.name,
    engines: enginesOf(hit),
    selected: index < topK,
    rank: index + 1,
  }));

  const allEngines = candidateNodes.flatMap((n) => n.engines);
  const confidence = scoreConfidence(allEngines);
  const sections = buildSections(candidateNodes);
  const edges = relatedEdges(graph, selectedIds);
  const tokenBudgetHint = candidateNodes.reduce((sum, n) => sum + n.excerpt.length + n.name.length, 0);

  return {
    question,
    confidence,
    anchorNodes,
    candidateNodes,
    edges,
    sections,
    retrievalTrace,
    tokenBudgetHint,
  };
}
