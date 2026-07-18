# Career OS

> People don't have a portfolio. People have knowledge.
> A portfolio is merely one projection of that knowledge.

**Career OS** is a Personal Knowledge Compiler. You don't write resumes, portfolios, or cover letters by hand. You author a Knowledge Base in Markdown, and the system **compiles** projections from a single source of truth.

```
Markdown nodes (career-data/)
        │
        ▼
   Compiler (Lexer → Parser → Ontology Validator → Graph Builder)
        │
        ▼
   Knowledge Graph (IR)  →  graph.json · graph.db
        │
        ├──► ResumeIR      →  /resume  (+ PDF print)
        ├──► PortfolioIR   →  /portfolio · /project/[id]
        ├──► ConversationIR→  /interview  (retrieve → IR → Gemini)
        ├──► Search Index  →  BM25 + optional Vector (Qdrant)
        └──► (planned) MCP Server · Cover Letter
```

---

## The 3 Core Philosophies (of 10)

1. **Knowledge First** — Knowledge is the source. Every output is compiled from it.
2. **Compile, Don't Copy** — You never manually write a resume. The Compiler generates it.
3. **AI is a View** — The AI does not own your knowledge. It verbalizes what the Compiler has already structured.

Full list → [`docs/00-vision/philosophy.md`](docs/00-vision/philosophy.md)

---

## ⚠️ Two Knowledge Systems — Do Not Confuse

This project has **two separate knowledge stores**. They look similar but serve completely different purposes:

```
career-data/                          knowledge/
"What I've done in my career"         "What I learned while building THIS project"
─────────────────────────────         ──────────────────────────────────────────
Source: Master CV, past projects      Source: Building CareerOS itself
For the Compiler → Recruiter          For me (the author) → optionally publishable
All career history, all companies     Only about this project's decisions & learnings
Short, metadata-heavy                 Long-form, reasoning-heavy
Schema-validated (must pass)          Freeform (encouraged to follow guide)
────────────────────────────────────────────────────────────────────────────────
```

| | `career-data/` | `knowledge/` |
|---|---|---|
| **Scope** | Entire career (all companies, all projects) | This project only (CareerOS) |
| **Question it answers** | "Has Bang used RabbitMQ?" | "Why did Bang choose remark over markdown-it **for this project**?" |
| **Who reads it** | Compiler → Graph → Recruiter | Bang himself, AI agents, blog readers |
| **Content style** | YAML metadata + short body | First-principles reasoning + tradeoffs |
| **Compiler processes it?** | ✅ Always | ⚡ Optional |
| **AI writing guide** | `templates/node/` | [`knowledge/README.md`](knowledge/README.md) |

**Rule for AI agents:** Career facts (projects, skills, experience) → `career-data/nodes/`. Decisions/learnings about building CareerOS → `knowledge/` (see [AI Skill Harness](knowledge/README.md)).

---

## Project Structure

```
career-os/
│
├── career-data/              ← "What I've done" (Compiler input)
│   ├── nodes/                ← Atomic graph nodes by type
│   ├── career/               ← Career timeline events
│   ├── assets/               ← Diagrams, screenshots, certificates
│   └── generated/            ← graph.json, graph.db, resume.ir.json… [git-ignored]
│
├── knowledge/                ← "What I know" (Second Brain)
│   ├── career-os/            ← Engineering decisions for this repo
│   └── …domain folders       ← distributed-systems, ai, database, …
│
├── packages/                 ← Shared libraries (compile-time / no HTTP server)
│   ├── ontology/             ← NodeType, EdgeType, KnowledgeNode<T>
│   ├── compiler/             ← Lexer, Parser, Validator, Graph Builder
│   ├── graph/                ← Traversal + PPR
│   ├── graph-store/          ← SQLite persistence
│   ├── conversation/         ← ConversationIR builder + prompt renderer
│   ├── resume/               ← ResumeIR projection + markdown render
│   ├── generator/            ← Artifact generators (evolving)
│   ├── sdk/ · shared/ · ui/  ← Shared surfaces
│   └── harness/ · skills/    ← Eval / skill scaffolding
│
├── services/                 ← Runtime libraries used by CLI + web API
│   ├── retriever/            ← Hybrid retrieval (metadata + BM25 + graph + vector + RRF)
│   ├── embedding/            ← Gemini embeddings (text-embedding-004)
│   ├── llm/                  ← Gemini verbalize (REST, no Vercel AI SDK)
│   ├── graph-engine/         ← Graph reasoning helpers
│   └── sync/                 ← Orchestrator (file-watch compile — evolving)
│
├── apps/
│   ├── web/                  ← Next.js 15 — landing, portfolio, resume, interview
│   ├── cli/                  ← `career compile` · `resume` · `ask` · `query`
│   ├── cv/                   ← Static CV export assets
│   ├── api/                  ← Placeholder (ask currently lives in apps/web /api)
│   └── mcp/                  ← Placeholder (planned MCP server)
│
├── docs/                     ← Vision, ADRs, architecture, guides, specs
├── journal/                  ← Engineering journal
├── labs/ · examples/ · templates/ · tests/ · scripts/
└── docker-compose.yml        ← Local Qdrant
```

---

## For AI Agents — Where to Read

Read **in this order** before writing code:

### 1. Vision
| Priority | File | What you'll learn |
|----------|------|-------------------|
| 🔴 Must | [`docs/00-vision/philosophy.md`](docs/00-vision/philosophy.md) | The 10 non-negotiable principles |
| 🔴 Must | [`docs/00-vision/00-project-vision.md`](docs/00-vision/00-project-vision.md) | What Career OS is and why it exists |
| 🟡 Should | [`docs/00-vision/09-roadmap.md`](docs/00-vision/09-roadmap.md) | Implementation roadmap |

### 2. Architecture
| Priority | File | What you'll learn |
|----------|------|-------------------|
| 🔴 Must | [`docs/02-architecture/00-compilation-pipeline.md`](docs/02-architecture/00-compilation-pipeline.md) | Full compiler pipeline |
| 🔴 Must | [`docs/02-architecture/02-knowledge-model.md`](docs/02-architecture/02-knowledge-model.md) | Ontology + reasoning spine |
| 🔴 Must | [`docs/02-architecture/04-compiler-design.md`](docs/02-architecture/04-compiler-design.md) | Compiler internals |
| 🟡 Should | [`docs/02-architecture/01-system-architecture.md`](docs/02-architecture/01-system-architecture.md) | System layers |
| 🟡 Should | [`docs/02-architecture/03-markdown-schema.md`](docs/02-architecture/03-markdown-schema.md) | FrontMatter + folder conventions |

### 3. Code
| Priority | File | What you'll learn |
|----------|------|-------------------|
| 🔴 Must | [`packages/ontology/src/taxonomy.ts`](packages/ontology/src/taxonomy.ts) | `NodeType` / `EdgeType` |
| 🔴 Must | [`packages/ontology/src/types.ts`](packages/ontology/src/types.ts) | `KnowledgeNode<T>`, edges, compile types |

### 4. Knowledge standards
| Priority | File | What you'll learn |
|----------|------|-------------------|
| 🔴 Must | [`knowledge/README.md`](knowledge/README.md) | How to write Second Brain notes |

### 5. Past decisions
| Priority | File | What you'll learn |
|----------|------|-------------------|
| 🟡 Should | [`docs/01-adr/`](docs/01-adr/) | ADRs (Graph, Retrieval, AI, Resume) |
| 🟢 Optional | [`knowledge/career-os/`](knowledge/career-os/) | Engineering decisions while building this |

---

## For AI Agents — Rules

1. **Never violate the 10 Philosophies.** Read `philosophy.md` first.
2. **Compiler logic goes in `packages/compiler/`.** Not in `services/`. See [`knowledge/career-os/why-compiler-in-packages-not-services.md`](knowledge/career-os/why-compiler-in-packages-not-services.md).
3. **Edges are compiler output.** Never hand-author an edges folder. See [`knowledge/career-os/why-edges-are-compiler-output.md`](knowledge/career-os/why-edges-are-compiler-output.md).
4. **Domain model lives in `packages/ontology/`.** Zero dependencies; everything imports from it.
5. **`career-data/` ≠ `knowledge/`.** Different systems. See [`knowledge/README.md`](knowledge/README.md).
6. **When writing knowledge notes**, follow the AI Skill Harness in [`knowledge/README.md`](knowledge/README.md).
7. **Run `npm run check-structure`** after structural changes.
8. **Run `npm run bootstrap`** to regenerate missing directories.

---

## Quick Start

```bash
# From repo root
npm install
npm run build            # ontology → graph → compiler → conversation → resume → services → cli
npm run check-structure  # optional sanity check
```

### Compile knowledge → graph + ResumeIR

```bash
npm run compile          # career-data/nodes → graph.json + graph.db
npm run resume           # → resume.ir.json + resume.md
```

### Run the web app

```bash
npm run web              # http://localhost:3000
```

| Route | What it shows |
|-------|----------------|
| `/` | Landing: Hero → Pipeline → Why → Philosophy → Architecture → Featured → Tech |
| `/about` | Pipeline + Architecture deep-dive |
| `/portfolio` | Featured capabilities + full project index from ResumeIR |
| `/project/[id]` | Project detail (problem → architecture → evidence) |
| `/resume` | Resume projection (+ print PDF; also `/resume/ir`, `/resume/markdown`) |
| `/interview` | Interview AI — Chat + Execution Trace (glass-box runtime) |
| `/contact` | Contact |

---

## Interview AI

Pipeline: **retrieve → ConversationIR → prompt → Gemini verbalize**, streamed to the UI as an Execution Trace.

### Required

```bash
cp .env.example .env
# Set GEMINI_API_KEY=
```

### Recommended (hybrid retrieval — BM25 + vector)

Docker Desktop must be running:

```bash
npm run qdrant:up                 # docker compose up -d qdrant  → :6333
npm run compile
npm run index:embeddings          # embed nodes → Qdrant collection `career-nodes`
npm run web
# → http://localhost:3000/interview
```

If Qdrant is down or unreachable, `/api/ask` **falls back to lexical retrieval** (BM25 + graph) so Interview still answers. Start Qdrant when you want hybrid / vector quality.

CLI (same pipeline as the web API):

```bash
npm run ask -- "Tell me about GraphRAG" --vector
```

---

## Useful scripts

| Script | Purpose |
|--------|---------|
| `npm run build` | Build packages + services + CLI |
| `npm run compile` | Compile Markdown nodes → graph |
| `npm run resume` | Project master ResumeIR |
| `npm run web` | Next.js dev server (`apps/web`) |
| `npm run web:build` | Production build for web |
| `npm run qdrant:up` / `qdrant:down` | Local Qdrant via Docker Compose |
| `npm run index:embeddings` | Embed graph nodes → Qdrant `career-nodes` |
| `npm run ask -- "…" --vector` | CLI Interview path |
| `npm run query` | Query the compiled graph |
| `npm run validate` | Validate nodes without full compile |
| `npm test` | Workspace unit tests |

Hire-demo deploy notes → [`journal/engineering/2026/07/hire-demo-deploy-and-review.md`](journal/engineering/2026/07/hire-demo-deploy-and-review.md)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript (npm workspaces) |
| Markdown | unified / remark |
| Schema | Zod |
| Graph storage | SQLite (`graph.db`) + `graph.json` |
| Vector store | Qdrant (optional, Docker) |
| Retrieval | Metadata + BM25 + Graph + Vector + RRF |
| Embeddings | Gemini `text-embedding-004` |
| LLM | Gemini REST (`gemini-2.5-flash` by default) |
| Web | Next.js 15 · React 19 · Tailwind · Framer Motion |
| Ask API | Next.js Route Handler (`apps/web/src/app/api/ask`) |
| CLI | `apps/cli` (`career compile` / `resume` / `ask`) |

---

## License

MIT
