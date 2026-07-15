# `@career-os/web`

Next.js portfolio / resume **viewer** for CareerOS.

> Scaffold today = Resume Viewer. Target product = Knowledge Platform frontend.  
> Sitemap / pages: [10-frontend-knowledge-platform.md](../../docs/02-architecture/10-frontend-knowledge-platform.md)  
> Design System / layout lock: [11-frontend-design-system.md](../../docs/02-architecture/11-frontend-design-system.md)

## Role in the monorepo

```text
career-data/nodes/*.md
        ↓
career compile / career resume   ← CLI only (server-side)
        ↓
career-data/generated/
  graph.json
  resume.md
  resume.ir.json                 ← ResumeIR
        ↓
apps/web                         ← consumes projections only
```

## Allowed imports

| Package | OK? |
|---|---|
| `@career-os/resume` | Yes (ResumeIR types + future shared render helpers) |
| `@career-os/ontology` | Types only if needed |
| `@career-os/conversation` | Types / client later for Ask AI API |
| `@career-os/compiler` | **No** |
| `@career-os/retriever` | **No** |
| `@career-os/embedding` | **No** |
| `@career-os/llm` | **No** |
| `@career-os/graph-store` | **No** |

Ask AI later = browser → Next.js Route Handler / API → runtime services — not graph traversal in the browser.

## Dev

From repo root:

```bash
npm run compile
npm run resume
npm run web
```

Open http://localhost:3000

If styles look unstyled after installing Tailwind, clear the Next cache and restart:

```bash
# PowerShell
Remove-Item -Recurse -Force apps/web/.next
npm run web
```

## Non-goals (this scaffold)

- Full portfolio design / PortfolioIR
- Ask AI chat UI
- Calling Retriever or Gemini from the client
