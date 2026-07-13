---
id: pyinstaller
type: technology
name: "PyInstaller"
schemaVersion: "1"
tags:
  - packaging
  - python
  - desktop
status: active
level: intermediate
category: tooling
created: "2025-09-01"
updated: "2026-07-13"
---

## Problem

Distributing a Python tool to non-technical end users (e.g. port operators
running an offline validator) can't assume they have Python installed or
know how to manage a virtual environment.

## Solution / Concept

PyInstaller bundles a Python application and its interpreter into a single
standalone executable, so end users just double-click and run — no Python
install, no `pip install`, no environment setup.

## Tradeoffs

- **Pro**: Removes the single biggest distribution barrier for Python desktop tools — no runtime install required
- **Pro**: Works fully offline, which matters for field/port operations without reliable internet
- **Con**: Resulting executables are large (bundle the interpreter itself)
- **Con**: Platform-specific — a Windows build won't run on macOS/Linux, needing a separate build per target OS

## Used In

- [[container-bay-plan-validator]] — packaged as a standalone executable for offline port operations
