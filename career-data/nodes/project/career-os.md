---
id: career-os
type: project
name: "CareerOS"
schemaVersion: "1"
aliases:
  - career-compiler
  - career-knowledge-base
tags:
  - personal-project
  - knowledge-compiler
  - typescript
status: active
role: "Full-stack Engineer & Architect"
created: "2026-07-01"
updated: "2026-07-13"
---

## Overview

CareerOS is a Personal Knowledge Compiler. Markdown files are the source code; the compiler transforms them into a Knowledge Graph, and the graph powers multiple outputs: Resume, Portfolio, AI Chatbot, and MCP Server.

## Demo

![[cover.png|caption=CareerOS]]

![[demo.mp4|caption=Compile → Resume / Interview|poster=poster.png]]

## Architecture

The system follows a strict compiler pipeline:

```
Markdown → Lexer → Parser → Semantic Analyzer → Validator → Graph → Artifacts
```

Key components use [[rabbitmq]] for async pipeline events.

## Chosen Solution

Built on [[typescript]] as the primary language. Uses [[unified]] and [[remark]] for Markdown AST parsing.

## Challenges

- Maintaining a single source of truth across multiple output formats
- Designing an ontology that is flexible yet strict enough for reliable graph construction

## Key Decisions

- [Edges are compiler output](../../../knowledge/career-os/why-edges-are-compiler-output.md) — Relationships are derived from wiki-links, not hand-authored (see `knowledge/career-os/` for the full reasoning)
- Compiler is a pure library in `packages/` with zero runtime dependencies

## Metrics

> ⚠️ Unverified — author to confirm after v1.0 release

## Lessons Learned

Domain-driven structure (knowledge by concept) is far more maintainable than tech-stack-based folder organization.
