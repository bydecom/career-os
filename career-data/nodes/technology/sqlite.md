---
id: sqlite
type: technology
name: "SQLite"
schemaVersion: "1"
tags:
  - database
  - embedded
status: active
level: intermediate
category: database
created: "2026-05-01"
updated: "2026-07-13"
---

## Problem

Some applications (a local dev tool, a single-machine graph engine, a
prototype) need real relational querying but not the operational overhead
of running a separate database server.

## Solution / Concept

SQLite is a self-contained, file-based relational database — the entire
database is one file, with no server process to run or manage. It's
embedded directly in the application process, making it a natural fit for
read-heavy, single-machine, or CLI-distributed tools.

## Tradeoffs

- **Pro**: Zero operational overhead — no server to install, configure, or keep alive
- **Pro**: A single file is trivial to ship, copy, or version alongside a tool
- **Con**: Limited concurrent-write support compared to PostgreSQL — wrong choice for a multi-writer server backend
- **Con**: No native network access — must be co-located with the process using it

## Used In

- [[graphrag-code]] — stores the AST-derived code knowledge graph
- [[conversational-state-machine]] — flows-as-data (intents, slots, policies) for the Dialogue Runtime
- [[career-os]] — compiled Knowledge Graph IR (`graph.db`) for Resume / Interview projections
