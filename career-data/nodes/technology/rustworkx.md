---
id: rustworkx
type: technology
name: "rustworkx"
schemaVersion: "1"
tags:
  - graph-algorithms
  - python
status: active
level: intermediate
category: tooling
created: "2026-05-01"
updated: "2026-07-13"
---

## Problem

Graph algorithms like PageRank over a codebase-sized dependency graph
(potentially tens of thousands of nodes/edges) need to run fast enough for
an interactive developer tool — a pure-Python graph implementation would be
the bottleneck.

## Solution / Concept

rustworkx is a Rust-backed graph library exposed to Python, providing
high-performance implementations of standard graph algorithms (including
Personalized PageRank) without leaving the Python ecosystem for the rest of
the application.

## Tradeoffs

- **Pro**: Rust-level performance for graph algorithms with a Python-native API — no separate service/language boundary needed
- **Pro**: Well-tested standard algorithm implementations (PPR, shortest path) instead of hand-rolling them
- **Con**: Smaller community/ecosystem than NetworkX, though the performance gap is the reason to accept that trade-off

## Used In

- [[graphrag-code]] — runs bidirectional Personalized PageRank over the code knowledge graph to compute both dependencies and blast-radius
