# Markdown Schema (The Source Code)

**Author:** Bang Thai Minh  
**Status:** Accepted  
**Version:** 3.0  

---

## 1. Directory Structure: A Flat Knowledge Base

CareerOS treats Markdown files as the Source Code of the Knowledge Graph. 
We explicitly **reject** organizing files into nested directories by node type (e.g., `nodes/technology/`, `nodes/project/`). Knowledge is fluid; a "Redis" node might evolve from a Technology to a Concept to an Architecture Pattern.

Instead, all knowledge lives in a flat directory, behaving like a true Zettelkasten or Wikipedia:

```text
career-data/
  ├── knowledge/
  │    ├── redis.md
  │    ├── e-commerce-platform.md
  │    ├── decoupled-order-queue.md
  │    ├── db-bottleneck.md
  │    └── fpt-software.md
  │
  └── schemas/
       ├── project-template.md
       ├── decision-template.md
       └── technology-template.md
```

The **Type** of the node is strictly defined in the YAML FrontMatter, not the folder structure.

---

## 2. YAML FrontMatter (The Metadata)

The FrontMatter acts as the strict typing system for the node. It is highly detailed and heavily validated by the parser.

### Core Fields (Required on all nodes)
```yaml
id: rabbitmq                 # Canonical ID (must match filename)
type: technology             # The Ontology Node Type
title: "RabbitMQ"            # Human-readable title
aliases:                     # Critical for NLP and Recruiter queries
  - MQ
  - Rabbit
tags:
  - message-broker
  - async
status: active               # active, deprecated, draft
version: 1.0.0               # For schema migrations
created: 2024-01-01
updated: 2026-07-13
```

### Domain-Specific Fields (Examples)
**Project:**
```yaml
role: "Lead Backend Engineer"
company: "fpt-software"      # Reference to company ID
period: "2023 - 2025"
repository: "https://github.com/bang/..."
demo: "https://..."
visibility: public
```

**Decision:**
```yaml
confidence: high             # high, medium, low
reviewed: true
evidence:
  - load-test-benchmark.md
  - architecture-diagram.png
```

---

## 3. The Body (Wiki-links & Prose)

**Crucial Design Choice:** We do NOT explicitly declare relationships in a dedicated `# Relations` block or inside the YAML. 

Relationships are purely derived from **Wiki-links** embedded naturally inside the prose. The parser acts as a Semantic Analyzer, extracting the edges based on context.

### Example (Decision Node)
```markdown
# Overview
The system was suffering from a [[Database Bottleneck]] during peak traffic.

# Context
Our monolithic application was writing directly to PostgreSQL. 

# Alternatives
- [[Kafka]]: Too operationally complex for our current team size.
- [[Redis PubSub]]: Lacked persistent message durability.

# Chosen Solution
We integrated [[RabbitMQ]] to decouple long-running AI analysis jobs. The architecture follows the [[Event-driven Architecture]] pattern.

# Metrics
This decision reduced API latency from 2 seconds to 10 ms (See [[Latency Benchmark]]).
```

---

## 4. Markdown Templates

Every Node Type has a strict internal Markdown template to ensure consistency.

### Project Template
```markdown
# Overview
# Problem
# Architecture
# Challenges
# Key Decisions
# Metrics
# Lessons Learned
```

### Decision Template
```markdown
# Problem
# Context
# Alternatives
# Trade-offs
# Outcome
# Lessons
```

---

## 5. The Parser Pipeline (The Knowledge Compiler)

Because CareerOS treats Markdown as Source Code, the Parser is not just a text reader. It is a full **Compiler Front-end** with strict semantic validation.

```text
Markdown (.md)
        │
        ▼
Lexer (remark-parse)
        │
        ▼
Markdown AST
        │
        ▼
Semantic Analyzer (Zod + Custom Logic)
   - Parses YAML FrontMatter
   - Extracts Wiki-links
   - Extracts Inline Tags & Metrics
        │
        ▼
Knowledge Object
        │
        ▼
Ontology Validator
   - Are there any orphan nodes?
   - Do all Wiki-links point to valid IDs?
   - Do edges violate Ontology rules? (e.g., Technology -> SOLVES -> Problem)
   - Do aliases conflict across nodes?
        │
        ▼
Knowledge Graph (IR)
```

By enforcing **Ontology Validation** at compile-time, CareerOS guarantees that the final Knowledge Graph is logically sound, preventing the AI Assistant from generating hallucinated or causally incorrect answers.
