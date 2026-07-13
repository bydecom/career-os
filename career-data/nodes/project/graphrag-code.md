---
id: graphrag-code
type: project
name: "GraphRAG-Code"
schemaVersion: "1"
tags:
  - ai
  - developer-tooling
  - open-source
  - mcp
  - graph
status: active
role: "Author / Solo Developer"
period: "May/2026 - Jun/2026"
repository: "https://github.com/bydecom/graphrag-code"
visibility: public
created: "2026-05-01"
updated: "2026-07-13"
---

## Overview

A Python-native open-source code knowledge graph that reduces AI token
costs by ~90% on structural code queries (e.g. "what breaks if I change
this function?"), by answering them from a pre-built graph instead of
having an LLM read and re-reason over source files every time.

## Problem

Asking an LLM "what depends on this function?" or "what's the blast radius
of this change?" normally means feeding it a large slice of the codebase as
context — expensive in tokens, slow, and still probabilistic (the model can
miss a dependency). These are structural questions with a deterministic
correct answer; they shouldn't require an LLM to answer at all.

## Chosen Solution

- Parse the codebase into an AST-derived knowledge graph using [[tree-sitter]], stored in [[sqlite]]
- Run bidirectional Personalized PageRank (PPR) via [[rustworkx]] to analyze
  both downstream dependencies ("what does this call?") and upstream
  blast-radius ("what calls this, transitively?")
- Package the engine as a [[fastmcp]] server exposing zero-config context
  tools (`get_impact`, `plan_change`) directly to Cursor / Claude Desktop
- Includes structural dead-code detection as a byproduct of the same graph

## Evidence

- Custom, LLM-free retrieval benchmark harness: achieved **0.98
  Precision@10** on real-world repositories, versus a **0.27** unidirectional
  baseline (i.e. only following dependencies forward, not analyzing blast
  radius backward) — bidirectional PPR was the key architectural decision
  driving that gap.
- ~90% reduction in AI token cost on structural queries, by answering from
  the graph instead of re-feeding source files to the LLM each time.

## Key Decisions

- **Bidirectional PPR over unidirectional traversal** — a plain dependency
  walk answers "what does X use" but not "what breaks if X changes"; both
  directions were needed to make `get_impact` actually useful for refactor
  planning, and this is what took precision from 0.27 to 0.98.
- **SQLite over a full graph database** — the graph is read-heavy,
  single-machine, and rebuilt from source on demand; a heavier graph DB
  would have added an operational dependency with no benefit at this scale.
- **LLM-free benchmark harness** — precision/recall are measured against
  ground-truth structural relationships extracted from the AST itself, not
  judged by another LLM, keeping the evaluation deterministic and
  reproducible.

## Lessons Learned

- The direction you walk a dependency graph changes the answer's meaning
  entirely — "what this uses" and "what would break if this changes" are
  different queries requiring different graph traversals, not the same
  traversal read two ways.
