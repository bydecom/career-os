---
date: 2026-07-13
author: Bang Thai Minh
type: engineering-decision
confidence: high
tags:
  - architecture
  - packages
  - naming
  - compiler
---

# Why `packages/prompt` Was Replaced by `packages/generator`

## Context

The initial package list included `packages/prompt` as a utility for building LLM prompts from the Knowledge Graph.

## Decision

Rename `packages/prompt` to `packages/generator`. The generator is responsible for producing **all build artifacts** from the Knowledge IR — not just LLM prompts.

## Alternatives Considered

### Option A — `packages/prompt`

**Pros:**
- Explicit about LLM involvement

**Cons:**
- Implies the only output is an LLM prompt. This is false.
- Resume PDF generation has nothing to do with prompts.
- Search index generation has nothing to do with prompts.
- Forces future artifact types (Cover Letter, MCP tool schema) into either an awkward fit inside `packages/prompt` or a new package, fragmenting the domain.

**Verdict:** ❌ Rejected

### Option B — `packages/generator`

**Pros:**
- Consistent with compiler literature: the final stage is always a **Code Generator**.
- Covers all artifact types: Resume, Portfolio, LLM prompts, MCP schemas, Search Indexes.
- Adding a new artifact type (`interview-prep`) = adding a new sub-module, no new packages.

**Cons:**
- Slightly more abstract. Developer must look inside to understand what it generates.

**Verdict:** ✅ Accepted

## Why

In compiler architecture, the pipeline is:
```
Source → AST → IR → Optimizer → Code Generator → Binary Output
```

In Career OS:
```
Markdown → AST → Knowledge IR → Optimizer → Generator → Resume / Portfolio / Chatbot / MCP
```

The `Generator` is the last stage. Naming it `generator` makes the compiler analogy explicit and consistent. Naming it `prompt` breaks the analogy and artificially limits its scope.

## Evidence

- LLVM's final stage is called the **Backend Code Generator**.
- TypeScript's `tsc` emitter stage (which writes `.js` files) is internally called the **Emitter** — a synonym for Generator.
- The philosophy document (Philosophy #3: **Compile, Don't Copy**) establishes that Resume, Portfolio, and Cover Letter are **build artifacts**. A package called `generator` is the natural home for the code that builds them.

## Decision Confidence

**High.** Consistent with compiler theory and the project's core metaphor.

## Future Revisit

No current trigger. If the Generator package becomes too large (e.g., PDF generation requires a separate headless browser process), split out `packages/pdf-renderer` as a sub-dependency of `packages/generator`.
