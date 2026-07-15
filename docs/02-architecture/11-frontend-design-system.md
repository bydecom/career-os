# Frontend Design System & Layout Lock

**Author:** Bang Thai Minh  
**Status:** Locked · **Version:** 1.1 (aligned with FE architecture 1.1 CTAs / AppShell / Graph panes)

**Related:** [10-frontend-knowledge-platform.md](./10-frontend-knowledge-platform.md) · [09-monorepo-web.md](./09-monorepo-web.md)

---

## 0. Process (required)

Architect workflow — **not** pixel-first coding:

```text
Vision
  → Wireframe
  → Mockup
  → Review
  → Map to Design System components
  → Implement
```

Forbidden workflow:

```text
Open VS Code → random div → margin-top: 12px → recolor → …
```

**Rule:** Design System + UI kit first. Pages only compose locked components.

---

## 1. Product feel (one language)

CareerOS web should feel like a real product (Vercel / Linear / Raycast / Apple product pages) — **not** a React homework CV.

| Axis | Direction |
|---|---|
| Metaphor | IDE for career knowledge + compiler product |
| References | Apple + Linear + Vercel (restraint, not clones) |
| Mode | **Dark** (IDE-inspired) |
| Density | Generous whitespace; calm hierarchy |
| Motion | Enough to show presence; never noise |
| Anti-pattern | Gradients overload, neon cyberpunk, Material on one page / Apple on another |

**Consistency law:** Landing, Resume, Portfolio, Graph must look like **one product**. If a page needs a new pattern, extend the kit — do not invent a local style.

---

## 2. Stack (locked for `apps/web`)

| Layer | Choice |
|---|---|
| Framework | Next.js App Router (`apps/web`) |
| Styling | Tailwind CSS |
| Components base | shadcn/ui (customize tokens; do not fork visual language per page) |
| Motion | Framer Motion |
| Icons | Prefer one set (e.g. Lucide via shadcn) |

Do not add a second CSS framework or a competing component library.

---

## 3. Design tokens (locked)

```text
Theme:          Dark · IDE-inspired
Background:     #09090B
Primary:        Emerald (Tailwind emerald scale; pick one default + hover/active)
Foreground:     near-white / zinc-100–50 hierarchy
Muted:          zinc-400 / zinc-500
Border:         zinc-800 / zinc-850
Card surface:   glass (translucent + blur + thin border) — use sparingly
Spacing:        8pt grid (4 / 8 / 16 / 24 / 32 / 48 / 64 …)
Radius:         16px default (cards, panels); smaller for chips/buttons as kit defines
Container:      max-width 1440px
Typography:     Inter (UI); optional mono for code / IR / pipeline labels
```

### CSS variables (implement once in globals)

Expose tokens as CSS variables / Tailwind theme extension so pages never hardcode random hex.

Example shape (exact emerald shade may be tuned once in Sprint 0, then frozen):

```css
:root {
  --background: #09090b;
  --foreground: #fafafa;
  --muted: #a1a1aa;
  --border: #27272a;
  --primary: /* emerald */;
  --radius: 16px;
  --container: 1440px;
}
```

### Typography roles

| Role | Use |
|---|---|
| Display | Landing hero only |
| Title | Section / page H1–H2 |
| Body | Default reading |
| Caption / Label | Eyebrows, meta, pipeline steps |
| Mono | Compiler pipeline, node ids, code |

---

## 4. UI kit (Sprint 0 — generate once, then lock)

Build / generate these components **before** page sprints. After lock: pages may only compose from this kit (+ layout primitives).

### Primitives

- Button (primary / secondary / ghost)
- Card (default + glass)
- Tag / Chip / Badge
- Input / Search
- Separator
- SectionTitle
- Container / Stack / Grid (layout helpers)

### Product components

- Hero
- Footer
- Topbar
- Sidebar
- Timeline (item + track)
- ProjectCard
- TechnologyCard / SkillGroup
- KnowledgeNode (list/panel)
- GraphNode (canvas later)
- PipelineStep (Markdown → Compiler → Graph → …)
- MetricStat (dashboard counts — use outside first viewport of Landing)
- CTAGroup

### Page shells

- `MarketingShell` — `/`, `/about`, `/contact`
- `AppShell` — **`/app` (locked dashboard entry)** + Resume, Portfolio, Graph, Timeline, Skills, Search

Graph Explorer kit pieces (Sprint 5): `GraphSidebar`, `GraphCanvas`, `GraphInspector` — three-pane layout, not fullscreen-only.

**Lock ceremony:** after Sprint 0 review, treat visual changes as Design System PRs only — not drive-by page CSS.

---

## 5. Layout rules

1. **One composition per first viewport** on Landing (brand, headline, one sentence, CTA group, one dominant visual — pipeline). No hero overlays (floating badges/chips on media).
2. **Cards** only when they contain interaction or a clear project unit — not for every paragraph.
3. **One job per section** — one headline, one short support line.
4. **8pt spacing** everywhere; no one-off `13px` / `17px`.
5. **Radius 16** for primary surfaces; keep chip/button radii from the kit.
6. **Glass** as accent on cards/panels, not on every element.
7. **No gradient overload** — prefer solid dark + emerald accent + subtle borders.
8. **Motion:** 2–3 intentional motions on Landing (pipeline steps, CTA presence); reuse easing from the kit.

---

## 6. Implementation sprints (UI)

Aligns with [10-frontend-knowledge-platform.md](./10-frontend-knowledge-platform.md) Phase 1–2.

| Sprint | Scope | Exit criteria |
|---|---|---|
| **0** | **Wireframes (IA only)** | B&W layouts for Phase 1 — see [12-frontend-wireframes.md](./12-frontend-wireframes.md); pick Landing A/B/C |
| **0b** | Design System + UI kit + tokens + shells | Kit locked after mockups; no page polish yet |
| **1** | Landing mockups (section-by-section) then code | Locked IA: A+B hybrid — Hero · Pipeline · **What CareerOS Solves** · Philosophy · Architecture (deep) · **3–4 large** Project cards · quiet Tech · Footer |
| **2** | Resume Viewer polish | Same `ResumeIR`; kit styling; export hooks stubbed optional |
| **3** | Portfolio | Project cards · light filter · kit only |
| **4** | Project Detail | Docs-quality + **Evidence** under Metrics |
| **5** | Graph Explorer | Sidebar \| Graph \| Inspector |
| **6** | Timeline (+ Skills if capacity) | Chronological journey |
| *(parallel)* | `/app` Dashboard | Counts · Recent compiles · Latest Resume/Portfolio — after Sprint 0 shells |

Do **not** start Sprint 5–6 until Sprint 1–4 are hire-demo ready.

---

## 7. Anti-patterns (explicit)

| Bad | Why |
|---|---|
| Each page a different aesthetic | Looks like four authors |
| “Just make Landing pretty” without kit | Drift within a week |
| Cyberpunk graph + Apple landing | Breaks product trust |
| Hardcoded colors in page modules | Bypass tokens |
| New card style per feature | Kit lock broken |
| Stat strip / chip cluster in Landing hero | Clutter; violates hero budget |

---

## 8. Handoff checklist (before coding a page)

1. Wireframe / mockup reviewed against this doc  
2. Components needed listed from §4 (no new unnamed components)  
3. Copy / content sources: IR / graph vs curated marketing  
4. Then implement  

---

## 9. Doc map

| Doc | Owns |
|---|---|
| **This file** | Design System, tokens, kit, layout rules, UI sprints |
| [10-frontend-knowledge-platform.md](./10-frontend-knowledge-platform.md) | Sitemap, page intent, product phases |
| [09-monorepo-web.md](./09-monorepo-web.md) | Repo boundaries / allowed packages |

**Status after this document:** FE layout & Design System are **chốt**. Next engineering step is Sprint 0 (kit), then Sprint 1 (Landing) — not random CSS on the current resume scaffold.
