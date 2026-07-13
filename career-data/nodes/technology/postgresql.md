---
id: postgresql
type: technology
name: "PostgreSQL"
schemaVersion: "1"
aliases:
  - postgres
  - psql
tags:
  - database
  - relational
  - sql
status: active
level: intermediate
category: database
created: "2019-01-01"
updated: "2026-07-13"
---

## Problem

Applications need durable, consistent storage for structured data, with
strong guarantees (ACID transactions) and the ability to express complex
relationships and queries declaratively.

## Solution / Concept

PostgreSQL is an open-source, object-relational database. It enforces schemas,
supports ACID transactions, and offers advanced features (JSONB columns, full
text search, window functions, extensions like `pgvector`) that make it
usable both as a strict relational store and a flexible semi-structured one.

## Tradeoffs

- **Pro**: Strong consistency guarantees (ACID) — safe default for most business data
- **Pro**: JSONB support gives some of the flexibility of a document store without giving up relational integrity
- **Pro**: Extension ecosystem (`pgvector` for embeddings, `pg_trgm` for fuzzy search)
- **Con**: Vertical scaling has limits; horizontal write-scaling requires extra tooling (Citus, logical replication)
- **Con**: Schema migrations need discipline in fast-moving codebases

## Used In

- [[career-os]] — the reference architecture for the Knowledge Graph storage layer (see `docs/02-architecture/01-system-architecture.md`)
