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
updated: "2026-07-18"
---

## Overview

A Code Knowledge Graph for AI coding agents. Tree-sitter AST → SQLite →
in-memory [[rustworkx]] graph → bidirectional Personalized PageRank →
[[fastmcp]] tools that return exact source blocks (not just symbol metadata).

One tunable `backward_weight` selects between two modes:

- **Downstream context** (default ~0.2) — what this symbol depends on
- **Upstream blast radius** (`get_impact` ~0.9) — who would break if it changes

PyPI: `graphrag-code-core` · Repo: [github.com/bydecom/graphrag-code](https://github.com/bydecom/graphrag-code)

Not [Microsoft GraphRAG](https://github.com/microsoft/graphrag) — that
indexes unstructured text; this indexes **code structure** for live agents.

## Highlights

- AST-derived knowledge graph (Tree-sitter + SQLite) with bidirectional Personalized PageRank via rustworkx (downstream deps + upstream blast radius).
- LLM-free retrieval harness: Precision@10 ≈ 0.98 on real packages vs ≈ 0.27 unidirectional ablation.
- Packaged as FastMCP (`plan_change`, `get_impact`, `get_context`) for Cursor / Claude Desktop, including structural dead-code signal.

## Demo

![[cover.png|caption=GraphRAG-Code]]

![[demo.mp4|caption=Structural query without re-reading the repo|poster=poster.png]]

## Problem

Dumping whole files into LLM agents is expensive and hallucination-prone.
Questions like "what breaks if I change this?" are **structural** — they
have deterministic answers from the call/import graph. They should not
require the model to re-reason over the repo every time.

Aider-style Repo Maps help, but undirected / global PageRank boosts
utilities (`logger.info`) regardless of the seed task. Coding agents need
**seeded**, **directed**, bidirectional ranking plus **exact snippets**.

## Runtime Pipeline

1. Tree-sitter AST parse (Python symbols, imports, calls, contains, routes)
2. Persist incremental graph in [[sqlite]]
3. Load into [[rustworkx]] in-memory graph
4. Expand seeds across interface / inheritance boundaries
5. Forward PPR (downstream) + Backward PPR (reversed graph)
6. Merge scores with tunable `backward_weight`
7. Extract AST-coordinate source blocks for top-k symbols
8. Serve via [[fastmcp]] stdio (`plan_change`, `get_impact`, `get_context`, …)

## Core Capabilities

### Bidirectional Personalized PageRank

Two independent PPR passes, merged by weight — not one symmetric walk.
Default leans downstream; `get_impact` raises backward weight for blast
radius. Ablation proof: unidirectional P@10 collapses on real packages
(`requests` 0.27) while bidirectional stays ~0.98.

### Exact Source Block Extraction

MCP tools inject real code snippets via AST coordinates — agents get
bodies and callers, not only symbol names.

### Zero-ops MCP Server

`plan_change`, `get_impact`, `get_context`, `get_pruned_context`,
`get_callers`, `list_symbols` plug into Cursor / Claude Desktop over
stdio. Ambiguous names return disambiguation lists instead of silent
guesses.

### Interface & Route Semantics

Inheritance / interface consumers expand seeds. Flask/FastAPI decorators
become route nodes with `handles` edges (visible as purple diamonds in
the graph visualizer).

### Orphan / Dead-Code Signal

Edges come only from real `import` / `call` / `contains` / `handles`.
Disconnected clusters are honest: nothing statically references them.

### LLM-free Structural Eval (RQ1)

`eval_retrieval.py` compares unidirectional PPR vs bidirectional vs
1-hop brute force against transitive-closure ground truth on real
packages (`requests`, `click`, `httpx`). Headline metric: Precision@10
for blast-radius — not LLM-as-judge, not inflated recall against huge
closures.

## Engineering Decisions

- **Bidirectional weighted merge over unidirectional walks** — blast
  radius needs upstream; forward-only spends budget on irrelevant nodes.
- **Personalized (seeded) PPR over global PageRank** — scores stay
  task-dependent; utilities do not dominate every query.
- **SQLite + rustworkx over Neo4j** — single-machine, rebuild-from-source,
  low ops; MCP stdio over heavy graph-DB infra.
- **AST-derived edges over LLM-indexed KBs** — literature shows LLM-KBs
  skip files and explode index cost; structure stays deterministic.
- **Separate tools by task** (`get_impact` vs `get_context`) — retrieval
  quality is task-dependent (JetBrains / NeurIPS 2025 insight).

## Tradeoffs

- Structural lane only — not a replacement for BM25/dense on NL bug-finding.
- Assignment heuristics, not a full type checker — intentional; LSP/LSIF
  is Phase 2. Gaps: `self.attr` chains, import aliases, dynamic dispatch.
- Python-first; multi-language planned.
- Over-context can make agents defensive (Google HCRG lesson) — keep
  token budgets and signature-only fallbacks in mind.

## Evidence

- Implementation: Tree-sitter indexer · rustworkx PPR · FastMCP tools ·
  `eval_retrieval.py` · graph visualizer export
- Validation: RQ1 blast_radius Precision@10 — Bidirectional **0.98 / 0.99 /
  0.98** on `requests` / `click` / `httpx` vs Unidirectional **0.27 /
  0.64 / 0.65** (matches 1-hop brute force on precision; far exceeds
  forward-only ablation). Methodology: `docs/RESEARCH.md`
- Measurement: PyPI `graphrag-code-core` · MCP in Cursor/Claude · ~ms PPR
  on in-memory graph
- Positioning: Aider RepoMap (undirected PR) · Codebase-Memory (MCP +
  Tree-sitter) · LocAgent / CodexGraph / RepoGraph — see related work in
  repo README / `docs/LITERATURE_REVIEW.md`
- Sibling: [[medical-citation-agent]] — same Deterministic-First + MCP
  pattern for FDA citations

Stack: [[python]], [[tree-sitter]], [[sqlite]], [[rustworkx]], [[fastmcp]],
[[gemini-ai]] (optional agent)

## Lessons Learned

- Traversal direction changes meaning: “uses” ≠ “would break.”
- Bidirectional is necessary for blast radius — ablation numbers make that
  non-negotiable.
- If the question is structural, keep the LLM out of the retrieval path;
  use it only after evidence is ranked.
- Cite related work honestly (Lofgren = conceptual inspiration for
  bidirectional *reasoning*, not the merge math we ship).
