---
id: movie-theater-management-system
type: project
name: "Movie Theater Management System"
schemaVersion: "1"
tags:
  - full-stack
  - search
  - performance
status: active
role: "Full-stack Developer"
company: fpt-software
period: "Jan/2026 - Mar/2026"
visibility: private
created: "2026-01-01"
updated: "2026-07-13"
---

## Overview

Contributed to a [[django]]-based movie theater web application built at
[[fpt-software]], developing custom backend modules and
performance-critical search/caching features, plus the [[react]] frontend.

## Chosen Solution

- Backend: [[django]], [[postgresql]] (`pg_trgm` trigram search + GIN indexes), [[redis]] caching
- Frontend: [[react]], i18n (multi-language support), debounce + `AbortController` for search
- Tooling: internal ETL script to normalize raw JSON into SQL seed scripts
- Email: Mailpit to simulate the forgot-password flow in development

## Key Decisions

- **Adaptive similarity threshold at the application layer** on top of
  Postgres trigram search — a single fixed similarity cutoff either missed
  relevant results (too strict) or returned noise (too loose) across
  different query lengths, so the threshold was tuned per query
  characteristics instead of hardcoded.
- **Prefix search (`query%`) for short queries** specifically to hit
  B-Tree indexes rather than the (more expensive) trigram GIN index — short
  queries don't need fuzzy matching, they need to be fast.
- **Redis-backed temporary tokens for forgot-password**, not database rows
  — the token is inherently short-lived and doesn't need durability beyond
  its TTL.

## Challenges

- Preventing redundant API calls while a user types into search — solved
  with debounce, in-memory caching, and `AbortController` to cancel
  in-flight requests when a newer keystroke supersedes them.
- Keeping search, cache, and UI layers consistent as filters and pagination
  interact with a partially-cached result set.

## Evidence

- Data crawling & ETL tool: transforms raw JSON into normalized SQL scripts for initial database seeding.
- Carousel-based movie slider with automated, API-driven transitions.

## Lessons Learned

- Search relevance tuning is not "set a threshold once" — different query
  shapes (single word vs multi-word, short vs long) need different
  matching strategies (`prefix` vs `trigram similarity`) to feel fast *and*
  relevant at the same time.
