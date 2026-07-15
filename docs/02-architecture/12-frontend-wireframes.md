# Frontend Wireframes — Phase 1 (Sprint 0)

**Status:** Landing IA locked (A+B hybrid) · other pages still draft  
**Version:** 1.1  
**Date:** 2026-07-14  
**Updated:** 2026-07-14 — Lock Landing A+B; add What CareerOS Solves; large project cards

**Source of truth:** [10-frontend-knowledge-platform.md](./10-frontend-knowledge-platform.md) · [11-frontend-design-system.md](./11-frontend-design-system.md)

> Wireframes validate IA. Mockups come next. Code comes last.

Legend: `[ ]` = control · `====` = section break · `|` = column

---

## Shells

### MarketingShell (`/`, `/about`, `/contact`)

```text
+------------------------------------------------------------------+
| CareerOS          Portfolio  Resume  About  Contact    [GitHub]  |
+------------------------------------------------------------------+
|                                                                  |
|                         {page body}                              |
|                                                                  |
+------------------------------------------------------------------+
| GitHub · LinkedIn · Email · © CareerOS                           |
+------------------------------------------------------------------+
```

### AppShell (`/app`, `/resume`, `/portfolio`, `/project/*`, …)

```text
+--------+---------------------------------------------------------+
| CareerOS|  Search…                                    [Profile] |
+--------+---------------------------------------------------------+
| Home   |                                                         |
| Resume |                   {page body}                           |
| Portf. |                                                         |
| …      |                                                         |
+--------+---------------------------------------------------------+
```

---

## 1. Landing `/` — **LOCKED: A + B hybrid**

**Decision (2026-07-14):**

| Choice | Keep / Drop |
|---|---|
| **Base** | Landing **A** (Apple) — matches Knowledge Platform vision |
| **Borrow from B** | Deeper Architecture block · **fewer, larger** Project cards (image · metric · role) |
| **Drop from C** | No Resume preview on Landing (Resume = projection, not homepage spotlight) |
| **Add** | **What CareerOS Solves** (Problem → Solution) between Pipeline and Philosophy |

Tech cloud stays **last before Footer** — not a selling point; proof is Projects + Compiler + Architecture.

### Final section order (storytelling)

```text
1. Hero              CareerOS · Compile knowledge. Not documents. · CTAs
2. Pipeline          MD → Compiler → Graph → Resume / Portfolio / Chat   (dominant)
3. What it solves    Traditional CV vs CareerOS (Why should I care?)
4. Philosophy        Single Source · Compile, don't copy · Evidence over prompt
5. Architecture      Deeper diagram (Linear/B depth)
6. Featured Projects 3–4 LARGE cards (not 4 tiny cards)
7. Tech cloud        Labels only — de-emphasized
8. Footer
```

### Wireframe — locked Landing

```text
+------------------------------------------------------------------+
| Navbar                                                           |
+------------------------------------------------------------------+
|                                                                  |
|  CareerOS                                                        |
|  Compile knowledge. Not documents.                               |
|  [Explore Portfolio]  [Open Resume]  [Try Interview AI]          |
|                                                                  |
|  [======== Pipeline illustration (dominant) ========]            |
|   MD → Compiler → Graph → Resume / Portfolio / Chat              |
|                                                                  |
+------------------------------------------------------------------+
|  What CareerOS Solves                                            |
|  +------------------------+  +------------------------+          |
|  | Traditional Resume     |  | CareerOS               |          |
|  | ✕ Static               |  | ✓ Single Source        |          |
|  | ✕ Manual copy          |  | ✓ Deterministic        |          |
|  | ✕ Multiple versions   |  | ✓ Queryable            |          |
|  +------------------------+  +------------------------+          |
+------------------------------------------------------------------+
|  Philosophy                                                      |
|  [ Single Source ] [ Compile don't copy ] [ Evidence over prompt]|
+------------------------------------------------------------------+
|  Architecture (deep — more boxes, compiler stages)               |
+------------------------------------------------------------------+
|  Featured Projects (3–4 LARGE)                                   |
|  +---------------------------+  +---------------------------+    |
|  | COVER / visual            |  | COVER / visual            |    |
|  | CareerOS · role · metric  |  | GraphRAG · role · metric  |    |
|  +---------------------------+  +---------------------------+    |
+------------------------------------------------------------------+
|  Tech cloud (labels only, quiet)                                 |
+------------------------------------------------------------------+
|  Footer                                                          |
+------------------------------------------------------------------+
```

**Hero budget check:** brand · one headline · one sentence · CTA group · one visual. No stats in first viewport. ✅

### Archive — rejected variants (reference only)

<details>
<summary>Version A original / B / C (superseded by lock above)</summary>

### Version A — “Apple” (calm narrative) — became base

```text
Hero → Pipeline → Philosophy → Architecture → Projects → Tech → Footer
```

### Version B — “Linear” (compiler-first) — borrow Architecture + large cards only

```text
Hero → Compiler strip → Architecture → 2–4 large project cards → Footer
```

Missing explicit philosophy / “why care” — too SaaS, not CareerOS story.

### Version C — “Vercel” — rejected for homepage

```text
Hero → Interactive pipeline → Features → Resume preview → Footer
```

Resume preview too early; feels like a CV site.

</details>

---

## 2. Dashboard `/app`

```text
+--------+---------------------------------------------------------+
| Nav    |  Dashboard                                              |
|        |---------------------------------------------------------|
| Home ● |  Nodes   Edges   Projects   Exp   Tech   Companies      |
| Resume |  [ 48 ]  [ 95 ]  [  8   ]  [ 2 ] [ 28 ] [   2     ]     |
| Portf. |---------------------------------------------------------|
| Graph  |  Recent compiles          |  Latest artifacts           |
| …      |  · compile 14:02 OK       |  · Resume → /resume         |
|        |  · resume  14:03 OK       |  · Portfolio → /portfolio   |
|        |---------------------------------------------------------|
|        |  Recent projects          |  Mini graph (optional)      |
|        |  · CareerOS               |  [···· small preview ····]  |
|        |  · GraphRAG-Code          |                             |
+--------+---------------------------------------------------------+
```

Projection: `DashboardIR` / `stats.json` (future).

---

## 3. Resume `/resume`

```text
+--------+---------------------------------------------------------+
| Nav    |  Resume                    [MD] [HTML] [PDF] (later)    |
|        |---------------------------------------------------------|
|        |  Name                                                   |
|        |  Headline · Location · Email · GitHub · LinkedIn        |
|        |---------------------------------------------------------|
|        |  Summary                                                |
|        |  .....................................................  |
|        |---------------------------------------------------------|
|        |  Experience                                             |
|        |  · Role — Company · dates                               |
|        |  · Role — Company · dates                               |
|        |---------------------------------------------------------|
|        |  Projects                                               |
|        |  · Project · period · stack                             |
|        |  · …                                                    |
|        |---------------------------------------------------------|
|        |  Skills                                                 |
|        |  [chip] [chip] [chip] …                                 |
|        |---------------------------------------------------------|
|        |  Education                                              |
|        |  · HCMUTE …                                             |
+--------+---------------------------------------------------------+
```

Projection: `ResumeIR` only.

---

## 4. Portfolio `/portfolio`

```text
+--------+---------------------------------------------------------+
| Nav    |  Portfolio              Filter: [All ▾] [AI] [Backend]  |
|        |---------------------------------------------------------|
|        |  +---------------------------+  +---------------------+ |
|        |  | COVER                     |  | COVER               | |
|        |  | CareerOS                  |  | GraphRAG-Code       | |
|        |  | role · period             |  | metric teaser       | |
|        |  | stack chips               |  |                     | |
|        |  +---------------------------+  +---------------------+ |
|        |  +---------------------------+  +---------------------+ |
|        |  | Medical Citation Agent    |  | E-Commerce          | |
|        |  +---------------------------+  +---------------------+ |
+--------+---------------------------------------------------------+
```

4–6 featured cards. Click → `/project/[id]`. Projection: `PortfolioIR`.

---

## 5. Project Detail `/project/[id]` ⭐

```text
+--------+---------------------------------------------------------+
| Nav    |  ← Portfolio                                            |
|        |---------------------------------------------------------|
|        |  HERO: Project name · role · period · [Demo] [Repo]     |
|        |=========================================================|
|        |  Overview                                               |
|        |---------------------------------------------------------|
|        |  Problem                                                |
|        |---------------------------------------------------------|
|        |  Architecture        [ diagram / placeholder box ]      |
|        |---------------------------------------------------------|
|        |  Engineering Decisions                                  |
|        |  · Why SQLite …                                         |
|        |  · Why Graph …                                          |
|        |---------------------------------------------------------|
|        |  Timeline                                               |
|        |---------------------------------------------------------|
|        |  Tech stack          [chips]                            |
|        |---------------------------------------------------------|
|        |  Metrics                                                |
|        |---------------------------------------------------------|
|        |  Evidence  ← locked under Metrics                       |
|        |  · Architecture.md · Diagram · Commit · Bench · ADR     |
|        |---------------------------------------------------------|
|        |  Related nodes                                          |
|        |  Tech → Exp → Decision → Company                        |
|        |---------------------------------------------------------|
|        |  Source documents                                       |
+--------+---------------------------------------------------------+
```

Section order must match architecture doc § Project Detail.

---

## 6. About `/about`

```text
MarketingShell
----------------------------------------------------------------
Hero: About CareerOS
----------------------------------------------------------------
Compiler pipeline (same vocabulary as Landing)
----------------------------------------------------------------
Architecture summary + links to ADRs / roadmap docs
----------------------------------------------------------------
Engineering principles (short)
----------------------------------------------------------------
Footer
```

---

## 7. Contact `/contact`

```text
MarketingShell
----------------------------------------------------------------
Contact
  Email     thaibang…@gmail.com
  GitHub    github.com/bydecom
  LinkedIn  …
  Website   …
----------------------------------------------------------------
Footer
```

From `profile` node / ResumeIR profile fields.

---

## Phase 2 (wireframe stubs only — do not mockup yet)

### Graph `/graph`

```text
+----------+---------------------+------------------+
| Sidebar  | Graph canvas        | Inspector        |
| filters  |                     | selected node    |
| search   |                     | edges · excerpt  |
| types    |                     |                  |
+----------+---------------------+------------------+
```

### Timeline / Skills / Search

Defer detailed wireframes until Phase 1 mockups are chosen.

---

## Component map (from wireframes → kit)

| Wireframe block | Future kit component |
|---|---|
| Navbar | Topbar / MarketingShell |
| Sidebar | AppShell sidebar |
| Hero + CTAs | Hero · CTAGroup |
| Pipeline | PipelineStep |
| What CareerOS Solves | ComparePanel / ProblemSolution |
| Philosophy trio | FeatureGrid / Card |
| Architecture (deep) | ArchitectureDiagram |
| Featured Projects (large) | ProjectCard (large variant) |
| Tech cloud (quiet) | TechCloud |
| Resume sections | ProfileCard · ExperienceSection · … |
| Evidence list | EvidenceSection |
| Stat row | MetricStat |
| Graph panes | GraphSidebar · GraphCanvas · GraphInspector |

---

## Review checklist

- [x] Pick Landing variant → **A + B hybrid locked** (no C Resume preview; + What CareerOS Solves)
- [x] Landing mockup implemented in `apps/web` (dark · emerald · section order locked)
- [ ] Confirm Project Detail section order (esp. Evidence under Metrics) — stub page live
- [ ] Confirm `/app` dashboard blocks enough for hire demo
- [ ] Polish kit / PortfolioIR / Project Detail Evidence depth

**Next:** Review Landing in browser (`npm run web`) → iterate visual → then PortfolioIR depth.
