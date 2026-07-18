---
id: redis
type: technology
name: "Redis"
schemaVersion: "1"
tags:
  - cache
  - in-memory
  - database
status: active
level: intermediate
category: database
created: "2026-06-01"
updated: "2026-07-13"
---

## Problem

Some data needs to be read/written far faster than a relational database
allows, and some operations (like "reserve this stock unit, but only if no
one else has") need atomicity guarantees a simple `SELECT` + `UPDATE` can't
give you under concurrency.

## Solution / Concept

Redis is an in-memory key-value store. Beyond simple caching, it supports
atomic primitives (`SETNX` for distributed locks, `INCR`, sorted sets) and
Lua scripting for compound atomic operations — a single Lua script executes
as one atomic unit, which is what makes race-free stock reservation
possible without a database lock.

## Tradeoffs

- **Pro**: Sub-millisecond reads/writes; ideal for rate-limiting, session/token state, hot caches
- **Pro**: Lua scripts give you multi-step atomicity without a distributed transaction
- **Pro**: `SETNX` + TTL is a simple, effective distributed lock primitive for single-leader-election problems (e.g. "only one cluster instance runs this cleanup job")
- **Con**: In-memory by default — durability requires explicit persistence config (RDB/AOF) and still isn't as strong as a relational DB
- **Con**: Managed Redis (e.g. Upstash) has command-count quotas that need monitoring at scale

## Used In

- [[ecommerce-platform]] — checkout stock reservation (Lua script + TTL), refresh-token storage (hashed, rotated), JWT blacklist, rate-limiting store shared across a PM2 cluster, and the distributed lock guarding the reservation-cleanup loop
- [[movie-theater-management-system]] — seat-map / seat-price cache, Redis TTL forgot-password tokens
