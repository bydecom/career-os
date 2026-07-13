# Overall System Architecture

## The Compiler Architecture

CareerOS is architected like a programming language compiler. Rather than a traditional web application pipeline, the system treats knowledge as source code, processes it into an intermediate representation, and compiles it into various output formats.

```text
                    Real-world Experience
                             │
                             ▼
                  Knowledge Capture (Markdown)
                             │
                             ▼
                    Knowledge Compiler
       ┌───────────────────────────────────────┐
       │ FrontMatter Validation                │
       │ Markdown AST Parsing                  │
       │ Wiki-link Resolution                  │
       │ Schema Validation                     │
       │ Entity Extraction                     │
       │ Edge Construction                     │
       └───────────────────────────────────────┘
                             │
                             ▼
          Knowledge IR (Graph + Metadata + Embeddings)
                             │
                             ▼
                Hybrid Retrieval Engine
       ┌────────────┬────────────┬────────────┐
       │ Lexical    │ Structural │ Semantic   │
       │ (BM25)     │ (Graph)    │ (Vector)   │
       └────────────┴────────────┴────────────┘
                             │
                             ▼
               Context Builder & Citation Engine
                             │
                             ▼
                    Generation / Projection Layer
       ┌────────┬──────────┬──────────┬────────────┐
       │ Resume │ Portfolio│ Chatbot  │ MCP / API  │
       └────────┴──────────┴──────────┴────────────┘
```

## Architecture Layers

### 1. The Source Code (`career-data/`)
Human-readable Markdown files acting as the single source of truth. Engineers write about their experiences, decisions, and projects using a combination of structured YAML FrontMatter and unstructured prose with `[[Wiki-links]]`.

### 2. Knowledge Compiler (`services/parser/`)
The compiler front-end. It watches for changes in the Source Code, parses the Abstract Syntax Tree (AST), validates metadata against strict schemas (Zod), resolves entity references, and extracts graph edges.

### 3. Knowledge IR (Intermediate Representation)
Once compiled, the data is stored in the Knowledge IR. This is the "machine code" of CareerOS. It consists of:
- **Graph Database**: For traversing structural relationships (Nodes & Edges).
- **Relational / Metadata Store**: For explicit entity matching.
- **Vector Database**: For semantic embeddings of the prose.

### 4. Hybrid Retrieval Engine (`services/retriever/`)
The optimizer layer. When a query is executed, it orchestrates BM25, Graph PageRank, and Vector similarity search to retrieve the most contextually relevant subset of the Knowledge IR, ranking them using Reciprocal Rank Fusion (RRF).

### 5. Generation / Projection Layer (`apps/web/`, `apps/api/`)
The final binary outputs. The LLM acts as the Generation Engine, taking the retrieved context and formatting it for the target View. Everything—from a static PDF Resume to an interactive Portfolio website to a conversational Chatbot—is merely a different projection of the underlying Knowledge IR.
