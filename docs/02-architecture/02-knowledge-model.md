# Knowledge Model (Ontology)

**Author:** Bang Thai Minh  
**Status:** Accepted  
**Version:** 2.0  

---

## The Knowledge Backbone

The core philosophy of CareerOS is that a developer's expertise is not defined by *where* they worked or *what* they built, but by **how they solve problems**.

Traditional CV models treat Projects and Companies as the primary entities. CareerOS treats them merely as the context. The true spine of the ontology is the engineering thought process:

**`Problem` ➔ `Decision` ➔ `Implementation` ➔ `Metric` ➔ `Evidence` ➔ `Lesson`**

---

## Node Taxonomy

Knowledge in CareerOS is classified into distinct Node types.

### The Problem Space
- **Problem**: A technical or business bottleneck (e.g., "Database Bottleneck", "Concurrent Update Race Condition").
- **Metric**: Raw, objective measurements (e.g., "Latency: 2s → 10ms", "Precision: 0.98").
- **Experiment**: A comparative trial (e.g., "Bidirectional vs Unidirectional PPR").

### The Solution Space
- **Decision**: An architectural or technical choice, including alternatives and trade-offs. (e.g., "Use Redis Cache Layer").
- **Technology**: Core technical stacks and libraries (e.g., "RabbitMQ", "Redis", "Next.js").
- **Tool**: Software used to enable work (e.g., "Postman", "Figma", "Cursor").
- **Architecture Concept**: System design paradigms (e.g., "Microservices", "CQRS", "Event-Driven").
- **Business Concept**: Domain-specific logic (e.g., "Inventory Management", "Checkout Flow").
- **Evidence**: Artifacts proving the work (e.g., Benchmarks, Architecture Diagrams, Code Commits).
- **Lesson**: Condensed wisdom (e.g., "Never cache auth tokens").

### The Context Space
- **Project**: A specific initiative where decisions were applied.
- **Experience**: A role or timeline period.
- **Company**: The organization where the experience took place.

---

## Edge Taxonomy

Edges define the relationships between nodes. They are strictly directional to enable natural language traversal.

### 1. Structural Edges
Define physical or chronological containment.
- `BELONGS_TO` (Project ➔ Experience)
- `PART_OF` (Feature ➔ Project)
- `WORKED_AT` (Experience ➔ Company)
- `USES` (Project ➔ Technology)
- `HAS` (Project ➔ Decision)

### 2. Semantic Edges
Define logical and technical reasoning.
- `SOLVES` (Decision ➔ Problem)
- `CAUSES` (Decision ➔ Problem)
- `SUPPORTS` (Decision ➔ Decision)
- `CONFLICTS_WITH` (Concept ➔ Concept)
- `DEPENDS_ON` (Technology ➔ Technology)
- `ENABLES` (Technology ➔ Decision)

### 3. Evidence Edges
Define proof and validation.
- `PROVES` (Evidence ➔ Lesson)
- `MEASURED_BY` (Decision ➔ Metric)
- `VALIDATES` (Evidence ➔ Metric)
- `REFERENCES` (Lesson ➔ Concept)

### 4. Inheritance Edges
Define hierarchical ontologies.
- `IS_A` (RabbitMQ ➔ Message Broker)

---

## Ontology Rules (Strict Constraints)

To prevent the Knowledge Graph from becoming a messy web, CareerOS enforces strict reasoning rules. The Graph Compiler will reject invalid relationships.

1. **A Technology cannot solve a Problem.**
   - ❌ WRONG: `Redis` ➔ `SOLVES` ➔ `Latency`
   - ✅ RIGHT: `Redis` ➔ `ENABLES` ➔ `[Decision: Redis Cache Layer]` ➔ `SOLVES` ➔ `[Problem: Latency]`

2. **Projects do not solve Problems. Decisions do.**
   - Projects merely `IMPLEMENT` Decisions.

3. **Achievements are not Nodes.**
   - "Reduced latency by 90%" is a View. The underlying Knowledge consists of a `Metric` ("Latency: 2s -> 10ms") which is `MEASURED_BY` a `Decision`, which `SOLVES` a `Problem`.

---

## Example Reasoning Trajectory

When a recruiter asks: *"Why did you use Redis in the E-Commerce project?"*

The AI Assistant traverses the graph precisely according to the ontology rules:

```text
[Technology: Redis]
       │
     (IS_A) ──▶ [Concept: In-memory Cache]
       │
    (ENABLES)
       │
       ▼
[Decision: Implement Redis Cache Layer]
       │
    (SOLVES) ────────┐
       │             ▼
       │      [Problem: Database Bottleneck]
       │
  (MEASURED_BY) ─────┐
       │             ▼
       │      [Metric: Latency 2s → 10ms]
       │             │
       │       (VALIDATED_BY)
       │             │
       │             ▼
       │      [Evidence: benchmark.md]
       │
 (IMPLEMENTED_IN)
       │
       ▼
[Project: E-Commerce Platform]
```

This rigid ontology allows the LLM to construct an answer that is technically profound, causally accurate, and fully backed by evidence.
