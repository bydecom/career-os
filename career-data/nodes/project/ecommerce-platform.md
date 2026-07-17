---
id: ecommerce-platform
type: project
name: "E-Commerce Platform"
schemaVersion: "1"
aliases:
  - bandai
  - e-commerce-project
tags:
  - full-stack
  - e-commerce
  - production
  - ai
  - fintech-adjacent
status: active
role: "Full-stack Developer"
company: fpt-software
period: "Mar/2026 - Jun/2026"
demo: "https://d7ozoo9vtkn42.cloudfront.net/"
visibility: private
created: "2026-06-01"
updated: "2026-07-18"
---

## Overview

Built during OJT at [[fpt-software]] (Mar–Jun 2026). A **production-shaped**
full-stack shop — buyer storefront + admin — not a CRUD demo. ~5 weeks to
core (including [[gemini-ai]] / [[qdrant]] AI), then deliberately hardened
across documented critique rounds before live on real [[aws]] infrastructure.

Focus: money paths, stock races, auth sessions, async workers, and
deploy/rollback safety.

> One-liner: *In five weeks I shipped an e-commerce core with Gemini/Qdrant
> AI, then hardened order, payment, inventory, auth, and async workers —
> and documented every production punch.*

Live demo: [CloudFront storefront](https://d7ozoo9vtkn42.cloudfront.net/)

## Demo

![[cover.png|caption=E-Commerce Platform]]

![[demo.mp4|caption=Storefront + admin walkthrough|poster=poster.png]]

## Problem

Tutorial shops skip what breaks in production: double-checkout races, VNPay
retries, refresh-token theft, AI latency on the HTTP hot path, and PM2
cluster footguns. A recruiter-facing portfolio needs proof those paths were
designed, tested, and hardened on real infra — not just listed in a README.

## Runtime Pipeline

1. [[angular]] 17 storefront / admin → HTTPS `/api`
2. Express 5 API ([[nodejs]] · [[typescript]] · [[zod]]) under [[pm2]] cluster
3. Persist via [[prisma]] → [[postgresql]] / Neon; sessions & holds in [[redis]] / Upstash
4. Presigned PUT → MinIO / [[aws]] S3 (+ CloudFront media)
5. Publish side-effects to [[rabbitmq]] → email worker + AI/Qdrant worker
6. Money path: [[vnpay]] create URL + synchronous IPN verify (idempotent)
7. Order status machine enforced in service (`PENDING → CONFIRMED → …`)
8. CI smoke on `/api/health` → deploy or auto-rollback ([[github-actions]])

## Core Capabilities

### Auth & Session Hardening

Email-verify-before-user-create; short-lived access JWT (in-memory on
client); refresh rotation (HttpOnly cookie, hashed in [[redis]]); `jti`
blacklist on logout; OTP soft-lockout; idle timeout; single-flight client
refresh.

### Inventory Reservation (Race-safe)

[[redis]] checkout stock hold + TTL; **Lua** atomic reserve + idempotency;
cleanup under distributed lock (`SETNX`) so [[pm2]] cluster does not
double-run expiry. Cancel/fail returns stock; guards when already `PAID`.

### Orders & VNPay Money Path

Enforced status machine + [[prisma]] `$transaction` + `OrderEvent` audit.
[[vnpay]] signed create + IPN verify, amount rounding defense, idempotent
duplicate-IPN handling — IPN stays **synchronous** so VNPay retries keep
their guarantee.

### Async Workers (Email + AI)

[[rabbitmq]] durable topology; email + AI consumers; manual ACK/NACK; DLQ
(TTL 7d, max 500); worker reconnect; `prefetch = 1` on AI to protect Gemini
quotas. Vector sync / feedback sentiment off the HTTP hot path.

### AI Module (Provider Abstraction)

`IAIProvider` → Gemini or Local fallback (DB-backed `SystemConfig` flip,
no redeploy). Storefront + admin tool-calling chatbots; description
enhancer; daily mini-advice with heuristic fallback; 768-dim L2 embeddings
→ [[qdrant]] cosine recommend.

### Ops Resilience

[[pm2]] cluster + graceful SIGTERM; Redis rate-limit with MemoryStore
fallback; health check smoke; CI **auto-rollback**; Neon
`connection_limit` tuned for pooler; multi-round `docs/codebase-review/`
hardening culture.

## Engineering Decisions

- **Redis Lua stock reservation** — atomic hold + idempotency under
  cluster-safe cleanup lock.
- **VNPay IPN synchronous, not queued** — retries require immediate
  success/fail; only side-effects go to RabbitMQ after commit.
- **AI provider abstraction** — swap Gemini ↔ local via DB config; fail soft
  on dashboard advice.
- **Async-only for non-interactive AI** — product vector sync / feedback
  analyze off HTTP (~2s → <10ms save); chat stays sync because the user waits.
- **Refresh-token rotation + `jti` blacklist** — shrink blast radius of
  stolen refresh tokens.

## Tradeoffs

- Hardening depth vs Layer-8 observability (centralized logging / APM) —
  92.3% of R1–R11 checklist closed; observability deferred post-go-live.
- Fail-open vs fail-closed JWT blacklist when Redis is down — hybrid by
  remaining TTL (product trade-off, not pure tech).
- Private repo / OJT context — live CloudFront demo + documented critique
  rounds carry the proof.

## Evidence

- Implementation: Express modules (auth, order, inventory, payment, ai) ·
  Angular storefront/admin · RabbitMQ workers · PM2 / AWS deploy
- Validation: VNPay unit tests **25/25** · stock reservation Lua **19/19** ·
  12 rounds in `docs/codebase-review/` (plan-vs-reality, battle tests,
  self-healing map)
- Measurement: **132+** EC2 deploys via zero-downtime PM2 CI · product-save
  ~2s → <10ms after async vector sync · **92.3%** R1–R11 checklist (36/39)
- Live: [CloudFront demo](https://d7ozoo9vtkn42.cloudfront.net/)

Stack: [[nodejs]], [[typescript]], [[angular]], [[prisma]], [[postgresql]],
[[redis]], [[rabbitmq]], [[gemini-ai]], [[qdrant]], [[vnpay]], [[jwt]],
[[zod]], [[docker]], [[aws]], [[pm2]], [[github-actions]], [[fpt-software]]

## Lessons Learned

- "Works on dev" ≠ "works on this cloud's network stack" — IPv6 DNS order
  and bare-metal-vs-Docker assumptions only failed on real EC2.
- Fail-open/fail-closed security choices are product decisions; document
  the argument, not only the conclusion.
- Critique → implement → verify on production logs is what turns a 5-week
  build into interview-grade evidence.
