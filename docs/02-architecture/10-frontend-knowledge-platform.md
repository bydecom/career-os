# Frontend Architecture — Knowledge Platform (not a CV site)

**Author:** Bang Thai Minh  
**Status:** Accepted (product vision for `apps/web`)  
**Version:** 1.1  
**Date:** 2026-07-14  
**Updated:** 2026-07-14 — Projection Registry, locked `/app`, CTA, Dashboard, Graph layout, Evidence  

**Related:** [09-monorepo-web.md](./09-monorepo-web.md) · [07-portfolio-design.md](./07-portfolio-design.md) · [11-frontend-design-system.md](./11-frontend-design-system.md) · [12-frontend-wireframes.md](./12-frontend-wireframes.md) · [99-v1-definition.md](../00-vision/99-v1-definition.md)

---

## 0. Mindset

The current scaffold is a **Resume Viewer**. That is useful, but incomplete.

CareerOS backend is a **Knowledge Platform / Compiler**. The frontend must reflect that.

> Do not think: “I am building a CV website.”  
> Think: “I am building an IDE to explore one engineer’s verified knowledge.”

**Resume is one projection** — not the product.

```text
Knowledge Graph
        │
        ├── Resume
        ├── Portfolio
        ├── Timeline
        ├── Graph Explorer
        ├── Project Detail
        ├── AI Interview
        ├── Architecture Explorer
        └── API / MCP
```

**Compile once, project everywhere.** Frontend is a projection layer over IR the CLI emits. It must not become a second content store.

---

## 0.1 Projection Registry (locked concept)

Everything the web shows that is **career fact** comes from a **named projection**, not from ad-hoc page queries over raw markdown.

```text
Knowledge Graph
      ↓
Projection Registry
      ├── ResumeIR          ← career resume          (exists)
      ├── ConversationIR    ← career ask             (exists)
      ├── PortfolioIR       ← career portfolio       (future)
      ├── TimelineIR        ← timeline page          (future)
      ├── SkillsIR          ← skills page            (future)
      ├── DashboardIR       ← /app overview          (future)
      └── GraphViewModel    ← /graph explorer        (future; may be graph.json + view prefs)
```

| Rule | Meaning |
|---|---|
| Pages **render** projections | They do not compile, parse source markdown, retrieve, or verbalize |
| New page → new projection (or reuse) | Do not invent a private data pipeline inside a React page |
| Marketing copy on `/` / `/about` | May be curated; **facts** still cite IR / graph |

Reinforce: **Everything is a projection.**

---

## 1. Product surfaces (two shells — locked)

Same pattern as GitHub / Linear / Supabase / Vercel: marketing vs product app.

### A. Marketing — `/`

Landing for cold recruiters. Explains **CareerOS**, not only Bang.

Routes that stay “story / public brochure” energy: `/`, `/about`, `/contact` (and later public `/api` / `/mcp` docs).

### B. Knowledge app — `/app` (**locked**, not optional)

```text
/          → marketing (Landing)
/app       → knowledge platform shell (Dashboard + sidebar)
```

`AppShell` (sidebar + topbar) owns in-app navigation. Deep routes may live under `/app/...` **or** top-level paths that still use `AppShell` — but `/app` itself is always the dashboard entry. Do not leave `/app` as “optional alias.”

Do **not** greet recruiters with a raw fullscreen graph on `/` (see [07-portfolio-design.md](./07-portfolio-design.md)).

---

## 2. Sitemap (target)

```text
/
├── Landing                              # CareerOS story + CTAs
│
├── /app                                 # Dashboard (LOCKED entry to knowledge app)
│
├── /resume                              # Resume projection
├── /portfolio                           # Featured projects
│   └── /project/[id]                    # Project detail (docs-quality)
├── /timeline
├── /skills
├── /graph                               # Signature explorer (Phase 2)
├── /search
│
├── /about
├── /contact
│
├── /interview  (Phase 3)                # Interview AI (ConversationIR)
├── /api        (Phase 3)
├── /mcp        (Phase 3)
└── /studio     (Phase 3)
```

In-app routes use `AppShell`. Marketing routes use `MarketingShell`.

---

## 3. Landing page (`/`) — sections

**IA locked:** Landing **A + B hybrid** — see [12-frontend-wireframes.md](./12-frontend-wireframes.md).  
No Resume preview on `/` (that is a projection page, not homepage spotlight).

| # | Section | Intent |
|---|---|---|
| 1 | **Hero** | Brand = CareerOS. Headline: *Compile knowledge. Not documents.* CTAs locked below. |
| 2 | **Pipeline** | Dominant visual: Markdown → Compiler → Knowledge Graph → Resume / Portfolio / Chat |
| 3 | **What CareerOS Solves** | Why care in ~5s: Traditional CV (static / manual / multi-version) vs CareerOS (single source / deterministic / queryable) |
| 4 | **Philosophy** | Single Source of Truth · Compile, don’t copy · Evidence over prompt |
| 5 | **Architecture** | Deeper diagram (Linear-style depth) — stages of the compiler |
| 6 | **Featured projects** | **3–4 large** cards (cover · role · metric) — not a grid of tiny cards |
| 7 | **Technology cloud** | Quiet, last before footer — not a selling point |
| 8 | **Footer** | GitHub · LinkedIn · Email |

### Hero CTAs (locked wording)

```text
Explore Portfolio
Open Resume
Try Interview AI
```

- Prefer **Open Resume** over “View Resume” (actionable).  
- Prefer **Try Interview AI** over “Ask AI” (role is clear; not generic chatbot).  
- Interview AI may link to `/interview` when Phase 3 exists; until then CTA can soft-link `/about` compiler story or a “coming soon” — do not ship a fake chat.

Hero budget: brand, one headline, one short sentence, one CTA group, one dominant visual (pipeline). No stat strips in the first viewport.

---

## 4. Main app routes (detail)

### `/app` — Dashboard (`DashboardIR` later)

Defined overview (do not leave vague):

| Block | Content |
|---|---|
| Counts | Nodes · Edges · Projects · Experiences · Technologies · Companies |
| Activity | Recent compiles (from diagnostics/stats if available) |
| Artifacts | Latest Resume · Latest Portfolio (links to projections) |
| Teasers | Recent projects · Recent technologies |
| Optional | Mini graph preview (not fullscreen) |

Source: prefer `DashboardIR` / `stats.json` + projection metadata — not hand-counted JSX.

### `/resume`

Pretty `ResumeIR` (scaffold evolves here). Later: export Markdown / HTML / PDF.

### `/portfolio`

Product-page energy: large project cards — cover, role, timeline, architecture teaser, metrics, stack, lessons. **Not** a CV bullet list. Backed by `PortfolioIR`.

### `/project/[id]`

Documentation-quality page (strongest deep surface for hiring):

1. Hero  
2. Overview  
3. Problem  
4. Architecture (+ diagram)  
5. Engineering Decisions (Why X)  
6. Timeline  
7. Tech stack  
8. Metrics  
9. **Evidence** (architecture notes, diagrams, commits, benchmarks, ADRs — *Evidence-based Engineering*)  
10. Related nodes (technology → experience → decision → company)  
11. Source documents (markdown excerpts / knowledge links)

Evidence sits **immediately under Metrics** — proof before related-node browsing.

### `/timeline`

Chronological journey. Click opens project. Prefer `TimelineIR`.

### `/skills`

Grouped skills + linked projects/experience. Prefer `SkillsIR`. Not icon soup.

### `/graph`

Signature interactive explorer — **Phase 2**. Do not block Phase 1.

**Layout (locked — not fullscreen-only canvas):**

```text
+------------------+------------------------+------------------+
| Sidebar          | Graph canvas           | Inspector        |
| (filters,        | (React Flow /          | (selected node   |
|  search,         |  Obsidian-like)        |  panel)          |
|  type toggles)   |                        |                  |
+------------------+------------------------+------------------+
```

Same family as Neo4j Browser / Obsidian / React Flow demos: **Sidebar | Graph | Inspector**.

### `/search`

Full-graph search (VS Code-like).

### `/about`

Architecture, ADRs, roadmap, compiler philosophy — for senior engineers who dig.

### `/contact`

Profile contact fields.

### Phase 3: `/interview`, `/api`, `/mcp`, `/studio`

Interview AI over ConversationIR + evidence. Frozen until Phase 1 hire-ready surfaces ship.

---

## 5. Data flow (frontend)

```text
Markdown (career-data/nodes)
        ↓
career compile / resume / portfolio / …
        ↓
Projection Registry → generated/*.ir.json (+ graph.json)
        ↓
apps/web renders projections
```

| May import | Must not import |
|---|---|
| `@career-os/resume`, future portfolio / timeline packages, ontology **types** | `compiler`, `retriever`, `embedding`, `llm`, `graph-store` |

Interview AI later: Browser → Next.js API → runtime (`conversation` + `retriever` + `llm`). Browser never answers from raw graph traversal.

---

## 6. Shipping phases

### Phase 1 — Hire-ready

```text
✓ Landing (with locked CTAs)
✓ /app Dashboard
✓ Resume
✓ Portfolio
✓ Project Detail (incl. Evidence)
✓ About
✓ Contact
```

### Phase 2 — Platform signal

```text
Timeline · Skills · Knowledge Graph (Sidebar|Graph|Inspector) · Search
```

### Phase 3 — Full platform

```text
Interview AI · Ask CareerOS · MCP · Public API · Studio
```

---

## 7. Relationship to existing docs

| Doc | Role |
|---|---|
| This file | FE product architecture + sitemap + Projection Registry + phases |
| [11-frontend-design-system.md](./11-frontend-design-system.md) | Design System, tokens, UI kit, layout rules, UI sprints |
| [12-frontend-wireframes.md](./12-frontend-wireframes.md) | **Sprint 0 B&W wireframes** (Landing A/B/C + Phase 1 pages) |
| [09-monorepo-web.md](./09-monorepo-web.md) | Monorepo + import boundaries |
| [07-portfolio-design.md](./07-portfolio-design.md) | IDE UX; no raw graph on first paint |
| [10-platform-capability-map.md](../00-vision/10-platform-capability-map.md) | Long-range platform |
| [09-roadmap.md](../00-vision/09-roadmap.md) | Weekly shipping |

---

## 8. Non-goals (now)

- Redesigning backend packages for the web  
- Building Studio / MCP / Interview UI before Phase 1  
- Treating `/` as a dump of `resume.md` only  
- Fullscreen graph with no Inspector  
- Separate `careeros-web` repo  
- Pages that privately rebuild career data outside the Projection Registry  

**Principle:** every new page is a new **projection**, not a new content CMS.
