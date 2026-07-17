# Future work: Knowledge Operating System

**Date:** 2026-07-16  
**Status:** Parked — architecture locked in discussion; **do not implement** until Hire Demo URL + CSM/portfolio story are recruiter-convincing.  
**Trigger to unfreeze:** Public demo stable + Principle #0 apply loop underway.

> Related (done instead of this): curated CSM story — `career-data/nodes/project/conversational-state-machine.md`, Project Detail, Featured card.

---

## Why this exists

A planning session correctly designed CareerOS as a **Knowledge Operating System**, then scope-crept a one-project story task into a 3–6 week redesign. This file parks that architecture so it is not lost — and not started too early.

**Tonight’s rule:** manually curate Narrative depth. Compiler extract comes later.

---

## Target architecture (locked names)

```text
Knowledge Graph (SoT)
        │
        ├──────────────────┐
        │                  │
        ▼                  ▼
Resume Projection    Conversation Projection
(~200 words)         (Planner output — structured
                      package, NOT Candidate Subgraph,
                      NOT a raw graph dump)
        │
        ▼
Narrative Projection
(knowledge as story — Project / Capability /
 About / Demo / Blog / PDF / Slides)
```

| Do not use long-term | Use instead |
|---|---|
| PortfolioIR | **Narrative Projection** |
| Presentation Projection | **Narrative Projection** |
| “Thinking” for interview UI | **System Trace** (UI may say Execution Trace) |

### Conversation Projection shape (Planner output)

```text
KG → Hybrid Retrieval → Candidate Subgraph → Conversation Planner
  → Conversation Projection → Prompt Builder → LLM
```

Suggested fields:

```ts
ConversationProjection {
  question
  narrative            // speaking strategy / story arc
  orderedFacts
  evidence
  confidence
  missingKnowledge?
  interviewGoal?
  relevantCapabilities?
}
```

---

## Capability fan-out (siblings, not a linear ladder)

```text
Capability
    ├── Pattern
    ├── Concept
    ├── Decision
    ├── Tradeoff
    ├── Runtime Object
    ├── Runtime Service
    └── Evidence
```

Example (CSM):

```text
Dialogue Runtime
  ├── Pattern: Slot-first Detection
  ├── Pattern: LIFO Stack
  ├── Runtime Object: ContextObject
  ├── Runtime Service: context.service.ts
  └── Evidence: tests
```

**Pattern ≠ Concept:** Pattern = reusable design; Concept = domain knowledge. They are siblings under Capability.

---

## Author content → compiler builds graph

- Markdown authors **Runtime Pipeline** as a **numbered list** only.
- Compiler later emits `PipelineStep` + `NEXT` edges. Authors never author a DAG.
- **Evidence buckets:** Implementation / Validation / Measurement (not one undifferentiated blob).

---

## Two traces → two UI tabs

| Tab | Name | Answers | Content |
|---|---|---|---|
| **Runtime** | System Trace (Execution Trace in UI OK) | What did the system do? | Retrieve → Rank → Expand → Plan → Prompt → LLM |
| **Knowledge** | Knowledge Trace | What knowledge was used? | Project → Capability → Pattern → Evidence |

Independent. Do not conflate.

**Capability Explorer** (deferred pages):

```text
/capability/dialogue-runtime
/capability/hybrid-retrieval
/capability/graphrag
/capability/schema-builder
```

Ontology must allow Capability as first-class; pages after URL.

---

## Recommended unfreeze order (demo value first)

1. System / Execution Trace polish (expand/collapse — largely on `/interview` already)
2. Knowledge Trace UI (Runtime | Knowledge tabs; bridge from selected evidence until typed KG)
3. Enrich more project markdown graph-ready (Capabilities, Runtime Pipeline list, Evidence buckets)
4. Capability ontology as typed entities
5. Capability pages `/capability/...`
6. Compiler extract from `## Capabilities`, `## Runtime Objects`, `## Runtime Services`, `## Runtime Pipeline`

---

## Interview acceptance test (when Knowledge Trace exists)

Ask: *Explain interruption handling.*

| Result | Verdict |
|---|---|
| Only `Project → Summary` | Fail |
| `Project → Capability: Dialogue Runtime → Pattern: LIFO → Object: ContextObject → Evidence: context.service.ts + tests` | Pass |

---

## Explicitly out of scope until unfreeze

- Full Semantic Analyzer extract for Capability / Pattern / Object / Service
- Rewriting ResumeIR to be deep (Resume stays shallow by design)
- Building Capability Explorer before public demo
- Renaming every historical “PortfolioIR” string in old docs in one sweep

---

## Pointers

| Doc | Role |
|---|---|
| [Roadmap](../../../docs/00-vision/09-roadmap.md) | Weekly hire-first checklist |
| [Dual roadmaps + deploy](./hire-demo-deploy-and-review.md) | Hire vs product milestones |
| [Deferred add-ons](./deferred-addons-pdf-image-conversation.md) | PDF / image / conversation unfreeze |
| [Local media assets](../../../career-data/assets/README.md) | Obsidian `![[…]]` embeds · `career-data/assets/<project-id>/` |
| [Candidate KG Platform (Vision)](../../../docs/someday/candidate-knowledge-graph-platform.md) | **Someday** side product — interview-driven Candidate Knowledge Graph + Growth Engine |
| CSM source (curated now) | `career-data/nodes/project/conversational-state-machine.md` |
