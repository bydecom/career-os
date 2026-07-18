---
id: career-os
type: project
name: "CareerOS"
schemaVersion: "1"
aliases:
  - career-compiler
  - career-knowledge-base
tags:
  - personal-project
  - knowledge-compiler
  - typescript
  - monorepo
status: active
role: "Full-stack Engineer & Architect"
period: "Jul/2026 - Present"
visibility: public
created: "2026-07-01"
updated: "2026-07-18"
repository: "https://github.com/bydecom/career-os"
---

## Overview

CareerOS is a Personal Knowledge Compiler where Markdown serves as the single
source of truth. A modular [[typescript]] compiler transforms knowledge into
a typed Knowledge Graph, from which Resume, Portfolio, and Interview
experiences are generated automatically.

Hire-first demo first (Landing → Project Detail → Resume → Deploy). Studio,
Dashboard, and Knowledge OS stay parked until a public URL exists
(Principle #0: job first).

Repo: [github.com/bydecom/career-os](https://github.com/bydecom/career-os)
(monorepo `career-knowledge-base`).

## Highlights

- Modular TypeScript compiler: Markdown wiki-links → typed Knowledge Graph IR (JSON + SQLite); packages stay I/O-free.
- ResumeIR and Interview `/api/ask` — hybrid PCR retrieval + Gemini verbalization; Execution Trace shows real engine scores.
- Hire-first surfaces (Landing, Portfolio, Project Detail, Resume); Studio / Knowledge OS parked until a public URL exists.

## Demo

![[cover.png|caption=CareerOS]]

![[demo.mp4|caption=Compile → Resume / Interview|poster=poster.png]]

## Problem

Engineers maintain parallel truths: a CV, a portfolio site, interview talking
points, and scattered notes. Each rewrite drifts. Recruiters see polish; the
author sees copy-paste debt.

Career knowledge needs a **single authorable source**, a **deterministic
compile** into a graph, and **projections** — not another admin UI that
becomes a second source of truth. The LLM may verbalize answers; it must
never become the database.

## Runtime Pipeline

1. Author Markdown under `career-data/nodes/` — wiki-links become edges
2. Lexer — frontmatter + body ([[zod]] schemas)
3. Parser — [[unified]] / [[remark]] AST + wiki-link extraction
4. Ontology — 24 `NodeType` / 18 `EdgeType` taxonomy; section-aware edge typing
5. Validator — schema + orphan diagnostics
6. Builder — Knowledge Graph IR → `graph.json` + [[sqlite]] `graph.db`
7. Projections — ResumeIR (shipped) · Portfolio / Narrative (curated → IR) ·
   ConversationIR (Interview)
8. Surfaces — Next.js hire demo + `POST /api/ask` hybrid retrieve → Gemini
   verbalize (AI-as-view)

CLI twin: `career compile` · `career resume` · `career ask` · `career query`.

## Core Capabilities

### Knowledge as Source Code

Markdown is the only authorable source in v1 — no CMS. Compile before any
LLM call (**AI-as-view**, ADR-0007). Progressive Certainty Retrieval
(ADR-0004): anchor facts before fuzzy search.

### Six Pure Compiler Packages

| Package | Role |
|---------|------|
| `@career-os/ontology` | Domain model — NodeType / EdgeType / Zod |
| `@career-os/compiler` | Markdown → KnowledgeGraph IR |
| `@career-os/graph` | Pure algos (adjacency, PPR, traversal) |
| `@career-os/graph-store` | SQLite persistence for compiled IR |
| `@career-os/resume` | Graph → ResumeIR → Markdown (no LLM) |
| `@career-os/conversation` | ConversationIR, confidence, budget, prompts |

`packages/*` stay I/O-free; `apps/cli` and `services/*` own the filesystem.

### Edges as Compiler Output

Wiki-links become graph edges — classified by section/ontology. No hand-
authored `career-data/edges/` table. See
`knowledge/career-os/why-edges-are-compiler-output.md`.

### Typed Projections

One graph → many shapes. ResumeIR is live (`/resume`, `/resume/markdown`,
`/resume/ir`). Portfolio / Project Detail use curated Narrative depth until
PortfolioIR (Narrative Projection) lands. ConversationIR drives Interview.

### Hybrid Retrieval + Execution Trace

`services/retriever` fuses metadata + graph PPR + BM25 (+ optional
[[qdrant]]) via RRF. Embedding via Gemini; verbalize via `services/llm`
only after IR + budget. Interview UI shows **Execution Trace** (real engine
scores) — not fake chain-of-thought.

### Hire-first Product Surfaces

Landing (Hero → Pipeline → Architecture → Featured 2-2-1) · `/portfolio` ·
`/project/[id]` (MarketingShell, no login wall) · `/resume*` · `/interview`
· `POST /api/ask` (NDJSON stream). Featured cards prove sibling systems:
[[graphrag-code]], [[medical-citation-agent]],
[[conversational-state-machine]], [[ecommerce-platform]].

## Engineering Decisions

- **Edges are compiler output** — wiki-links drive the graph (ADR-0002/0003).
- **Deterministic compile before LLM** — evidence-backed generation
  (ADR-0007/0008); model verbalizes ranked evidence only.
- **Hybrid PCR + RRF** — metadata anchor → graph expand → BM25 → optional
  vector (ADR-0004/0005/0006).
- **Curated Product Cards until PortfolioIR** — hire clarity over fully
  IR-driven Landing copy.
- **MarketingShell for Project Detail** — recruiters never hit an auth wall.
- **SQLite graph for v1** — rebuild-from-source, low ops; Neo4j later if needed.
- **Park Knowledge OS / Candidate KG** under `docs/someday/` +
  `journal/.../future-knowledge-os.md` — do not implement before Deploy +
  reviewer pass.

## Tradeoffs

- Curated Landing / Project Detail vs fully IR-driven narrative — owned
  clarity for hire-demo; Narrative Projection is the someday path.
- ResumeIR shipped; `career portfolio` / PortfolioIR still next on roadmap.
- Studio, Dashboard `/app`, MCP SaaS, PDF/Image ingest — Product milestones
  4–6; frozen until Hire Demo URL + apply loop.
- Graph stats on UI hydrate from `stats.json` after `npm run compile` —
  never hand-edited node/edge counts.

## Evidence

- Implementation: 6 packages · `apps/cli` · `apps/web` · embedding /
  retriever / llm services · Interview Execution Trace · Featured 5-card
  layout
- Validation: `npm run compile` → nodes/edges/diagnostics; ResumeIR on
  `/resume`; `career ask` / `/api/ask` grounded answers
- Measurement: live `stats.json` (nodes · edges · parseTimeMs) · 24 ontology
  node types · 10 ADRs under `docs/01-adr/`
- Docs: `docs/02-architecture` · `docs/00-vision/09-roadmap.md` · hire-demo
  journal

Stack: [[typescript]], [[nodejs]], [[unified]], [[remark]], [[zod]],
[[react]], Next.js, [[sqlite]], [[qdrant]], [[rabbitmq]] (pipeline events),
[[gemini-ai]]

Sibling proofs: [[graphrag-code]] · [[medical-citation-agent]] ·
[[conversational-state-machine]] · [[ecommerce-platform]] ·
[[container-bay-plan-validator]] · [[match-3-puzzle-game]] ·
[[movie-theater-management-system]]

## Lessons Learned

- Domain-first folders beat tech-stack folders when knowledge is the product.
- If Landing explains philosophy but not proof, recruiters bounce —
  Architecture + Featured Products close that gap.
- Principle #0: job first — ship a recruiter-usable URL before platform sprawl.
- AI-as-view is an architecture choice: keep the LLM out of the compile path
  and out of retrieval ranking; let it speak only after evidence is fixed.
