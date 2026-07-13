# ADR-0003: Knowledge as Atomic Nodes

**Status:** Accepted  
**Date:** 2026-07-13  
**Owner:** Bang Thai Minh

---

# Context

Traditional resumes are documents.

Documents are optimized for human reading. They are not optimized for computation.

CareerOS is fundamentally a knowledge operating system. Knowledge should therefore be modeled independently of any presentation format.

A PDF resume, a portfolio website, an AI conversation, or an interview answer are merely different representations of the same underlying knowledge. 

Organizing data primarily by "Projects" or "Experiences" artificially traps knowledge inside those containers, making cross-cutting queries nearly impossible.

---

# Knowledge Philosophy

CareerOS does not store resumes.
CareerOS does not store portfolios.
CareerOS stores knowledge.
Everything else is generated.

The system stores knowledge, not documents.
Documents are generated. Knowledge is never generated.

---

# Requirements

The data structure must:
- Ensure knowledge has exactly one canonical definition (Single Source of Truth).
- Prevent data duplication (e.g., RabbitMQ must only be defined once, even if used in 5 projects).
- Enable Knowledge to remain completely presentation-independent. (A RabbitMQ node should not know whether it will appear in a Resume, Portfolio, or Chatbot).

---

# Considered Options

## Option A — JSON / YAML CV Schema (Documents)
### Advantages
- Standardized (e.g., JSON Resume schema).
### Disadvantages
- Deeply nested and hierarchical.
- Cross-referencing is painful.
- Updating a skill requires finding every project that mentions it.

Decision:
❌ Rejected

## Option B — Relational Graph (SQL Joins)
### Advantages
- Standard relational modeling (e.g., `Projects`, `Skills`, `Project_Skills`).
### Disadvantages
- Relationships are just foreign keys, lacking rich contextual metadata.
- Querying a deep relationship tree is computationally heavy.

Decision:
❌ Rejected

## Option C — Atomic Node-Based Structure
### Advantages
- Every entity is an atomic Node.
- Relationships are established via Edges, not nesting.
- No data duplication (Single Source of Truth).
- Infinitely flexible for querying and generation.
### Disadvantages
- Requires a mental shift when inputting data (writing wiki pages instead of a CV).

Decision:
✅ Accepted

---

# Decision

CareerOS abandons the traditional CV structure in favor of an **Atomic Node-Based Structure**. 

Every concept, technology, decision, project, and experience is a separate Markdown file (Node). They are linked together via explicit Edges (Wiki-links). A "Resume" is simply a specific, filtered traversal view of this graph.

---

# Architecture

                 Knowledge
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
 Technology      Experience      Concept
      │              │              │
      ▼              ▼              ▼
 Project        Decision       Research
      │              │
      └──────────────┴──────────────┐
                     ▼
              Knowledge Graph
                     ▼
       Resume / Portfolio / Chatbot

---

# Consequences

## Positive
- **Infinite document generation**: Resume, Portfolio, Interview, Cover Letter, LinkedIn bio—all are generated from the same source.
- Complete deduplication of knowledge.
- The system can answer highly complex, non-linear questions.

## Negative
- **Knowledge consistency becomes critical**: If a core Node has bad metadata, all downstream representations will fail.
- The initial data entry process is more fragmented.

---

# Design Principles

## Knowledge First
Knowledge exists independently of AI and presentation logic.

## Single Source of Truth
Every entity exists exactly once.

## AI is a View
LLMs are just one of many presentation layers.

## Atomicity & Composable Knowledge
Small, independent nodes compose to form complex narratives.

---

# Common Misconception

## Why not Project-first?
Many portfolio systems organize information by projects. CareerOS intentionally rejects this model.

Projects are temporary. Technologies evolve. Concepts evolve. Architectural decisions evolve. Knowledge outlives projects.

Therefore, Projects reference knowledge. Knowledge does not belong to projects.

## Presentation Logic
Knowledge should never know where it will be displayed. A RabbitMQ node should not know whether it will appear in a Resume, Portfolio, Chatbot, Cover Letter, or Interview Answer. Presentation layers decide that. Knowledge remains presentation-independent.

---

# Future Evolution
- Knowledge Versioning
- Knowledge Provenance
- Knowledge Diff
- Knowledge Merge
- Knowledge Review Workflow
