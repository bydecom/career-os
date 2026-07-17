---
id: medical-citation-agent
type: project
name: "Medical Citation Agent"
schemaVersion: "1"
tags:
  - ai
  - deterministic-extraction
  - open-source
  - mcp
  - healthcare
status: active
role: "Author / Solo Developer"
period: "May/2026 - Jun/2026"
repository: "https://github.com/bydecom/medical-citation-agent"
visibility: public
created: "2026-05-01"
updated: "2026-07-18"
---

## Overview

A **deterministic-first MCP tool** that extracts medical claims from FDA
drug labels with verifiable, line-level citations. The LLM stays **out** of
the extraction path — it only ever receives sentences that already exist
verbatim in the source label.

Sibling to [[graphrag-code]]: same Deterministic-First + [[fastmcp]] pattern,
different domain (regulated text vs code structure).

Repo: [github.com/bydecom/medical-citation-agent](https://github.com/bydecom/medical-citation-agent)

## Demo

![[cover.png|caption=Medical Citation Agent]]

![[demo.mp4|caption=Claim + line-level citation|poster=poster.png]]

## Problem

Medical assistants hallucinate — inventing contraindications, misremembering
dosages, or answering without a traceable source. Even standard RAG can fail
*after* retrieval when the model paraphrases or merges chunks incorrectly
(see [RAGTruth](https://arxiv.org/abs/2401.00396)).

For "Is warfarin safe during pregnancy?", confidence without a cited sentence
is the failure mode.

## Runtime Pipeline

1. Load [[openfda]] Structured Product Label → numbered sentences
2. Regex pattern match (contraindication / warning / dosage triggers)
3. Biomedical NER via [[scispacy]] (`en_core_sci_sm`) + type heuristics
4. Deduplicate by statement text
5. `SafetyGuardrail.check()` — block critical drug–condition pairs without
   explicit CI phrasing
6. Emit `MedicalClaim` + `CitationSource` (document_id, start_line, end_line,
   raw_text)
7. Serve via [[fastmcp]] stdio (`extract_claims`, …)

## Core Capabilities

### Layer Split (Extract vs Summarize)

Only Layer 1 is claimed: extract + cite verbatim → measured hallucination
0.00. Layer 2 (summarize / answer) is out of scope — RAGTruth risk stays
with the downstream agent.

### Verbatim Claim + Line Citation

Every claim carries exact line coordinates and `raw_text`. An auditor can
open the label and read the sentence — string containment, not LLM-as-judge.

### Pattern + NER Extraction

Regex triggers gate recall deliberately; SciSpaCy NER + keyword heuristics
type entities. No generative model invents medical statements.

### SafetyGuardrail

Rule-based anti-corruption layer (`safety_rules.json`): blocks critical
pairs (e.g. warfarin + pregnancy) unless the sentence contains explicit
contraindication phrasing (`contraindicated`, `do not use`, `avoid in`).

### Confidence Tiers by Pattern Class

Contraindication triggers ≈ 0.9 · warnings ≈ 0.7 · dosage ≈ 0.6 — agents get
a weight signal, not a flat bag of claims.

### Zero-ops MCP + Regression Lock

[[fastmcp]] over stdio for Cursor / Claude Desktop. 96 pytest cases in CI
([[github-actions]], Python 3.10 + 3.12) lock NER heuristics, guardrail
phrasing gate, and MCP dedup.

## Engineering Decisions

- **Split Layer 1 from Layer 2** — only claim what the eval measures.
- **Precision over recall** — regex-gated ceiling (~0.80 Recall@CI) keeps
  citation precision at 1.00.
- **Rule-based SafetyGuardrail** — critical pairs need explicit CI phrasing,
  not incidental dosage-context mentions.
- **[[openfda]] SPL as evidence** — official labels; no scraping / paywalls.
- **Invert API-proxy MCP servers** — emit cited sentences; LLM consumes
  evidence, never authors it inside the tool.

## Tradeoffs

- Recall ceiling (~0.80) accepted for auditability — claims without a
  trigger phrase are skipped on purpose.
- OTC SPL key gaps (`warnings`, `do_not_use` for ibuprofen /
  acetaminophen) logged as indexer debt — 0 claims today, not hidden.
- Prototype scale (15 curated CI cases) vs FDARxBench-scale QA — owned
  verbatim cite from one label; multi-corpus agentic QA is out of scope.

## Evidence

- Implementation: OpenFDA loader · regex + SciSpaCy pipeline ·
  SafetyGuardrail · FastMCP tools · 96 pytest fixtures
- Validation: Citation Precision **1.00**, Hallucination **0.00** on 15
  curated CI cases (warfarin / metformin / amoxicillin) — `claim.statement
  ⊆ raw_label_text`
- Measurement: Recall@contraindications **0.80** (12/15) · CI on Python
  3.10 + 3.12
- Positioning: not SIDEKICK / PharmaGraphRAG (DDI graphs); not
  pharma-agent multi-corpus QA — different task class
- Sibling: [[graphrag-code]] — Deterministic-First + MCP for code structure

Stack: [[python]], [[openfda]], [[scispacy]], [[fastmcp]], [[github-actions]]

## Lessons Learned

- "Zero hallucination" is honest only when scoped to the measured layer.
- Precision/recall trade-offs should be stated design decisions, not
  accidents users discover.
- Evidence-first is an architecture choice — keep the LLM out of extraction.
