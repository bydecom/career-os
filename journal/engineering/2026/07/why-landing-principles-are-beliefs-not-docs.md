---
date: 2026-07-14
author: Bang Thai Minh
type: engineering-decision
confidence: high
tags:
  - frontend
  - landing
  - principles
  - storytelling
related:
  - apps/web/src/components/landing/Philosophy.tsx
  - journal/engineering/2026/07/why-landing-what-it-solves-is-deduplication.md
  - docs/02-architecture/12-frontend-wireframes.md
---

# Why Landing Principles Must Feel Like Beliefs (Not Docs Cards)

## Problem

An early Philosophy block used three equal cards with documentation tone:

> Single Source of Truth — Facts live in Markdown nodes…

Correct, forgettable. No hierarchy, no slogan density, no mini visual — the section most likely to become “three pretty cards.”

## Solution

Rename framing to **Core Principles / How CareerOS is built**. Each card:

- Numbered `01`–`03`
- Large stacked title (Apple/Linear density)
- One primary tagline + short punch lines
- Static mini flow (Markdown → Graph → …) at the bottom — personality without motion noise

Locked slogans:

1. *Knowledge is authored once. Everything else is generated.*
2. *Resume isn’t edited. Portfolio isn’t rewritten. Both are compiled.*
3. *The LLM never invents. It verbalizes verified IR.*

## Landing narrative (keep)

```
Hero → Pipeline → Problem → Principles → Architecture → Projects
```

Story: what it is → how compile works → why it matters → beliefs → architecture climax → proof. Architecture deserves the most craft next; Projects close the claim with evidence.

## Decision

Principles sell **beliefs with personality**, not feature bullets. Component may stay named `Philosophy.tsx`; user-facing label is **Core Principles**.
