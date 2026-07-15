---
id: container-bay-plan-validator
type: project
name: "Container Bay Plan Validator"
schemaVersion: "1"
tags:
  - logistics
  - desktop-app
  - data-processing
status: active
role: "Python Developer"
company: freelance
period: "Sep/2025 - Dec/2025"
visibility: private
created: "2025-09-01"
updated: "2026-07-13"
---

## Overview

A Python-based desktop application supporting container bay plan validation
for maritime logistics operations — verifying that a proposed container
stowage plan doesn't violate physical stability or structural rules before
it's executed at a port.

## Problem

Bay plans arrive as unstructured 6-digit LOC telemetry in Excel/PDF exports,
not as a clean spatial model. Manually checking whether a plan violates
"heavy-on-light" stacking rules, or whether two adjacent bays actually form
a single virtual 40ft slot (spanning what look like two independent 20ft
bays), is error-prone under time pressure at a live port operation.

## Chosen Solution

- Deterministic parser: ingests unstructured 6-digit LOC codes from
  Excel/PDF ([[pandas]], [[pdfplumber]], regex) and reconstructs a
  verifiable 2D/3D maritime container stowage matrix
- Strict separation of concerns: data ingestion layer decoupled from the
  business rules engine (heavy-on-light stability algorithm, dynamic load
  assessment)
- Interactive UI ([[tkinter]]) with bay-slice navigation for real-time
  spatial violation highlighting
- Packaged as a standalone executable via [[pyinstaller]] for offline use
  in port operations with no dependency install required on-site

## Challenges

- **Virtual 40ft bays spanning dual 20ft slots**: some bay positions that
  look like two independent 20ft slots in the raw LOC data are structurally
  one 40ft container footprint. Naive per-slot validation produced false
  positives (flagging a valid 40ft container as violating a 20ft
  constraint). Solved with cross-bay footprint lookups that resolve the
  pairing before running stability checks — eliminating the false
  positives entirely.

## Key Decisions

- **Decouple ingestion from the rules engine** — the LOC-code parsing
  logic and the heavy-on-light stability algorithm were kept as separate
  layers specifically so that a change in the input format (a new
  telemetry export style) wouldn't risk touching validated business logic,
  and vice versa.

## Lessons Learned

- Physical/spatial domain rules (which slots are "really" one structural
  unit) can't always be inferred from the data's surface shape — the
  40ft/20ft pairing bug taught that a purely data-driven parser needs an
  explicit domain model layered on top, not just cleaner parsing.
