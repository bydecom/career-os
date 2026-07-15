---
date: 2026-07-14
author: Bang Thai Minh
type: engineering-decision
confidence: high
tags:
  - frontend
  - landing
  - pipeline
  - design-system
  - storytelling
related:
  - apps/web/src/components/landing/Pipeline.tsx
  - docs/02-architecture/11-frontend-design-system.md
  - docs/02-architecture/12-frontend-wireframes.md
---

# Why Landing `Pipeline.tsx` Centers the Knowledge Graph (Not the Compiler)

## Problem

Early Landing iterations treated the CareerOS pipeline as **four equal cards in a row** (Markdown → Compiler → Graph → Resume). That reads as a wireframe pasted into UI: recruiters remember “four boxes,” not the product thesis.

A later iteration over-corrected the other way: **Compiler got the strongest glow** because it is the “engine.” Technically honest — but product-wrong. CareerOS does not sell a compiler. It sells a **Knowledge Graph IR** and the idea **Compile once → Project everywhere**.

If a recruiter skims for three seconds and remembers “nice Compiler card,” storytelling failed.

## Solution / Concept

`Pipeline.tsx` is the Landing **signature section**. Visual hierarchy and layout must encode the architecture without requiring the user to read copy.

### Visual hierarchy (`stageClass` variants)

| Stage | Variant | Role | Visual weight |
|-------|---------|------|----------------|
| Markdown | `flat` | Source | Quiet border, no glow |
| Compiler | `engine` | How you get there | Emerald border + **light** shadow — present, not hero |
| Knowledge Graph | `hero` | Product / IR | Strongest glow, gradient, constellation + node pulse |
| Resume / Portfolio / Interview AI | fan-out glass | Projections | Calm glass cards — outcomes, not another stacked stage |

**Graph is the only stage that “owns” the emerald glow.** Compiler is deliberately secondary so the eye lands on IR, not on the toolchain.

### Layout: fan-out, not a fourth equal card

Wrong mental model (column of four peers):

```
Markdown → Compiler → Graph → Projection card
```

Intended mental model (compile once, project everywhere):

```
          Markdown
               │
               ▼
           Compiler
               │
               ▼
        Knowledge Graph IR   ★ hero
         /        |        \
    Resume   Portfolio   Interview AI
```

Projections are **not** a fourth pipeline stage with the same chrome. They are **fan-out leaves** under the graph — SVG fork + three glass cards. The diagram itself teaches the USP.

### Interaction

- Hover a pipeline stage → expand ✓ details (Lexer / Parser / ontology / node counts) — product feel, not decoration.
- Graph always shows a live-feeling constellation (pulse) so IR feels like a running system, not a label.

### Copy

Headline is **“Compile once. Project everywhere.”** — not “Not four cards. A compiler.” The section title must reinforce Graph + projections, not the compile step.

## Why (First Principles)

1. **Landing sells the product thesis, not the implementation favorite.** Backend pride is the Compiler; product memory must be the Graph.
2. **Hierarchy is storytelling.** Equal cards → no story. Wrong hero → wrong memory. Correct hero → USP sticks in 3 seconds.
3. **Layout encodes architecture.** Fan-out is the same idea as `projectResume` / future Portfolio / ConversationIR: one IR, many projections.
4. **Wireframes are maps, not destinations.** Horizontal step strips are fine for docs; Landing needs signature visual grammar (terminal chrome + vertical compile story + fan-out).

## Key Design Decisions Locked in This Component

### Do not glow Markdown or Projections by default

Source and outputs stay calm. Glow is a scarce signal; spending it on Graph protects contrast.

### Compiler stays visible but mid-weight

Recruiters still see that this is a real deterministic pipeline (Lexer → Parser → Ontology → Graph builder on hover). They just do not mistake the toolchain for the product.

### Stats on Graph (nodes / edges)

Concrete numbers (`48 nodes · 95 edges`) make IR feel real. Prefer wiring from `career-data/generated/stats.json` later if the Landing is server-composed; hardcode is acceptable for marketing freeze as long as it stays close to compile output.

### Terminal chrome (`career compile —verbose`)

Frames the section as a compiler run, not a marketing feature grid — aligned with “Compile knowledge. Not documents.”

### MCP omitted from the fan-out trio (for now)

Primary fan-out is Resume / Portfolio / Interview AI — what a hiring audience cares about. MCP can live in Architecture/docs; Landing fan-out stays three leaves so the fork reads instantly.

## What This Is Not

- Not a generic “process steps” pattern from SaaS templates.
- Not a place to equalize all stages for “visual balance.”
- Not permission to make Compiler the brightest element again without an explicit product decision.

## Related Files

- Implementation: `apps/web/src/components/landing/Pipeline.tsx`
- Design system tokens: `docs/02-architecture/11-frontend-design-system.md`
- Landing IA (Hero → Pipeline → …): `docs/02-architecture/12-frontend-wireframes.md`

## Decision

**Keep Graph as visual hero + fan-out projections.** If hierarchy is revisited, change it deliberately in this journal — do not “balance” glow across Compiler and Graph by accident.
