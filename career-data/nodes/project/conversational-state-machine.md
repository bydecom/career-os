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
updated: "2026-07-16"
---

## Overview

A **Dialogue Runtime Engine** — not a chatbot skin. Enterprise interruption
patterns (hold / finish / lock / discard) rebuilt on an LLM-native stack,
with a single serializable `ContextObject` as the source of truth for every
turn. Flows are data in SQLite; Gemini only fills slots under catalog enums.

Repository: [github.com/bydecom/conversational-state-machine](https://github.com/bydecom/conversational-state-machine)

## Problem

Multi-turn bots collapse when users interrupt: booking a ticket, then
ordering food, then wanting to resume. Naive LLM chat loses the original
task. Enterprise platforms hide the stack logic behind proprietary config.
The hard question is not “which model?” — it is how the runtime should
behave under interruption.

## Demo

![[cover.png|caption=Conversational State Machine]]

![[demo.mp4|caption=Booking → Order Food → Resume|poster=poster.png]]

Drop files into `career-data/assets/conversational-state-machine/`
(`cover.png`, `poster.png`, `demo.mp4`). See that folder’s README.

## Runtime Pipeline

1. Slot-first detection (catalog / quick-reply match stays in current flow)
2. Regex pattern match (deterministic triggers from DB)
3. Gemini structured output (schema built from DB + catalog enums)
4. Entity validation against catalog
5. Context-switch policy (hold / finish / lock / discard)
6. Context stack push/pop (LIFO `onHoldTasks`)
7. Advance to next missing slot or confirm / resume

## Core Capabilities

### Dialogue Runtime

Message → NLU → policy → stack → resume. One pipeline owns the turn; the LLM
does not own the control plane.

### Serializable ContextObject

Every session is one JSON-serializable snapshot (`intent`, `entities`,
`onHoldTasks`, tags, confirm flags). Any turn can be replayed or debugged
from the object alone — no hidden runtime memory.

### Dynamic Schema Builder

`schema.builder.ts` builds Gemini response schemas from Prisma intents +
catalog enums. The model cannot invent a movie or menu item that is not in
the DB.

### Interruption Policy Engine

Four policies as stack operations: `hold_and_resume`, `finish_then_switch`,
`lock_current`, `switch_and_discard`. Configurable per-flow or globally.

### Flows as data

Intent definitions, slots, prompts, and switch policies live in SQLite. The
Flow Editor writes the DB; the state machine reads it. No redeploy to change
a flow.

### Slot-first routing

Before considering a context switch, the pipeline checks catalog / quick
reply for the current slot. Button clicks do not break the flow via NLU
hallucination.

## Engineering Decisions

- **Interruption as stack push/pop** — four policies stay composable and
  unit-testable instead of flag soup per policy.
- **Structured output over prompt engineering** — schema from DB constrains
  intent and entity values at detection time.
- **One hold queue** — `onHoldTasks` is the only lane; LIFO encodes resume
  order without a separate pending-intent field.
- **Slot-first before switch** — catalog match keeps the user in the current
  task when they click a quick reply.

## Tradeoffs

- Deterministic dialogue control vs fully free-form agent loops — owned the
  control plane; less “agent freedom,” fewer silent task losses.
- Four explicit policies vs infinite custom rules — coverage without
  combinatorial explosion.
- In-memory sessions — restart clears state (design for demo / local runtime;
  persistence deferred).

## Evidence

- Implementation: `context.service.ts` (~994 LOC), `schema.builder.ts`,
  `state.machine.ts`, `context-switch.policy.ts`, `catalog.service.ts`
- Validation: Vitest 10/10 passing (`context.service.test.ts`,
  `context-switch.policy.test.ts`)
- Measurement: 4 interruption policies · LIFO stack · enum-constrained slots
- Docs: `docs/IMPLEMENTATION.md` in the project repo
- Stack: [[nodejs]], Express, [[typescript]], [[prisma]], [[sqlite]],
  [[gemini-ai]], Svelte 5

## Lessons Learned

- Dialog interruption is a stack problem, not a flags-and-conditionals
  problem.
- Constrain what the LLM may emit at detection time — fewer invented
  entities later.
