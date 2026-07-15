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
updated: "2026-07-10"
---

## Overview

Built during an On-the-Job Training (OJT) placement at [[fpt-software]]
(Mar–Jun 2026). A full-stack e-commerce platform (buyer storefront + admin
console) with the initial build shipped in ~5 weeks, then deliberately
hardened across 12 documented rounds of technical critique before going
live on real AWS infrastructure. Not a CRUD demo — the
focus was production-shaped concerns: money paths (payment), stock races
(inventory), auth sessions, async workers, and deploy/rollback safety.

> Interview-friendly one-liner: "In five weeks I shipped an e-commerce core
> with Gemini/Qdrant AI, then deliberately hardened order, payment,
> inventory, auth, and async workers — and documented every production
> punch."

## Chosen Solution

- Backend: [[nodejs]] 20, Express 5, [[typescript]], [[prisma]], [[redis]], JWT, Zod
- Frontend: [[angular]] 17 (standalone components + signals), Tailwind CSS
- Data: [[postgresql]] 16 (`pg_trgm` for fuzzy search) → Neon in production
- Message broker: [[rabbitmq]] 3 (`amqplib`) for email + AI workers
- AI: [[gemini-ai]] (embeddings + chat) + [[qdrant]] for vector search
- Payment: [[vnpay]] sandbox (create + IPN verify)
- Infra: [[docker]] Compose (local), [[aws]] (S3/CloudFront + EC2), [[pm2]] cluster mode

## Architecture

```
Angular 17 --HTTPS--> Express API (PM2 cluster) --> PostgreSQL (Neon)
                          |                      --> Redis (Upstash)
                          |--publish--> RabbitMQ --> Email Worker
                          |                      --> AI Worker --> Gemini + Qdrant
                          |--IPN webhook--> VNPay
```

**Order status machine (enforced in service, not just UI):**

```
PENDING → CONFIRMED → SHIPPING → DONE
PENDING → CANCELLED   (only while PENDING)
```

## Key Decisions

- **Stock reservation via Redis + Lua script** — atomic checkout hold with
  TTL cleanup under a distributed lock, so a PM2 cluster (multiple instances)
  never double-runs the expiry sweep and never oversells inventory.
- **VNPay IPN kept synchronous, not queued** — the payment webhook is
  idempotent-by-design (VNPay retries on non-`00` response); moving it to a
  queue would have broken that retry guarantee and risked charging a
  customer without marking the order `PAID`. Only side-effects (email,
  admin notification) were pushed to RabbitMQ after the transaction commits.
- **AI kept as a provider abstraction** (`IAIProvider.generateJson<T>()`),
  not a hard dependency on Gemini — admin can flip provider via DB-backed
  config without a redeploy, and a `LocalAIProvider` fallback keeps the
  product usable if the AI budget or quota is exhausted.
- **Async-only for AI tasks that don't need an immediate response** —
  product vector sync and feedback sentiment analysis moved off the HTTP
  hot path into an `ai.worker.ts` RabbitMQ consumer (`prefetch = 1` to
  protect Gemini rate limits), cutting product-save latency from ~2s to
  under 10ms. Chatbot and description-enhancer stayed synchronous because
  the user is actively waiting for that response.
- **Refresh-token rotation, not just access tokens** — HttpOnly cookie,
  hashed in Redis, rotated on every refresh, with a `jti` blacklist on
  logout, to reduce the blast radius of a stolen refresh token.

## Challenges

- **Checkout stock races**: two buyers checking out the same last unit at
  the same time. Solved with a Redis Lua script for atomic reserve +
  idempotency (same hold key → success, no double-count), plus a
  distributed-lock-guarded cleanup loop for expired reservations.
- **PM2 cluster mode was not safe by default**: no graceful shutdown
  handler, in-memory rate-limit store (bypassable across instances), and a
  per-instance cleanup `setInterval` that would race in cluster mode. All
  three had to be fixed (SIGTERM handler, `RedisStore` for rate limiting,
  Redis `SETNX` lock for the cleanup loop) before cluster mode could be
  trusted in production.
- **Neon serverless connection pool exhaustion**: PM2 cluster × multiple
  workers could open more connections than Neon's pooler allows. Fixed with
  `connection_limit=3` tuned per instance on the connection string.
- **DLQ as a silent, unbounded sink**: dead-letter queues for email/AI
  workers had no TTL or max-length, meaning they could grow forever and
  eventually fill disk. Fixed with a 7-day TTL and a 500-message cap.
- **Cross-domain auth cookies**: frontend on CloudFront, backend on a
  separate EC2 domain — browsers blocked the refresh cookie under default
  `SameSite` policy until it was explicitly set to `sameSite: 'none'` +
  `secure: true`.

## Evidence

- 12 rounds of documented technical critique (`docs/codebase-review/`):
  architecture review → implementation → production log verification →
  fix, repeated. Round 7, for example, caught a `RedisStore` race
  condition and an under-sized PM2 `listen_timeout` directly from reading
  `pm2 logs` on the live EC2 instance after deploy.
- Unit tests on the money-critical paths: 25 test cases for VNPay signature
  verification + IPN handling, 19 test cases for Redis stock-reservation
  Lua-script idempotency — both passing 100% on first full run.
- Self-inflicted production incidents documented and fixed live: RabbitMQ
  running bare-metal instead of the assumed Docker Compose setup, Node.js
  IPv6-first DNS resolution timing out on EC2 (fixed via
  `--dns-result-order=ipv4first`), PM2 workers not inheriting
  `.env.production` when run in `fork` mode.

## Metrics

- 132+ deployments executed to AWS EC2 via the zero-downtime PM2 cluster
  CI/CD pipeline (auto-rollback + backup + S3/CloudFront sync).
- Product-save latency (admin path): ~2s → <10ms after moving Qdrant/Gemini
  vector sync off the HTTP request into an async worker.
- Test coverage on critical paths: VNPay (25/25 passing), stock reservation
  (19/19 passing).
- 92.3% of the R1–R11 hardening checklist closed (36/39 items), audited
  directly against the running code — remaining gaps are Layer 8
  observability (centralized logging, metrics, APM), explicitly deferred
  post-go-live.

## Lessons Learned

- "Works on dev" is not the same claim as "works on this cloud's network
  stack" — IPv6 DNS resolution order and bare-metal-vs-Docker assumptions
  were both invisible until they hit the real EC2 instance.
- A security fail-open/fail-closed decision (JWT blacklist when Redis is
  down) is a product trade-off, not a purely technical one — the resolved
  hybrid (fail-closed if a token's remaining TTL is large, fail-open if it's
  about to expire anyway) came from treating it that way.
- Documenting the *argument* behind a decision (the "💬 Tranh luận" rounds
  in `technical_critique.md`) turned out to matter more than the conclusion
  itself — it's what makes the reasoning reusable three months later or for
  a new teammate.
