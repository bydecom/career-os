---
date: 2026-07-14
author: Bang Thai Minh
type: engineering-decision
confidence: high
tags:
  - frontend
  - design-system
  - ui-kit
  - philosophy
related:
  - apps/web/src/components/landing/Philosophy.tsx
  - apps/web/src/components/ui/
  - docs/02-architecture/11-frontend-design-system.md
---

# Why Landing Sections Must Compose the UI Kit (Not Hand-Rolled Tailwind)

## Problem

`Philosophy.tsx` shipped as pixel-first HTML + ad-hoc Tailwind (`bg-zinc-950`, inline `MiniFlow`). That violates Design System §0:

> Architect workflow — not pixel-first coding.  
> Design System + UI kit first. Pages only compose locked components.

Hardcoded zinc bypasses tokens. Inline mini-flows duplicate the product component `PipelineStep` planned in Sprint 0.

## Solution

Sprint 0b primitives (minimal lock for Principles section):

| Kit piece | Path |
|-----------|------|
| `cn()` | `src/lib/utils.ts` |
| `Container` | `components/ui/container.tsx` |
| `SectionTitle` | `components/ui/section-title.tsx` |
| `Card` / `CardContent` | `components/ui/card.tsx` |
| `PipelineStep` | `components/ui/pipeline-step.tsx` |

`Philosophy` only composes: `Container` → `SectionTitle` → `Card` → `PipelineStep`. Tokens only (`border-border`, `bg-background/50`, `text-muted-foreground`) — no raw zinc/hex in page modules.

## Decision

Extend the kit before inventing local class soups. Next Landing sections (WhatItSolves, Pipeline chrome, Architecture) should migrate onto the same primitives when touched.
