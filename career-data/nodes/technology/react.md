---
id: react
type: technology
name: "React"
schemaVersion: "1"
tags:
  - frontend
  - ui
  - javascript
status: active
level: expert
category: frontend
created: "2019-01-01"
updated: "2026-07-13"
---

## Problem

Manually synchronizing the DOM with application state as it changes is
error-prone and hard to scale past small pages — every state change needs
someone to remember which DOM nodes to update, and in what order.

## Solution / Concept

React lets you describe UI declaratively as a function of state (components
return what the UI *should* look like, not imperative DOM instructions). It
reconciles the previous and next virtual DOM trees and applies the minimal
set of real DOM mutations needed.

## Tradeoffs

- **Pro**: Declarative model scales better than manual DOM manipulation as apps grow
- **Pro**: Component model encourages reuse and testability
- **Pro**: Huge ecosystem (Next.js, React Query, Zustand, Radix, etc.)
- **Con**: Re-render performance requires active management at scale (memoization, virtualization)
- **Con**: Ecosystem churn — patterns for state management/data fetching have shifted multiple times

## Used In

- [[career-os]] — planned for the Portfolio frontend, the "IDE for Career" UI (`apps/web`, Phase 4)
