# Progressive GraphRAG Design

**Author:** Bang Thai Minh  
**Status:** Accepted  
**Version:** 2.0  

---

## 1. The Runtime Retrieval Layer

In the CareerOS architecture, GraphRAG sits in the **Runtime** (not a compile-time Optimizer pass).

It takes a natural language query, traverses the Intermediate Representation (Knowledge IR), and extracts the most highly relevant, deterministic subgraph of knowledge before that subgraph is assembled into ConversationIR and verbalized by the LLM.

Standard RAG (Vector-only) fails in career applications because it relies entirely on fuzzy semantic similarity, which destroys causal relationships and facts. CareerOS implements **Progressive Certainty Retrieval (PCR)** to solve this.

> Note: A future **Knowledge Optimizer** (v2+) may precompute indexes / compress the graph at compile time. That is separate from runtime retrieval.

---

## 2. The Retrieval Pipeline

When a user asks a question (e.g., *"Why did you use Redis in the E-commerce project?"*), the system executes a progressive funnel:

### Step 1: Query Understanding & Entity Extraction (NER)
- Extracts entities: `[Redis]` (Technology), `[E-commerce]` (Project).
- Maps to exact Node IDs via Aliases in the Knowledge Repository.

### Step 2: Metadata & Graph Traversal (The Anchor)
- Locates the `redis` and `e-commerce` nodes.
- Executes a **Bidirectional Personalized PageRank (PPR)** starting from these anchor nodes.
- Follows strict Ontology Rules: `Technology ➔ ENABLES ➔ Decision ➔ IMPLEMENTED_IN ➔ Project`.
- This ensures 100% deterministic structural facts.

### Step 3: Lexical Search (BM25)
- Runs a fast keyword search across the Knowledge IR to catch niche terms (e.g., acronyms) that might have been missed by NER.

### Step 4: Semantic Search (Vector)
- Embeddings are queried to find the *qualitative* "Why" and "How" (e.g., matching the phrase "we needed to reduce database load" against the `sections` of a Decision node).

---

## 3. Reciprocal Rank Fusion (RRF)

The results from Graph, Lexical, and Semantic retrieval are completely different data structures. CareerOS merges them using RRF with explicit weights that favor deterministic facts over fuzzy matches:

1. **Metadata/Graph Match**: Weight 4.0
2. **Lexical Match**: Weight 2.0
3. **Semantic Vector Match**: Weight 1.0

This guarantees that hard facts (e.g., "I worked at FPT") always outrank semantic hallucinations.

---

## 4. The Context Payload

The final optimized payload sent to the LLM is not just a dump of text. It is a structured JSON graph:

```json
{
  "context": [
    {
      "node": "redis-cache-layer",
      "type": "decision",
      "content": "Implemented Redis to offload PostgreSQL...",
      "edges": [
        { "relation": "SOLVES", "target": "db-bottleneck" },
        { "relation": "IMPLEMENTED_IN", "target": "e-commerce-platform" }
      ],
      "metrics": [
        { "name": "Latency", "change": "2s -> 10ms" }
      ]
    }
  ]
}
```

By providing the LLM with structured edges and metrics, CareerOS forces the AI to reason logically and cite empirical evidence, completing the Evidence-Based Generation cycle.
