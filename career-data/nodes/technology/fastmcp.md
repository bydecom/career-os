---
id: fastmcp
type: technology
name: "FastMCP"
schemaVersion: "1"
tags:
  - mcp
  - ai
  - developer-tooling
status: active
level: intermediate
category: ai
created: "2026-05-01"
updated: "2026-07-13"
---

## Problem

Exposing a tool's capabilities to an AI coding assistant (Cursor, Claude
Desktop) requires implementing the Model Context Protocol (MCP) — the
transport, tool schema declaration, and stdio handling — which is
boilerplate unrelated to the tool's actual logic.

## Solution / Concept

FastMCP is a Python framework for building MCP servers with minimal
boilerplate: decorate a function, and it becomes a callable tool exposed
over stdio to any MCP-compatible client. It handles the protocol plumbing
so the tool author only writes the actual capability (e.g. `get_impact`,
`extract_claims`).

## Tradeoffs

- **Pro**: Turns "build an MCP server" into "add a decorator" for the common case
- **Pro**: stdio transport means zero network/deployment configuration — the client (Cursor/Claude) launches the process directly
- **Con**: Being Python-only ties the tool's implementation language to Python, even if the consuming agent is language-agnostic

## Used In

- [[graphrag-code]] — exposes `plan_change`, `get_impact`, `get_context`, and related structural tools
- [[medical-citation-agent]] — exposes `extract_claims` as an MCP tool
