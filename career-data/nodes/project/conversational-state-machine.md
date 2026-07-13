---
id: conversational-state-machine
type: project
name: "Conversational State Machine"
schemaVersion: "1"
tags:
  - ai
  - dialog-management
  - open-source
  - deterministic
status: active
role: "Author / Solo Developer"
period: "Jun/2026"
visibility: public
created: "2026-06-01"
updated: "2026-07-13"
---

## Overview

Enterprise dialog-management patterns reverse-engineered from proprietary
platforms (e.g. Kore.ai) and rebuilt on an LLM-native stack, focused on one
hard problem: how a chatbot should behave when a user interrupts one task to
ask about another, then wants to come back.

## Problem

Multi-turn chatbots break down at task-switching: a user booking a flight
suddenly asks "what's my order status?" — should the bot hold the flight
context and resume it after, finish the current task first, lock it and
refuse the interruption, or discard it and switch entirely? Enterprise
platforms solve this with proprietary context-stack logic that isn't openly
documented; naive LLM chatbots usually just lose the original context.

## Chosen Solution

- Deep-dive technical audit of the proprietary context-switching
  architecture of enterprise platforms (Kore.ai-style), then abstracted
  the pattern into an open, LLM-native implementation
- Modeled four interruption policies — `hold_and_resume`,
  `finish_then_switch`, `lock_current`, `switch_and_discard` — as
  deterministic LIFO stack operations on a single serializable
  `ContextObject`
- Slot-first detection pipeline using strict catalog enum constraints,
  enforcing deterministic structured output from the LLM to eliminate
  entity hallucination during cross-task switches
- Stack: [[nodejs]], Express, [[typescript]], [[prisma]], [[sqlite]], [[gemini-ai]], Svelte 5

## Key Decisions

- **Interruption policy as a stack operation, not ad-hoc state flags** —
  representing `hold_and_resume` / `lock_current` / etc. as push/pop
  operations on a single serializable context object made the four
  policies composable and testable in isolation, instead of a growing pile
  of conditional branches per policy.
- **Slot-first detection with enum constraints, not free-text extraction**
  — constraining what the LLM can output to a known catalog at the
  detection step removes an entire class of "the model invented an entity
  that doesn't exist in our system" bugs during a task switch.

## Lessons Learned

- Dialog interruption is fundamentally a stack problem (LIFO push/pop of
  context), not a flags-and-conditionals problem — modeling it that way
  from the start avoided combinatorial state explosion across the four
  policies.
