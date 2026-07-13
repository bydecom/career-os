---
id: nodejs
type: technology
name: "Node.js"
schemaVersion: "1"
aliases:
  - node
tags:
  - runtime
  - backend
  - javascript
status: active
level: expert
category: runtime
created: "2018-01-01"
updated: "2026-07-13"
---

## Problem

JavaScript was originally locked inside the browser. Building backend
services, CLIs, or build tooling required a separate language and runtime,
fragmenting the stack.

## Solution / Concept

Node.js runs JavaScript outside the browser on Google's V8 engine, with an
event-driven, non-blocking I/O model. A single thread handles many concurrent
connections by never blocking on I/O — reads/writes are dispatched to libuv's
thread pool and resumed via the event loop.

## Tradeoffs

- **Pro**: One language across frontend and backend
- **Pro**: Non-blocking I/O is a natural fit for API/network-heavy workloads
- **Pro**: Massive package ecosystem (npm)
- **Con**: CPU-bound work blocks the event loop (needs worker threads / offloading)
- **Con**: Callback/Promise chains can get complex without discipline (async/await mitigates this)

## Used In

- [[career-os]] — the Compiler CLI, package build scripts, and future API/services all run on Node.js
