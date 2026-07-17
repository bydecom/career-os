---
id: gemini-ai
type: technology
name: "Google Gemini"
schemaVersion: "1"
aliases:
  - gemini
tags:
  - ai
  - llm
  - embeddings
status: active
level: intermediate
category: ai
created: "2026-06-01"
updated: "2026-07-13"
---

## Problem

Building product features like a shopping assistant chatbot, product
description generation, feedback sentiment analysis, and semantic search all
need a language model — but calling that model synchronously inside a
request handler couples your app's availability and latency to a third-party
API you don't control.

## Solution / Concept

Google Gemini (via `@google/genai`) is used for two distinct capabilities:
structured JSON generation (chat intent extraction, description writing,
feedback classification) and text embeddings (`gemini-embedding-001`, 768
dimensions) for the vector search pipeline. Both are wrapped behind a
provider abstraction (`IAIProvider.generateJson<T>()`) so the app isn't
hard-wired to one vendor.

## Tradeoffs

- **Pro**: Structured JSON-schema output makes LLM responses safely typeable/parseable in application code
- **Pro**: One provider covers both chat/generation and embeddings, simplifying the AI module's surface area
- **Con**: External API latency (multi-second) and rate limits mean anything not on the critical request path must be pushed to an async worker
- **Con**: Vendor lock-in risk if the abstraction leaks — mitigated here with a `LocalAIProvider` fallback and DB-backed provider switch

## Used In

- [[ecommerce-platform]] — storefront/admin chatbots (tool-calling orchestration), product description enhancer, daily admin mini-advice (with heuristic fallback), async feedback sentiment analysis, and product embeddings for [[qdrant]]
- [[conversational-state-machine]] — structured-output NLU under Dynamic Schema Builder (catalog enums)
- [[career-os]] — Interview verbalization after hybrid retrieval (AI-as-view)
- [[graphrag-code]] — optional terminal agent (`graphrag-code-agent`); not on the structural retrieval path
