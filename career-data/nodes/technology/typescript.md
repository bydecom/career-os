---
id: typescript
type: technology
name: "TypeScript"
schemaVersion: "1"
aliases:
  - ts
tags:
  - language
  - static-typing
  - frontend
  - backend
status: active
level: expert
category: language
created: "2019-01-01"
updated: "2026-07-13"
---

## Problem

JavaScript's dynamic typing allows entire classes of bugs (wrong argument
types, undefined property access) to slip past development and surface only
at runtime, often in production.

## Solution / Concept

TypeScript adds a static type system on top of JavaScript, checked at compile
time. It compiles down to plain JavaScript, so it runs anywhere JS runs, but
catches type errors before the code ever executes.

## Tradeoffs

- **Pro**: Catches type errors at compile time, not runtime
- **Pro**: Self-documenting APIs via types; better IDE autocomplete/refactoring
- **Pro**: Gradual adoption — can mix `.ts` and `.js` in the same codebase
- **Con**: Extra build step (`tsc`) compared to plain JS
- **Con**: Type gymnastics can slow down prototyping for very dynamic code

## Used In

- [[career-os]] — the entire Compiler pipeline (Lexer, Parser, Validator, Builder) is written in strict TypeScript
