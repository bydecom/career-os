# CareerOS Roadmap

**Status:** Accepted  
**Version:** 3.6  

CareerOS is a **living project**. It will never be "done."  
This file is the **weekly shipping checklist** — not the 5-year architecture catalog.

| Doc | Role |
|---|---|
| **This roadmap** | What ships next (weekly) — **Hire-first** |
| [v1.0 Definition](./99-v1-definition.md) | **Locked** product freeze |
| [Capability Map](./10-platform-capability-map.md) | Long-range shape — **Product-first** |
| [Engineering Principles](./11-engineering-principles.md) | Laws of play (#0: job first) |
| [Dual roadmaps + deploy](../../journal/engineering/2026/07/hire-demo-deploy-and-review.md) | Hire vs product milestones · persistence-early · CLI · thin AWS |
| [Future: Knowledge OS](../../journal/engineering/2026/07/future-knowledge-os.md) | **Parked** — Narrative Projection · Capability fan-out · System/Knowledge Trace · compiler extract (after Hire Demo) |

**Two tracks (do not merge into one panic list):** Hire-first proves the system for interviews; Product-first grows the engine room. Current surfaces are **v1 presentation**, not vaporware — compiler → graph → SQLite → ResumeIR already run.

**Product-first freeze (after Hire Demo):** (1) Hire Demo → (2) Compiler Core + SQLite + **CLI toolchain** → (3) Projection Engine → (4) Ingestion **adapters** → (5) Conversation Runtime (projection) → (6) Platform. Detail in the dual-roadmap journal.

---

## Hire-demo ship path (current week)

*Goal: Public URL + real reviewers before more platform features.*  
**Detail:** [hire-demo-deploy-and-review.md](../../journal/engineering/2026/07/hire-demo-deploy-and-review.md)

```text
✅ Landing (Hero · Pipeline · Why Care · Philosophy · Architecture · Featured)
✅ Portfolio shell · Project Detail · Resume projection polish

↓

[ ] Deploy public URL (prefer thin AWS for AI Platform signal; Vercel OK if blocked)
[ ] Domain + SSL
[ ] Smoke / bug fix
[ ] 5–10 reviewers (4 KPI questions — not “đẹp không?”)
[ ] Fix from feedback only
[ ] Apply jobs (Principle #0)
```

| Do **not** start before URL + apply loop | Why |
|---|---|
| PDF / Image ingest, MCP, Dashboard, Studio, full SaaS cloud | Product milestones **4–6** (ingest/runtime/platform) — after Hire Demo + Compiler CLI; see dual-roadmap journal + [deferred add-ons](../../journal/engineering/2026/07/deferred-addons-pdf-image-conversation.md) |

**Reviewer KPI (ask exactly these):**

1. In 30s — what does CareerOS do? → Landing
2. Which project do you remember? → Featured
3. Do you believe these are real projects? → Project Detail
4. Would you interview this person? → **overall KPI**

---

## v1.0 — Demo freeze (priority)

See [99-v1-definition.md](./99-v1-definition.md). A stranger clones the repo and demos CareerOS in one sitting.

| Command / surface | Status | Definition of Done |
|---|---|---|
| `career compile` | Done | Compiles clean; `graph.json` + `graph.db`; tests pass |
| `career ask "..."` | Done | Grounded answer + deterministic reasoning + confidence; no invented facts |
| `career resume` | **Done (Markdown)** | Master projection → `resume.md`; HTML/PDF/JD later |
| `career portfolio` | **Next** | One-flow deploy/export; 100% facts from graph; no duplicate content store |

---

## Phase 0: Foundation
*Goal: Establish the Architecture and Design Language before writing code.*
- [x] Define Vision & Philosophy
- [x] Write Architecture Decision Records (ADRs)
- [x] Design Knowledge Ontology
- [x] Design Markdown Schema & Folder Conventions
- [x] Set Naming Conventions

## Phase 1: Knowledge Engine Core
*Goal: CareerOS can compile Markdown into Knowledge.*  
**DoD:** `career compile` succeeds; graph valid; compiler tests pass.
- [x] Implement Zod Schemas for AST and FrontMatter Validation
- [x] Build the `packages/compiler` (Markdown Lexer, AST Parser, Semantic Analyzer) — originally planned as `services/parser`
- [x] Build the Ontology Validator
- [x] Build the Graph Construction Worker
- [x] Create CLI tools (e.g., `career compile`)

## Phase 2: Knowledge Retrieval Engine
*Goal: CareerOS can deterministically retrieve facts and semantic context.*  
**DoD:** `career query` / retrieval golden set — high recall on known entities; latency acceptable on current graph size (~44 nodes).
- [x] Implement BM25 Keyword Indexing
- [x] Implement Graph Traversal (Bidirectional PageRank)
- [x] Implement Vector Embeddings (Qdrant)
- [x] Implement Reciprocal Rank Fusion (RRF) for Hybrid Ranking
- [x] Establish Retrieval Benchmarks (Precision/Recall testing)

## Phase 3: Knowledge Conversation Engine
*Goal: The AI can logically formulate responses based on retrieved evidence.*  
**DoD:** `career ask` answers are evidence-traceable; reasoning deterministic; confidence shown; no hallucination of missing nodes.

### Phase 3A — Minimal Vertical Slice
- [x] Build `packages/conversation` (ConversationIR + builder + budget + PromptRenderer)
- [x] Build `services/llm` (LlmProvider interface + Gemini adapter + verbalize)
- [x] CLI `career ask` (retrieve → ConversationIR → LLM)
- [x] Split query-logs / conversation-logs JSONL (seed telemetry before Evaluation Platform / Optimizer)

### Phase 3B — Strategy — frozen for v1.0 → v2
- [ ] Build the Intent & Strategy Planner
- [ ] Build ConversationIR audience/tone assembly (formerly "Knowledge Package Assembler")
- [ ] Integrate richer Response Planner on top of retrieval confidence

### Phase 3.5 — Knowledge Optimization — frozen for v1.0 → v2
- [ ] Knowledge Optimization passes driven by query/conversation log pain (not speculation)

## Phase 4: Knowledge Interfaces (Views) — v1.0 focus
*Goal: User-facing projections — ask, export, browse.*  
**DoD:** `career resume` + portfolio surface meet [v1.0 Definition](./99-v1-definition.md); facts 100% from graph.
- [x] Master Markdown resume (`career resume` → ResumeIR → `resume.md` + `resume.ir.json`) — **v1.0.0**
- [x] Monorepo `apps/web` scaffold (Next.js viewer over ResumeIR) — see [09-monorepo-web.md](../02-architecture/09-monorepo-web.md)
- [x] FE Knowledge Platform architecture + sitemap noted — [10-frontend-knowledge-platform.md](../02-architecture/10-frontend-knowledge-platform.md)
- [x] FE Design System + layout lock — [11-frontend-design-system.md](../02-architecture/11-frontend-design-system.md) (Sprint 0 kit → Landing → …)
- [x] Hire-demo web surfaces — Landing · Architecture · Featured Product cards · Portfolio shell · Project Detail · Resume projection (`/resume`, print PDF, `/resume/ir`, `/resume/markdown`)
- [ ] **Deploy `apps/web` (public URL)** — prefer thin AWS (CloudFront + SSL) for AI Platform signal; Vercel OK for speed — see [hire-demo-deploy-and-review](../../journal/engineering/2026/07/hire-demo-deploy-and-review.md)
- [ ] Resume CLI HTML / PDF renderers (`--html` / `--pdf`) — v1.0.1+ (browser print covers hire-demo PDF)
- [ ] Tailored resume (`--jd`) — v1.1 (may use Retriever; master never does)
- [ ] PortfolioIR depth (`career portfolio` + filters/timeline) — after deploy / apply loop
- [ ] Interactive Graph Explorer View — nice-to-have after resume/portfolio
- [ ] MCP Server — **frozen for v1.0** (protocol adapter over Skills later; see Capability Map)

## Phase 5: Knowledge Authoring — after v1.0 unless blocking authoring scale
*Goal: Scale how knowledge enters the graph — still compile-first.*
- [ ] Build a VS Code Extension / Obsidian Plugin for live Node Validation
- [ ] **Deferred add-ons (parked 2026-07-16 — do not start before hire-demo):**
  - [ ] PDF → Markdown ingest (review before compile)
  - [ ] Image → structural / ontology-typed data
  - [ ] Conversational management (sessions, evidence-linked history) beyond minimal `career ask`
  - See [deferred-addons-pdf-image-conversation.md](../../journal/engineering/2026/07/deferred-addons-pdf-image-conversation.md)
- [ ] Broken Link Checker
- [ ] Duplicate Alias Detection
- [ ] Node Recommendation System

## Phase 6: Automation — last
- [ ] GitHub Actions for CI/CD
- [ ] Auto-compile Knowledge on `git push`
- [ ] Auto-generate and upload Vector Embeddings
- [ ] Re-deploy Vercel Frontend on IR change

---

## Frozen until v2 (do not start for fun)

Tracked in Capability Map / scaffold only:

- Skills registry & agent tool loop
- Evaluation Platform (Harness): replay, golden set, A/B, hallucination metrics
- Optimizer passes
- Intent / Planner / multi-audience strategy
- MCP / Discord / extra protocol adapters (unless needed for a real demo constraint)
