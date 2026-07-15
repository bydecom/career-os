---
date: 2026-07-14
author: Bang Thai Minh
type: engineering-decision
confidence: high
tags:
  - frontend
  - landing
  - what-it-solves
  - storytelling
related:
  - apps/web/src/components/landing/WhatItSolves.tsx
  - journal/engineering/2026/07/why-landing-hero-teaches-knowledge-compiler.md
  - journal/engineering/2026/07/why-landing-pipeline-centers-knowledge-graph.md
  - docs/02-architecture/12-frontend-wireframes.md
---

# Why `WhatItSolves` Sells Knowledge Deduplication (Not a Resume Builder)

## Problem

An early “What CareerOS solves” block framed the pain as **Traditional resume** with bullets like static PDFs and copy-paste. That teaches the wrong category:

> CareerOS looks like a resume builder / CV tool.

CareerOS’s real pain is **knowledge duplication**: the same facts maintained separately across Resume, Portfolio, LinkedIn, and AI prompts — then drifting.

Also, bullets like “Deterministic compile” / “Queryable graph” are true for engineers but opaque to recruiters in a 20–30s Landing skim.

## Solution / Concept

Keep the title **What CareerOS solves**. Change the story to:

**Left — Traditional workflow**

- Visual: four silos (Resume · Portfolio · LinkedIn · AI prompts) → “Same facts · four copies · drift”
- Bullets: each surface maintained separately; information drifts

**Right — CareerOS**

- Visual: Markdown → Knowledge Graph → fan-out (Resume · Portfolio · Interview)
- Bullets recruiters can parse: one source, Resume stays in sync, Portfolio consistent, AI from evidence

Icons: Lucide `XCircle` / `CheckCircle2` — clearer than raw ✕/✓ glyphs.

Body copy continues Hero’s thesis in engineer voice: duplicate facts vs one verified graph with compiled views.

## Landing pace (product rule)

Recruiters spend ~20–30 seconds on Landing before choosing Portfolio or Resume. Landing should answer only:

1. **What is CareerOS?** → Hero  
2. **Why is it different from a normal portfolio?** → WhatItSolves  
3. **What can I open next?** → Featured Projects + Resume CTAs  

Compiler / Ontology / IR depth belongs in **Pipeline (signature, still visual)** plus **Architecture / About** — not repeated as more explanation cards. Homepage sells the idea; later pages explain the architecture.

## Decision

**Pain = duplication. Solution = one graph, many projections. No resume-builder framing. Recruiter-readable outcomes on the right column.**
