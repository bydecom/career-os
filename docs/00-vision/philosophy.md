# The 10 Core Philosophies of CareerOS

**Status:** Accepted  
**Version:** 3.0  

CareerOS is governed by 10 non-negotiable principles. Every line of code, every architectural decision, and every UI design must trace back to these laws.

---

### 1. Knowledge First
Knowledge is the ultimate truth. Resumes, portfolios, cover letters, and AI chatbots are merely disposable artifacts generated from that knowledge.

### 2. Single Source of Truth
Every project, technology, metric, and decision exists exactly once in the system. There is no duplicate data. If a metric changes, it changes everywhere.

### 3. Compile, Don't Copy
You do not *write* a resume. You do not *design* a portfolio. You author a Knowledge Base, and the system **compiles** that knowledge into a Resume, Portfolio, or Conversation.

### 4. Deterministic over Magic
Semantic vector search is probabilistic. Structural graph search is deterministic. CareerOS always prioritizes deterministic logic (Metadata & Graph Edges) before resorting to semantic embeddings.

### 5. Evidence First
Every claim must be verifiable. "I reduced latency by 90%" is invalid unless it points to a Metric Node, which points to a Decision Node, which points to an Evidence Node (e.g., a benchmark report).

### 6. Graph before Vector
Factual relationships (`USED_IN`, `SOLVES`) cannot be reliably inferred by LLM embeddings. They must be explicitly mapped in a Knowledge Graph to ensure structural accuracy.

### 7. Knowledge before Presentation
Data domain modeling precedes UI design. The Knowledge Object does not know if it will be rendered as a PDF, a React component, or a Chat response. It remains presentation-independent.

### 8. AI is a View
The AI is not a database. It is not an agent that owns your knowledge. It is merely a linguistic rendering engine (a "View") that verbalizes the retrieved Knowledge Package.

### 9. Human is the Authority
The AI is strictly forbidden from creating net-new knowledge or hallucinating facts. The human engineer is the sole authoritative author of the Markdown source code. The AI only transforms what exists.

### 10. Eat Your Own Dog Food
CareerOS is built using its own philosophy. The architecture decisions, ontology designs, and principles of CareerOS are documented in Markdown, meaning the system itself is a node in its own Knowledge Graph.
