---
id: phaser
type: technology
name: "Phaser"
schemaVersion: "1"
aliases:
  - phaser-3
tags:
  - game-development
  - javascript
status: active
level: intermediate
category: game-engine
created: "2025-06-01"
updated: "2026-07-13"
---

## Problem

Building a 2D web game from scratch means reimplementing a scene graph,
sprite rendering, tweening, and input handling — solved problems that
shouldn't be rebuilt per project.

## Solution / Concept

Phaser is an HTML5 2D game framework providing scenes, sprites, physics,
tweening, and input handling out of the box, running on Canvas/WebGL and
deployable directly to the web.

## Tradeoffs

- **Pro**: Batteries-included 2D game primitives (scenes, sprites, tweens) — no need to hand-roll a render loop
- **Pro**: Runs anywhere a browser does; trivially deployable (e.g. to Vercel as a static site)
- **Con**: 2D-only — not a fit if a project later needs 3D
- **Con**: Game architecture discipline (state machines, event buses) is still on the developer; Phaser doesn't enforce structure

## Used In

- [[match-3-puzzle-game]] — the entire game engine: scenes, board rendering, tile sprites, input handling
