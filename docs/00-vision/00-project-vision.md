# CareerOS - Project Vision

**Author:** Bang Thai Minh  
**Status:** Accepted  
**Version:** 1.0  

---

> People don't have a portfolio.
>
> People have knowledge.
>
> A portfolio is merely one projection of that knowledge.

## Vision

CareerOS is a Knowledge Operating System.

It does not store resumes.
It does not store portfolios.
It stores knowledge.

Everything else is generated.

---

## Problem

Professional knowledge is fragmented.

The same experience is repeatedly rewritten across resumes, portfolios, LinkedIn profiles, cover letters, and interview preparation notes. Each copy slowly diverges. Maintaining consistency becomes impossible.

Traditional AI portfolio assistants worsen this problem by generating answers from probabilistic embeddings instead of verified evidence, leading to hallucination.

---

## Solution

CareerOS introduces an **Atomic Knowledge Model**.

Every experience, project, technology, architectural decision, lesson learned, and research note exists exactly once as an independent knowledge node. These nodes form a deterministic Knowledge Graph.

Instead of storing documents, CareerOS stores knowledge. Every document is generated on demand by traversing this graph.

---

## The Compiler Metaphor

CareerOS is not a website. It is a compiler.

- **Source Code**: Markdown (Atomic Nodes)
- **Compiler Front-end**: Parser
- **Intermediate Representation (IR)**: Knowledge Graph
- **Optimizer**: Hybrid Retriever
- **Binary Outputs**: Resume, Portfolio, Chatbot, Interview Assistant

```text
Experience 
    │
    ▼
Capture (Markdown)
    │
    ▼
Validate (Schema)
    │
    ▼
  Parse
    │
    ▼
Knowledge Graph (IR)
    │
    ▼
Hybrid Retrieval
    │
    ▼
AI / Resume / Portfolio / Interview
    │
    ▼
Feedback
    │
    ▼
Update Knowledge
```

---

## What CareerOS is NOT

❌ A portfolio builder  
❌ A resume generator  
❌ A chatbot wrapper  
❌ A note-taking application  

**CareerOS is a knowledge operating system.**
Those products are simply different views over the same knowledge graph.

---

## Core Principles

1. **Knowledge First**
2. **Single Source of Truth**
3. **Evidence First**
4. **Deterministic over Magic**
5. **AI is a View**
6. **Graph before Vector**

---

## Example: Information Traversal

When a recruiter asks: *"Tell me about RabbitMQ."*

CareerOS does not rely on fuzzy semantic guesses. It traverses the Graph:

```text
User Query: "Tell me about RabbitMQ"
    │
    ▼
[RabbitMQ Node]
    │
    ├── USED_IN ──▶ [Project: E-Commerce]
    │                   │
    │                   ├── IMPLEMENTED_AT ──▶ [Company: FPT Software]
    │                   │
    │                   └── ACHIEVED ──▶ [Metric: Handled 1000 RPS]
    │
    └── MADE_DECISION ──▶ [Decision: Decoupled Order Queue]
                            │
                            └── PRODUCED ──▶ [Evidence: Architecture Diagram]
    │
    ▼
Generated Answer (with interactive citations)
```

---

## Long-term Vision

Although CareerOS begins as a personal knowledge operating system for software engineers, the underlying architecture is domain-independent.

Any profession whose expertise can be represented as interconnected knowledge (Designer, Researcher, Scientist, Lawyer, Doctor) may benefit from the exact same model.

---

> CareerOS does not ask:
> 
> *"What have you built?"*
> 
> CareerOS asks:
> 
> *"What do you know?"*
> 
> Everything else is merely another way of presenting that knowledge.
