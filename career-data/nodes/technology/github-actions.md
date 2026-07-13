---
id: github-actions
type: technology
name: "GitHub Actions"
schemaVersion: "1"
tags:
  - ci-cd
  - devops
status: active
level: intermediate
category: infrastructure
created: "2026-06-01"
updated: "2026-07-13"
---

## Problem

Manually running tests and deploying on every change doesn't scale past a
handful of commits, and is exactly the kind of repetitive, error-prone task
that should be automated rather than trusted to human discipline.

## Solution / Concept

GitHub Actions runs YAML-defined workflows directly on GitHub, triggered by
events like `push` or `pull_request` — running test suites, and executing
multi-step deploy pipelines (backup → deploy → smoke test → rollback) with
no separate CI infrastructure to host.

## Tradeoffs

- **Pro**: No separate CI server to host/maintain — lives alongside the code in the same platform
- **Pro**: Conditional steps (`if: failure()`) make auto-rollback pipelines straightforward to express
- **Con**: Vendor-coupled to GitHub; migrating to another CI provider means rewriting workflows
- **Con**: Debugging a failing workflow step often means push-and-check-logs iteration, slower than local debugging

## Used In

- [[ecommerce-platform]] — CI/CD pipeline: automated backend deploy to EC2 with smoke-test-gated auto-rollback, frontend S3 sync + CloudFront invalidation, and Jest test runs with coverage artifacts
- [[medical-citation-agent]] — CI running 96 regression tests across Python 3.10 and 3.12
