---
id: remark
type: technology
name: "remark"
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

Need a concrete Markdown-to-AST parser to plug into the [[unified]] processor
pipeline — `unified` itself defines only the interface, not the actual
Markdown grammar.

## Solution / Concept

`remark` is the `unified`-compatible Markdown processor. `remark-parse`
converts raw Markdown text into an `mdast` tree; the Compiler walks this tree
to extract headings (Sections), fenced code blocks, and wiki-link text nodes.

## Tradeoffs

- **Pro**: Battle-tested, widely used across the JS ecosystem (MDX, Gatsby, Docusaurus)
- **Pro**: Composable — only pulled in `remark-parse`, kept the dependency surface small
- **Con**: Full round-trip (`remark-stringify`) adds complexity if Markdown needs to be regenerated later

## Used In

- [[career-os]] — the `parseMarkdown` function in `packages/compiler/src/parser` is built directly on `remark-parse`
