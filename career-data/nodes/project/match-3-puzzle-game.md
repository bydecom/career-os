---
id: match-3-puzzle-game
type: project
name: "Match-3 Puzzle Game"
schemaVersion: "1"
tags:
  - game-development
  - event-driven
status: active
role: "Game Engineer"
period: "Jun/2025 - Sep/2025"
visibility: private
created: "2025-06-01"
updated: "2026-07-13"
---

## Overview

A Match-3 puzzle game prototype built from provided visual concepts for an
academic product, using [[phaser]] on the web.

## Problem

Match-3 games need many levels with varying boards, obstacles, and win
conditions — hardcoding each level in game logic doesn't scale past a
handful of levels and makes level design a programming task instead of a
content task.

## Chosen Solution

- **Data-driven level engine**: board layouts, obstacles, and win
  constraints are entirely generated from JSON configuration, enabling
  zero-code level expansions
- **Event Bus** decoupling `GameScene` (core logic) from `UIScene`
  (rendering/HUD) — strict event-driven architecture rather than direct
  cross-scene method calls
- **Board Facade pattern**: orchestrates specialized, isolated modules
  (`Matcher`, `Powerups`, `Input`, `State`) instead of one monolithic game
  loop handling everything
- Core mechanics (cascading matches, tile swapping) modeled as
  deterministic Finite State Machines to prevent race conditions during
  rapid user input

## Key Decisions

- **FSM for tile swap/cascade instead of ad-hoc boolean flags** — a
  Match-3 board has many overlapping states (swapping, resolving matches,
  cascading, awaiting input) and a flags-based approach breaks under rapid
  input; a deterministic FSM makes illegal state transitions structurally
  impossible instead of relying on discipline to avoid them.
- **Event Bus over direct scene coupling** — kept `UIScene` from reaching
  into `GameScene` internals, so HUD/rendering changes never risk breaking
  core game logic.

## Lessons Learned

- Race conditions in fast-input games (rapid taps/swipes) are best
  prevented structurally (FSM) rather than defensively (guards/flags
  sprinkled through the input handler).
