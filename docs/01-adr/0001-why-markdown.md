# ADR-0001: Markdown as the Single Source of Truth

**Status:** Accepted  
**Date:** 2026-07-13  
**Owner:** Bang Thai Minh

---

# Context

CareerOS aims to become a long-term knowledge operating system rather than a traditional portfolio.

The system must support multiple downstream consumers, including:

- Resume Generator
- Portfolio Website
- AI Recruiter Assistant
- Interview Preparation
- Cover Letter Generator
- Future AI Agents

All of these components should consume the same verified knowledge source.

The storage format therefore must satisfy the following requirements:

- Human-readable
- Version-controlled
- Easy to review in Pull Requests
- AI-friendly
- IDE-friendly
- Platform independent
- Capable of expressing structured metadata and long-form documentation
- Suitable for Graph construction

---

# Requirements

The source of truth should:

- remain readable without any custom software
- support Git as the primary version history
- allow engineers to edit documents inside VSCode/Cursor
- contain both structured metadata and rich documentation
- scale to hundreds of knowledge nodes
- support automatic graph extraction
- avoid vendor lock-in

---

# Considered Options

## Option A — Relational Database (PostgreSQL)

### Advantages

- Strong consistency
- Easy querying
- Mature ecosystem

### Disadvantages

- Knowledge editing becomes difficult
- Requires Admin UI
- Poor Git integration
- Hard to review changes
- Long-form documentation becomes awkward

Decision:

❌ Rejected

---

## Option B — Headless CMS

Examples:

- Strapi
- Sanity
- Contentful

### Advantages

- Friendly editing interface
- Built-in authentication

### Disadvantages

- Vendor dependency
- Difficult offline workflow
- Git history is limited
- Knowledge no longer lives with the codebase

Decision:

❌ Rejected

---

## Option C — Notion

### Advantages

- Excellent writing experience
- Easy collaboration

### Disadvantages

- API limitations
- Difficult schema validation
- Difficult graph extraction
- External dependency

Decision:

❌ Rejected

---

## Option D — Markdown + YAML Front Matter

### Advantages

- Plain text
- Git native
- Human readable
- Easy to diff
- Easy to validate
- Works with any editor
- Supports long-form technical documentation
- Supports structured metadata
- Ideal for parser pipelines

### Disadvantages

- Requires parser
- Requires schema validation
- No built-in querying

Decision:

✅ Accepted

---

# Decision

CareerOS stores every knowledge artifact as a Markdown document with YAML Front Matter.

Markdown files become the **canonical source of truth**.

Every downstream representation is generated from these files.

Examples include:

- Portfolio
- Resume
- Knowledge Graph
- Embeddings
- AI Context
- Search Index

The database is considered a cache, not the primary storage.

---

# Architecture

                Markdown Files
                        │
                        ▼
              Parser & Validation
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
    Knowledge Graph             Search Index
          │                           │
          └─────────────┬─────────────┘
                        ▼
                 AI Orchestrator
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
    Portfolio       Resume          Recruiter AI

---

# Consequences

## Positive

- Git becomes the complete knowledge history.
- Every change can be reviewed through Pull Requests.
- Easy backup.
- Easy migration.
- AI agents can directly read Markdown.
- Parser can generate graph relationships.
- Easy future export to JSON, PDF, HTML.

## Negative

- Parser becomes a critical component.
- Schema validation must be strict.
- Broken metadata can affect downstream services.
- Requires indexing before querying.

---

# Design Principles

This decision follows several core principles of CareerOS.

## Knowledge First

Knowledge exists independently of AI.

LLMs never own knowledge.

They only consume knowledge.

---

## Human First

A human should always be able to understand and edit the source files.

---

## Git Native

Git is the historical memory of the system.

---

## Evidence First

Every generated answer should be traceable back to one or more Markdown files.

---

## Deterministic

Knowledge ingestion should never depend on LLM inference.

Parsing must remain deterministic.

---

# Future Evolution

Potential future improvements include:

- Markdown linting
- Automatic schema migration
- Graph relationship extraction
- Incremental indexing
- Live preview
- Visual knowledge editor
