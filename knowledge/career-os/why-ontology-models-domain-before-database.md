---
date: 2026-07-13
author: Bang Thai Minh
type: engineering-decision
confidence: high
tags:
  - compiler
  - ontology
  - typescript
  - domain-model
---

# Why `packages/ontology` Models the Domain Before the Database

## Problem

Most knowledge base projects start with a database schema (Postgres tables, Neo4j node labels) or a validation schema (Zod, Yup) and then write application code to match that schema. This produces systems where the database is the source of truth for the domain model.

The risk: if the domain evolves (e.g., a new node type, a richer edge metadata), changing the database schema is painful and migrations are required.

## Solution / Concept

`packages/ontology` is a pure TypeScript domain model. It has zero runtime dependencies (no database, no Zod, no ORM). It defines what a `KnowledgeNode` **is** — not how it is stored or validated. Zod schemas and database schemas are derived from this, not the other way around.

```
packages/ontology    ← defines the domain (pure TS interfaces + enums)
        ↓
packages/schemas     ← validates instances against the domain (Zod)
        ↓
services/parser      ← uses schemas to validate compiled nodes
        ↓
SQLite / Qdrant      ← stores valid nodes
```

## Why (First Principles)

A **domain model** answers: *"What is this thing?"*  
A **database schema** answers: *"How is this thing stored?"*  
A **validation schema** answers: *"Is this instance correct?"*

These are three different concerns. Conflating them produces fragile code where a database migration breaks application logic, or a Zod schema change breaks what the Compiler understands as a `KnowledgeNode`.

By placing the domain model in its own package with no dependencies, it becomes the stable foundation that all other layers depend on — never the other way around.

## Key Design Decisions Made in This Package

### `name` instead of `title`

`title` implies a document. `RabbitMQ`, `FPT Software`, `GraphRAG-Code` are not document titles — they are the **names** of entities. Renamed to `name`.

### `KnowledgeNode<TMetadata>` — Generic Metadata

Instead of `metadata: Record<string, any>`, the node is generic:

```ts
interface KnowledgeNode<TMetadata extends BaseMetadata = BaseMetadata>
```

This means `KnowledgeNode<ProjectMetadata>` is fully type-safe at compile time. Adding a field to `ProjectMetadata` is caught by TypeScript across the entire codebase immediately.

### `body: ParsedMarkdown` instead of `content: string`

A raw string forces every consumer to re-parse Markdown. `ParsedMarkdown` carries the remark AST, extracted sections (with hierarchy), and raw text — parsed once, consumed many times.

### `Section` with hierarchy instead of `Record<string, string>`

`Record<string, string>` loses the `##` vs `###` distinction. A proper `Section` tree preserves heading level and nesting, which the Semantic Analyzer needs to correctly classify content under each heading.

### `SourceLocation` on every Node and Edge

```ts
interface SourceLocation {
  filePath: string;
  lineStart: number;
  lineEnd: number;
}
```

Without this, a `CompilerDiagnostic` error message can only say "something is wrong somewhere." With `SourceLocation`, the CLI can say `Error in fpt-software.md:45 — unknown edge target`. This is the difference between a toy compiler and a production compiler.

### `KnowledgeEdge` has an `id`

Edges need `id` for graph UI operations (delete, annotate, inspect), for debugging, and for stable serialization to `career-data/generated/graph/`. A nameless edge is unaddressable.

### `EdgeMetadata` with `source` and `confidence`

```ts
interface EdgeMetadata {
  confidence: number;      // 0.0 to 1.0
  source: 'wiki-link' | 'frontmatter' | 'inferred';
  createdBy: string;       // which compiler pass?
  reason?: string;
}
```

This enables the Retrieval Engine to weight edges by confidence during graph traversal. A `wiki-link` edge is more reliable than an `inferred` edge. The Semantic Analyzer can set this at compile time.

### `CompileResult` instead of `KnowledgeGraph`

The Compiler does not just return a graph. It returns:

```ts
interface CompileResult {
  graph: KnowledgeGraph;
  diagnostics: CompilerDiagnostic[];  // warnings, errors
  statistics: { totalNodes, totalEdges, parseTimeMs };
}
```

This is what every serious compiler returns. Diagnostics are first-class output, not console logs.

### `schemaVersion` on BaseMetadata

```yaml
schemaVersion: 1
```

Future versions of the Compiler can read this field and apply migration logic for older nodes. Without it, a v2 Compiler reading v1 nodes has no way to know the format has changed.

## Tradeoffs

| Decision | Cost | Benefit |
|----------|------|---------|
| Generic `KnowledgeNode<TMetadata>` | More complex TypeScript | Full type safety across the codebase |
| `ParsedMarkdown` vs `string` | Larger in-memory IR | Single parse pass; all consumers get the AST |
| `SourceLocation` everywhere | More fields per node | Precise error reporting; hot-reload support |
| Pure TS (no Zod in ontology) | Need separate `packages/schemas` | Domain model has zero dependencies; stable foundation |

## Failure Modes

- If `schemaVersion` is not enforced by the Compiler, v1 and v2 nodes will silently coexist and produce inconsistent graph output.
- If `SourceLocation` is not populated by the Lexer, diagnostics will be useless in the CLI.
- If `TMetadata` is not constrained with `extends BaseMetadata`, consumer code can pass arbitrary objects and bypass the type system.

## Real-World Usage

- `packages/ontology` is the **only** package with zero dependencies (except TypeScript itself).
- All other packages (`packages/compiler`, `packages/generator`, `packages/schemas`) import from `@career-os/ontology`.
- `packages/ontology/src/taxonomy.ts` — `NodeType` and `EdgeType` enums.
- `packages/ontology/src/types.ts` — `KnowledgeNode<T>`, `KnowledgeEdge`, `CompileResult`.

## References

- `docs/02-architecture/00-compilation-pipeline.md` — where the ontology fits in the full pipeline
- `docs/01-adr/0003-knowledge-as-atomic-nodes.md` — the strategic decision that nodes are atomic
- `docs/01-adr/0002-graph-as-canonical-knowledge-model.md` — why a graph, not a table
- [[compiler-in-packages-not-services]] — the broader packages vs services distinction

## Decision Confidence

**High.** The generic metadata pattern and `CompileResult` structure are both well-established patterns in production compiler design (TypeScript Compiler API, ESLint's `Linter` class, Babel's `transform` return type).

## Future Revisit

Reconsider the generic `TMetadata` approach if:
- The number of `NodeType` variants exceeds ~20, at which point a discriminated union (`type: 'project'` with a `ProjectNode` interface) may be cleaner than a generic.
- If the remark AST type (`any` currently in `ParsedMarkdown.ast`) needs to be typed strictly, add `unified` as a peer dependency and use `Root` from `mdast`.

## Used In

- `packages/compiler` — imports `KnowledgeNode`, `KnowledgeEdge`, `CompileResult` to build the pipeline
- `packages/generator` — imports `KnowledgeGraph` to generate artifacts
- `packages/schemas` — imports `NodeType`, `BaseMetadata` to build Zod validators
- `services/graph-engine` — imports `KnowledgeEdge` for traversal
