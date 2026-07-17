---
date: 2026-07-16
author: Bang Thai Minh
type: product-backlog
confidence: medium
status: deferred
tags:
  - ingest
  - multimodal
  - conversation
  - post-v1
related:
  - docs/00-vision/09-roadmap.md
  - docs/00-vision/10-platform-capability-map.md
  - docs/00-vision/11-engineering-principles.md
---

# Deferred Add-ons — Ingest & Conversation Management (Post Hire-Demo)

## Status

**Later.** Do **not** start these while Landing Architecture / Featured Projects / Portfolio deploy / job applications are unfinished.

Principle #0 still wins: CareerOS exists to get hired. These ideas enlarge the platform; they do not unblock the hire demo.

## Ideas captured (2026-07-16)

### 1. PDF → Markdown

Ingest PDFs (old resumes, papers, offer letters) into Markdown knowledge nodes suitable for `career compile`.

Likely shape (when unfrozen):

- Extract text / layout → Markdown (+ optional frontmatter stubs)
- Human review before nodes enter `career-data/`
- Never auto-commit unverified facts into the graph

### 2. Image → structural data

Vision / OCR path: screenshots, certificates, architecture diagrams → structured fields or candidate nodes (not free-form chat memory).

Same rule: **compile into ontology-typed knowledge**, not “store blobs and hope the LLM remembers.”

### 3. Conversational management

Beyond current `career ask` (retrieve → ConversationIR → verbalize):

- Session / thread management
- Turn history with evidence links
- Possible evaluation hooks from conversation logs

Distinct from “chat product.” Remains **evidence-first**; LLM stays voice, not source of truth.

## Why defer

| If we build now… | Cost |
|------------------|------|
| PDF / image ingest | Pulls focus into multimodal ETL before PortfolioIR + deploy |
| Conversation management | Easy to become chatbot scaffolding; fights “compiler not chatbot” story |
| All of the above | Delays Architecture wow + apply-jobs loop |

## Unfreeze when

1. Hire-demo ship path done — public URL + reviewer pass — see [hire-demo-deploy-and-review.md](./hire-demo-deploy-and-review.md).  
2. Applying / interviewing is underway.  
3. **Compiler CLI toolchain** (Milestone 2: `compile` / `validate` / `doctor` / `resume` / …) feels coherent — ingest is Milestone **4** (adapter), not next after Landing.  
4. Authoring scale actually hurts (too many PDFs/images to hand-convert) — then ingest is justified.

## Decision

Park under **post–v1.0 / Phase 5-ish authoring + conversation ops**. Revisit only with an explicit roadmap unfreeze — not as drive-by Landing or CLI features.
