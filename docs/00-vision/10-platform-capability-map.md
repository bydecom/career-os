# Platform Capability Map

**Author:** Bang Thai Minh  
**Status:** Draft (long-range architecture)  
**Version:** 1.1  
**Date:** 2026-07-14  
**Update cadence:** every 3–6 months (not weekly)

---

> **CareerOS exists to get you hired; the job then feeds CareerOS — never the other way around.**  
> ([Engineering Principle #0](./11-engineering-principles.md) · [v1.0 Definition](./99-v1-definition.md))
>
> **Knowledge is the product. Skills are the interface. Protocols are just adapters.**

This document is the **5-year shape** of CareerOS.
It does **not** replace [09-roadmap.md](./09-roadmap.md).

| Document | Rhythm | Question it answers |
|---|---|---|
| [Roadmap](./09-roadmap.md) | Weekly | What do we ship this week? |
| **This map** | 3–6 months | If CareerOS lives 5 years, what is it? |
| [Engineering Principles](./11-engineering-principles.md) | Rarely | What are the laws of play? |

**Do not merge this map into the shipping roadmap** because an idea is fun. That is how platforms die with 0 users.

---

## 0. v1.0 vs living platform

CareerOS is a **living project**. Nobody "finishes" it.

**v1.0 (job-seeking / demo)** — freeze ~70% of ambition:

```text
Knowledge → Compile → Ask → Resume → Portfolio
```

A stranger clones the repo and runs:

```bash
career compile
career ask "Why RabbitMQ?"
career resume
career portfolio
```

**v2+ (after you have a job / users / evidence):** Skills, Evaluation Platform, Optimizer, Agent loop, MCP adapters, Intent Planner.

The danger is not that the project is too big.
The danger is that the project is **too fun** — refactor forever, never send the CV.

Use CareerOS to **get the job**. Let the job feed CareerOS later.

---

## 1. What changed

| Then | Now |
|---|---|
| AI Resume Builder | Knowledge Platform |
| Business capabilities | Core platform capabilities |
| MCP as a goal | MCP as one protocol adapter |
| Chatbot as the product | Conversation as one runtime path |
| "Change the prompt and pray" | Evidence via Evaluation Platform (logs → pain → change) |

### Sharpened vision

> CareerOS is a Knowledge Platform that compiles knowledge into reusable runtime capabilities. Every output—Resume, Portfolio, Chatbot, MCP, or API—is simply a different projection of the same compiled Knowledge Graph.

Related: [00-project-vision.md](./00-project-vision.md), [philosophy.md](./philosophy.md).

---

## 2. Capability stack

ConversationIR is a **first-class citizen** (not an implementation detail of chat).

### ConversationIR today (Phase 3A)

- Question
- Anchor nodes + candidate nodes (evidence excerpts)
- Related edges
- Grouped sections
- Retrieval trace (deterministic reasoning input)
- **Retrieval confidence** (0–1 from contributing engines)

### ConversationIR later (v2+, aspirational — not implemented)

- Explicit missing-knowledge signals
- Follow-up question suggestions
- Audience / style fields
- Richer evidence / metric attachments

```text
Knowledge (Markdown source)
      ↓
Compiler                         ← Phase 1 ✅
      ↓
Knowledge IR (Graph + SQLite + Vectors)
      ↓
Runtime                          ← Phase 2–3 ✅ / evolving
  Retriever · LLM ports · (future) Skill Dispatcher
      ↓
ConversationIR                   ← first-class IR for verbalization
      ↓
Skills (domain interface)        ← v2+
  search_nodes · graph_neighbors · explain_decision · compile_resume · …
      ↓
Adapters / Protocols             ← user-facing "interfaces", not architecture vanity
  CLI · Chat · Resume · Portfolio · REST · MCP · …
      ↓
Views (projections of Knowledge + ConversationIR)
      ↓
Evaluation Platform (Harness)    ← v2+ measurable evolution
  Replay · Golden Dataset · Regression · Latency · Hallucination · Cost · A/B
```

User value language for adapters / views:

> I can ask. I can export. I can sync.

Skills are how we implement that — users never need to know the word "Skill."

LLM / agents must **not** know MCP. They only call Skills (or receive ConversationIR to verbalize).

---

## 3. Why Skills before MCP

Wrong: `MCP Request → business logic`  
Right: `Skill → MCP / REST / CLI adapters`

Protocols change. Domain Skills should not.

---

## 4. Agent loop (v2+ aspiration)

```text
career ask "Why RabbitMQ?"
        ↓
needs evidence → JournalSearch / ProjectLookup / GraphTraversal Skills
        ↓
build ConversationIR
        ↓
LLM verbalizes only
```

---

## 5. Evaluation Platform (Harness)

Also called Harness. Prefer **Evaluation Platform** when talking to humans — it sounds measurable.

Evaluation Platform ≠ CI/CD.

| Evaluation Platform | Automation (CI/CD) |
|---|---|
| Replay historical queries | Deploy on push |
| Golden dataset + regression | Auto-embed |
| Prompt / retrieval A/B | Auto-compile |
| Latency / cost / hallucination | Vercel redeploy |

```text
Query → Runtime → Answer
              ↑
     Evaluation Platform
   log · evaluate · replay · report
```

Scaffold today: `packages/harness/` (name kept; product name = Evaluation Platform).  
Seed data already exists: `query-logs.jsonl`, `conversation-logs.jsonl`.

---

## 6. Long-range phase rename (NOT shipping order)

See historical table in git history / previous revisions if needed.
**Active shipping order remains [09-roadmap.md](./09-roadmap.md).**

Future merge target (~v4.0): Compiler → Runtime → Conversation → Skills → Views → Authoring → Evaluation → Automation.

---

## 7. Discipline

1. Ship vertical slices on the weekly roadmap.
2. Touch this map only every 3–6 months (or when vision truly shifts).
3. No new packages for fun — [Engineering Principles](./11-engineering-principles.md) §7.
4. Optimizer / Agent only after Evaluation Platform evidence.
5. Signature project energy is good; **shipping for the job** comes first.
