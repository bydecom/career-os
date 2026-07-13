# Knowledge Compiler Design

**Author:** Bang Thai Minh  
**Status:** Accepted  
**Version:** 4.0  

---

## 1. Why "Compiler" instead of "Parser"?

In CareerOS, we completely discard the term "Parser". 
A simple parser reads Markdown and dumps it into a database. CareerOS performs a deeply semantic transformation. 

We map the compilation of human knowledge exactly to how a programming language is compiled:

| Compiler Term | CareerOS Architecture |
| --- | --- |
| **Source Code** | Markdown Knowledge Files |
| **Lexer** | Markdown Tokenizer (remark-parse) |
| **Parser** | Markdown AST Builder |
| **Semantic Analyzer** | Sections, Metrics, and Link Extractor |
| **IR (Intermediate Rep.)** | `KnowledgeObject` JSON |
| **Optimizer** | Ontology & Schema Validator |
| **Code Generation** | Graph / Embeddings / BM25 Index |

---

## 2. The Compiler Pipeline

The Compiler is completely **stateless and decoupled** from the database layer. It does not know what SQLite, Neo4j, or Qdrant are. It compiles Markdown into a strict Intermediate Representation (IR), validates it, and emits a `KnowledgeCompiled` event for downstream workers to persist.

```text
                Markdown File
                      │
                      ▼
            FrontMatter Parser (YAML)
                      │
                      ▼
             Markdown AST Parser
                      │
                      ▼
            Semantic Analyzer
     ┌────────────────────────────────┐
     │ Sections                       │
     │ Wiki-links                     │
     │ Code Blocks & Snippets         │
     │ Metrics (Before/After/Unit)    │
     │ Diagrams (Mermaid)             │
     │ References & Citations         │
     └────────────────────────────────┘
                      │
                      ▼
              Knowledge Object (IR)
                      │
          ┌───────────┴────────────┐
          ▼                        ▼
  Ontology Validator       Schema Validator
          │                        │
          └───────────┬────────────┘
                      ▼
          KnowledgeCompiled Event
                      │
     ┌────────────────┼────────────────┐
     ▼                ▼                ▼
 Graph Builder   Search Indexer   Embedding Worker
     │                │                │
     └────────────────┴────────────────┘
                      ▼
             Knowledge Repository
```

---

## 3. Semantic Analysis (Beyond Regex)

Regex is insufficient for parsing relationships. We rely entirely on the Markdown AST.

### Link Extraction and Directionality
When a Wiki-link `[[RabbitMQ]]` is detected, the Semantic Analyzer analyzes its *context* to determine the Edge Type.
- If under `# Chosen Solution`: ➔ `USES`
- If under `# Rejected Alternatives`: ➔ `REJECTED`
- If under `# Problem`: ➔ `SOLVES` (if the node is a Decision)

### Metrics Extraction
Instead of letting the LLM read raw text like `"Reduced latency from 2s to 10ms"`, the Semantic Analyzer extracts structured metrics:
```json
{
  "metrics": [
    {
      "name": "latency",
      "before": 2000,
      "after": 10,
      "unit": "ms"
    }
  ]
}
```

### Code & Diagram Extraction
Blocks like ` ```mermaid ` or ` ```ts ` are extracted into the IR so the Frontend Portfolio can natively render interactive Architecture diagrams or Code snippets without relying on markdown-to-html runtime parsing.

---

## 4. The Knowledge Object (IR)

The output of the Semantic Analyzer is the Intermediate Representation:

```typescript
interface KnowledgeObject {
  metadata: {
    id: string;
    type: NodeType;
    aliases: string[];
    tags: string[];
    version: string;
  };
  sections: Record<string, string>; // e.g. { "architecture": "...", "metrics": "..." }
  entities: EntityReference[];
  links: EdgeReference[];
  metrics: MetricExtract[];
  diagrams: DiagramExtract[];
  codeblocks: CodeSnippet[];
  references: string[];
}
```

---

## 5. Strict Validation Layer

Before the `KnowledgeCompiled` event is emitted, the IR must pass two strict validation layers.

### Schema Validation (Zod)
Ensures required fields exist based on node type (e.g., a Project must have a `role` and `company`).

### Ontology Validation
This ensures logical correctness across the entire Graph. It checks for:
- **Orphan Nodes**: Is this node isolated?
- **Reference Integrity**: Do all `[[Wiki-links]]` resolve to existing `id`s or `aliases`?
- **Alias Conflicts**: Do two nodes share the same alias?
- **Ontology Rules**: Does this edge violate physics? (e.g., Rejecting `Technology -> SOLVES -> Problem`).

---

## 6. Event-Driven Persistence

The Compiler ends by placing the `KnowledgeObject` onto an Event Bus.

Independent workers listen to the event:
- **Graph Builder**: Upserts nodes and edges into SQLite/Neo4j.
- **Search Indexer**: Extracts plain text and updates BM25 terms.
- **Embedding Worker**: Chunks the `sections` and calls OpenAI/Cohere to upsert vectors into Qdrant.
