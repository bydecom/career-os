# API & Interoperability Design

**Author:** Bang Thai Minh  
**Status:** Accepted  
**Version:** 2.0  

---

## 1. Overview

CareerOS is a headless Knowledge Operating System. The core logic runs independently of the presentation layer. To serve the various "Views" (Portfolio, Resume, Chatbot, MCP), the system exposes a unified set of APIs acting as the bridge between the Knowledge Repository and the Presentation Layer.

---

## 2. API Architecture

The backend exposes endpoints through a strict Domain-Driven Design (DDD) approach. We do not expose basic database CRUD endpoints (since Knowledge is compiled from Markdown, the API is strictly **Read-Only** from the client's perspective).

### The Graph API
Used by the Portfolio and Graph Explorer to render timelines, skills, and node relationships.

- `GET /api/v1/nodes/:id`
  - Returns the compiled `KnowledgeObject` (Metadata, Sections, Metrics).
- `GET /api/v1/nodes/:id/edges?type=SOLVES&direction=out`
  - Returns specific relationships (e.g., What problems did this decision solve?).
- `GET /api/v1/graph/trajectory?startNode=redis&endNode=e-commerce`
  - Calculates the shortest logical path between two concepts.
- `GET /api/v1/graph/ontology`
  - Returns the schema definitions (useful for building dynamic UIs).

### The Retrieval API (Progressive Certainty Retrieval)
Used by the Chatbot or MCP to execute the Hybrid Search.

- `POST /api/v1/retrieval/query`
  - Body: `{ "query": "Why did you use RabbitMQ?", "filters": { "type": ["decision", "project"] } }`
  - Internally executes NER, Graph PPR, BM25, and Vector Search.
  - Returns: A ranked array of `KnowledgeObject` payloads based on Reciprocal Rank Fusion (RRF) scores.

### The Generation API (Vercel AI SDK)
Acts as the final projection layer for the Chatbot.

- `POST /api/v1/generation/chat`
  - Body: `{ "messages": [...] }`
  - Calls the Retrieval API internally, builds the Context payload, and streams back the LLM response.
  - Injects Evidence tags (e.g., `<evidence type="metric" id="..." />`) into the stream for the UI to render interactive widgets.

---

## 3. Model Context Protocol (MCP)

CareerOS natively implements an MCP Server (FastMCP). This makes the entire Knowledge Base programmable and accessible directly to AI IDEs (Cursor) or AI Assistants (Claude Desktop).

This completely flips the job interview paradigm: Instead of sending a recruiter a static PDF, you send them a secure MCP server link. Their internal AI instance can directly "interview" your CareerOS.

### Exposed FastMCP Tools

- `explore_knowledge_node(id: string)`
  - Returns the full sections and metadata of any node.
- `traverse_relationships(id: string, edgeType?: string)`
  - Returns adjacent nodes to explore why a decision was made.
- `execute_hybrid_search(query: string)`
  - Allows Claude/Cursor to perform a semantic + graph search against your knowledge base.
- `get_verifiable_metrics(nodeId: string)`
  - Returns hard data (metrics, benchmarks) attached to an architecture decision.
- `trace_evidence(nodeId: string)`
  - Follows the ontology rule: `Problem ➔ Decision ➔ Implementation ➔ Metric ➔ Evidence` to validate any claim.

---

## 4. API Principles

1. **Read-Only by Default**: The API cannot modify the Knowledge Graph. Only the Compiler (watching the Markdown files) can mutate state.
2. **Deterministic Context**: Every Retrieval API endpoint must guarantee deterministic ordering of structural facts before vector similarities.
3. **Evidence Included**: Every Knowledge node returned by the API natively includes its `edges` and `metrics` to enforce the Evidence-First principle across all Views.
