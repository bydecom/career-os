---
date: 2026-07-13
author: Bang Thai Minh
type: engineering-decision
confidence: high
tags:
  - architecture
  - naming
  - developer-experience
---

# Why `decisions/` Was Renamed to `journal/engineering/`

## Context

The initial structure had a `decisions/` folder at root level, organized by `YYYY/MM/`. The intent was to capture micro-decisions made during development (e.g., why we chose `remark` over `markdown-it`).

## Decision

Rename `decisions/` to `journal/engineering/`. Keep the same `YYYY/MM/` time-based structure inside.

## Alternatives Considered

### Option A — Keep `decisions/`

**Pros:**
- Short and familiar

**Cons:**
- Overloaded word: `docs/01-adr/` also contains "decisions". A new contributor cannot distinguish between the two without reading both.

**Verdict:** ❌ Rejected

### Option B — `engineering-log/`

**Pros:**
- Clear intent: a log of engineering activity

**Cons:**
- "Log" implies append-only structured data (like a database log). These are freeform notes.

**Verdict:** ❌ Rejected

### Option C — `journal/engineering/`

**Pros:**
- `journal/` signals a human-authored, time-indexed notebook — exactly what this is.
- The `engineering/` subfolder allows future expansion: `journal/research/`, `journal/product/`.
- Clearly distinct from `docs/01-adr/` which contains formal, long-lived architectural decisions.

**Verdict:** ✅ Accepted

## Why

The key distinction between an ADR and a journal entry:

| | ADR | Engineering Journal |
|---|---|---|
| **Scope** | System-level decision | In-the-moment coding choice |
| **Lifespan** | Long-lived, rarely updated | Short-lived, written once |
| **Audience** | Future team members | Future self |
| **Format** | Formal RFC | Freeform notebook |

## Evidence

- Lab notebooks in R&D teams use date-indexed, freeform entries — exactly the `journal/engineering/YYYY/MM/` structure.
- The distinction is documented in `docs/01-adr/0001-why-markdown.md`.

## Decision Confidence

**High.** The naming is self-documenting and removes all ambiguity.

## Future Revisit

Reconsider only if the journal grows to the point where a `YYYY/MM/` time structure is insufficient (e.g., needs to be indexed by project or feature). At that point, add an optional `project:` FrontMatter field and build a filtered view.
