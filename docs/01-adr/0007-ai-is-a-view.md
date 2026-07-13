# ADR-0007: AI is a View

**Status:** Accepted  
**Date:** 2026-07-13  
**Owner:** Bang Thai Minh

---

# Context

In many modern applications, the Large Language Model (LLM) is treated as the central intelligence of the system. It is fed documents and trusted to act as the primary brain, generating answers based on its internal weights and probabilistic reasoning. This leads to hallucinations, non-deterministic behavior, and "black box" systems where developers cannot explain *why* an AI said something.

CareerOS is built to represent professional knowledge truthfully. We cannot afford an AI hallucinating a skill or a project constraint.

---

# Requirements

- The LLM must not generate net-new facts.
- The LLM must not act as a database.
- The system architecture must decouple the Knowledge Graph from the LLM.
- The LLM's role must be restricted to natural language translation and formatting.

---

# Considered Options

## Option A — LLM as the Core Engine (Agentic Architecture)
### Advantages
- Simple to prototype (just prompt engineering).
### Disadvantages
- High risk of hallucination.
- No deterministic guarantee.
- Impossible to thoroughly unit test knowledge retrieval.

Decision:
❌ Rejected

## Option B — AI is a View (Strict Separation of Concerns)
### Advantages
- The Knowledge Graph acts as the backend (Model).
- The Retriever acts as the Controller.
- The AI acts purely as the View.
- 100% deterministic knowledge boundaries.
### Disadvantages
- Requires a highly robust deterministic retrieval pipeline before the LLM can be invoked.

Decision:
✅ Accepted

---

# Decision

In CareerOS, the **AI is merely a View**. 

The LLM does not own knowledge; it only transforms knowledge. It is treated exactly the same way as a React component: it takes a JSON payload (the retrieved Graph Nodes) as `props` and renders it into a human-readable string. If the Knowledge Graph returns empty, the AI must render "I do not know."

---

# Architecture

    Model (Knowledge Graph)
             │
             ▼
    Controller (Progressive Certainty Retrieval)
             │
             ▼
    View (LLM / Portfolio UI / PDF Generator)

---

# Consequences

## Positive
- Total elimination of factual hallucination.
- The LLM can be swapped out easily (Gemini -> Claude -> GPT-4) without affecting the system's "intelligence", because the intelligence lives in the Graph.

## Negative
- The AI's conversational capability is strictly bottlenecked by the quality of the parser and retrieval algorithms.

---

# Design Principles

## Deterministic over Magic
By treating the AI as a View, we remove the "magic" of LLM cognition from the core data flow.

## Knowledge First
The Graph is the brain. The AI is just the mouth.
