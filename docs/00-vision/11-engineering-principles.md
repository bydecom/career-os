# Engineering Principles

**Author:** Bang Thai Minh  
**Status:** Accepted  
**Version:** 1.1  
**Date:** 2026-07-14  

---

These are the **laws of play** for CareerOS.

They are not an architecture catalog. They are engineering discipline.
Architecture lives in ADRs and the [Platform Capability Map](./10-platform-capability-map.md).
Shipping lives in the [Roadmap](./09-roadmap.md).
Product freeze lives in [99-v1-definition.md](./99-v1-definition.md).

When a fun idea conflicts with these principles, the principles win.

---

## 0. CareerOS serves the job — then the job feeds CareerOS

**CareerOS exists to get you hired; the job then feeds CareerOS — never the other way around.**

Do not postpone applications to "finish" the platform.
Ship a demo-worthy v1.0, use it to open opportunities, then grow the platform without deadline panic.

---

## 1. Don't speculate

Do not build Optimizer / Agent / Planner because they "sound right."
Build them when **logs and golden queries** prove a concrete failure mode.

## 2. Compiler first

Markdown is source code. The Knowledge Graph is IR.
Never hand-edit compiled artifacts as source of truth.

## 3. Everything deterministic before LLM

Metadata → Graph → Lexical → Vector → LLM.
The LLM never becomes the database.

## 4. Evidence before optimization

Measure retrieval, confidence, latency, and answer quality **before** redesigning the pipeline.

## 5. Measure before redesign

If you cannot show a metric or a failing case, you are not redesigning — you are doodling.

## 6. Vertical slices over horizontal layers

Prefer `compile → ask → resume → portfolio` end-to-end over finishing every abstraction layer first.

## 7. No abstraction before duplication

Do not invent Skills / Harness / Dispatcher until at least two call sites hurt without them.

## 8. Runtime never mutates Knowledge

Only the Compiler writes the Knowledge IR.
Retriever, Conversation, LLM, Views, and Adapters are read-only consumers.

## 9. Compile, don't copy

Resume, Portfolio, Chat, Cover Letter, MCP responses are **projections**.
Do not maintain parallel copies of the same facts.

## 10. LLM verbalizes, never invents

The LLM receives ConversationIR (or a Skill result) and turns it into language.
It must not create net-new career facts.

---

## Operating cadence

| Artifact | Update rhythm | Purpose |
|---|---|---|
| [Roadmap](./09-roadmap.md) | Weekly | What ships next |
| [Capability Map](./10-platform-capability-map.md) | Every 3–6 months | Long-range platform shape |
| [v1.0 Definition](./99-v1-definition.md) | Locked | Product freeze for job-seeking demo |
| This file | Rarely | Discipline — change only with a strong reason |

**Never merge the Capability Map into the shipping roadmap** just because an idea is exciting.
