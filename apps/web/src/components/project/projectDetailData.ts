import type { ResumeIR, ResumeProject } from '@career-os/resume';
import { pickFeaturedProjects } from '@/components/marketing/featuredData';
import type { FeaturedProduct } from '@/components/marketing/FeaturedProjects';

export type ProjectLink = { label: string; href: string };

export type ProjectCapabilityCard = {
  title: string;
  description: string;
};

export type ProjectDetailView = {
  id: string;
  name: string;
  capability?: string;
  tagline?: string;
  role?: string;
  period?: string;
  overview: string;
  problem: string;
  constraints: string[];
  architecture: {
    summary: string;
    /** Runtime pipeline steps (numbered list in source markdown). */
    steps: string[];
  };
  /** Core capabilities — curated depth for Narrative project pages. */
  capabilities?: ProjectCapabilityCard[];
  decisions: string[];
  tradeoffs: string[];
  timeline: string[];
  technologies: string[];
  metrics: string[];
  evidence: string[];
  lessons: string[];
  related: string[];
  sources: string[];
  links: ProjectLink[];
};

/** Hire-first curated depth until Narrative projection is compiler-driven. */
const CURATED: Record<string, Omit<ProjectDetailView, 'id' | 'name' | 'role' | 'period' | 'technologies'>> = {
  'career-os': {
    capability: 'Knowledge Compiler',
    tagline: 'Personal Knowledge Compiler',
    overview:
      'CareerOS treats career knowledge as source code. Markdown nodes compile into a Knowledge Graph IR, then project into Resume, Portfolio, and Interview surfaces — without rewriting the story for each view.',
    problem:
      'Engineers maintain parallel truths: a CV, a portfolio site, interview talking points, and scattered notes. Each rewrite drifts. Recruiters see polish; the author sees copy-paste debt.',
    constraints: [
      'Single authorable source in Markdown — no CMS admin UI in v1',
      'Deterministic compile path before any LLM verbalization',
      'Hire-first surfaces first; Studio / Dashboard deferred',
    ],
    architecture: {
      summary: 'Source → Compiler → Knowledge Graph IR → typed projections.',
      steps: ['Markdown nodes', 'Lexer / Parser / Ontology', 'Graph IR', 'ResumeIR · PortfolioIR · ConversationIR'],
    },
    decisions: [
      'Edges are compiler output — wiki-links become graph edges, not hand-authored relationship tables.',
      'Compiler packages stay pure libraries with zero runtime I/O — services own the filesystem.',
      'Landing sells the product demo; deep ontology docs live under /project and /about.',
    ],
    tradeoffs: [
      'Curated Product Cards on Landing vs fully IR-driven copy — chose curated for hire clarity until PortfolioIR lands.',
      'MarketingShell for Project Detail vs AppShell — chose MarketingShell so recruiters never hit a login wall.',
    ],
    timeline: [
      '2026-07 — Vision, ADRs, ontology, monorepo compiler skeleton',
      '2026-07 — ResumeIR + Landing IA (Hero → Pipeline → Architecture → Proof)',
      'Next — Portfolio depth → Deploy → Apply; Phase 2 capabilities after URL exists',
    ],
    metrics: ['48 nodes', '95 edges', '6 compiler packages', 'ResumeIR live'],
    evidence: [
      'docs/02-architecture — system + compiler + frontend lock',
      'docs/01-adr — progressive certainty, hybrid retrieval, AI-as-view',
      'career-data/nodes — authored source of truth',
      'packages/* — deterministic compile libraries',
    ],
    lessons: [
      'Domain-first folders beat tech-stack folders when knowledge is the product.',
      'If Landing explains philosophy but not proof, recruiters bounce — Architecture + Featured Products close that gap.',
    ],
    related: ['TypeScript', 'unified / remark', 'RabbitMQ (pipeline events)', 'ResumeIR', 'Knowledge Graph'],
    sources: ['career-data/nodes/project/career-os.md', 'docs/02-architecture/01-system-architecture.md'],
    links: [
      { label: 'Landing Architecture', href: '/#architecture' },
      { label: 'Portfolio', href: '/portfolio' },
    ],
  },
  'graphrag-code': {
    capability: 'Code Reasoning',
    tagline: 'Structural answers without re-reading the repo',
    overview:
      'A Python-native code knowledge graph that answers structural questions from a pre-built graph instead of re-feeding source files to an LLM on every query.',
    problem:
      '“What breaks if I change this function?” is a structural question with a deterministic answer — yet teams still pay tokens for the model to re-reason over large code slices, slowly and incompletely.',
    constraints: [
      'LLM-free retrieval benchmark (no LLM-as-judge)',
      'Single-machine, rebuild-from-source graph — ops simplicity over graph DB cluster',
      'Zero-config MCP tools for Cursor / Claude Desktop',
    ],
    architecture: {
      summary: 'Parse → AST graph (SQLite) → bidirectional Personalized PageRank → MCP tools.',
      steps: ['Tree-sitter parse', 'SQLite graph store', 'Bidirectional PPR', 'get_impact / plan_change'],
    },
    decisions: [
      'Bidirectional PPR over unidirectional walks — blast radius needs upstream callers, not only downstream callees.',
      'SQLite over a dedicated graph database — read-heavy, local, rebuilt on demand.',
      'LLM-free harness — precision measured against AST ground truth.',
    ],
    tradeoffs: [
      'Precision-first structural retrieval vs semantic “vibe search” — owned the structural lane only.',
      'MCP packaging vs CLI-only — chose MCP so the tool shows up where engineers already work.',
    ],
    timeline: ['May–Jun 2026 — design, graph engine, MCP surface, LLM-free eval harness'],
    metrics: ['0.98 Precision@10', '~90% token reduction on structural queries', '0.27 → 0.98 vs unidirectional baseline'],
    evidence: [
      'Custom LLM-free benchmark harness on real repositories',
      'Bidirectional PPR ablation vs unidirectional baseline',
      'https://github.com/bydecom/graphrag-code',
    ],
    lessons: [
      'Traversal direction changes the meaning of the answer — “uses” ≠ “would break”.',
      'If the question is structural, keep the LLM out of the retrieval path.',
    ],
    related: ['Tree-sitter', 'SQLite', 'rustworkx', 'FastMCP'],
    sources: ['career-data/nodes/project/graphrag-code.md'],
    links: [{ label: 'GitHub', href: 'https://github.com/bydecom/graphrag-code' }],
  },
  'medical-citation-agent': {
    capability: 'Evidence-first AI',
    tagline: 'Citations before generation',
    overview:
      'A deterministic-first MCP tool that extracts medical claims from FDA drug labels with verifiable, line-level citations — LLMs stay out of the extraction path.',
    problem:
      'Medical assistants hallucinate contraindications and dosages. Even RAG can fail after retrieval when the model paraphrases or merges chunks without a traceable sentence.',
    constraints: [
      'No generative model inside extraction',
      'Every claim must be string-containment verifiable against the source label',
      'Precision over recall for auditability',
    ],
    architecture: {
      summary: 'OpenFDA load → pattern match + SciSpaCy NER → SafetyGuardrail → cited MedicalClaim.',
      steps: ['OpenFDA SPL', 'Regex + NER extract', 'Safety guardrail', 'Claim + line citation'],
    },
    decisions: [
      'Split Layer 1 (extract + cite) from Layer 2 (summarize) — only claim Layer 1 results.',
      'Rule-based SafetyGuardrail for critical drug–condition pairs without explicit CI phrasing.',
      'Tier confidence by pattern class (contraindication > warning > dosage).',
    ],
    tradeoffs: [
      'Regex-gated recall ceiling (~0.80) accepted to keep hallucination at 0.00.',
      'OTC SPL key gaps logged as indexer debt, not hidden behind a soft score.',
    ],
    timeline: ['May–Jun 2026 — extractor, guardrail, MCP, 96 regression tests'],
    metrics: ['Citation precision 1.00', 'Hallucination 0.00', '96 pytest cases', 'Recall@CI ~0.80'],
    evidence: [
      'LLM-free eval: claim.statement ⊆ raw_label_text',
      'Warfarin / metformin / amoxicillin curated cases',
      'https://github.com/bydecom/medical-citation-agent',
    ],
    lessons: [
      'For regulated text, inventing nothing beats answering everything.',
      'Evidence-first is an architecture choice, not a prompt instruction.',
    ],
    related: ['OpenFDA', 'scispacy', 'FastMCP'],
    sources: ['career-data/nodes/project/medical-citation-agent.md'],
    links: [{ label: 'GitHub', href: 'https://github.com/bydecom/medical-citation-agent' }],
  },
  'conversational-state-machine': {
    capability: 'Dialogue Runtime',
    tagline: 'Enterprise interruption as a deterministic stack',
    overview:
      'A Dialogue Runtime Engine — not a chatbot skin. Four interruption policies (hold / finish / lock / discard) as LIFO stack ops on one serializable ContextObject. Flows live in SQLite; Gemini only fills slots under catalog enums.',
    problem:
      'Multi-turn bots collapse on interruption: book a ticket, order food, then resume. Naive LLM chat loses the original task; enterprise platforms hide the stack. The hard problem is runtime behavior under switch — not which model you call.',
    constraints: [
      'Four explicit interruption policies — no ad-hoc flag soup',
      'Slot-first detection with catalog enum constraints',
      'Serializable ContextObject — no hidden session memory',
    ],
    architecture: {
      summary:
        'Turn pipeline: slot-first and schema-constrained NLU, then policy + LIFO stack, then advance or resume.',
      steps: [
        'Slot-first',
        'Regex',
        'Gemini SO',
        'Validate',
        'Policy',
        'Stack',
        'Advance / resume',
      ],
    },
    capabilities: [
      {
        title: 'Dialogue Runtime',
        description:
          'One turn pipeline owns control: NLU → policy → stack → resume. The LLM does not own the control plane.',
      },
      {
        title: 'Serializable ContextObject',
        description:
          'Single JSON snapshot per session (intent, entities, onHoldTasks, tags). Replay and debug from the object alone.',
      },
      {
        title: 'Dynamic Schema Builder',
        description:
          'schema.builder.ts builds Gemini response schemas from DB intents + catalog enums — no invented movies or menu items.',
      },
      {
        title: 'Interruption Policy Engine',
        description:
          'hold_and_resume · finish_then_switch · lock_current · switch_and_discard — stack ops, configurable per-flow or globally.',
      },
      {
        title: 'Flows as data',
        description:
          'Intents, slots, prompts, and policies in SQLite. Flow Editor writes DB; state machine reads it — no redeploy to change a flow.',
      },
      {
        title: 'Slot-first routing',
        description:
          'Catalog / quick-reply match runs before context switch so button clicks do not break the current task via NLU.',
      },
    ],
    decisions: [
      'Interruption as stack push/pop — four policies stay composable and unit-testable.',
      'Structured output over prompt engineering — schema from DB at detection time.',
      'One hold queue (onHoldTasks) — LIFO encodes resume order without a second pending-intent field.',
      'Slot-first before switch — quick replies stay in the current flow.',
    ],
    tradeoffs: [
      'Deterministic control vs free-form agent loops — owned the control plane; fewer silent task losses.',
      'Four policies vs infinite custom rules — coverage without combinatorial explosion.',
      'In-memory sessions — restart clears state (persistence deferred).',
    ],
    timeline: ['Jun 2026 — enterprise pattern audit → LLM-native Dialogue Runtime prototype'],
    metrics: ['4 interruption policies', 'Vitest 10/10', '~994 LOC context.service.ts'],
    evidence: [
      'Implementation: context.service.ts · schema.builder.ts · state.machine.ts · context-switch.policy.ts',
      'Validation: Vitest 10/10 (context.service.test.ts, context-switch.policy.test.ts)',
      'Measurement: 4 policies · LIFO onHoldTasks · enum-constrained slots',
      'Docs: docs/IMPLEMENTATION.md in the project repo',
    ],
    lessons: [
      'Dialog interruption is a stack problem, not a flags-and-conditionals problem.',
      'Constrain what the LLM may emit at detection time — fewer invented entities later.',
    ],
    related: ['TypeScript', 'Prisma', 'SQLite', 'Google Gemini', 'Svelte 5'],
    sources: ['career-data/nodes/project/conversational-state-machine.md'],
    links: [
      { label: 'GitHub', href: 'https://github.com/bydecom/conversational-state-machine' },
      { label: 'Portfolio', href: '/portfolio' },
    ],
  },
};

function fromResumeOnly(project: ResumeProject): ProjectDetailView {
  return {
    id: project.id,
    name: project.name,
    role: project.role,
    period: project.period,
    overview: project.summary || 'Projected from ResumeIR.',
    problem: 'Full problem narrative lands with PortfolioIR. This page currently projects from ResumeIR.',
    constraints: [],
    architecture: {
      summary: 'Architecture depth for this project is authored in career-data (curated Narrative detail for featured projects).',
      steps: [],
    },
    capabilities: [],
    decisions: project.keyDecisions,
    tradeoffs: [],
    timeline: project.period ? [project.period] : [],
    technologies: project.technologies,
    metrics: project.metrics,
    evidence: ['ResumeIR projection — Evidence list expands with PortfolioIR.'],
    lessons: [],
    related: project.technologies.slice(0, 6),
    sources: [`career-data/nodes/project/${project.id}.md`],
    links: [{ label: 'Portfolio', href: '/portfolio' }],
  };
}

export function resolveProjectDetail(
  id: string,
  ir: ResumeIR | null,
): ProjectDetailView | null {
  const fromIr = ir?.projects.find((p) => p.id === id);
  const curated = CURATED[id];
  const featured = pickFeaturedProjects(ir).find((p) => p.id === id) as FeaturedProduct | undefined;

  if (!fromIr && !curated) return null;

  if (!curated) {
    return fromResumeOnly(fromIr!);
  }

  return {
    id,
    name: fromIr?.name ?? featured?.name ?? id,
    role: fromIr?.role ?? featured?.role,
    period: fromIr?.period ?? featured?.period,
    technologies: fromIr?.technologies ?? [],
    ...curated,
    // Curated narrative wins for featured depth; IR often truncates decision strings.
    decisions: curated.decisions,
    metrics: curated.metrics.length ? curated.metrics : (fromIr?.metrics ?? []),
  };
}
