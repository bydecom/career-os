# Knowledge Conversation Engine

**Author:** Bang Thai Minh  
**Status:** Accepted  
**Version:** 3.0  

---

## 1. Identity & Philosophy

Most portfolio AI chatbots are prompted with: *"You are Bang. Answer questions as if you are him."*

CareerOS explicitly rejects this. **The AI does not pretend to be the candidate.**

Instead, the AI is a **Knowledge Interface** operating over a verified career database. This manages user expectations, prevents uncanny-valley interactions, and maintains strict professional integrity.

> *"I am the CareerOS Knowledge Interface. I can query Bang's verified project history, architecture decisions, and metrics. What would you like to know?"*

---

## 2. The Conversation Pipeline

The conversation flow is not a direct API call to an LLM. It is a multi-stage pipeline:

```text
User Question
      │
      ▼
Intent & Audience Classifier (Strategy — v2+)
      │
      ▼
Hybrid Retriever (PCR) — Runtime
      │
      ▼
ConversationIR Builder (+ budget)
      │
      ▼
Response Planner (Tone & Structure — v2+)
      │
      ▼
LLM (Verbalization of ConversationIR)
      │
      ▼
UI Renderer (Markdown + Interactive Citations)
```

---

## 3. The Strategy Engine & Response Planner

Instead of hardcoding "HR" vs "Tech Lead" prompts, the Strategy Engine dynamically determines the approach:

### Intent ➔ Audience ➔ Strategy ➔ Tone
- **Example 1**: `technical_question` ➔ `Senior Backend Audience` ➔ `Focus on Architecture & Trade-offs` ➔ `Tone: CTO`
- **Example 2**: `behavioral_question` ➔ `HR Audience` ➔ `Use STAR Format (Situation, Task, Action, Result)` ➔ `Tone: Recruiter`
- **Example 3**: `concept_explanation` ➔ `Junior Audience` ➔ `Focus on Analogies` ➔ `Tone: Junior`

---

## 4. Verbalization vs. Generation

The LLM is NOT prompted to *"Answer the question"*. 

It is prompted to: *"Verbalize this ConversationIR."*

The runtime builds a structured ConversationIR (anchors, candidates, edges, retrieval trace, retrieval confidence). The LLM acts purely as a linguistic formatter. It is strictly forbidden from introducing external facts.

---

## 5. Multi-level Guardrails

What happens if the user asks a question the Knowledge Base cannot answer?

- **Level 1 (Exact Match)**: The node exists. The LLM verbalizes the exact evidence.
- **Level 2 (Semantic Pivot)**: The node does not exist (e.g., "Do you know Kafka?"). The graph finds a sibling node via the `IS_A` relationship (e.g., RabbitMQ). 
  - *Response*: "Bang's knowledge base does not contain evidence for Kafka. However, he has extensive production experience with RabbitMQ (a related Message Broker), where he..."
- **Level 3 (No Match)**: 
  - *Response*: "I do not have verified evidence regarding that topic in the knowledge base."

---

## 6. Confidence Scoring

Trust is paramount. CareerOS does not wait for the user to guess if the AI is hallucinating. It explicitly broadcasts its confidence level *before* generating the answer. This is calculated by the **Retriever**, not the LLM.

- **High Confidence**: Exact Node Match + Edge Match + Verifiable Metric.
- **Medium Confidence**: Node Match + Semantic similarity, but missing exact hard metrics.
- **Low Confidence**: Semantic Vector Match only. (Fallback).

---

## 7. Interactive Citations

Evidence is not injected via clunky XML tags. The LLM uses a native Markdown extension syntax (e.g., `[[evidence:decision-001]]` or `[[metric:latency]]`).

When the frontend parses these tags, it renders domain-specific UI widgets, not just text links:
- **Metric**: Renders a Green/Red Badge (e.g., `Latency: 2s ➔ 10ms`).
- **Decision**: Renders an expandable ADR Card (Problem ➔ Alternatives ➔ Chosen).
- **Architecture**: Renders a preview thumbnail of the Mermaid SVG.
- **Commit**: Renders a GitHub-style code diff.

---

## 8. Beyond the Recruiter

By reframing this as a **Knowledge Conversation Engine**, it serves multiple consumers:
- **Recruiters**: Asking about experience.
- **The Candidate (You)**: Generating a tailored cover letter based on a Job Description, or practicing for a specific interview.
- **MCP Clients (Cursor/Claude)**: Querying your past technical decisions while writing new code.
