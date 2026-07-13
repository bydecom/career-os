---
id: tree-sitter
type: technology
name: "Tree-sitter"
schemaVersion: "1"
tags:
  - ast
  - parser
  - developer-tooling
status: active
level: intermediate
category: tooling
created: "2026-05-01"
updated: "2026-07-13"
---

## Problem

Building structural code-analysis tools (dependency graphs, refactor
impact analysis) needs a real, language-aware parse tree — regex or
line-based heuristics can't reliably tell "this identifier is a function
call" from "this identifier is a string containing the same text."

## Solution / Concept

Tree-sitter is an incremental parsing library that builds a concrete syntax
tree for source code across many languages with a unified query API. It's
fast enough to re-parse on every keystroke (used by editors like Neovim and
GitHub's code viewer) and precise enough to drive structural analysis.

## Tradeoffs

- **Pro**: Multi-language grammars under one consistent API — one parsing strategy for a polyglot codebase
- **Pro**: Incremental parsing is fast enough for interactive tools, not just batch analysis
- **Con**: Grammar quality/coverage varies by language; edge cases in less-common languages may need workarounds
- **Con**: Working with concrete syntax trees still requires domain knowledge of each language's grammar shape

## Used In

- [[graphrag-code]] — parses source files into the AST that seeds the knowledge graph
