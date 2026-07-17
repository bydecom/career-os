---
title: Candidate Knowledge Graph Platform
status: Vision
priority: Someday
created: 2026-07
owner: Thai Minh Bang
related: CareerOS (seed architecture / Knowledge Compiler lineage)
---

# Candidate Knowledge Graph Platform

> Vision Brief — why this exists, not a technical backlog.  
> Seeded from lessons building CareerOS (Knowledge Graph as SoT; Resume as one projection).

---

## Vision

Traditional resumes compress years of experience into one or two pages.

They lose architecture decisions, tradeoffs, reasoning, failed attempts, growth, and the relationships between projects, technologies, and knowledge.

This platform aims to replace the resume as the **primary source of truth**.

Instead of storing documents, it builds a living **Candidate Knowledge Graph** that continuously evolves through conversations.

The resume becomes only one projection of that graph.

---

## Core Idea

The platform interviews a candidate using AI.

Instead of generating a disposable summary, it continuously extracts structured knowledge and links it into a graph.

```text
Resume
        +
Portfolio
        +
GitHub
        +
Conversation
        +
Future Updates
        │
        ▼
Candidate Knowledge Graph
```

Every new interview **enriches** the graph rather than replacing previous information.

Knowledge accumulates.

---

## Philosophy

Documents are outputs.

Knowledge is the asset.

The Knowledge Graph is the single source of truth.

Everything else is generated from it.

```text
Knowledge Graph
      │
      ├──────── Resume
      ├──────── Portfolio
      ├──────── Interview Answers
      ├──────── Cover Letter
      ├──────── LinkedIn Profile
      ├──────── Recruiter Report
      └──────── Skill Timeline
```

This is the same projection model CareerOS proved in miniature: compile once, project many times.

---

## Product Goal

Create the most complete digital representation of a professional engineer.

Not just:

> “I know Redis.”

Instead:

```text
Redis
├── Used in CareerOS
├── Used in GraphRAG
├── Cache Layer
├── Distributed Lock
├── Pub/Sub
├── Tradeoffs
├── Performance Lessons
├── Architecture Decisions
└── Evidence
```

Knowledge should be **connected**.

---

## User Journey

### Step 1 — Ingest

Upload:

- Resume
- Portfolio
- GitHub
- LinkedIn (optional)

### Step 2 — Bootstrap graph

AI extracts an initial graph:

```text
Projects · Skills · Companies · Experiences
Technologies · Achievements · …
```

### Step 3 — Interview for gaps

AI starts interviewing.

Instead of random questions, it identifies **missing knowledge**.

Example:

```text
CareerOS
    ↓
Redis detected
    ↓
No architecture decision found
    ↓
Ask: Why Redis instead of PostgreSQL as a cache?
```

Every answer updates the graph.

### Step 4 — Richer than the resume

Conversation ends.

The graph is now significantly richer than the uploaded documents alone.

---

## Knowledge Graph (sketch)

### Node types

```text
Person · Experience · Project · Capability · Technology
Concept · Pattern · Decision · Tradeoff · Evidence
Achievement · Research · Certification · Education
Language · Company
```

### Relationships

```text
USED · CREATED · IMPLEMENTS · DEPENDS_ON · RELATED_TO
HAS_CAPABILITY · PROVES · LEARNED_FROM · WORKED_AT
IMPROVED · MENTORED · DESIGNED
```

(Exact ontology evolves; the ladder Capability → Pattern / Concept / Decision / Evidence should stay first-class.)

---

## Interview Engine

The interview is **not** a chatbot.

It is a **graph enrichment engine**.

```text
Question
    ↓
Retrieve candidate graph
    ↓
Find missing information
    ↓
Generate follow-up questions
    ↓
Extract structured knowledge
    ↓
Validate
    ↓
Merge into graph
    ↓
Repeat
```

Objective: **graph completeness** — not conversation length.

UI should expose **System Trace** (what the runtime did) and **Knowledge Trace** (which nodes/evidence were used), not fake LLM “thinking.”

---

## Candidate Score

Instead of ATS keyword matching, measure **graph quality**.

### Coverage

```text
Redis → Cache · Cluster · Persistence · Pub/Sub · Streams · Locks
```

### Evidence density

```text
Technology → Project → Decision → Evidence → Metrics
```

### Confidence

```text
Resume only
    ↓
Resume + Conversation
    ↓
Resume + GitHub
    ↓
Multiple evidence sources
```

---

## Recruiter View

Instead of reading resumes, recruiters **explore knowledge**.

```text
Backend · Architecture · System Design · Testing · Cloud · Leadership
```

Expanding one node shows:

```text
Projects · Evidence · Tradeoffs · Code · Interview Answers · Confidence
```

Search by **capability graph**, not keywords.

---

## Candidate View

Candidates own their graph. From the same SoT they can generate:

- Resume
- Portfolio
- Interview preparation
- Cover letter
- Skill gap analysis
- Career roadmap
- Learning recommendations

---

## Knowledge Growth Engine

The graph is not only for *reading* a candidate — it **detects knowledge gaps** and directs growth.

Example — Backend / Distributed Systems subgraph:

```text
Distributed Systems
    │
    ├── Consistency          ✅
    ├── Replication          ✅
    ├── CAP Theorem          ✅
    ├── Raft                 ❌
    ├── Paxos                ❌
    ├── Gossip Protocol      ❌
    └── Event Sourcing       ❌
```

The system infers:

> You are around Intermediate Backend. To move toward Senior, the highest-leverage missing topics are Raft, Gossip Protocol, and Event Sourcing.

So the product becomes:

| Mode | Job |
|------|-----|
| Enrichment interview | Fill missing Decision / Evidence / Tradeoff nodes |
| Growth interview | Target gaps that unblock the next seniority level |
| Learning loop | Recommend resources → re-interview → mark nodes ✅ |

This is the long-term differentiator versus ATS tools and AI resume builders: **a living professional identity that also coaches upward.**

---

## Future Features

- Graph Explorer
- Capability Pages
- Timeline View
- Knowledge Diff (what changed since last interview)
- Growth Tracking
- Mock Interviews
- Company-specific Interview Packs
- Learning Recommendations
- Certification Planning

---

## Business Models (sketch)

### Candidate

Monthly subscription — unlimited interviews, resume / portfolio generation, career coaching via Growth Engine.

### Recruiter

Search candidates by capability graph, not keywords.

### Enterprise

Internal employee knowledge graphs — training maps, skill inventories, succession planning.

### API

```text
Upload → Conversation → Knowledge Graph → JSON
```

Integrate into ATS / HR systems.

---

## Relationship to CareerOS

CareerOS is the **personal, author-first** proof: Markdown → Knowledge Graph → Resume / Narrative / Interview projections.

This platform generalizes that idea:

| CareerOS | This platform |
|----------|----------------|
| You author Markdown | System interviews + ingests many sources |
| One candidate (you) | Many candidates |
| Hire-demo / portfolio | Product / SaaS |
| Manual curation early | Continuous graph enrichment |

Reuse where it helps: ontology thinking, hybrid retrieval, Conversation as Planner output, Execution / Knowledge traces, Narrative vs Resume projections.

Do **not** fork CareerOS blindly — extract principles; ship a new product surface.

---

## Long-Term Vision

A resume is a snapshot.

A Knowledge Graph is a living representation of a person's professional identity.

The platform should become the **operating system for professional knowledge** — not another resume builder.

---

## Someday checklist (when spinning up the new repo)

1. Copy this brief into the new repo as `docs/00-vision/vision-brief.md` (or equivalent).
2. Decide v0 slice: ingest resume → bootstrap graph → 10 gap-filling questions → export JSON + one Narrative page.
3. Defer Growth Engine scoring until enrichment interview loop works end-to-end.
4. Keep CareerOS as the reference implementation for compiler / projection philosophy.
