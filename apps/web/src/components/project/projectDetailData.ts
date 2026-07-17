import type { ResumeIR, ResumeProject } from '@career-os/resume';
import { pickFeaturedProjects } from '@/components/marketing/featuredData';
import type { FeaturedProduct } from '@/components/marketing/FeaturedProjects';
import { loadGraphStats } from '@/lib/loadGenerated';

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
      steps: [
        'Markdown nodes',
        'Lexer + Zod',
        'unified / remark',
        'Ontology',
        'Validator',
        'Graph IR',
        'ResumeIR · PortfolioIR · ConversationIR',
        'Surfaces + Ask',
      ],
    },
    capabilities: [
      {
        title: 'Knowledge as Source Code',
        description:
          'Markdown is the only authorable source in v1. Compile before any LLM verbalization — AI-as-view, not AI-as-source.',
      },
      {
        title: 'Compiler Packages as Pure Libraries',
        description:
          'packages/* stay I/O-free; apps/cli and services/* own the filesystem. Rebuild-from-source stays honest.',
      },
      {
        title: 'Edges as Compiler Output',
        description:
          'Wiki-links become graph edges — not hand-authored relationship tables.',
      },
      {
        title: 'Typed Projections',
        description:
          'One graph → ResumeIR, Portfolio / Project Detail, ConversationIR. Same facts, different shapes.',
      },
      {
        title: 'Hybrid Retrieval for Interview',
        description:
          'Ask fuses metadata, BM25, Qdrant, and graph. Execution Trace shows real engine scores — not fake chain-of-thought.',
      },
      {
        title: 'Hire-first Product Surfaces',
        description:
          'Landing + MarketingShell Project Detail for recruiters. Phase 2 waits for a public URL.',
      },
    ],
    decisions: [
      'Edges are compiler output — wiki-links become graph edges, not hand-authored relationship tables.',
      'Compiler packages stay pure libraries with zero runtime I/O — services own the filesystem.',
      'Landing sells the product demo; deep ontology docs live under /project and /about.',
      'Curated Product Cards until PortfolioIR lands — hire clarity over fully IR-driven Landing copy.',
    ],
    tradeoffs: [
      'Curated Product Cards on Landing vs fully IR-driven copy — chose curated for hire clarity until PortfolioIR lands.',
      'MarketingShell for Project Detail vs AppShell — chose MarketingShell so recruiters never hit a login wall.',
      'SQLite graph for v1 vs Neo4j/cluster — ops simplicity; scale later.',
      'Park Knowledge OS / Candidate KG under docs/someday — no implement before Deploy + reviewer pass.',
    ],
    timeline: [
      '2026-07 — Vision, ADRs, ontology, monorepo compiler skeleton',
      '2026-07 — ResumeIR + Landing IA (Hero → Pipeline → Architecture → Proof)',
      'Next — Deploy → Reviewer → Apply; Phase 2 capabilities after URL exists',
    ],
    metrics: ['Compiler stats from stats.json', '6 compiler packages', 'ResumeIR live'],
    evidence: [
      'docs/02-architecture — system + compiler + frontend lock',
      'docs/01-adr — progressive certainty, hybrid retrieval, AI-as-view',
      'career-data/nodes — authored source of truth',
      'packages/* — deterministic compile libraries',
      'Sibling proofs: GraphRAG-Code · Medical Citation Agent · Conversational State Machine',
    ],
    lessons: [
      'Domain-first folders beat tech-stack folders when knowledge is the product.',
      'If Landing explains philosophy but not proof, recruiters bounce — Architecture + Featured Products close that gap.',
      'Principle #0: job first — ship a recruiter-usable URL before platform sprawl.',
    ],
    related: [
      'TypeScript',
      'unified / remark',
      'Qdrant',
      'SQLite',
      'GraphRAG-Code',
      'Medical Citation Agent',
      'Conversational State Machine',
    ],
    sources: ['career-data/nodes/project/career-os.md', 'docs/02-architecture/01-system-architecture.md'],
    links: [
      { label: 'Landing Architecture', href: '/#architecture' },
      { label: 'Portfolio', href: '/portfolio' },
    ],
  },
  'graphrag-code': {
    capability: 'Code Reasoning',
    tagline: 'Bidirectional PPR for blast radius — not another file dump',
    overview:
      'Python-native Code Knowledge Graph: Tree-sitter → SQLite → rustworkx → bidirectional Personalized PageRank → FastMCP tools that return exact source blocks. One backward_weight selects downstream context vs upstream blast radius.',
    problem:
      '“What breaks if I change this?” is structural and deterministic — yet agents still pay tokens to re-read the repo. Global/undirected Repo Maps boost utilities regardless of the seed. Agents need seeded, directed, bidirectional ranking plus real snippets.',
    constraints: [
      'LLM-free RQ1 eval (no LLM-as-judge) on real packages',
      'SQLite + rustworkx — no Neo4j ops tax',
      'MCP stdio for Cursor / Claude Desktop',
      'Assignment heuristics now; full type resolution deferred to LSP/LSIF',
    ],
    architecture: {
      summary:
        'AST index → persistent SQLite → in-memory graph → forward+backward PPR merge → AST snippets → MCP tools.',
      steps: [
        'Tree-sitter AST',
        'SQLite persist',
        'rustworkx load',
        'Seed expand',
        'Forward PPR',
        'Backward PPR',
        'Weight merge',
        'Snippet + MCP',
      ],
    },
    capabilities: [
      {
        title: 'Bidirectional Personalized PageRank',
        description:
          'Two PPR passes merged by backward_weight — downstream context (≈0.2) vs blast radius (≈0.9). Unidirectional ablation fails on real packages; bidirectional stays ~0.98 P@10.',
      },
      {
        title: 'Exact Source Block Extraction',
        description:
          'MCP tools inject AST-coordinate snippets so agents see real callers and bodies — not symbol metadata alone.',
      },
      {
        title: 'Zero-ops MCP Server',
        description:
          'plan_change, get_impact, get_context, get_pruned_context, get_callers, list_symbols over stdio. Ambiguous names disambiguate instead of guessing.',
      },
      {
        title: 'Interface & Route Semantics',
        description:
          'Expand seeds across inheritance/interface consumers. Flask/FastAPI routes become first-class nodes with handles edges.',
      },
      {
        title: 'Orphan / Dead-Code Signal',
        description:
          'Only real import/call/contains/handles edges. Floating clusters mean nothing statically references them — an honest smell detector.',
      },
      {
        title: 'LLM-free Structural Eval (RQ1)',
        description:
          'eval_retrieval.py: blast_radius P@10 on requests/click/httpx — bidirectional 0.98–0.99 vs unidirectional 0.27–0.65. Full method in docs/RESEARCH.md.',
      },
    ],
    decisions: [
      'Bidirectional weighted merge over forward-only walks — blast radius needs upstream callers.',
      'Personalized (seeded) PPR over global PageRank — task-dependent scores, not utility hubs every time.',
      'SQLite + rustworkx over Neo4j — rebuild-from-source, MCP-friendly ops.',
      'AST-derived edges over LLM-indexed knowledge bases — avoid silent file skipping and index cost blowups.',
      'Separate tools by task (get_impact vs get_context) — retrieval quality is task-dependent.',
    ],
    tradeoffs: [
      'Structural retrieval lane vs NL bug localization — owned structure; BM25/dense still win some NL tasks.',
      'Heuristic call resolution vs full type checker — ship useful edges now; LSP/LSIF later.',
      'Python-first vs multi-language breadth — depth on one ecosystem first.',
      'More graph context can make agents over-engineer (Google HCRG) — keep token budgets disciplined.',
    ],
    timeline: [
      'May–Jun 2026 — indexer, bidirectional PPR, MCP surface, graph visualizer',
      '2026 — RQ1 LLM-free eval on requests/click/httpx; PyPI graphrag-code-core',
    ],
    metrics: [
      'P@10 blast_radius ≈ 0.98–0.99 (bidirectional)',
      'Unidirectional ablation ≈ 0.27–0.65',
      'LLM-free eval harness',
      'PyPI: graphrag-code-core',
    ],
    evidence: [
      'Implementation: Tree-sitter · rustworkx PPR · FastMCP · eval_retrieval.py · graph export/visualizer',
      'Validation: RQ1 Precision@10 on requests/click/httpx — docs/RESEARCH.md',
      'Measurement: matches 1-hop brute force on precision; far exceeds forward-only ablation',
      'https://github.com/bydecom/graphrag-code',
      'Related positioning: Aider RepoMap · Codebase-Memory · LocAgent · CodexGraph · RepoGraph',
    ],
    lessons: [
      'Traversal direction changes the answer’s meaning — “uses” ≠ “would break”.',
      'Bidirectional is not decoration — ablation numbers make the backward pass mandatory.',
      'If the question is structural, keep the LLM out of retrieval; verbalize after ranking.',
      'Cite inspiration honestly — bidirectional reasoning ≠ shipping Lofgren’s estimator.',
    ],
    related: ['Tree-sitter', 'SQLite', 'rustworkx', 'FastMCP', 'Python', 'Medical Citation Agent'],
    sources: ['career-data/nodes/project/graphrag-code.md'],
    links: [
      { label: 'GitHub', href: 'https://github.com/bydecom/graphrag-code' },
      { label: 'PyPI', href: 'https://pypi.org/project/graphrag-code-core/' },
    ],
  },
  'medical-citation-agent': {
    capability: 'Evidence-first AI',
    tagline: 'Citations before generation',
    overview:
      'A deterministic-first MCP tool that extracts medical claims from FDA drug labels with verifiable, line-level citations — LLMs stay out of the extraction path. Sibling to GraphRAG-Code: same Deterministic-First + FastMCP pattern.',
    problem:
      'Medical assistants hallucinate contraindications and dosages. Even RAG can fail after retrieval when the model paraphrases or merges chunks without a traceable sentence.',
    constraints: [
      'No generative model inside extraction',
      'Every claim must be string-containment verifiable against the source label',
      'Precision over recall for auditability',
    ],
    architecture: {
      summary: 'OpenFDA load → pattern match + SciSpaCy NER → SafetyGuardrail → cited MedicalClaim → FastMCP.',
      steps: [
        'OpenFDA SPL',
        'Regex triggers',
        'SciSpaCy NER',
        'Dedup',
        'SafetyGuardrail',
        'Claim + citation',
        'FastMCP',
      ],
    },
    capabilities: [
      {
        title: 'Layer Split (Extract vs Summarize)',
        description:
          'Only Layer 1 is claimed: extract + cite verbatim → hallucination 0.00. Layer 2 summarize stays with the downstream agent.',
      },
      {
        title: 'Verbatim Claim + Line Citation',
        description:
          'Every claim carries line coordinates and raw_text. Auditors verify by string containment — not LLM-as-judge.',
      },
      {
        title: 'Pattern + NER Extraction',
        description:
          'Regex gates recall on purpose; SciSpaCy NER types entities. No generative model invents medical statements.',
      },
      {
        title: 'SafetyGuardrail',
        description:
          'Blocks critical drug–condition pairs unless the sentence has explicit contraindication phrasing.',
      },
      {
        title: 'Confidence Tiers by Pattern Class',
        description:
          'Contraindication ≈ 0.9 · warning ≈ 0.7 · dosage ≈ 0.6 — agents get a weight signal, not a flat bag.',
      },
      {
        title: 'Zero-ops MCP + Regression Lock',
        description:
          'FastMCP over stdio. 96 pytest cases in CI (Python 3.10 + 3.12) lock heuristics, guardrail, and dedup.',
      },
    ],
    decisions: [
      'Split Layer 1 (extract + cite) from Layer 2 (summarize) — only claim Layer 1 results.',
      'Rule-based SafetyGuardrail for critical drug–condition pairs without explicit CI phrasing.',
      'Tier confidence by pattern class (contraindication > warning > dosage).',
      'Invert API-proxy MCP servers — emit cited sentences; LLM consumes evidence only.',
    ],
    tradeoffs: [
      'Regex-gated recall ceiling (~0.80) accepted to keep hallucination at 0.00.',
      'OTC SPL key gaps logged as indexer debt, not hidden behind a soft score.',
      'Prototype scale (15 curated CI cases) vs FDARxBench-scale QA — owned verbatim cite from one label.',
    ],
    timeline: ['May–Jun 2026 — extractor, guardrail, MCP, 96 regression tests'],
    metrics: ['Citation precision 1.00', 'Hallucination 0.00', '96 pytest cases', 'Recall@CI ~0.80'],
    evidence: [
      'Implementation: OpenFDA loader · regex + SciSpaCy · SafetyGuardrail · FastMCP · 96 pytest',
      'Validation: claim.statement ⊆ raw_label_text on warfarin / metformin / amoxicillin',
      'Measurement: Precision 1.00 · Hallucination 0.00 · Recall@CI 0.80',
      'https://github.com/bydecom/medical-citation-agent',
      'Sibling: GraphRAG-Code — Deterministic-First + MCP',
    ],
    lessons: [
      'For regulated text, inventing nothing beats answering everything.',
      'Evidence-first is an architecture choice, not a prompt instruction.',
      '"Zero hallucination" is honest only when scoped to the measured layer.',
    ],
    related: ['OpenFDA', 'scispacy', 'FastMCP', 'Python', 'GraphRAG-Code'],
    sources: ['career-data/nodes/project/medical-citation-agent.md'],
    links: [{ label: 'GitHub', href: 'https://github.com/bydecom/medical-citation-agent' }],
  },
  'conversational-state-machine': {
    capability: 'Dialogue Runtime',
    tagline: 'Enterprise interruption as a deterministic stack',
    overview:
      'Dialogue Runtime Engine — selective parity with enterprise dialog platforms (Kore.ai / Voiceflow-class patterns), not a clone. Four interruption policies as LIFO stack ops on one serializable ContextObject. Flows are SQLite data; Gemini only fills slots under catalog enums.',
    problem:
      'Multi-turn bots collapse on interruption: book a ticket, order food, then resume. Naive LLM chat loses the original task; enterprise platforms hide the stack. The hard problem is runtime behavior under switch — not which model you call.',
    constraints: [
      'Four explicit interruption policies — no ad-hoc flag soup',
      'Slot-first detection with catalog enum constraints',
      'Serializable ContextObject — no hidden session memory',
      'Selective enterprise parity — document gaps (hold cap, resume modes) honestly',
    ],
    architecture: {
      summary:
        'ContextService.processMessage: confirm gates → slot-first → regex → Gemini SO → validate → policy/stack → advance or LIFO resume.',
      steps: [
        'Confirm gates',
        'Slot-first',
        'Regex',
        'Gemini SO',
        'Validate',
        'Policy + stack',
        'Advance / resume',
      ],
    },
    capabilities: [
      {
        title: 'Dialogue Runtime',
        description:
          'One turn pipeline owns control: NLU → policy → stack → resume. Unknown mid-task re-prompts the slot; LLM does not own the control plane.',
      },
      {
        title: 'Serializable ContextObject',
        description:
          'Single JSON snapshot (intent, entities, onHoldTasks, tags, lastTransition). Replay and debug from the object alone — live in the Context UI tab.',
      },
      {
        title: 'Dynamic Schema Builder',
        description:
          'schema.builder.ts builds Gemini response schemas from DB intents + catalog enums — no invented movies, cinemas, or menu items.',
      },
      {
        title: 'Interruption Policy Engine',
        description:
          'lock · discard · finish_then_switch · hold_and_resume — one onHoldTasks queue, LIFO pop on confirm. Per-flow or global; auto / ask confirm.',
      },
      {
        title: 'Flows as data',
        description:
          'Intents, slots, prompts, policies in SQLite. Flow Editor writes DB; state.machine.ts reads it — no redeploy. Seeded BookingSeat ↔ OrderFood.',
      },
      {
        title: 'Slot-first routing',
        description:
          'Catalog / quick-reply match before context switch. emitAsTag filters currentTags. Button clicks do not break the flow via NLU.',
      },
    ],
    decisions: [
      'Interruption as stack push/pop — four policies stay composable; no pendingIntent second lane.',
      'Structured output over prompt engineering — schema from DB at detection time.',
      'One hold queue (onHoldTasks) — LIFO for both hold_and_resume and finish_then_switch deferred targets.',
      'Slot-first before switch — quick replies stay in the current flow.',
      'Selective enterprise parity — ship inspectable control-plane patterns; document Kore.ai-class gaps.',
    ],
    tradeoffs: [
      'Deterministic control vs free-form agent loops — fewer silent task losses.',
      'Four policies vs infinite custom rules — coverage without combinatorial explosion.',
      'In-memory sessions — restart clears state (persistence deferred).',
      'Gaps: no on-hold quantity cap; fixed resume notification; contextTags/preconditions not yet in NLU; switch_and_discard under-tested (3/4).',
    ],
    timeline: ['Jun 2026 — enterprise pattern audit → LLM-native Dialogue Runtime (v2 interruption policies)'],
    metrics: ['4 interruption policies', 'Vitest 10/10', '~994 LOC context.service.ts', 'LIFO onHoldTasks'],
    evidence: [
      'Implementation: context.service.ts · context-switch.policy.ts · state.machine.ts · schema.builder.ts · nlu.engine.ts',
      'Validation: Vitest 10/10 — hold, lock, finish_then_switch, ask confirm, LIFO resume, emitAsTag',
      'Measurement: 4 policies · enum-constrained slots · State/Context/Switch/Flows live panels',
      'Docs: docs/IMPLEMENTATION.md §11 gap list',
      'https://github.com/bydecom/conversational-state-machine',
    ],
    lessons: [
      'Dialog interruption is a stack problem, not a flags-and-conditionals problem.',
      'Constrain what the LLM may emit at detection time — fewer invented entities later.',
      'Selective parity beats cloning — document enterprise gaps honestly.',
    ],
    related: ['TypeScript', 'Prisma', 'SQLite', 'Google Gemini', 'Svelte 5'],
    sources: ['career-data/nodes/project/conversational-state-machine.md'],
    links: [
      { label: 'GitHub', href: 'https://github.com/bydecom/conversational-state-machine' },
      { label: 'Portfolio', href: '/portfolio' },
    ],
  },
  'ecommerce-platform': {
    capability: 'Production Commerce',
    tagline: 'Money paths, stock races, and deploy rollback — not a CRUD demo',
    overview:
      'OJT at FPT Software: full-stack e-commerce (Angular + Express) shipped in ~5 weeks with Gemini/Qdrant AI, then hardened across documented critique rounds on real AWS — VNPay, Redis stock holds, RabbitMQ workers, PM2 auto-rollback.',
    problem:
      'Tutorial shops skip what breaks in production: double-checkout races, payment retries, refresh-token theft, AI latency on the HTTP path, and PM2 cluster footguns. Portfolio proof needs those paths designed, tested, and hardened on real infra.',
    constraints: [
      'Real AWS + Neon + Upstash + Qdrant Cloud + VNPay sandbox',
      'Zero-downtime PM2 deploys with smoke-gated auto-rollback',
      'Keep HTTP off Gemini/embedding latency for non-interactive work',
      'Document every production punch (docs/codebase-review/)',
    ],
    architecture: {
      summary:
        'Angular → Express/PM2 → Postgres/Redis; RabbitMQ workers for email + AI; VNPay IPN sync; S3/CloudFront media.',
      steps: [
        'Angular 17',
        'Express API',
        'Prisma / Neon',
        'Redis holds',
        'RabbitMQ',
        'VNPay IPN',
        'AI worker',
        'PM2 / CI',
      ],
    },
    capabilities: [
      {
        title: 'Auth & Session Hardening',
        description:
          'Verify-before-create, in-memory access JWT, refresh rotation + jti blacklist, OTP soft-lockout, single-flight client refresh.',
      },
      {
        title: 'Inventory Reservation (Race-safe)',
        description:
          'Redis Lua stock hold + TTL + SETNX cleanup lock — PM2 cluster cannot double-run expiry or oversell.',
      },
      {
        title: 'Orders & VNPay Money Path',
        description:
          'Enforced status machine, Prisma transactions, OrderEvent audit. IPN stays synchronous and idempotent so VNPay retries keep their guarantee.',
      },
      {
        title: 'Async Workers (Email + AI)',
        description:
          'RabbitMQ durable topology, manual ACK, DLQ caps, reconnect. Vector sync / feedback off HTTP; prefetch=1 protects Gemini quotas.',
      },
      {
        title: 'AI Module (Provider Abstraction)',
        description:
          'IAIProvider Gemini ↔ local via DB config. Tool-calling chatbots, mini-advice fallback, 768-dim Qdrant recommend.',
      },
      {
        title: 'Ops Resilience',
        description:
          'PM2 graceful shutdown, Redis rate-limit fallback, health smoke, CI auto-rollback, Neon pooler tuning, multi-round critique culture.',
      },
    ],
    decisions: [
      'Redis Lua stock reservation — atomic hold + cluster-safe cleanup lock.',
      'VNPay IPN synchronous, not queued — retries need immediate success/fail; side-effects after commit.',
      'AI provider abstraction — swap Gemini ↔ local via DB config; fail soft on dashboard advice.',
      'Async-only for non-interactive AI — product-save ~2s → <10ms; chat stays sync.',
      'Refresh-token rotation + jti blacklist — shrink stolen-refresh blast radius.',
    ],
    tradeoffs: [
      'Hardening depth vs Layer-8 observability — 92.3% R1–R11 closed; APM deferred post-go-live.',
      'JWT blacklist fail-open vs fail-closed when Redis is down — hybrid by remaining TTL.',
      'Private OJT repo — CloudFront demo + critique docs carry the public proof.',
    ],
    timeline: [
      'Mar–Jun 2026 — OJT at FPT Software: ~5-week core + hardening rounds',
      '2026-07 — Live AWS stack; 132+ PM2 deploys; R1–R11 checklist audit',
    ],
    metrics: [
      '132+ EC2 deploys',
      'VNPay tests 25/25',
      'Stock Lua 19/19',
      'R1–R11 92.3% (36/39)',
      'Save latency ~2s → <10ms',
    ],
    evidence: [
      'Implementation: auth · order · inventory · payment · ai modules · Angular admin/storefront · RabbitMQ workers',
      'Validation: docs/codebase-review/ (critique, battle tests, self-healing) · VNPay 25/25 · stock 19/19',
      'Measurement: 132+ zero-downtime deploys · async vector sync latency win · 36/39 checklist',
      'Live: https://d7ozoo9vtkn42.cloudfront.net/',
    ],
    lessons: [
      '"Works on dev" ≠ this cloud’s network stack — IPv6 DNS and Docker assumptions failed on EC2.',
      'Fail-open/fail-closed security choices are product decisions — document the argument.',
      'Critique → implement → verify on production logs turns a 5-week build into interview evidence.',
    ],
    related: [
      'Angular',
      'Prisma',
      'Redis',
      'RabbitMQ',
      'VNPay',
      'Gemini',
      'Qdrant',
      'AWS',
      'PM2',
      'FPT Software',
    ],
    sources: ['career-data/nodes/project/ecommerce-platform.md'],
    links: [
      { label: 'Live demo', href: 'https://d7ozoo9vtkn42.cloudfront.net/' },
      { label: 'Portfolio', href: '/portfolio' },
    ],
  },
  'container-bay-plan-validator': {
    capability: 'Maritime Validation',
    tagline: 'Excel bay plans → deterministic grid → safety rules',
    overview:
      'Bay Checker — desktop app for maritime stowage. Parses noisy BBRRTT Excel/PDF logs into deck/hold grids, enforces heavy-on-light + VGM + balance rules, and ships offline via PyInstaller for port ops (e.g. Tien Sa–class environments).',
    problem:
      'Bay plans arrive as unstructured 6-digit LOC telemetry, not a spatial model. Under time pressure, heavy-on-light, 20/40ft bay pairing, and imbalance checks are error-prone — misses become safety and schedule risk.',
    constraints: [
      'Offline-first desktop for quay-side machines (no pip on site)',
      'Decouple ingestion from validated business rules',
      'Even/odd bay pairing must eliminate 40ft false positives',
      'Private / internal — confidential port tooling',
    ],
    architecture: {
      summary:
        'Import → sanitize BBRRTT → bay pairing → grid state → validator → Tkinter highlight / Checker Mode / Excel export.',
      steps: [
        'Import Excel/PDF',
        'Sanitize LOC',
        'Decode BBRRTT',
        'Bay pairing',
        'Grid rebuild',
        'Rules engine',
        'UI + export',
        'PyInstaller',
      ],
    },
    capabilities: [
      {
        title: 'Intelligent Parsing & Spatial Mapping',
        description:
          'BBRRTT decode, zero-pad sanitization, even/odd 40ft pairing across dual 20ft slots, deck 94→80 and hold 14→02 grid reconstruction.',
      },
      {
        title: 'Deterministic Stack Stability',
        description:
          'Heavy-on-light with size isolation (20↔20, 40↔40). Paired 40ft bays traverse partner bays for the supporting base — no cross-size false positives.',
      },
      {
        title: 'Dynamic Load & Balance',
        description:
          'Deck/Hold sectional VGM, per-row limits by pure-20 / pure-40 / mixed composition, transverse CoG imbalance alerts.',
      },
      {
        title: 'Error Mode + Checker Mode',
        description:
          'Red-highlight violations with tier logs; Checker Mode reconciles target ID+LOC lists → Matched / Position Mismatch.',
      },
      {
        title: 'Offline Desktop Delivery',
        description:
          'Tkinter + tksheet UI, modular widgets. PyInstaller one-file Windows build for ports without dependency installs.',
      },
      {
        title: 'Ingestion / Rules Decoupling',
        description:
          'file_reader → bay_object grid → validator rules → visualizer. Input-format churn does not touch safety logic.',
      },
    ],
    decisions: [
      'Decouple ingestion from rules — telemetry format changes must not risk validated stability logic.',
      'Explicit maritime domain model for 40ft even/odd pairing — surface LOC shape is not enough.',
      'Strict size isolation in stability comparisons — intentional bypass of cross-size checks.',
      'Offline PyInstaller ship — quay-side machines often lack network/admin rights.',
    ],
    tradeoffs: [
      'Desktop Tkinter vs web multi-user — chose offline-first for port floors.',
      'Private internal tool — demo + domain narrative carry proof, not a public repo.',
      'PDF/OCR edge cases remain operational care items alongside Excel as primary path.',
    ],
    timeline: ['Sep–Dec 2025 — Freelance: parser, grid model, validator, Tkinter UI, PyInstaller packaging'],
    metrics: [
      'Deck 8 tiers / Hold 7 tiers',
      'Even/odd 40ft sync',
      'Error + Checker modes',
      'Offline .exe ship',
    ],
    evidence: [
      'Implementation: file_reader.py · bay_object.py · validator.py · visualizer.py · UI_Components/*',
      'Validation: Error Mode spatial highlight · Checker Mode match/mismatch · Excel export',
      'Measurement: BBRRTT decode · size-isolated heavy-on-light · dynamic stack limits by composition',
      'Context: Freelance · Tien Sa–class maritime ops',
    ],
    lessons: [
      'Spatial domain rules need an explicit model on top of parsing — 40ft/20ft pairing proved it.',
      'Decoupling ingestion from rules keeps safety logic stable when exporters change noise.',
      'For port tools, offline installability is part of the product.',
    ],
    related: ['Python', 'Pandas', 'Tkinter', 'pdfplumber', 'PyInstaller', 'Freelance'],
    sources: ['career-data/nodes/project/container-bay-plan-validator.md'],
    links: [{ label: 'Portfolio', href: '/portfolio' }],
  },
  'match-3-puzzle-game': {
    capability: 'Game Systems',
    tagline: 'Data-driven Match-3 — Board facade, not a god loop',
    overview:
      'Jungle Gems — Phaser 3 + Vite Match-3 with a modular Board (swap, match, gravity, refill, power-ups, boosters, blockers) and JSON levels. GameScene / UIScene talk only through an event bus. Live on Vercel.',
    problem:
      'Many levels with irregular boards, blockers, and win conditions — hardcoding does not scale, and coupling HUD to board logic breaks under rapid swipe cascades.',
    constraints: [
      'JSON-owned layouts, objectives, moves, star timers',
      'GameScene gameplay vs UIScene HUD — no direct scene coupling',
      'Board facade + focused modules as mechanics grow',
      'Mobile viewport 576×1024 FIT, deployable static build',
    ],
    architecture: {
      summary:
        'Map → LevelLoader → GameScene + UIScene; Board facade wires Creator/Input/Matcher/Powerups/State; events drive HUD.',
      steps: [
        'Boot / Preload',
        'Map select',
        'Load JSON',
        'Game + UI scenes',
        'Board modules',
        'Match / cascade',
        'Events → HUD',
        'Win / persist',
      ],
    },
    capabilities: [
      {
        title: 'Board Facade + Focused Modules',
        description:
          'Board.js orchestrates BoardCreator, Input, Matcher, Powerups, State (gravity/refill) — readable algorithms as features grow.',
      },
      {
        title: 'Data-driven Level Design',
        description:
          'JSON gridLayout (null holes), blockerLayout, objectives, maxMoves, starTimes — designers extend levels without Phaser code.',
      },
      {
        title: 'Event-driven Scene Split',
        description:
          'gemsMatched · objectiveUpdated · moveUsed · boosterSelected · levelWin/Lose — UI and audio plug in without owning the board.',
      },
      {
        title: 'Power-ups & Boosters',
        description:
          'Bomb / Color Bomb (+ combos) via BoardPowerups + VFX. Hammer, swap, rocket, shuffle: select → target → useBooster.',
      },
      {
        title: 'Blockers & Objectives',
        description:
          'BaseBlocker → Stone / Rope. Objectives target gems or blocker types; Order panel updates from events.',
      },
      {
        title: 'Progression Shell',
        description:
          'World map, stars, localStorage via PlayerDataManager, popups, AudioManager. Live: match-3-two.vercel.app.',
      },
    ],
    decisions: [
      'Board facade over god-object GameScene — modules own match/power/gravity.',
      'JSON levels over hardcoded boards — content stays a content task.',
      'Event bus over direct scene refs — HUD/SFX changes never break cascades.',
      'Deterministic board state for input races — illegal transitions are structural.',
    ],
    tradeoffs: [
      'Power-up logic in BoardPowerups today vs dedicated Gem subclasses later.',
      'Client-only progress — leaderboard / APIManager still planned.',
      'More blockers and atlas/pooling polish remain on the roadmap.',
    ],
    timeline: ['Jun–Sep 2025 — Freelance academic product: core engine → map → Vercel demo'],
    metrics: [
      'JSON levels 1–9',
      'Bomb + Color Bomb',
      '4 boosters',
      'Live Vercel demo',
    ],
    evidence: [
      'Implementation: Board.js + board/* · GameScene/UIScene · PlayerDataManager · level JSON',
      'Validation: Playable Vercel build — match, cascade, power-ups, boosters, blockers',
      'Measurement: 576×1024 FIT · event-decoupled HUD · irregular boards via null cells',
      'https://match-3-two.vercel.app/',
    ],
    lessons: [
      'Fast-input races are prevented structurally — not with flags in the swipe handler.',
      'Data-driven levels: the ninth level should cost minutes, not a rewrite.',
      'Event buses pay when HUD, SFX, and popups all need the same match signal.',
    ],
    related: ['Phaser 3', 'Vite', 'JavaScript', 'Freelance'],
    sources: ['career-data/nodes/project/match-3-puzzle-game.md'],
    links: [
      { label: 'Play live', href: 'https://match-3-two.vercel.app/' },
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

  const stats = id === 'career-os' ? loadGraphStats() : null;
  const metrics =
    id === 'career-os' && stats
      ? [
          `${stats.totalNodes} nodes`,
          `${stats.totalEdges} edges`,
          '6 compiler packages',
          'ResumeIR live',
        ]
      : curated.metrics;

  return {
    id,
    name: fromIr?.name ?? featured?.name ?? id,
    role: fromIr?.role ?? featured?.role,
    period: fromIr?.period ?? featured?.period,
    technologies: fromIr?.technologies ?? [],
    ...curated,
    // Curated narrative wins for featured depth; IR often truncates decision strings.
    decisions: curated.decisions,
    metrics: metrics.length ? metrics : (fromIr?.metrics ?? []),
  };
}
