# ADR-0004: Progressive Certainty Retrieval (PCR)

**Status:** Accepted  
**Date:** 2026-07-13  
**Owner:** Bang Thai Minh

---

# Context

Most Retrieval-Augmented Generation (RAG) systems begin retrieval through semantic vector similarity.

Although effective for fuzzy natural language queries, semantic retrieval alone is insufficient for structured technical knowledge bases where entities have stable identities.

For example, "RabbitMQ" is not merely a semantic concept. It is a unique technology node with explicit relationships to projects, experiences, architectural decisions, and implementation evidence.

Using vector similarity as the first retrieval step introduces unnecessary uncertainty when deterministic lookup is possible.

---

# Retrieval Philosophy

Retrieval is a process of reducing uncertainty.

Every retrieval stage should maximize certainty before introducing probabilistic reasoning. CareerOS therefore follows this order:

`Deterministic Knowledge` ➔ `Graph Relationships` ➔ `Lexical Search` ➔ `Semantic Retrieval` ➔ `LLM Generation`

---

# Requirements

The retrieval system should:
- Support **explainable retrieval**. (e.g., "Why did the AI retrieve this project? Because RabbitMQ -> USED_IN -> E-Commerce -> IMPLEMENTED_AT -> FPT").
- Guarantee 100% precision when querying for specific skills, projects, or companies.
- Prevent hallucinated relationships.
- Fast and deterministic matching before falling back to probabilistic models.
- Support strict filtering by node types and attributes.

---

# Considered Options

## Option A — Pure Vector Search (Standard RAG)
### Advantages
- Easy to implement.
- Good at handling fuzzy semantic queries.
### Disadvantages
- Prone to retrieving irrelevant documents where a keyword is casually mentioned.
- Cannot enforce hard constraints (e.g., "Only show projects").
- Non-deterministic.

Decision:
❌ Rejected

## Option B — Full-Text Search (BM25 only)
### Advantages
- Excellent keyword matching.
- Fast and deterministic.
### Disadvantages
- Fails on semantic variations (e.g., "message broker" vs "RabbitMQ").
- Does not inherently understand node types or relations.

Decision:
❌ Rejected

## Option C — Progressive Certainty Retrieval (PCR)
### Advantages
- Enforces strict deterministic matching based on Node ID and FrontMatter tags.
- Provides a solid anchor node from which graph traversal can begin.
- Eliminates hallucinated search results for known entities.
- Combines the absolute certainty of graph logic with the fuzzy matching power of embeddings.
### Disadvantages
- Requires high-quality, structured metadata.
- Implementation is significantly more complex, requiring a Query Understanding Layer before retrieval.

Decision:
✅ Accepted

---

# Decision

CareerOS never begins retrieval from embeddings.

Embeddings are considered a context enrichment mechanism rather than the primary retrieval engine.

Whenever deterministic knowledge exists, retrieval must first rely on explicit metadata and graph relationships. Semantic retrieval is only introduced after deterministic context has been exhausted.

---

# Architecture

                    User Query
                         │
                         ▼
             Query Understanding Layer
           (NER, Intent, Disambiguation)
                         │
                         ▼
                 Entity Normalization
                         │
                         ▼
                 Metadata Lookup
                         │
               Found? ───┴────── No
                 │               │
                 ▼               ▼
          Graph Expansion    BM25 Search
                 │               │
                 └──────┬────────┘
                        ▼
                 Vector Search
                        │
                        ▼
                Context Ranking
                        │
                        ▼
                     LLM

---

# Consequences

## Positive
- **Explainability**: Every retrieved context can be traced. Every node has provenance. Every edge has provenance.
- 100% deterministic retrieval for known skills and projects.
- Drastically reduces hallucination.
- Faster response times for exact matches.

## Negative
- Relies heavily on the Query Understanding Layer accurately extracting entities from the user's query.
- Requires rigorous tagging in the Markdown files.

---

# Design Principles

This decision follows several core principles of CareerOS:

## Knowledge First
The structured metadata is the ultimate source of truth, not the embedding vector.

## Deterministic over Magic
Never let LLM semantic search decide when a deterministic metadata query exists.

## Evidence First
Because retrieval is progressive and graph-based, every answer can be traced back to explicit nodes and edges.

---

# Future Evolution
- Hybrid Ranking (Metadata Score + Graph Score + BM25 Score + Vector Score)
- Cross Encoder for Re-ranking
- Reciprocal Rank Fusion
- Graph Neural Retrieval
- Adaptive Context Budget
