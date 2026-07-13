---
date: 2026-07-13
author: Bang Thai Minh
type: engineering-decision
confidence: high
tags:
  - knowledge-model
  - second-brain
  - information-architecture
---

# Why Knowledge Is Organized by Domain, Not Tech Stack

## Context

The initial `career-data/knowledge/` structure was organized by tech stack layer:
```
knowledge/
  backend/
  frontend/
  database/
  infrastructure/
```

## Decision

Replace tech stack categories with **knowledge domains**:
```
knowledge/
  software-engineering/
  distributed-systems/
  ai/
  computer-science/
  system-design/
  database/
  architecture/
  career/
  product/
  leadership/
  research/
  books/
  papers/
  courses/
```

## Alternatives Considered

### Option A — Tech stack layers (`backend/`, `frontend/`, `infrastructure/`)

**Pros:**
- Familiar to most developers
- Maps directly to job descriptions

**Cons:**
- Technologies span multiple layers. Every placement is a judgment call:
  - Redis → `backend/` or `database/`?
  - Docker → `infrastructure/` or `backend/`?
  - CQRS → `backend/` or `architecture/`?
  - Kafka → `backend/` or `infrastructure/`?
- Over time, the structure drifts and becomes inconsistent.
- Layers are a *deployment* concern, not a *knowledge* concern.

**Verdict:** ❌ Rejected

### Option B — Knowledge domains (`distributed-systems/`, `database/`, `architecture/`)

**Pros:**
- Domains are stable. `distributed-systems/` will always be the right home for RabbitMQ, Kafka, CQRS, Saga, and Outbox patterns.
- Maps to how knowledge is actually applied: interview discussions, architecture reviews, and blog posts.
- No ambiguity: each concept has exactly one correct home.

**Cons:**
- Requires domain thinking upfront. "Where does this go?" needs a deliberate answer the first time.

**Verdict:** ✅ Accepted

## Why

Tech-stack categories are an *implementation* view. Knowledge domains are a *conceptual* view. A Second Brain should organize knowledge by concept, not by where it is deployed.

When you are preparing for a system design interview about messaging systems, you want to find RabbitMQ, Kafka, Redis Streams, and NATS together — not scattered across `backend/` and `infrastructure/`.

## Evidence

- Zettelkasten methodology: notes are organized by concept, not by project or technology.
- Google's SRE handbook organizes chapters by domain (Reliability, Monitoring, Postmortems) — not by service layer.

## Decision Confidence

**High.** Domain organization is consistent with established knowledge management research (Zettelkasten, Building a Second Brain by Tiago Forte).

## Future Revisit

Reconsider if the `distributed-systems/` domain becomes too large (>50 notes). At that point, subdivide into `messaging/`, `consensus/`, `storage/` — but keep the domain-first principle.
