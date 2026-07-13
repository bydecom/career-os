---
id: qdrant
type: technology
name: "Qdrant"
schemaVersion: "1"
tags:
  - vector-database
  - ai
  - search
status: active
level: intermediate
category: database
created: "2026-06-01"
updated: "2026-07-13"
---

## Problem

Keyword search (even fuzzy, via `pg_trgm`) misses semantically similar
results that don't share exact substrings — a search for "warm winter
jacket" should surface a product described as "insulated cold-weather
coat", which no keyword index will match.

## Solution / Concept

Qdrant is a vector database purpose-built for storing embeddings and running
fast approximate nearest-neighbor search over them (cosine/dot-product
distance). Product text (name + category + price + description) is embedded
via Gemini's embedding model, upserted into a Qdrant collection, and queried
at search/recommend time.

## Tradeoffs

- **Pro**: Enables semantic search/recommendation that keyword indexes structurally cannot do
- **Pro**: Qdrant Cloud removes the operational burden of running/scaling a vector index yourself
- **Con**: Adds an eventual-consistency window — search results can briefly miss a just-created product until the async sync worker catches up
- **Con**: Another moving part in the stack; hybrid search (Postgres + Qdrant merge) is needed to mask that consistency gap

## Used In

- [[ecommerce-platform]] — product embeddings (768-dim, L2-normalized, cosine distance) synced asynchronously via a RabbitMQ worker after product create/update, used for semantic product search and recommendations
