---
id: unified
type: technology
name: "unified"
schemaVersion: "1"
tags:
  - ast
  - markdown
  - compiler-toolchain
status: active
level: intermediate
category: tooling
created: "2026-07-01"
updated: "2026-07-13"
---

## Problem

Parsing Markdown into a structured, walkable tree (instead of regex-matching
raw text) is required to reliably extract headings, sections, links, and code
blocks for the Knowledge Compiler.

## Solution / Concept

`unified` is a pluggable text-processing framework built around syntax trees.
It defines a common interface (`Processor`) that plugins like `remark-parse`
attach to, producing a standard `mdast` (Markdown AST) that downstream code
can traverse.

## Tradeoffs

- **Pro**: Plugin ecosystem (`remark-*`) covers most Markdown extensions needed
- **Pro**: Produces a real AST — more robust than regex-based parsing
- **Con**: Learning curve around the unist/mdast node type conventions
- **Con**: Slightly heavier than a minimal hand-rolled parser for simple needs

## Used In

- [[career-os]] — powers the Parser stage of the Compiler pipeline (`packages/compiler/src/parser`)
