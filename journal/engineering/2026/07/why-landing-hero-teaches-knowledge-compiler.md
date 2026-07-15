---
date: 2026-07-14
author: Bang Thai Minh
type: engineering-decision
confidence: high
tags:
  - frontend
  - landing
  - hero
  - design-system
  - storytelling
related:
  - apps/web/src/components/landing/Hero.tsx
  - apps/web/src/components/shell/MarketingShell.tsx
  - apps/web/src/components/landing/Pipeline.tsx
  - journal/engineering/2026/07/why-landing-pipeline-centers-knowledge-graph.md
  - docs/02-architecture/11-frontend-design-system.md
  - docs/02-architecture/12-frontend-wireframes.md
---

# Why Landing `Hero.tsx` Must Teach “Compiler for Personal Knowledge” in One Viewport

## Problem

An early Hero was typographically strong but **compositionally empty**:

```
Compile knowledge.
Not documents.

[paragraph]
[CTAs]

(empty right half of the viewport)
```

Headline quality ≠ product story. On a near-full viewport, the eye falls into whitespace. Recruiters leave with “nice slogan,” not “this person built a knowledge compiler.”

Secondary issues that diluted the USP:

- Badge `Knowledge Platform` — generic SaaS.
- Body copy “deterministic knowledge platform that transforms…” — correct, forgettable.
- Interview AI linked like a live product while Phase 3 is not ready.
- No **proof** (nodes / edges / IR artifacts) under CTAs — feels like a marketing site, not running software.
- Navbar logo slightly underweighted vs. the brand claim in the Hero.

## Solution / Concept

Hero is the **first wow moment**. It must answer in ~3 seconds:

> This is not a normal portfolio. This is a compiler for personal knowledge.

### Locked structure

```
COMPILE ONCE · PROJECT EVERYWHERE

Compile knowledge.
Not documents.                    ← do not change

Markdown becomes a verified Knowledge Graph.
Resume, Portfolio, and Interview AI are only projections.

[ Explore Portfolio ]  [ Open Resume ]  Try Interview AI (Coming Phase 3)

48 Nodes · 95 Edges · ResumeIR · ConversationIR

                              ┌ mini terminal ─────────┐
                              │ Markdown → Compiler    │
                              │        ↓               │
                              │  Knowledge Graph ★     │
                              │   /    |    \          │
                              │ Resume Portfolio AI    │
                              │ ✓ graph.json …         │
                              └────────────────────────┘
```

Left = thesis + proof. Right = **architecture diagram as UI** (same story as `Pipeline.tsx`, compressed).

### Copy rules

| Slot | Decision | Why |
|------|----------|-----|
| Headline | Keep `Compile knowledge. / Not documents.` | Brand, Apple/Linear-grade; already the best line on the page |
| Badge | `Compile once · Project everywhere` | Encodes USP; not a vague category label |
| Body | Two short lines: Graph = source of truth; Resume/Portfolio/AI = projections | Memorable; maps to backend (`projectResume`, ConversationIR) |
| Proof row | Live-feeling counts + IR names | Signals real compile output, not vapor |

Avoid restoring generic “platform that transforms engineering experience…” unless rewriting for a different audience.

### Right-rail visual (`HeroPipelineVisual`)

- Terminal chrome (`career compile`) — same grammar as Pipeline signature.
- Graph is the glowing node; fan-out to Resume / Portfolio / Interview.
- Footer checks: `graph.json`, `resume.ir.json`, `ConversationIR`.

This fills the empty half **and** previews the Pipeline section so scroll reinforces, not reintroduces, the idea.

### CTA honesty

- Primary: Explore Portfolio  
- Secondary: Open Resume  
- Interview AI: **not a fake link** — muted label + `Coming Phase 3`

Hiring traffic should never click a dead “product” and bounce confused.

### Navbar (`MarketingShell`)

- Slightly shorter bar (`h-12`) so Hero owns vertical space.
- Logo `CareerOS` one step larger / heavier — brand must hold vs. the headline.

## Why (First Principles)

1. **Hero sells the category of the work, not whitespace.** Empty premium layouts work for consumer brands with photography; CareerOS’s “photo” is the compile graph.
2. **Same story as Pipeline, earlier.** Pipeline is the deep signature; Hero is the 3-second trailer. Hierarchy still centers **Knowledge Graph + fan-out**, not Compiler-as-hero (see Pipeline journal).
3. **Proof beats adjectives.** `48 Nodes · 95 Edges · ResumeIR` beats “deterministic knowledge platform.”
4. **Honesty is product design.** Disabled / Coming Phase 3 beats a soft-link to About that looks like a third primary CTA.

## Key Design Decisions Locked

### Do not replace the headline

Any rewrite of `Compile knowledge. Not documents.` needs an explicit brand decision — not a “fill the layout” tweak.

### Do not leave the right column empty on desktop

If the visual is removed, replace it with another **architecture-proof** artifact (live stats, compile log), not decorative gradient alone.

### Keep Graph-weighted in the mini diagram

Hero visual must not re-elevate Compiler glow above Graph — consistent with Pipeline hierarchy.

### Prefer stats close to `career-data/generated/stats.json`

Hardcoded `48` / `95` is fine for freeze; prefer server-passed stats when Landing is composed from generated artifacts.

## What This Is Not

- Not a two-column marketing template with stock illustration.
- Not permission to re-enable Interview AI as a primary link before Phase 3.
- Not a place to dilute the badge back to “Knowledge Platform.”

## Related Files

- `apps/web/src/components/landing/Hero.tsx`
- `apps/web/src/components/shell/MarketingShell.tsx`
- `apps/web/src/components/landing/Pipeline.tsx`
- `journal/engineering/2026/07/why-landing-pipeline-centers-knowledge-graph.md`

## Decision

**Hero = thesis + proof + mini fan-out diagram. Headline stays. Interview AI stays honest. Graph stays the visual center of the right rail.**
