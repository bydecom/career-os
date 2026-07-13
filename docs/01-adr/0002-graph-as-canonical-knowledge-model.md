# ADR-0002: Graph as the Canonical Knowledge Model

**Status:** Accepted  
**Date:** 2026-07-13  
**Owner:** Bang Thai Minh

---

# Context

CareerOS is fundamentally a knowledge operating system.

Knowledge is not naturally hierarchical. It consists of entities connected through explicit relationships.

Examples include:
- Technology USED_IN Project
- Project BELONGS_TO Experience
- Experience WORKED_AT Company
- Concept IMPLEMENTED_BY Project
- Decision SUPPORTED_BY Evidence

Attempting to model this network using relational tables results in an explosion of join tables and increasingly complex queries.

Because GraphRAG is one of the primary retrieval mechanisms of CareerOS, the knowledge model should be graph-native rather than table-native.

---

# Requirements

The data model should:
- Support dynamic, schema-less relationships between any two entities.
- Ensure relationships are first-class citizens.
- Allow efficient traversal (e.g., "Find all skills used in projects at company X").
- Be naturally compatible with GraphRAG algorithms (like Personalized PageRank).
- Provide an intuitive mental model for plotting a career trajectory.

---

# Considered Options

## Option A — Traditional Relational Database (PostgreSQL with standard Schema)
### Advantages
- Ubiquitous and well-understood.
- Excellent data integrity and ACID properties.
### Disadvantages
- Requires many join tables (`ProjectSkills`, `ExperienceProjects`).
- Recursive queries or multi-hop traversals become extremely complex and slow.
- Does not easily support adding new types of relationships dynamically.

Decision:
❌ Rejected

## Option B — Pure Document Store (MongoDB)
### Advantages
- Flexible schema.
### Disadvantages
- No native support for complex joins or graph traversal.
- Data duplication is often required to avoid joins.

Decision:
❌ Rejected

## Option C — JSON Documents
### Advantages
- Simple and fast.
- Easy serialization.
### Disadvantages
- Relationships are implicit.
- Traversal requires recursive parsing.
- No shared graph structure.

Decision:
❌ Rejected

## Option D — Graph Data Model (Stored in SQLite/Postgres or Native Graph DB)
### Advantages
- First-class support for Nodes and Edges.
- Relationships are explicit and easy to query.
- Ideal for AI context building (GraphRAG).
- Aligns perfectly with human mental models of knowledge mapping.
### Disadvantages
- Requires custom parsing logic if stored in a relational DB.

Decision:
✅ Accepted

---

# Decision

We will treat the parsed data logically as a **Graph** (Nodes and Edges). Every parsed Markdown file becomes a Node, and every Wiki-link or FrontMatter relation becomes a directional Edge. While the underlying physical storage might be SQLite/PostgreSQL, the querying and logical architecture will remain strictly Graph-based.

## Why not Neo4j initially?

Although Neo4j is purpose-built for graph workloads, it introduces unnecessary operational complexity during the early stages.

CareerOS currently contains only hundreds to a few thousand knowledge nodes.

SQLite/PostgreSQL provides:
- easier deployment
- easier backup
- easier CI/CD
- lower infrastructure cost

The graph abstraction layer isolates storage concerns, making future migration possible without affecting application logic.

---

# Architecture

    Markdown
       │
       ▼
     Parser
       │
       ▼
    Knowledge Graph
       │
       ▼
    Graph Repository
       │
       ▼
     Retriever
       │
       ▼
      LLM

---

# Consequences

## Positive
- Perfectly supports Bidirectional PageRank for GraphRAG.
- Enables the "Graph Explorer" UI natively.
- Adding a new relationship type requires zero schema migrations.

## Negative
- Querying requires a Graph abstraction layer in the API.
- If scaling massively, we may need to migrate from SQLite to Neo4j.

## Neutral
- Developers must think in terms of graph traversal instead of SQL joins.
- This requires a different mental model but aligns better with GraphRAG.

---

# Design Principles

This decision follows several core principles of CareerOS:

## Knowledge First
The graph represents the ultimate factual truth of the career data.

## Evidence First
Graph edges are not just for query efficiency; they exist to trace evidence. 

## Deterministic over Magic
Traversing explicit graph edges guarantees deterministic context retrieval for the LLM.

---

# Common Misconceptions

## Graph means Neo4j
**False.**  
Graph is a logical data model. Neo4j is one possible physical implementation.

## Graph replaces Vector Search
**False.**  
Graph and Vector solve different retrieval problems. Graph retrieves factual relationships. Vector retrieves semantic similarity. CareerOS intentionally combines both through Hybrid Retrieval.

## Every relationship should be inferred by LLM
**False.**  
Relationships should be explicitly extracted whenever possible. LLMs are used only when deterministic extraction is impossible.

---

# Future Evolution

- Bidirectional Personalized PageRank
- Community Detection
- Graph Embeddings
- Temporal Graph
- Knowledge Version Graph
- Provenance Tracking
