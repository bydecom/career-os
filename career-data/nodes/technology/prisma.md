---
id: prisma
type: technology
name: "Prisma"
schemaVersion: "1"
tags:
  - orm
  - database
  - typescript
status: active
level: intermediate
category: database-tooling
created: "2026-06-01"
updated: "2026-07-13"
---

## Problem

Hand-writing SQL for every query is error-prone and loses type safety at the
boundary between the database and application code — a renamed column
doesn't fail at compile time, it fails at 2am in production.

## Solution / Concept

Prisma is a type-safe ORM for Node.js/TypeScript. A single schema file
(`schema.prisma`) generates a fully-typed client, so every query is checked
against the real database shape at compile time. It also supports
transactions (`$transaction`), raw parameterized SQL (`$queryRaw`) when the
query builder isn't expressive enough, and migration tooling.

## Tradeoffs

- **Pro**: End-to-end type safety from schema to query result
- **Pro**: `$transaction` makes multi-write atomicity explicit and easy to reason about
- **Pro**: `$queryRaw` (tagged, parameterized) escapes the query builder safely when needed, without falling back to unsafe string concatenation
- **Con**: Generated client adds a build step; can get large in serverless bundle-size-constrained environments
- **Con**: Some advanced SQL (window functions, complex CTEs) still needs raw SQL

## Used In

- [[ecommerce-platform]] — all persistence (orders, products, inventory, feedback), including `$transaction`-wrapped order status transitions and parameterized `$queryRaw` for the orphaned-feedback sweeper query
