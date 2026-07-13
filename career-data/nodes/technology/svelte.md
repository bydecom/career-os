---
id: svelte
type: technology
name: "Svelte"
schemaVersion: "1"
tags:
  - frontend
  - ui
status: active
level: beginner
category: frontend
created: "2026-06-01"
updated: "2026-07-13"
---

## Problem

Frontend frameworks that ship a runtime to the browser (React, Angular) add
bundle size and a virtual-DOM diffing cost, even for smaller, prototype-scale
UIs where that overhead isn't paying for itself.

## Solution / Concept

Svelte is a compiler, not a runtime framework — it compiles components into
vanilla, highly optimized JavaScript at build time, with no virtual DOM.
Svelte 5's runes bring fine-grained reactivity similar in spirit to Angular
signals or React hooks, but with less boilerplate.

## Tradeoffs

- **Pro**: Smaller shipped bundle size and less runtime overhead than a virtual-DOM framework
- **Pro**: Less boilerplate for simple reactive UI compared to React/Angular
- **Con**: Smaller ecosystem/community than React or Angular — fewer ready-made component libraries
- **Con**: Compiler-based magic can be less transparent when debugging than an explicit runtime

## Used In

- [[conversational-state-machine]] — frontend for visualizing/interacting with the dialog context stack
