---
id: movie-theater-management-system
type: project
name: "Movie Theater Management System"
schemaVersion: "1"
aliases:
  - movie-theater
  - qmovie
tags:
  - full-stack
  - search
  - performance
  - booking
status: active
role: "Full-stack Developer"
company: fpt-software
period: "Jan/2026 - Mar/2026"
visibility: private
created: "2026-01-01"
updated: "2026-07-18"
---

## Overview

OJT at [[fpt-software]] (Jan–Mar 2026). A **movie ticket booking** system —
browse movies, pick showtimes, select seats, apply promotions, pay, and
manage bookings.

Split repos: [[django]] + DRF backend (PostgreSQL, Redis, Celery) and
[[react]] (TypeScript) frontend. Focus contribution: performance-critical
search/caching, booking/seat integrity paths, and the React booking UX.

## Highlights

- Hybrid search: PostgreSQL trigram + GIN (fuzzy) and B-Tree prefix search with adaptive similarity thresholds; Python ETL JSON → SQL seeds.
- React search with in-memory caching, debouncing, and `AbortController` to cancel redundant in-flight requests while typing.
- Redis TTL forgot-password tokens; Redis API-layer caching for seat maps / hot paths.
- Responsive UI with API-driven carousel and multi-language (i18n) support.

## Demo

![[cover.png|caption=Movie Theater Management System]]

![[demo.mp4|caption=Search → seats → booking|poster=poster.png]]

## Problem

Ticket booking is a concurrent inventory problem: seats race under load,
search must feel instant across fuzzy titles, and password-reset / promo
expiry are short-lived workflows. A naive CRUD stack either oversells
seats, feels slow on search, or stores ephemeral tokens as durable rows.

## Runtime Pipeline

1. React storefront (Vite) — Home / Now Showing / Detail / Seat / Payment
2. DRF APIs — auth (JWT), movies, showtimes, bookings, promotions
3. [[postgresql]] — domain models + `pg_trgm` / GIN for movie search
4. [[redis]] — cache (seat maps, seat prices), short-lived reset tokens
5. Booking service — `transaction.atomic()` seat occupancy + pricing + promo
6. Celery worker + beat — expired promotion checker and scheduled jobs
7. Mailpit (dev) — SMTP catcher for forgot-password / notifications
8. Django Unfold admin — ops for movies, rooms, seats, promos

## Core Capabilities

### Adaptive Trigram Search

Postgres `pg_trgm` + GIN, with an **application-layer adaptive similarity
threshold** (query-length aware). Short queries use **prefix** (`query%`)
to hit B-Tree; longer queries use fuzzy trigram — relevance without
paying GIN cost on every keystroke.

### Search UX Hardening (React)

Debounce + in-memory cache + `AbortController` cancel in-flight requests
when a newer keystroke supersedes — fewer redundant API calls while typing.

### Atomic Booking & Seat Map

`create_booking` runs in a transaction: validate customer/showtime, reject
occupied / unavailable seats, price by seat type, apply promo / points /
food-combo lines. Seat maps cached in Redis (`room:{id}:seat-map`) with
invalidation on config change.

### Auth & Ephemeral Tokens

DRF SimpleJWT for sessions. Forgot-password tokens live in [[redis]] with
TTL — not durable DB rows for inherently short-lived secrets. Mailpit
catches mail in local/dev.

### Promotions & Celery Jobs

Promotion codes on booking; Celery beat task
`expired_promotion_checker` keeps promo status honest without manual
sweeps. Redis cache patterns for `seat_price:*` busted via signals.

### Admin + Seed Tooling

Unfold admin for theater ops. Internal ETL: raw JSON → normalized SQL seed
scripts. Optional Gemini helpers under configuration services for ops
assist features.

## Engineering Decisions

- **Adaptive similarity over one fixed cutoff** — short vs long queries
  need different matching strategies.
- **Prefix for short queries** — B-Tree speed when fuzzy is unnecessary.
- **Redis TTL tokens for password reset** — ephemeral by design.
- **Atomic booking with explicit seat conflict checks** — fail loud on
  occupied seats rather than soft oversell.
- **Cache seat maps / prices** — booking UI reads hot paths from Redis;
  signals invalidate on config writes.

## Tradeoffs

- Split frontend/backend repos — clearer ownership; two setup paths for
  local (Postgres + Redis + Mailpit + Celery + Vite).
- Private OJT codebase — proof via narrative + demo assets, not a public
  GitHub URL.
- Celery solo pool on Windows for local workers — production uses
  multiprocess pool on Linux.

## Evidence

- Implementation: Django apps `movies` · `bookings` · `accounts` ·
  `authentication` · `configuration`; React pages SeatSelection /
  Booking / Payment / Promotion; Celery beat schedule
- Validation: Occupied-seat rejection in `create_booking`; Redis seat-map
  cache hit path; Mailpit forgot-password loop
- Measurement: Adaptive trigram + prefix split; debounce/`AbortController`
  search UX; promo expiry via Celery
- Context: [[fpt-software]] OJT · precedes [[ecommerce-platform]] hardening
  round on the same placement arc

Stack: [[django]], [[postgresql]], [[redis]], [[react]], [[typescript]],
Celery, JWT, Mailpit, Docker (Redis/Mailpit)

## Lessons Learned

- Search relevance is not “one threshold forever” — query shape drives
  prefix vs trigram.
- Concurrent seat booking needs transactional occupancy checks; cache is
  for read paths, not the source of truth for “is this seat free?”
- Ephemeral auth tokens belong in Redis TTL space, not as forever rows.
