---
date: 2026-07-13
author: Bang Thai Minh
type: engineering-decision
confidence: high
tags:
  - architecture
  - compiler
  - knowledge-model
---

# Why Edges Are Compiler Output, Not Hand-Authored Data

## Context

During the initial bootstrap, `career-data/edges/` was created as a folder for manually authoring relationships between knowledge nodes. The assumption was that relationships (e.g., "Project uses Technology") would be written by hand in YAML or Markdown.

## Decision

Remove `career-data/edges/` entirely. Edges must be **derived by the Compiler**, not hand-authored.

The Compiler extracts edges from `[[Wiki-links]]` embedded in the prose of each Markdown node. The Semantic Analyzer then classifies the edge type (e.g., `USES`, `SOLVES`, `IMPLEMENTS`) based on context and ontology rules.

Generated edges are stored in `career-data/generated/graph/` — a git-ignored directory.

## Alternatives Considered

### Option A — Hand-authored edge files (`career-data/edges/*.yaml`)

**Pros:**
- Explicit and easy to grep
- No parser complexity

**Cons:**
- Violates Single Source of Truth — relationship intent is written in two places
- Every node rename requires updating both the node file and the edge file
- Edge files can drift out of sync with node files silently

**Verdict:** ❌ Rejected

### Option B — Compiler-derived edges from `[[Wiki-links]]`

**Pros:**
- DRY: relationship is expressed once, in prose, where it is most natural
- Always in sync with node files
- Authoring feel is identical to Obsidian / Roam Research

**Cons:**
- Requires a robust parser; implicit intent must be resolved correctly
- Debugging requires running `career compile --diagnostics` rather than reading a file

**Verdict:** ✅ Accepted

## Why

If edges were hand-authored, every rename or new relationship would require updating two places. This directly violates **Philosophy #2: Single Source of Truth**.

With compiler-derived edges, you write `[[RabbitMQ]]` naturally inside your project note's prose. The Compiler infers `Project USES Technology` from context. No duplication.

## Evidence

- Obsidian, Roam Research, and Logseq all use this model: links in prose, graph derived by the tool.
- The ADR `0003-knowledge-as-atomic-nodes.md` establishes that nodes are the atomic unit. Edges are a secondary derived artifact.

## Decision Confidence

**High.** This is consistent with how every major graph-based note-taking system works. The tradeoff (implicit intent) is acceptable because the Ontology Validator acts as a hard gate against invalid edge types.

## Future Revisit

Reconsider if:
- A user needs to express a relationship that cannot be inferred from prose context (e.g., a time-based edge with a specific date metadata).
- The parser begins making systematic errors on a particular node type.

In those cases, an optional `relations:` FrontMatter array can be added as an escape hatch — but only as a supplement, never a replacement.
