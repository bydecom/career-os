# ADR-0006: Hybrid Retrieval Ranking Strategy

**Status:** Accepted  
**Date:** 2026-07-13  
**Owner:** Bang Thai Minh

---

# Context

Retrieval in CareerOS is executed progressively (see ADR-0003: Progressive Certainty Retrieval). Because the system queries multiple distinct engines (Graph Traversal, Lexical BM25, and Semantic Vector Search), it produces distinct sets of results, each with fundamentally incompatible scoring mechanisms. 

Before feeding these documents to the LLM, they must be ranked and merged into a single coherent context payload, ensuring that the most relevant and structurally accurate nodes appear first.

---

# Requirements

The ranking system must:
- Combine disparate scores (Boolean metadata matches, BM25 TF-IDF, Vector Cosine Similarity, Graph PageRank) into a unified metric.
- Strongly prioritize explicit structural evidence over semantic similarity.
- Boost nodes that are verified by multiple retrieval engines.
- Not exceed the context window budget of the LLM.

---

# Considered Options

## Option A — Simple Concatenation
### Advantages
- Trivial to implement.
### Disadvantages
- Disjointed context.
- Exceeds token limits quickly.
- Does not prioritize highly relevant cross-retrieval matches.

Decision:
❌ Rejected

## Option B — Cross-Encoder Re-Ranking Only
### Advantages
- Highly accurate semantic re-ranking (using models like Cohere Rerank or BGE).
### Disadvantages
- Discards explicit Graph and Lexical signals during the final sort. It relies purely on the semantic overlap between the query and the text, ignoring structural facts.

Decision:
❌ Rejected

## Option C — Reciprocal Rank Fusion (RRF) + Weighted Heuristics
### Advantages
- Mathematically balances different scoring systems without requiring normalization of their absolute values.
- Nodes that appear in multiple retrieval paths (e.g., found via Graph Traversal AND Vector Search) are mathematically boosted.
- Allows injecting arbitrary weights (e.g., giving Graph matches a 2x multiplier).
### Disadvantages
- Requires tuning of hyperparameters (RRF constants, weight multipliers).

Decision:
✅ Accepted

---

# Decision

CareerOS implements **Reciprocal Rank Fusion (RRF)** combined with a weighted heuristic to rank context nodes.

The final rank score for any Node $N$ is calculated as a weighted sum of its inverse rank across all retrieval engines:

$$FinalScore(N) = \sum_{engine \in Engines} \frac{Weight_{engine}}{k + Rank_{engine}(N)}$$

Where:
- `Weight_Metadata` = 4.0
- `Weight_Graph` = 3.0
- `Weight_BM25` = 1.0
- `Weight_Vector` = 1.0

This ensures that an exact metadata match always outranks a fuzzy vector match, perfectly aligning with the Progressive Certainty Retrieval philosophy.

---

# Architecture

    Metadata Results    Graph Results     BM25 Results     Vector Results
           │                  │                │                 │
           └─────────┐        │        ┌───────┘                 │
                     ▼        ▼        ▼                         ▼
                  ┌────────────────────────┐
                  │    Reciprocal Rank     │
                  │      Fusion (RRF)      │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │  Context Truncation    │
                  │   (Adaptive Budget)    │
                  └───────────┬────────────┘
                              │
                              ▼
                             LLM

---

# Consequences

## Positive
- Guarantees that factual, structurally linked nodes dominate the LLM context.
- Naturally filters out noisy semantic matches.
- Provides a mathematically sound way to merge 4 completely different database outputs.

## Negative
- Increases latency (must wait for all 4 retrievers to finish before ranking).
- Requires fine-tuning of the `k` constant and weights.

---

# Design Principles

This decision follows several core principles of CareerOS:

## Knowledge First
By heavily weighting Metadata and Graph ranks, the system prioritizes structural knowledge over probabilistic semantic matching.

## Deterministic over Magic
RRF is a deterministic algorithmic fusion, avoiding the "black box" unpredictability of pure LLM cross-encoders.

---

# Future Evolution
- Integrate a lightweight Machine Learning model (Learning to Rank) to automatically adjust the RRF weights based on the user's intent.
- Experiment with Cross-Encoder re-ranking *after* RRF for the top 5 nodes.
