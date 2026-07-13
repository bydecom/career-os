---
id: zod
type: technology
name: "Zod"
schemaVersion: "1"
tags:
  - validation
  - typescript
status: active
level: intermediate
category: backend-tooling
created: "2026-06-01"
updated: "2026-07-13"
---

## Problem

Request bodies and query strings arrive as untyped JSON/strings at runtime
— TypeScript's compile-time types don't protect against a client sending
malformed or malicious input; that needs a runtime check.

## Solution / Concept

Zod is a TypeScript-first schema validation library — you declare a schema
once and get both a runtime validator and an inferred static type from it,
so validation logic and type definitions can't drift apart.

## Tradeoffs

- **Pro**: One schema definition drives both runtime validation and compile-time types — no duplicate maintenance
- **Pro**: Composable (`.extend()`) — a base pagination schema can be extended per-endpoint without repeating fields
- **Con**: Default `.object()` parsing strips unknown keys silently — a real production bug if a schema doesn't declare every query param a route actually uses
- **Con**: Deeply nested/refined schemas can get hard to read

## Used In

- [[ecommerce-platform]] — request validation middleware (`validateBody`/`validateQuery`); a stripped-unknown-keys bug on the base pagination schema (breaking `search`/`status` filters) was found and fixed by extending per-endpoint schemas explicitly
- [[career-os]] — frontmatter schema validation in the Compiler's validator stage
