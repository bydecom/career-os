# Monorepo layout — Web viewer

**Status:** Accepted (scaffold)  
**Date:** 2026-07-14  

CareerOS stays a single monorepo. The web app is a **projection viewer**, not a second source of truth.

```text
careeros/
├── apps/
│   ├── cli/          # compile · ask · resume · (portfolio later)
│   └── web/          # Next.js — consumes ResumeIR / PortfolioIR / graph.json
├── packages/
│   ├── ontology/
│   ├── compiler/     # CLI / server only — web must NOT import
│   ├── conversation/
│   ├── resume/
│   └── portfolio/    # future
├── services/
│   ├── embedding/    # server only
│   ├── retriever/    # server only
│   └── llm/          # server only
└── career-data/
    ├── nodes/
    └── generated/    # graph.json · resume.md · resume.ir.json
```

## Boundary

| Layer | Owns |
|---|---|
| CLI + packages/compiler + services/* | Build Knowledge IR, retrieve, verbalize |
| `career resume` / future `career portfolio` | Emit `ResumeIR` / `PortfolioIR` JSON |
| `apps/web` | Render projections; later call Ask API |

Do **not** split into `careeros-web` until types and deploy force it. Sharing `ResumeIR` in one workspace is the point.

---

## Product architecture (sitemap, phases, mindset)

The scaffold today is a Resume Viewer. The target product is a **Knowledge Platform frontend**.

- **[10-frontend-knowledge-platform.md](./10-frontend-knowledge-platform.md)** — sitemap, page intent, product phases  
- **[11-frontend-design-system.md](./11-frontend-design-system.md)** — Design System, tokens, UI kit, layout rules (**locked before UI coding**)
