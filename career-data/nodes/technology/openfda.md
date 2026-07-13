---
id: openfda
type: technology
name: "OpenFDA"
schemaVersion: "1"
tags:
  - api
  - healthcare
  - data-source
status: active
level: intermediate
category: api
created: "2026-05-01"
updated: "2026-07-13"
---

## Problem

Building any credible medical-safety tool needs an authoritative, official
source for drug label data (contraindications, warnings, dosage) — not
scraped or crowd-sourced text that could itself be wrong.

## Solution / Concept

OpenFDA is the U.S. FDA's public API exposing Structured Product Labeling
(SPL) data — the official, regulator-approved text for prescription and
OTC drug labels — as semi-structured JSON, free and without scraping.

## Tradeoffs

- **Pro**: Official regulatory source — no scraping, no paywall, no provenance ambiguity
- **Pro**: Machine-readable JSON is far easier to index than parsing label PDFs
- **Con**: Field schema differs between prescription (Rx) and over-the-counter (OTC) labels — a single fixed field list misses OTC-specific safety sections
- **Con**: No native stable passage/sentence IDs — consumers must build their own indexing scheme for citation purposes

## Used In

- [[medical-citation-agent]] — primary evidence source for all extracted medical claims and citations
