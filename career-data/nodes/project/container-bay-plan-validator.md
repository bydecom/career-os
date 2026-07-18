---
id: container-bay-plan-validator
type: project
name: "Bay Checker"
schemaVersion: "1"
aliases:
  - bay-checker
tags:
  - logistics
  - desktop-app
  - data-processing
  - maritime
status: active
role: "Python Developer"
company: freelance
period: "Sep/2025 - Dec/2025"
visibility: private
created: "2025-09-01"
updated: "2026-07-18"
---

## Overview

Converts unstructured maritime bay-plan logs into deterministic spatial
models for automated safety validation. Desktop app for maritime stowage
ops: Excel/PDF → 2D/3D grids → stacking and load rules so human error does
not ship unsafe plans.

Built for complex port logistics (e.g. Tien Sa Port). Private / internal use.

## Highlights

- Deterministic parser for unstructured 6-digit LOC telemetry (Excel/PDF) into verifiable 2D/3D stowage matrices.
- Heavy-on-light stability and dynamic load assessment; ingestion decoupled from the rules engine.
- Even/odd 40ft bay pairing via cross-bay footprint lookups — eliminates false-positive validation.
- Tkinter bay-slice UI with real-time violation highlighting; PyInstaller executable for offline port ops.

## Demo

![[cover.png|caption=Bay Checker]]

![[demo.mp4|caption=Excel → grid → stability errors|poster=poster.png]]

## Problem

Bay plans arrive as noisy 6-digit LOC telemetry (`BBRRTT`) in Excel/PDF —
not as a spatial model. Under time pressure, planners must catch
heavy-on-light violations, 20ft/40ft bay pairing, deck/hold VGM limits,
and port/starboard imbalance by eye. Misses become safety and schedule risk.

## Runtime Pipeline

1. Import Excel / PDF (`.xlsx` / `.xls` / PDF tables)
2. Sanitize LOC codes — zero-pad, truncate noise ([[pandas]], [[pdfplumber]])
3. Decode `BBRRTT` → Bay / Row / Tier; identify size from `SzTp` (+ bay parity fallback)
4. Logical bay pairing — even 40ft bays occupy two odd 20ft slots; sync partner bays
5. Rebuild deck/hold grids (`bay_object.py` state machine)
6. Run rules engine (`validator.py`) — stability, sectional VGM, stack limits, balance
7. Render violations in [[tkinter]] grid + side-panel logs; export errors to Excel
8. Package offline via [[pyinstaller]] for port machines with no pip install

## Core Capabilities

### Intelligent Parsing & Spatial Mapping

Not 1:1 column mapping — reconstructs vessel geometry. BBRRTT decode,
even/odd bay pairing (40ft spans two 20ft slots; preserve independent
bays like `00`), deck tiers `94→80` (≤17 slots) and hold `14→02` (≤15 slots).

### Deterministic Stack Stability

Enforces heavy-on-light with mixed stowage: compare 20ft only to 20ft,
40ft only to 40ft (no cross-size false positives). For paired 40ft bays,
vertical traversal looks up partner bays for the supporting base.

### Dynamic Load & Balance

Sectional Deck/Hold VGM totals; per-row stack limits by composition
(pure 20 / pure 40 / mixed); transverse center-of-gravity for severe
port/starboard imbalance alerts.

### Error Mode + Checker Mode

Error Mode highlights violating containers in red with tier-level logs;
thresholds global or per-bay. Checker Mode reconciles a target ID+LOC
list against the parsed grid → **Matched** / **Position Mismatch**.

### Offline Desktop Delivery

[[tkinter]] + `tksheet` UI; modular widgets (`UI_Components/`). Standalone
Windows executable via [[pyinstaller]] — no on-site dependency install.

### Ingestion / Rules Decoupling

`file_reader.py` → dictionary; `bay_object.py` grid state; `validator.py`
rules; `visualizer.py` UI. Input-format changes do not touch validated
business logic.

## Engineering Decisions

- **Decouple ingestion from rules** — new telemetry export style must not
  risk validated stability logic.
- **Explicit domain model for 40ft pairing** — surface LOC shape is not
  enough; even/odd maritime rules prevent false positives.
- **Strict size isolation in stability** — bypass cross-size comparisons
  intentionally.
- **Offline PyInstaller ship** — port ops often lack network / admin rights.

## Tradeoffs

- Desktop Tkinter vs web multi-user — chose offline-first for quay-side use.
- Private internal tool — proof is demo + domain narrative, not a public repo.
- PDF path via [[pdfplumber]] — OCR/edge cases remain operational care items.

## Evidence

- Implementation: `file_reader.py` · `bay_object.py` · `validator.py` ·
  `visualizer.py` · `UI_Components/*` · `pdf_module.py`
- Validation: Error Mode spatial highlight + Checker Mode match/mismatch ·
  export to Excel for planners / authorities
- Measurement: Deck 8 tiers / Hold 7 tiers · even/odd 40ft sync ·
  dynamic stack limits by composition
- Context: Freelance [[freelance]] · Sep–Dec 2025 · Tien Sa–class ops

Stack: [[python]], [[pandas]], [[tkinter]], [[pdfplumber]], [[pyinstaller]]

## Lessons Learned

- Spatial domain rules cannot always be inferred from data surface shape —
  40ft/20ft pairing needs an explicit maritime model on top of parsing.
- Decoupling ingestion from rules keeps safety logic stable when exporters
  change column noise.
- For port tools, offline installability is part of the product, not ops afterthought.
