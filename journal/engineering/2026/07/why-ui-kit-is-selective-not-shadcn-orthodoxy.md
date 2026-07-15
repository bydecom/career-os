---
date: 2026-07-14
author: Bang Thai Minh
type: engineering-decision
confidence: high
tags:
  - frontend
  - design-system
  - ui-kit
  - architecture
related:
  - apps/web/src/components/ui/
  - apps/web/src/components/marketing/
  - docs/02-architecture/11-frontend-design-system.md
---

# UI Kit: Tokens + Selective Primitives (Not shadcn Orthodoxy)

## Agree

1. **Never hardcode zinc/hex in page modules** — use `bg-background`, `text-muted`, `border-border`, etc.
2. **Shared flow UI must be one component** — `PipelineFlow` (Hero / Pipeline / Principles / Architecture), not five inline `MiniFlow`s.
3. **Marketing sections should compose**, not invent local chrome every time.

## Disagree / nuance

1. **shadcn `Card` is a primitive, not a law.** CareerOS may prefer `GlassCard` / `FeatureCard` / raw bordered **spec sheets** when glow, hover, or IDE aesthetics need control.
2. **`SectionHeader` is optional.** Use when sections share chrome; diverge to raw `h2`/`p` + typography classes when spacing differs (Hero ≠ Architecture). Linear/Vercel often skip this abstraction.
3. **Do not componentize every stack.** `mt-4 space-y-2` stays as Tailwind. React components have cost.

## Locked folder shape

```text
components/
  ui/           Container, SectionHeader?, Card?, PipelineFlow, Button, Badge, Terminal…
  marketing/    Hero, Pipeline, WhatItSolves, Philosophy, Architecture, FeaturedProjects…
  shared/       ProjectCard, TechBadge, Timeline… (cross marketing + app)
  shell/        MarketingShell, AppShell
```

## Philosophy visual

Principles cards are **specification sheets** (RULE 01 · hairline rules · whitespace · typography footer).

**Do not** put `PipelineFlow` / diagram badges in Philosophy — that duplicates the principle and fights the Vercel/Linear visual language (PowerPoint-in-a-card). Diagrams belong in **Architecture**.

Footer pattern (minimal):

```text
────────────
Invariant
Author once. Compile forever.
```

or Source → Projection metadata — no pills, no ↓ stacks.

## Priority

After Problem (WhatItSolves) + Principles: invest next in **Architecture** — the technical wow section. Philosophy is beliefs; Architecture is proof of a real compiler system.
