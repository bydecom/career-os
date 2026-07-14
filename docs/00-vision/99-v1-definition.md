# CareerOS v1.0 Definition

**Status:** Locked  
**Version:** 1.0  
**Date:** 2026-07-14  

---

> **CareerOS exists to get you hired; the job then feeds CareerOS — never the other way around.**

This file is the **product freeze** for v1.0.  
After this document is accepted, do **not** expand vision, phases, or packages for fun. Only ship code that moves v1.0 to Done.

Long-range ideas live in [10-platform-capability-map.md](./10-platform-capability-map.md) (update every 3–6 months).  
Discipline lives in [11-engineering-principles.md](./11-engineering-principles.md).  
Weekly work lives in [09-roadmap.md](./09-roadmap.md).

---

## What v1.0 is

A stranger clones the repo and can complete this path without hand-editing generated artifacts:

```text
Write knowledge in Markdown
        ↓
Compile → Knowledge Graph
        ↓
Ask the AI about any experience
        ↓
Generate a Resume
        ↓
Generate / open a Portfolio
```

### Commands / surfaces (Definition of Done)

| Deliverable | Done when |
|---|---|
| `career compile` | Compiles without schema/ontology errors; emits `graph.json` + `graph.db`; unit/integration tests pass |
| `career ask "..."` | Answer is grounded in ConversationIR; reasoning is deterministic; confidence is shown; no invented employers/projects/metrics |
| `career resume` | Master Markdown renders from the graph only (`ResumeIR`); no Retriever/LLM; usable for applications (HTML/PDF follow) |
| `career portfolio` (or deployed web) | Deployable in one documented flow; **100% of career facts** come from the compiled graph — no duplicate content store |

If these four work, CareerOS v1.0 is **complete as a product**. Everything else is enhancement.

---

## Explicitly out of scope for v1.0 (→ v2+)

- MCP / Discord / extra protocol adapters (unless a hard demo constraint appears)
- Knowledge Skills registry & agent tool loop
- Evaluation Platform (Harness) beyond existing JSONL logs
- Optimizer passes, Intent Planner, multi-audience Strategy
- Authoring IDE plugins, full Automation/CI empire

Scaffold folders and Capability Map entries may exist. **Do not implement them until v1.0 is Done.**

---

## How to use this lock

1. Before starting work: does it unblock `compile` / `ask` / `resume` / `portfolio`? If no → defer.
2. Tempted to add a package or phase? Re-read this file.
3. Vision changes: only via Capability Map cadence (3–6 months), never mid-sprint.

**Vision is stable. Implementation evolves.**
