---
id: match-3-puzzle-game
type: project
name: "Jungle Gems"
schemaVersion: "1"
aliases:
  - jungle-gems
  - match-3-game
tags:
  - game-development
  - event-driven
  - phaser
status: active
role: "Game Engineer"
company: freelance
period: "Jun/2025 - Sep/2025"
demo: "https://match-3-two.vercel.app/"
visibility: public
created: "2025-06-01"
updated: "2026-07-18"
---

## Overview

A modular Match-3 game engine with data-driven level definitions and
deterministic gameplay state transitions. Built with [[phaser]] 3 + Vite —
mixin-style board modules (swap, match, gravity, refill, power-ups,
boosters, blockers) and JSON levels so designers extend content without
rewriting the core loop.

Live: [match-3-two.vercel.app](https://match-3-two.vercel.app/)

Built for an academic product from provided visual concepts (freelance).

## Highlights

- Data-driven level engine: boards, obstacles, and win constraints from JSON — zero-code level expansions.
- Event Bus decouples GameScene (core logic) from UIScene (HUD rendering).
- Board Facade orchestrates Matcher, Powerups, Input, and State modules.
- Deterministic FSM for swap/cascade to prevent race conditions under rapid input.

## Demo

![[cover.png|caption=Jungle Gems]]

![[demo.mp4|caption=Match-3 gameplay|poster=poster.png]]

## Problem

Match-3 needs many levels with irregular boards, blockers, move budgets,
and win conditions. Hardcoding each level in game logic does not scale —
level design becomes a programming task. Coupling HUD to board logic also
makes UI changes risk breaking cascades under rapid swipe input.

## Runtime Pipeline

1. Boot → Title → Preloader (assets) → Map (`PlayerDataManager` progress)
2. Level select → `LevelLoaderScene` loads JSON from `public/assets/levels/`
3. Parallel scenes: `GameScene` (board) + `UIScene` (HUD overlay)
4. `Board` facade wires `BoardCreator` · `BoardInput` · `BoardMatcher` ·
   `BoardPowerups` · `BoardState` (gravity / refill)
5. Match resolve → emit events (`gemsMatched`, `objectiveUpdated`, …)
6. UI / audio / popups react via event bus — no direct scene coupling
7. Win/lose → `PlayerDataManager` persists stars/progress (`localStorage`)

## Core Capabilities

### Board Facade + Focused Modules

`Board.js` orchestrates creation, input, matching, power-ups, and
state/gravity. Core algorithms stay readable as mechanics grow — not one
monolithic update loop.

### Data-driven Level Design

JSON owns `gridLayout` (incl. `null` holes for irregular shapes),
`blockerLayout`, `objectives`, `maxMoves`, `starTimes`, `availableGems`.
Designers tweak levels without touching Phaser code.

### Event-driven Scene Split

`GameScene` owns gameplay; `UIScene` owns HUD. Communication via shared
events (`gemsMatched`, `moveUsed`, `boosterSelected`, `levelWin` /
`levelLose`) — HUD changes never reach into board internals.

### Power-ups & Boosters

Match-4+ → Bomb / Color Bomb (+ combos, e.g. Bomb+Bomb 5×5) via
`BoardPowerups` + VFX managers. Player boosters (hammer, swap, rocket,
shuffle): UI selects → targeting mode → `board.useBooster(...)`.

### Blockers & Objectives

`BaseBlocker` → Stone / Rope with hit rules. Objectives target gems or
blocker types; Order panel updates from `objectiveUpdated` events.

### Progression Shell

World map + `LevelNode`, star thresholds, shop/spin/friend popups,
`AudioManager`, `localStorage` save. Live deploy on Vercel.

## Engineering Decisions

- **Board facade over god-object GameScene** — modules own match / power /
  gravity so cascades stay testable and extendable.
- **JSON levels over hardcoded boards** — content task stays content.
- **Event bus over direct scene refs** — UI/audio plug in without coupling.
- **Deterministic board state for input races** — illegal transitions under
  rapid swipe are structural, not flag soup (cascade / swap / await-input).

## Tradeoffs

- Bomb/Color Bomb live in `BoardPowerups` today — dedicated `Gem` subclasses
  are the natural OOP extension, not yet split.
- Client-only progress (`localStorage`) — leaderboard / `APIManager` planned.
- More blockers (ice, chains) and atlas/pooling polish still on roadmap.

## Evidence

- Implementation: `Board.js` + `board/*` · scenes (Map / Game / UI / popups)
  · `PlayerDataManager` · level JSON `level_1`…`level_9`
- Validation: Live playable build · core match/cascade/power-up/booster/
  blocker paths exercised in shipped demo
- Measurement: Viewport 576×1024 FIT · event table for HUD decoupling ·
  irregular boards via `null` cells
- Live: [match-3-two.vercel.app](https://match-3-two.vercel.app/)

Stack: [[phaser]], Vite (ES modules) · Freelance [[freelance]]

## Lessons Learned

- Race conditions under fast input are best prevented structurally
  (board state machine), not with guards sprinkled in the input handler.
- Data-driven levels turn Match-3 from “write code per level” into
  “author JSON” — the engine earns its keep when the ninth level costs minutes.
- Event buses pay off when HUD, SFX, and popups all need the same match
  signal without owning the board.
