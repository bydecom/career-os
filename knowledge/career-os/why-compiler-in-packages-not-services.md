---
date: 2026-07-13
author: Bang Thai Minh
type: engineering-decision
confidence: high
tags:
  - architecture
  - packages
  - services
  - compiler
---

# Why Compiler Logic Lives in `packages/compiler`, Not `services/`

## Context

The initial structure placed `parser`, `indexer`, and `watcher` inside the `services/` directory. This made sense intuitively — they "do work." However, a review revealed a conflation of two very different concepts: a **library** and a **service**.

## Decision

Move all compiler logic into `packages/compiler/src/`. Reserve `services/` exclusively for **long-running runtime processes** with a network interface or event loop.

```
packages/compiler/src/
  lexer/       ← tokenizes raw Markdown
  parser/      ← builds remark AST
  validator/   ← runs ontology type-checking
  builder/     ← constructs KnowledgeGraph from IR
  indexer/     ← builds BM25 index
  watcher/     ← file system watch logic (library, not a daemon)

services/
  graph-engine ← long-running graph traversal server
  retriever    ← long-running hybrid retrieval server
  embedding    ← long-running vector embedding worker
  llm          ← long-running LLM endpoint
  sync         ← orchestrator: calls packages/compiler on file events
```

## Alternatives Considered

### Option A — `services/parser`, `services/indexer`, `services/watcher`

**Pros:**
- Grouped by "things that do work"

**Cons:**
- Implies a network interface and a running process. The compiler is stateless and has neither.
- Cannot be unit tested without standing up a service.
- Cannot be imported directly by `apps/cli` or `apps/mcp` without going through a network call.

**Verdict:** ❌ Rejected

### Option B — `packages/compiler` (library)

**Pros:**
- Stateless pure functions: `compile(filePath) → CompileResult`
- 100% unit-testable without any running service
- Can be imported directly: `import { compile } from '@career-os/compiler'`
- Both `apps/cli` and `services/sync` can consume it without a network hop

**Cons:**
- Requires careful internal API design to keep the package cohesive

**Verdict:** ✅ Accepted

## Why

A **service** owns its lifecycle and exposes a network interface. A **package** is a set of pure, importable functions. The compiler takes a file path and returns a `CompileResult` — it is unambiguously a library.

This also satisfies the **Golden Tests** requirement: `tests/golden/` tests can call `packages/compiler` directly with `input.md → expected.json` without any service infrastructure.

## Evidence

- TypeScript Compiler (`tsc`) ships as a library (`typescript` npm package), not a service. Editors import it directly.
- Babel and SWC are the same: libraries first, CLI wrappers second.
- The `services/sync` orchestrator pattern (library consumer + event loop) is the standard approach in build pipelines (Webpack, Vite, esbuild all use this model).

## Decision Confidence

**High.** This is industry-standard practice for compiler tooling.

## Future Revisit

Reconsider only if:
- Compilation time exceeds ~30 seconds per run and needs to be moved to a persistent daemon with incremental compilation.
- In that case, `services/compiler-daemon` can be created as a wrapper around `packages/compiler` that adds IPC and caching — without changing the library itself.
