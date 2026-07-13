---
id: angular
type: technology
name: "Angular"
schemaVersion: "1"
tags:
  - frontend
  - ui
  - typescript
status: active
level: intermediate
category: frontend
created: "2026-06-01"
updated: "2026-07-13"
---

## Problem

Large frontend applications need structure — routing, state, forms, HTTP,
dependency injection — decided consistently across a team, rather than
assembled ad-hoc from many small libraries.

## Solution / Concept

Angular is an opinionated, batteries-included frontend framework built in
TypeScript. It provides routing, forms, HTTP client, and dependency
injection out of the box. Modern Angular (v17+) adds standalone components
(no `NgModule` boilerplate) and signals for fine-grained reactive state.

## Tradeoffs

- **Pro**: Consistent conventions across a codebase — less bikeshedding on "how do we structure this"
- **Pro**: Signals give React-hooks-like reactivity without the dependency-array footguns
- **Pro**: Built-in DI makes testing/mocking services straightforward
- **Con**: Steeper learning curve than React/Vue for newcomers
- **Con**: More ceremony for simple pages compared to a lighter framework

## Used In

- [[ecommerce-platform]] — the entire storefront + admin console frontend, using standalone components/signals, lazy-loaded `/admin` routes, and route guards (`authGuard`, `adminGuard`)
