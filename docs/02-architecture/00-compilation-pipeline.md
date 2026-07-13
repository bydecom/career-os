# Compilation Pipeline

**Status:** Accepted  
**Author:** Bang Thai Minh  
**Version:** 1.0  

---

This is the most important architecture document in Career OS.

Every feature, every service, every API endpoint is a **projection** of this pipeline.

---

## The Pipeline

```text
┌─────────────────────────────────────────────────────────────────┐
│                      CAREER OS COMPILER                         │
│                                                                 │
│  Human Authors Markdown                                         │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐                                               │
│  │    LEXER    │  Tokenize raw .md file                        │
│  │             │  Split FrontMatter from Body                  │
│  └──────┬──────┘                                               │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐                                               │
│  │   PARSER    │  Build Markdown AST (via remark)              │
│  │             │  Extract [[Wiki-links]] → candidate edges     │
│  │             │  Extract Sections (## h2, ### h3)             │
│  └──────┬──────┘                                               │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────┐                                           │
│  │ SEMANTIC        │  Classify NodeType from FrontMatter       │
│  │ ANALYZER        │  Resolve aliases → canonical IDs          │
│  │                 │  Enrich edges with EdgeType               │
│  └──────┬──────────┘                                           │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────┐                                           │
│  │ KNOWLEDGE IR    │  KnowledgeNode<TMetadata>                 │
│  │ (Intermediate   │  KnowledgeEdge                            │
│  │  Representation)│  SourceLocation                           │
│  └──────┬──────────┘                                           │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────┐                                           │
│  │ ONTOLOGY        │  Check edge legality (e.g.                │
│  │ VALIDATOR       │    Technology cannot SOLVES Problem,      │
│  │                 │    only Decision can)                     │
│  │                 │  Detect orphan nodes                      │
│  │                 │  Detect duplicate aliases                 │
│  │                 │  Emit CompilerDiagnostics                 │
│  └──────┬──────────┘                                           │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────┐                                           │
│  │ OPTIMIZER       │  Merge duplicate tags                     │
│  │                 │  Infer implicit edges                     │
│  │                 │  Dead node detection                      │
│  │                 │  Normalize edge directions                │
│  └──────┬──────────┘                                           │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────┐                                           │
│  │ GRAPH BUILDER   │  Write nodes → SQLite                     │
│  │                 │  Write edges → SQLite                     │
│  │                 │  Build BM25 index                         │
│  │                 │  Queue embeddings → Qdrant                │
│  └──────┬──────────┘                                           │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   KNOWLEDGE GRAPH                       │   │
│  │              (The compiled binary output)               │   │
│  └──────┬──────────────────────────────────────────────────┘   │
│         │                                                       │
└─────────┼───────────────────────────────────────────────────────┘
          │
          ▼
  ┌───────────────────────────────────────────────────────────────┐
  │                        GENERATOR                              │
  │                                                               │
  │  Knowledge IR + Graph → Artifacts                            │
  │                                                               │
  │         ├──────────► Resume (PDF / JSON)                     │
  │         ├──────────► Portfolio (React component data)        │
  │         ├──────────► Chatbot Context (Evidence Package)      │
  │         ├──────────► MCP Tools (Cursor / Claude)             │
  │         ├──────────► Cover Letter (LLM-generated, cited)     │
  │         └──────────► Search Index (BM25 + Vector)            │
  └───────────────────────────────────────────────────────────────┘
```

---

## The Compiler Analogy

This pipeline is not a coincidence. It is deliberately modeled after how production compilers work:

| Compiler Stage        | Career OS Equivalent              |
|-----------------------|-----------------------------------|
| Source Code           | Markdown files (`career-data/`)   |
| Lexer                 | FrontMatter + Body tokenizer      |
| Parser                | remark AST builder                |
| Semantic Analyzer     | NodeType classifier + alias resolver |
| IR (Intermediate Repr)| `KnowledgeNode<TMetadata>`        |
| Type Checker          | Ontology Validator                |
| Optimizer             | Tag merger, dead-node detector    |
| Code Generator        | Resume / Portfolio / Prompt builder |
| Binary Output         | Knowledge Graph (SQLite + Qdrant) |

This is why Markdown is the **source code**, and Resume/Portfolio/Chatbot are **build artifacts**.

You do not write a resume. You **compile** one.

---

## Design Rules

1. **The compiler is stateless.** Each run reads from `career-data/` and writes to `career-data/generated/`. No side effects.
2. **The Ontology Validator is a hard gate.** If a node fails validation, the entire compile fails with a diagnostic error — just like a type error in TypeScript.
3. **The Generator is separate from the Compiler.** The compiler builds the Knowledge Graph. The Generator reads from the Graph to produce artifacts. They are different packages.
4. **Edges are compiler output, not human input.** You never write edges by hand. The parser extracts `[[Wiki-links]]` and the Semantic Analyzer classifies their `EdgeType`.
5. **Every claim must be traceable.** Every Generator output must cite its source node via `SourceLocation`. No hallucination.
