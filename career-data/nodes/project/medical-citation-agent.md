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
updated: "2026-07-13"
---

## Overview

A deterministic-first MCP tool that extracts medical claims from FDA drug
labels with verifiable, line-level citations. Built specifically to keep
LLMs **out** of the extraction path — the model never invents a medical
statement; it only ever receives sentences that already exist verbatim in
the source label.

## Demo

![[cover.png|caption=Medical Citation Agent]]

![[demo.mp4|caption=Claim + line-level citation|poster=poster.png]]

## Problem

LLM assistants answering medical questions frequently hallucinate —
inventing contraindications, misremembering dosages, or paraphrasing
warnings without a traceable source. For a question like "Is warfarin safe
during pregnancy?", a generic model may answer confidently while omitting
the boxed-warning nuance or citing nothing at all. Even standard RAG systems
can still fail *after* retrieval, when the model paraphrases or merges
retrieved chunks incorrectly (see [RAGTruth](https://arxiv.org/abs/2401.00396)).

## Chosen Solution

Split the problem into two layers and only claim to solve the first one:

```
Layer 1 (this tool)  — extract + cite verbatim   → Hallucination 0.00 (measured)
Layer 2 (the agent)  — summarize / answer          → not evaluated here (RAGTruth risk)
```

- Deterministic extraction pipeline: regex triggers (contraindication /
  warning / dosage patterns) + [[scispacy]] biomedical NER
  (`en_core_sci_sm`) — no generative model in the extraction path
- Every `MedicalClaim` carries a `CitationSource(document_id, start_line,
  end_line, raw_text)` — an auditor can read the exact sentence
- Rule-based `SafetyGuardrail`: acts as an anti-corruption layer, blocking
  5 critical drug–condition pairs declared in `safety_rules.json` (e.g.
  warfarin + pregnancy) unless the sentence contains explicit
  contraindication phrasing (`contraindicated`, `do not use`, `avoid in`),
  filtering out incidental mentions in dosage-context text
- [[openfda]] Structured Product Labels (SPL) as the primary evidence
  source — official, no scraping, no paywalls
- Exposed as a [[fastmcp]] server over stdio — zero-config for Cursor /
  Claude Desktop

## Architecture

```
extract_claims(document_path)
    ├── load_openfda_text()   → parse OpenFDA JSON into numbered sentences
    ├── _match_patterns()     → regex: contraindication / warning / dosage
    ├── extract_entities()    → scispacy NER + keyword type heuristics
    ├── dedup by statement
    └── SafetyGuardrail.check() → block critical pairs without CI phrasing
```

Claims are tiered by pattern-match confidence rather than treated
uniformly: contraindication triggers (`contraindicated in`, `do not use`)
score 0.9, warnings (`use with caution`, `risk of`) score 0.7, and dosage
patterns (`maximum daily dose`, `mg per`) score 0.6 — giving downstream
agents a signal for how much weight to put on a given claim.

## Evidence

- **Citation Precision: 1.00, Hallucination Rate: 0.00** across 15 curated
  contraindication test cases spanning 3 prescription labels — measured by
  a reproducible, LLM-free eval harness that checks `claim.statement ⊆
  raw_label_text` (string containment, not LLM-as-judge).

  | Drug | Sentences indexed | Claims extracted | Precision | Hallucination | Recall |
  |---|---|---|---|---|---|
  | warfarin | 160 | 15 | 1.00 | 0.00 | 0.83 (5/6) |
  | metformin | 135 | 20 | 1.00 | 0.00 | 0.80 (4/5) |
  | amoxicillin | 97 | 14 | 1.00 | 0.00 | 0.75 (3/4) |
- Recall@contraindications: 0.80 (12/15 cases) — the honest ceiling of a
  regex-gated approach: claims without a trigger phrase are silently
  skipped, a deliberate precision-over-recall trade-off for auditability.
- 96 regression tests (pytest) running in CI (Python 3.10 + 3.12) on
  synthetic Rx/OTC fixtures — locks NER type heuristics, the guardrail's
  contraindication-phrasing gate, and MCP dedup behavior.
- Documented known gap: OTC labels (ibuprofen, acetaminophen) store safety
  text under different SPL keys (`warnings`, `do_not_use`) not yet mapped
  by `FIELDS_TO_EXTRACT` — 0 claims extracted for those two drugs. Logged
  as an indexer gap, not hidden.

## Discussion (Positioning vs Alternatives)

Explicitly scoped against related systems rather than claiming to replace
them:

| Task class | Example | This project |
|---|---|---|
| Verbatim cite from one label | "Quote the pregnancy contraindication" | ✅ Core scope |
| SPL passage QA at scale (FDARxBench: 700 labels, 17K QA) | — | ⚠️ Prototype only, 15 cases |
| Multi-corpus agentic drug-safety QA | pharma-agent | ❌ Out of scope |
| Drug–drug interaction knowledge graph | SIDEKICK, PharmaGraphRAG | ❌ Different task class (relationship reasoning, not document indexing) |

Most open-source OpenFDA MCP servers are API proxies that hand raw JSON to
an LLM to interpret. This tool inverts that: it only ever emits sentences
that already exist in the label — the LLM (if any, downstream) is a
*consumer* of cited evidence, not a component inside the extraction tool.

## Lessons Learned

- "Zero hallucination" is only an honest claim if scoped to the layer it
  was actually measured at. Extraction-layer hallucination (0.00) is a
  real, valuable, and narrow claim — it says nothing about whether a
  downstream agent later paraphrases that evidence incorrectly.
- A precision/recall trade-off should be a stated design decision, not an
  accident discovered by users — regex-gated extraction was chosen
  specifically to keep precision at 1.00, accepting a recall ceiling as
  the cost.
