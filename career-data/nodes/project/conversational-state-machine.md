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
repository: "https://github.com/bydecom/conversational-state-machine"
visibility: public
created: "2026-06-01"
updated: "2026-07-18"
---

## Overview

A Dialogue Runtime Engine implementing enterprise conversational patterns
including context switching, interruption handling, slot filling, and
deterministic task resumption on top of LLM-based NLU.

Inspired by platforms such as Kore.ai / Voiceflow — **selective parity**,
not a clone. Flows are data in [[sqlite]]; [[gemini-ai]] only fills slots
under catalog enums. One serializable `ContextObject` is the source of
truth every turn.

Repo: [github.com/bydecom/conversational-state-machine](https://github.com/bydecom/conversational-state-machine)

## Highlights

- Selective parity with enterprise dialog platforms — reverse-engineered interruption patterns onto an open LLM-native stack.
- Four interruption policies as deterministic LIFO stack ops on one serializable ContextObject (`hold` / `finish` / `lock` / `discard`).
- Slot-first detection with catalog enum–constrained Gemini structured output — no entity hallucination on cross-task switches.

## Demo

![[cover.png|caption=Conversational State Machine]]

![[demo.mp4|caption=Booking → Order Food → Resume|poster=poster.png]]

Example path: book a movie → interrupt to order food → finish food →
LIFO pop resumes booking at the Cinema slot. State visible live in the
UI (State / Context / Switch / Flows tabs).

## Problem

Multi-turn bots collapse on interruption: book a ticket, order food, then
resume. Naive LLM chat loses the original task. Enterprise platforms hide
the stack behind proprietary config. The hard question is not “which
model?” — it is how the runtime should behave under switch.

## Runtime Pipeline

`ContextService.processMessage()` owns the turn:

1. Confirm gates — `awaitingContextSwitch` (yes/no policy) or
   `awaitingConfirm` (booking confirm)
2. Slot-first — catalog / quick-reply match stays in the current flow
3. Regex pattern match — deterministic triggers from DB
4. Gemini structured output — schema from DB + catalog enums
   (`schema.builder.ts`)
5. Entity validation against catalog (`entity-validator.service.ts`)
6. Context-switch policy — hold / finish / lock / discard on
   `onHoldTasks`
7. Advance — next missing slot, confirmation, or LIFO `pop()` resume

## Core Capabilities

### Dialogue Runtime

Message → NLU → policy → stack → resume. One pipeline owns control; the
LLM does not own the control plane. `Unknown` mid-task re-prompts the
current slot instead of breaking the flow.

### Serializable ContextObject

Single JSON snapshot per session (`intent`, `entities`, `currentNodeName`,
`onHoldTasks`, `currentTags`, `awaitingConfirm`, `lastTransition`, …).
Replay or debug from the object alone — no hidden runtime memory. Types:
`backend/src/models/types.ts`.

### Dynamic Schema Builder

`schema.builder.ts` builds Gemini response schemas from Prisma intents +
catalog enums. The model cannot invent a movie, cinema, or menu item
outside the DB.

### Interruption Policy Engine

Four policies as stack ops on one queue (`onHoldTasks`):

| Policy | Stack effect |
|--------|----------------|
| `lock_current` | Reject switch; stack unchanged |
| `switch_and_discard` | Drop current; start new (no push) |
| `finish_then_switch` | Push deferred new task; finish current first |
| `hold_and_resume` | Push current; start new now |

On confirm → always LIFO `pop()`. Per-flow or global; confirm mode
`auto` / `ask`.

### Flows as data

Intents, slots, prompts, and switch policies live in [[sqlite]] via
[[prisma]]. Flow Editor writes DB; `state.machine.ts` reads it. No
redeploy to change a flow. Seeded: Welcome → BookingSeat ↔ OrderFood.

### Slot-first routing

Before context switch, catalog / quick-reply match for the current slot
runs first — button clicks do not break the flow via NLU hallucination.
`emitAsTag` filters which entities land in `currentTags`.

## Engineering Decisions

- **Interruption as stack push/pop** — four policies stay composable and
  unit-testable; no `pendingIntent` second lane.
- **Structured output over prompt engineering** — schema from DB at
  detection time.
- **One hold queue** — LIFO encodes resume order for both
  `hold_and_resume` and `finish_then_switch` deferred targets.
- **Slot-first before switch** — quick replies stay in the current task.
- **Selective enterprise parity** — stack + 4 policies + `emitAsTag`;
  not a platform clone (no On-Hold Quantity cap yet, no resume
  notification modes).

## Tradeoffs

- Deterministic control vs free-form agent loops — fewer silent task losses.
- Four explicit policies vs infinite custom rules — coverage without
  combinatorial explosion.
- In-memory sessions — restart clears state (demo / local runtime;
  persistence deferred).
- Known gaps: no on-hold quantity cap; resume notification style fixed;
  `contextTags` / `preconditions` stored but not yet read by NLU;
  `switch_and_discard` not fully covered in Vitest (3/4 policies tested).

## Evidence

- Implementation: `context.service.ts` (~994 LOC) ·
  `context-switch.policy.ts` · `state.machine.ts` · `schema.builder.ts` ·
  `nlu.engine.ts` · `catalog.service.ts`
- Validation: Vitest **10/10** (`context.service.test.ts`,
  `context-switch.policy.test.ts`) — hold, lock, finish_then_switch,
  ask confirm, LIFO resume, `emitAsTag`
- Measurement: 4 policies · LIFO `onHoldTasks` · enum-constrained slots ·
  live State/Context/Switch/Flows panels
- Docs: `docs/IMPLEMENTATION.md` (architecture + gap list §11)

Stack: [[nodejs]], [[typescript]], [[prisma]], [[sqlite]], [[gemini-ai]],
[[svelte]]

## Lessons Learned

- Dialog interruption is a stack problem, not a flags-and-conditionals
  problem.
- Constrain what the LLM may emit at detection time — fewer invented
  entities later.
- Selective parity beats cloning: ship the control-plane patterns that
  interviewers can inspect, document the enterprise gaps honestly.
