# Second Brain — Knowledge Authoring Skill

> **This file is an AI Skill Harness.**
> Any AI assistant that reads this file before writing a note will produce output
> that is consistent with the CareerOS Second Brain standards.
>
> Feed this file to your AI (Cursor, Claude, ChatGPT, Gemini) as context before asking
> it to write any knowledge note for this project.

---

## What is this folder?

`knowledge/` is the **Second Brain for the CareerOS project itself**.

It documents everything learned and every decision made **while building this specific project**. It is NOT a general personal wiki. It is NOT career history.

### The Boundary

| | `career-data/` | `knowledge/` (this folder) |
|---|---|---|
| **Scope** | Entire career — all companies, all past projects | **This project only** — CareerOS |
| **What it stores** | Facts: "I used RabbitMQ at FPT" | Reasoning: "Why I chose remark over markdown-it for the Compiler" |
| **Who writes it** | Human author (from Master CV) | Human author + AI assistant (while building) |
| **Who reads it** | Compiler → Graph → Recruiter | Author (self-learning) + optionally published |
| **Format** | Short metadata nodes (YAML-heavy, ~20 lines) | Long-form reasoning (Markdown-heavy, 100+ lines) |
| **Schema-validated?** | ✅ Must pass ontology validation | ❌ Freeform, but encouraged to follow this guide |

### Two types of notes in `knowledge/`

1. **Learning notes** (`knowledge/distributed-systems/rabbitmq.md`)
   What I learned about a technology *while building CareerOS*. First principles, tradeoffs, failure modes.

2. **Decision notes** (`knowledge/career-os/why-edges-are-compiler-output.md`)
   Why I made a specific engineering decision *in this project*. Alternatives, evidence, confidence, future revisit triggers.

---

## The 10 Authoring Rules

### Rule 1 — Atomic: One Note, One Idea

Each note covers exactly one concept. If you find yourself writing two `##` headings that could stand alone, split them into separate notes.

```
❌ redis.md covering: Cache + Pub/Sub + Streams + Persistence
✅ redis.md        → core concept + when to use + tradeoffs
✅ redis-pubsub.md → links to [[redis]]
```

### Rule 2 — Answer "Why", Not "What"

The internet has documentation. Your Second Brain stores reasoning.

```
❌ "RabbitMQ is an open-source message broker that implements AMQP."
✅ "I chose RabbitMQ over Redis Pub/Sub because I needed message durability
    and dead-letter queues for the order processing pipeline."
```

### Rule 3 — Use the Standard Structure

Every knowledge note should follow this skeleton:

```markdown
## Problem
What situation makes this knowledge relevant?

## Solution / Concept
The core idea, derived from first principles. As short as possible.

## Why (First Principles)
Derive the concept from fundamentals, not from documentation.

## Tradeoffs
What does this cost? What does it break? What are the alternatives?

## Alternatives Considered  ← especially for decision notes
Option A: pros, cons, verdict.
Option B: pros, cons, verdict.

## Failure Modes
How does this fail in production? What are the edge cases?

## Evidence
Benchmarks, commits, diagrams, ADRs that support the claims.

## Real-World Usage
Specific examples from your own projects. Use [[wiki-links]].

## Decision Confidence  ← for decision notes
High / Medium / Low + reasoning.

## Future Revisit  ← for decision notes
Under what conditions should this decision be reconsidered?

## Used In
- [[project-name]] — how it was used
```

Not every section is mandatory. But skipping one should be a conscious choice, not an oversight.

### Rule 4 — No Documentation Copying

If a section reads like it was pasted from the official docs, delete it.

```
❌ "Redis supports various data types including strings, hashes, lists, sets..."
✅ "The data types that matter for my use cases: Hash (session storage),
    Sorted Set (leaderboards), String with TTL (cache invalidation)."
```

### Rule 5 — Evidence for Performance Claims

If you write a number, cite a source. No exceptions.

```
❌ "Redis reduced latency significantly."
✅ "Redis reduced p99 latency from 200ms to 8ms. Benchmark: [[graphrag-benchmark-2026]]."
```

Acceptable evidence: benchmark result, commit hash, ADR reference, diagram, screenshot.

### Rule 6 — Link, Don't Duplicate

If a concept is already explained in another note, use `[[wiki-link]]`. Do not re-explain it.

```
❌ Explaining TTL in both redis.md and session-management.md
✅ session-management.md: "Uses TTL via [[redis]] to auto-expire sessions."
```

### Rule 7 — End With "Used In"

Every note about a technology or pattern must list real projects where you used it. This is how the Compiler builds `USES` edges.

```markdown
## Used In

- [[graphrag-code]] — primary message broker for async pipeline
- [[ecommerce-platform]] — order event streaming with DLQ
```

### Rule 8 — Write From First Principles

Start from the problem a technology solves. Derive the solution.

```
Redis exists because:
  Problem   → Disk I/O is slow for hot data
  Solution  → Keep frequently accessed data in RAM
  Constraint → RAM is expensive → use TTL for eviction
  Extension → Need atomicity → CAS operations, Lua scripts
```

### Rule 9 — No Tutorial Style

Notes are not step-by-step guides. They are reasoning artifacts.

```
❌ "Step 1: Install Redis. Step 2: Connect. Step 3: Set a key."
✅ "Critical production config: maxmemory-policy must be allkeys-lru.
    Without it, Redis rejects all writes when memory is full."
```

### Rule 10 — No Duplicated Knowledge

If `redis.md` already explains TTL, then `rabbitmq.md` should NOT re-explain TTL. Link instead.

---

## For Decision Notes (`knowledge/career-os/`)

Decision notes use the same structure above, but MUST include these additional sections:

1. **Alternatives Considered** — Every option you evaluated, with pros/cons and verdict (Accepted/Rejected).
2. **Decision Confidence** — High / Medium / Low + why you're confident or uncertain.
3. **Evidence** — External references (compiler literature, industry patterns) or internal references (ADRs, benchmarks).
4. **Future Revisit** — Specific trigger conditions for reconsidering the decision.

---

## Knowledge Quality Checklist

Before saving any note, verify:

- [ ] Covers exactly **one concept** (Rule 1)
- [ ] Explains **"Why"**, not just "What" (Rule 2)
- [ ] Follows the **standard structure** (Rule 3)
- [ ] Does **not** read like official documentation (Rule 4)
- [ ] Performance claims have **evidence** (Rule 5)
- [ ] Uses `[[wiki-links]]` instead of duplicating content (Rule 6)
- [ ] Ends with `## Used In` listing real projects (Rule 7)
- [ ] Derives concepts from **first principles** (Rule 8)
- [ ] Is **not** a tutorial or step-by-step guide (Rule 9)
- [ ] No content is **duplicated** from another note (Rule 10)

For decision notes, also verify:
- [ ] Lists **Alternatives Considered** with verdicts
- [ ] States **Decision Confidence** level
- [ ] Provides **Evidence** (not just "I think...")
- [ ] Defines **Future Revisit** triggers

---

## AI Instructions

When an AI assistant is asked to write or help write a Second Brain note, it **must**:

1. **Read this entire file** before generating any content.
2. **Follow all 10 rules** strictly. Violations are unacceptable.
3. **Never introduce unverified facts.** If uncertain, write: `> ⚠️ Unverified — author to confirm`.
4. **Use `[[wiki-links]]` liberally.** Every referenced technology or concept that might have its own note should be linked.
5. **Do NOT write the `## Used In` section.** Only the human author knows which projects genuinely used this. Leave: `> TODO: Author to add real project references`.
6. **Do NOT copy documentation.** If a sentence could appear on the official website, delete it.
7. **Prefer short, dense prose** over verbose explanations. This is a Second Brain, not a blog.
8. **For decision notes:** Always include Alternatives Considered, Decision Confidence, Evidence, and Future Revisit. Never skip these.
9. **Run the Quality Checklist** mentally before considering the note complete.
10. **Ask the author** if you're unsure about domain-specific details rather than hallucinating an answer.
