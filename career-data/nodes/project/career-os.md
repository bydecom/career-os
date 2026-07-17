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
status: active
role: "Full-stack Engineer & Architect"
period: "Jul/2026 - Present"
visibility: public
created: "2026-07-01"
updated: "2026-07-18"
---

## Overview

CareerOS is a **Personal Knowledge Compiler**. Markdown nodes are the source
code; the compiler builds a Knowledge Graph IR; typed projections power
Resume, Portfolio, and Interview — without rewriting the story for each
surface.

Hire-first demo first: Landing → Project Detail → Resume → Deploy. Studio /
Dashboard stay deferred until a public URL exists.

Repo: this monorepo (`career-knowledge-base`).

## Demo

![[cover.png|caption=CareerOS]]

![[demo.mp4|caption=Compile → Resume / Interview|poster=poster.png]]

## Problem

Engineers maintain parallel truths: a CV, a portfolio site, interview talking
points, and scattered notes. Each rewrite drifts. Recruiters see polish; the
author sees copy-paste debt. Career knowledge needs a **single authorable
source** and **deterministic projections**, not another CMS.

## Runtime Pipeline

1. Author Markdown nodes under `career-data/nodes/` (wiki-links = edges)
2. Lexer — frontmatter + body split ([[zod]] schemas)
3. Parser — [[unified]] / [[remark]] AST + wiki-link extraction
4. Ontology / Semantic Analyzer — typed nodes, edge inference by section
5. Validator — schema + orphan diagnostics
6. Graph IR — `graph.json` + [[sqlite]] `graph.db`
7. Projections — ResumeIR · PortfolioIR · ConversationIR
8. Surfaces — Landing, `/project/[id]`, `/resume`, Interview `/api/ask`
   (hybrid retrieval: metadata + BM25 + [[qdrant]] + graph)

## Core Capabilities

### Knowledge as Source Code

Markdown is the only authorable source in v1 — no CMS admin UI. Compile
before any LLM verbalization (AI-as-view, not AI-as-source).

### Compiler Packages as Pure Libraries

`packages/*` stay I/O-free; `apps/cli` and `services/*` own the filesystem
and runtime. Rebuild-from-source stays honest.

### Edges as Compiler Output

Wiki-links become graph edges — not hand-authored relationship tables. See
`knowledge/career-os/why-edges-are-compiler-output.md`.

### Typed Projections

One graph → ResumeIR (printable CV), Portfolio / Project Detail narrative,
ConversationIR for Interview ask. Same facts, different shapes.

### Hybrid Retrieval for Interview

Ask path fuses metadata, BM25, vector ([[qdrant]]), and graph — Execution
Trace shows real engine scores, not fake chain-of-thought.

### Hire-first Product Surfaces

Landing sells the demo (Architecture + Featured Products); Project Detail
uses MarketingShell so recruiters never hit a login wall. Phase 2
capabilities wait for a public URL.

## Engineering Decisions

- **Edges are compiler output** — wiki-links drive the graph.
- **Deterministic compile before LLM** — progressive certainty; retrieval
  ranks evidence, model verbalizes after.
- **Curated Product Cards until PortfolioIR lands** — hire clarity over
  fully IR-driven Landing copy.
- **MarketingShell for Project Detail** — no auth wall for recruiters.
- **[[typescript]] + [[nodejs]] monorepo** — one language across compiler,
  web, and services.

## Tradeoffs

- Curated Landing copy vs fully IR-driven marketing — owned clarity for
  hire-demo; IR-driven narrative is the someday path.
- SQLite graph for v1 vs Neo4j/cluster — ops simplicity; scale later.
- Park Knowledge OS / Candidate KG platform docs under `docs/someday/` —
  do not implement before Deploy + reviewer pass.

## Evidence

- Implementation: `packages/compiler` · ontology · ResumeIR · Interview
  ask + Execution Trace · Project Detail curated depth
- Validation: `npm run compile` — nodes/edges/diagnostics; ResumeIR live
  on `/resume`
- Measurement: authored nodes under `career-data/nodes/` · 6 compiler
  packages · Featured Products prove GraphRAG / Medical / CSM sibling work
- Docs: `docs/02-architecture` · `docs/01-adr` · `docs/00-vision/09-roadmap.md`

Stack: [[typescript]], [[nodejs]], [[unified]], [[remark]], [[zod]],
[[react]], [[sqlite]], [[qdrant]], [[rabbitmq]] (pipeline events),
[[gemini-ai]] (Interview verbalization)

Sibling proofs: [[graphrag-code]] · [[medical-citation-agent]] ·
[[conversational-state-machine]]

## Lessons Learned

- Domain-first folders beat tech-stack folders when knowledge is the product.
- If Landing explains philosophy but not proof, recruiters bounce —
  Architecture + Featured Products close that gap.
- Principle #0: job first — ship a recruiter-usable URL before platform sprawl.
