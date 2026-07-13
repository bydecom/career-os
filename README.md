# Career OS

> People don't have a portfolio. People have knowledge.
> A portfolio is merely one projection of that knowledge.

**Career OS** is a Personal Knowledge Compiler. You don't write resumes, portfolios, or cover letters. You author a Knowledge Base in Markdown, and the system **compiles** them from a single source of truth.

```
Markdown Knowledge
        │
        ▼
   Compiler (Lexer → AST → Semantic Analyzer → Ontology Validator)
        │
        ▼
   Knowledge Graph (IR)
        │
        ├──► Resume (PDF)
        ├──► Portfolio (React)
        ├──► AI Chatbot (RAG)
        ├──► MCP Server (Cursor / Claude)
        ├──► Cover Letter (LLM-generated, cited)
        └──► Search Index (BM25 + Vector)
```

---

## The 3 Core Philosophies (of 10)

1. **Knowledge First** — Knowledge is the source. Every output is compiled from it.
2. **Compile, Don't Copy** — You never manually write a resume. The Compiler generates it.
3. **AI is a View** — The AI does not own your knowledge. It is a rendering engine that verbalizes what the Compiler has already structured.

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

Example:                              Example:
career-data/nodes/technology/         knowledge/career-os/
  rabbitmq.md                           why-edges-are-compiler-output.md
  → id, type, aliases, tags              → Problem, Decision, Alternatives,
  → Used In: [[project-a]]                 Evidence, Confidence, Future Revisit
  → 20 lines                               → 100+ lines

                                      knowledge/distributed-systems/
                                        rabbitmq.md
                                          → What I learned about RabbitMQ
                                            while building this project
```

| | `career-data/` | `knowledge/` |
|---|---|---|
| **Scope** | Entire career (all companies, all projects) | This project only (CareerOS) |
| **Question it answers** | "Has Bang used RabbitMQ?" | "Why did Bang choose remark over markdown-it **for this project**?" |
| **Who reads it** | Compiler → Graph → Recruiter | Bang himself, AI agents, blog readers |
| **Content style** | YAML metadata + short body | First-principles reasoning + tradeoffs |
| **Compiler processes it?** | ✅ Always | ⚡ Optional |
| **AI writing guide** | `templates/node/` | [`knowledge/README.md`](knowledge/README.md) |
| **Key subfolder** | `nodes/technology/`, `nodes/project/`... | `career-os/` = engineering decisions for this project |

**Rule for AI agents:** If you are asked to add career data (a past project, skill, work experience), write to `career-data/nodes/`. If you are asked to document a decision or learning note **about building CareerOS**, write to `knowledge/` and follow the [AI Skill Harness](knowledge/README.md).

---

## Project Structure

```
career-os/
│
├── career-data/            ← "What I've done" (Compiler input)
│   ├── nodes/              ← Atomic graph nodes by type (technology, project, experience...)
│   ├── career/             ← Career timeline events
│   ├── assets/             ← Diagrams, screenshots, certificates
│   └── generated/          ← Compiler output (graph, embeddings, resume...) [git-ignored]
│
├── knowledge/              ← "What I know" (Second Brain, personal + publishable)
│   ├── distributed-systems/    RabbitMQ.md, CQRS.md, Saga.md...
│   ├── database/               Redis.md, PostgreSQL.md...
│   ├── ai/                     RAG.md, Embeddings.md...
│   ├── career-os/              Decisions about this project itself
│   └── ...18 domain categories
│
├── packages/               ← Shared libraries (no runtime)
│   ├── compiler/           ← The Knowledge Compiler (Lexer, Parser, Validator, Builder)
│   ├── ontology/           ← Core domain model (NodeType, EdgeType, KnowledgeNode<T>)
│   ├── graph/              ← Graph construction and traversal
│   ├── generator/          ← Artifact generator (Resume, Portfolio, Prompts)
│   ├── sdk/                ← Public SDK for consumers
│   ├── shared/             ← Cross-package utilities
│   └── ui/                 ← Shared React components
│
├── services/               ← Runtime services only
│   ├── graph-engine/       ← Graph traversal + PPR reasoning
│   ├── retriever/          ← Hybrid retrieval (BM25 + Graph + Vector + RRF)
│   ├── embedding/          ← Vector embedding worker
│   ├── llm/                ← LLM verbalization endpoint
│   └── sync/               ← Orchestrator (triggers compiler on file change)
│
├── apps/                   ← Consumer applications
│   ├── web/                ← Portfolio frontend (IDE-like UI)
│   ├── api/                ← REST API (Express)
│   ├── cli/                ← CLI tools (`career compile`, `career validate`)
│   └── mcp/                ← MCP Server for Cursor / Claude
│
├── docs/                   ← Project documentation
│   ├── 00-vision/          ← Vision, Roadmap, Philosophy
│   ├── 01-adr/             ← 10 Architecture Decision Records
│   ├── 02-architecture/    ← System design specs (start here ↓)
│   ├── 03-guides/          ← Developer guides
│   ├── 04-spec/            ← Implementation specifications
│   └── ...
│
├── labs/                   ← Research, prototypes, benchmarks
├── templates/              ← Node, resume, cover-letter templates
├── tests/                  ← Fixtures, integration, e2e, golden tests
├── examples/               ← Demo setups for open-source
└── scripts/                ← bootstrap.js, check-structure.js
```

---

## For AI Agents — Where to Read

If you are an AI agent (Cursor, Claude, Gemini, ChatGPT) tasked with working on this project, read the following files **in this order** before writing any code:

### 1. Understand the Vision
| Priority | File | What you'll learn |
|----------|------|-------------------|
| 🔴 Must | [`docs/00-vision/philosophy.md`](docs/00-vision/philosophy.md) | The 10 non-negotiable principles |
| 🔴 Must | [`docs/00-vision/00-project-vision.md`](docs/00-vision/00-project-vision.md) | What Career OS is and why it exists |
| 🟡 Should | [`docs/00-vision/09-roadmap.md`](docs/00-vision/09-roadmap.md) | 6-phase implementation roadmap |

### 2. Understand the Architecture
| Priority | File | What you'll learn |
|----------|------|-------------------|
| 🔴 Must | [`docs/02-architecture/00-compilation-pipeline.md`](docs/02-architecture/00-compilation-pipeline.md) | **The most important file.** Full compiler pipeline diagram. |
| 🔴 Must | [`docs/02-architecture/02-knowledge-model.md`](docs/02-architecture/02-knowledge-model.md) | Ontology: node types, edge types, reasoning spine |
| 🔴 Must | [`docs/02-architecture/04-compiler-design.md`](docs/02-architecture/04-compiler-design.md) | How the Compiler works internally |
| 🟡 Should | [`docs/02-architecture/01-system-architecture.md`](docs/02-architecture/01-system-architecture.md) | Overall system layers |
| 🟡 Should | [`docs/02-architecture/03-markdown-schema.md`](docs/02-architecture/03-markdown-schema.md) | FrontMatter schema and folder conventions |

### 3. Understand the Code
| Priority | File | What you'll learn |
|----------|------|-------------------|
| 🔴 Must | [`packages/ontology/src/taxonomy.ts`](packages/ontology/src/taxonomy.ts) | All `NodeType` and `EdgeType` enums |
| 🔴 Must | [`packages/ontology/src/types.ts`](packages/ontology/src/types.ts) | `KnowledgeNode<T>`, `KnowledgeEdge`, `CompileResult` |

### 4. Understand the Knowledge Standards
| Priority | File | What you'll learn |
|----------|------|-------------------|
| 🔴 Must | [`knowledge/README.md`](knowledge/README.md) | **AI Skill Harness.** How to write Second Brain notes. |

### 5. Understand Past Decisions
| Priority | File | What you'll learn |
|----------|------|-------------------|
| 🟡 Should | [`docs/01-adr/`](docs/01-adr/) | 10 ADRs covering Graph, Retrieval, AI, Resume |
| 🟢 Optional | [`knowledge/career-os/`](knowledge/career-os/) | 6 engineering decisions made while building this project |

---

## For AI Agents — Rules

1. **Never violate the 10 Philosophies.** Read `philosophy.md` first.
2. **Compiler logic goes in `packages/compiler/`.** Not in `services/`. See [`knowledge/career-os/why-compiler-in-packages-not-services.md`](knowledge/career-os/why-compiler-in-packages-not-services.md).
3. **Edges are compiler output.** Never create a folder or file for hand-authored edges. See [`knowledge/career-os/why-edges-are-compiler-output.md`](knowledge/career-os/why-edges-are-compiler-output.md).
4. **Domain model lives in `packages/ontology/`.** It has zero dependencies. All other packages import from it.
5. **`career-data/` is for the Compiler.** `knowledge/` is the Second Brain. They are different systems with different purposes. Read [`knowledge/README.md`](knowledge/README.md) for the full distinction.
6. **When writing knowledge notes**, follow the AI Skill Harness in [`knowledge/README.md`](knowledge/README.md).
7. **Run `npm run check-structure`** to verify the directory tree after structural changes.
8. **Run `npm run bootstrap`** to regenerate missing directories.

---

## Quick Start

```bash
# Verify project structure
npm run check-structure

# Regenerate missing directories
npm run bootstrap
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript |
| Markdown Parsing | unified / remark |
| Schema Validation | Zod |
| Graph Storage | SQLite |
| Vector Storage | Qdrant |
| Search | BM25 (custom) |
| LLM | Vercel AI SDK |
| Frontend | React (IDE-like UI) |
| API | Express |
| AI Integration | MCP (Model Context Protocol) |

---

## License

MIT
