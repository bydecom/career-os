---
date: 2026-07-16
author: Bang Thai Minh
type: shipping-checklist
confidence: high
status: next
tags:
  - hire-first
  - product-first
  - deploy
  - aws
  - vercel
  - review
  - resume
related:
  - docs/00-vision/09-roadmap.md
  - docs/00-vision/99-v1-definition.md
  - docs/00-vision/10-platform-capability-map.md
  - docs/00-vision/11-engineering-principles.md
  - journal/engineering/2026/07/deferred-addons-pdf-image-conversation.md
---

# Dual Roadmaps — Hire-demo Deploy & Product Platform

## Status

**Two roadmaps, both correct — different goals.** Do not collapse them into one panic list.

| Track | Goal | Cadence |
|---|---|---|
| **Hire-first** | Get interviews — prove “I can design an AI / knowledge system” | Days–weeks |
| **Product-first** | Build CareerOS as a real platform (“Anything → Knowledge Compiler → Graph → projections”) | Months |

Principle #0 still wins for weekly work: **ship a public demo and apply** before PDF/OCR/MCP/Dashboard.

---

## Roadmap 1 — Hire-first (xin việc)

```text
Landing → Portfolio → Project Detail → Resume → Deploy → Reviewers → Apply
```

**Proof statement for recruiters:**

> “I can design a knowledge / AI system — compile once, project many surfaces.”

Enough to earn a call. Does **not** require Neo4j, Cognito, ECS, or multi-tenant SaaS.

### Why Resume before Deploy

Recruiter path is usually:

```text
Landing → Portfolio → Project Detail → Resume → Download PDF → LinkedIn → GitHub
```

Resume is the **close**. Thin Resume = last click fails.

### Ship path (current)

```text
✅ Landing (Hero · Pipeline · Why Care · Philosophy · Architecture · Featured)
✅ Portfolio shell
✅ Project Detail (featured depth)
✅ Resume polish (projection · print PDF · ResumeIR / Markdown)

↓

🎯 Deploy public URL (Milestone 1 showcase)
↓
🎯 Smoke / bug fix
↓
🎯 5–10 real reviewers (4 KPI questions)
↓
🎯 Fix only what feedback proves
↓
🎯 Apply jobs
```

---

## Anxiety check — “Landing sells something that doesn’t exist?”

**No.** Current CareerOS is incomplete, not fake.

### Already real (v1 engine room)

```text
Markdown → Parser / Compiler → Graph (graph.json + graph.db)
        → ResumeIR → Website projections
        → Portfolio / Project Detail / Resume surfaces
        → career ask (ConversationIR path exists in CLI)
```

This is a **working compiler demo**, not a Figma mockup.

### Not built yet (= Product Phase 2+)

```text
PDF → Markdown
Image → Graph
Conversation Runtime (product)
Ontology Editor / Studio
Knowledge Explorer UI
Dashboard
MCP / multi-user / orgs
```

Selling those on Landing as “live product” would be vaporware. Selling **Knowledge Compiler → Graph → projections** is honest — that path already runs.

---

## Roadmap 2 — Product-first (CareerOS thật)

Long arc (Capability Map / engine room). **Do not block Hire-first Deploy on this.**

### Core compile path — persistence early

**Locked order** (SQLite is not an afterthought):

```text
Markdown → Compiler → Graph → Persistence (SQLite) → IR → Projection
```

Not:

```text
Markdown → Compiler → Ontology → Graph → … → Database later
```

As soon as a Graph exists you want query, version diff, incremental compile, search, provenance, traversal. If the graph only lives in RAM then dumps to JSON, later refactor hurts. `graph.db` is already the right instinct — keep treating **persistence as part of the core**, not a Phase-later migration.

North-star (everything becomes knowledge; surfaces are projections/adapters):

```text
Anything
   │
   ▼
Knowledge Compiler
   │
   ▼
Knowledge Graph (persisted)
   ├── Resume / Portfolio / Interview     ← projections
   ├── Chatbot / API / MCP                ← projections + adapters
   └── PDF / Image / Email / Docs         ← ingestion adapters (not core)
```

Landing / Portfolio / Resume today = **presentation layer of v1**, not the finished platform.

### Locked product milestones (tech-lead freeze)

| # | Milestone | Scope |
|---|---|---|
| **1** | **Hire Demo** | Landing → Portfolio → Resume → thin AWS deploy → Apply |
| **2** | **Knowledge Compiler Core** | Compiler · Graph · **SQLite persistence** · **Compiler CLI** as toolchain |
| **3** | **Projection Engine** | ResumeIR · PortfolioIR · ConversationIR complete & honest |
| **4** | **Ingestion Adapters** | PDF→Markdown · Image→structured · Email/Docs… *(adapters, not core)* |
| **5** | **Conversation Runtime** | Intent → Planner → Tool → Graph → Response IR → LLM verbalize *(chat = projection)* |
| **6** | **CareerOS Platform** | Dashboard · Studio · Graph Explorer · MCP · Multi-user |

#### Milestone 2 detail — Compiler CLI (before PDF / MCP)

After core graph + SQLite, prioritize a **toolchain UX** so a recruiter can clone and run:

```bash
career init
career compile
career validate
career doctor
career resume
career portfolio
career graph
career export pdf
career ask
```

Convincing demo:

```bash
npm install
career compile
career resume
career portfolio
```

Artifacts appear without hand-editing generated files. Website alone is a viewer; **CLI makes CareerOS a compiler product.**

*(Several commands already exist — harden into a coherent doctor/validate/init/export story before ingest.)*

#### Milestone 4 — Ingestion is adapter

```text
PDF / Image / Email / Docs  →  (adapter)  →  Markdown AST / typed nodes  →  Knowledge Graph
```

PDF/OCR never become the center. Philosophy: **Everything becomes knowledge.**

#### Milestone 5 — Conversation is projection, not owner of the graph

```text
Conversation → Intent → Planner → Tool → Knowledge Graph → Response IR → LLM verbalize
```

Not `Chatbot → Graph`. Chat is another projection — same rule as Resume / Portfolio.

---

## Deploy choice — Vercel vs AWS

| Option | When | Signal |
|---|---|---|
| **Vercel** | Fastest public URL for hire-demo | “Shipped a product page” |
| **AWS (preferred if targeting AI Platform / AWS roles)** | Milestone 1 showcase with production-shaped hosting | “Can deploy a system” |

### Recommendation

- **Hire-first DoD** = stable public URL + SSL + domain — host is secondary.
- Prefer **thin AWS** for AI Platform roles — not enterprise on day one.

### Milestone 1 — thin AWS (enough)

```text
CloudFront
   │
   ▼
Next.js (CareerOS showcase)
   │
   ▼
Compiler Service (optional worker; CLI-first OK)
   │
   ▼
SQLite (graph persistence)
   │
   ▼
S3 (artifacts: ResumeIR, exports)
```

Domain + ACM SSL. No Cognito / Neo4j / Step Functions required.

### Split later (only when needed)

ECS/Fargate · RDS/Postgres + pgvector · Neo4j · SQS/EventBridge · Cognito · MCP Gateway.

**Rule:** do not spend weeks on cloud plumbing while the compiler core and CLI story are still thin.

---

## DB decision (2026-07-16) — skip Postgres and Neo4j for now

Audited what already exists before adding services:

| Need | Already have | Verdict |
|---|---|---|
| Graph / node / edge metadata store | `packages/graph-store` — SQLite (`graph.db`), indexed by type/source/target | **Keep.** Postgres would duplicate this at current scale (48 nodes / 95 edges) — no query Postgres enables that SQLite can't at this size. |
| Vector retrieval for Interview AI | `services/retriever/src/qdrant.ts` (fetch-based) + `scripts/index-embeddings.mjs` + wired into `career ask --vector` | **Use it.** Already in `docker-compose.yml` — just `docker compose up -d qdrant` + index. Not net-new work. |
| Relationship / path queries (multi-hop traversal, graph visualization) | Not needed yet — current queries are single-hop (node → edges) | **Defer GraphDB (Neo4j).** Revisit only when a real query needs `Project → Tech → Skill → Domain → other Project` path-finding or a visual graph explorer ships (Milestone 5/6). |

**Rule:** add Neo4j only when a concrete retrieval/UX need can't be expressed as SQLite lookups + Qdrant similarity — not "for completeness."

### Interview AI status

`career ask "<question>" --vector` already runs the full path: Hybrid Retriever (BM25 + Graph + Qdrant vector) → RRF → ConversationIR → Gemini verbalize. **Backend exists.** What's missing is a **web-facing chat UI** (Milestone 5 — Conversation Runtime as projection, with interrupt/stack behavior), not the retrieval core.

---

## Reviewer panel (5–10 people)

Mix: 1 frontend, 1 backend, 1 BA, 1 recruiter, 1 PM (+ peers).

Ask **these four only** — not “đẹp không?”:

| # | Question | Failure mode |
|---|---|---|
| 1 | **In 30 seconds, what does CareerOS do?** | Landing / Architecture unclear |
| 2 | **Which project do you remember most?** | Featured weak |
| 3 | **Do you believe these are real projects?** | Project Detail / Evidence thin |
| 4 | **Would you interview this person?** | **Overall KPI** |

### Pass signal

≥4/5 converge on:

> “A Knowledge Compiler for career knowledge — Markdown → Graph → Resume / Portfolio / Interview.”

Scatter (portfolio / CV / chatbot / graph / AI randomly) → fix Hero or Architecture — **not** add M3–M6 features.

---

## Checklist

### Hire-first (this week)

- [x] Resume projection polish
- [ ] Public deploy (prefer thin AWS for AI Platform signal; Vercel acceptable if blocked)
- [ ] Domain + SSL
- [ ] Smoke: Landing → Portfolio → Project → Resume → PDF → LinkedIn/GitHub
- [ ] 5–10 reviewers (4 questions)
- [ ] Fix from feedback only
- [ ] Apply with URL on CV / LinkedIn

### Product-first (do not block apply)

- [ ] M2 — Compiler core + SQLite-as-persistence + CLI toolchain (`init` / `validate` / `doctor` / …)
- [ ] M3 — Projection Engine (ResumeIR / PortfolioIR / ConversationIR complete)
- [ ] M4+ — Ingestion adapters → Conversation Runtime → Platform (only after hire loop underway)
