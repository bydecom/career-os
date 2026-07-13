---
id: docker
type: technology
name: "Docker"
schemaVersion: "1"
tags:
  - containerization
  - devops
  - infrastructure
status: active
level: intermediate
category: infrastructure
created: "2019-01-01"
updated: "2026-07-13"
---

## Problem

"Works on my machine" — differences between development, staging, and
production environments (OS versions, installed dependencies, system
libraries) cause bugs that only appear after deployment.

## Solution / Concept

Docker packages an application with its exact runtime environment (OS
libraries, dependencies, config) into an immutable image. Containers built
from that image run identically anywhere Docker is installed, because they
share the host kernel but isolate the filesystem and process namespace.

## Tradeoffs

- **Pro**: Environment parity between dev/staging/prod eliminates a whole class of bugs
- **Pro**: Images are versioned artifacts — easy rollback, reproducible builds
- **Pro**: Enables horizontal scaling via orchestrators (Kubernetes, ECS, Swarm)
- **Con**: Adds an abstraction layer to debug (networking, volumes, layer caching)
- **Con**: Image size/build time needs active management (multi-stage builds, `.dockerignore`)

## Used In

- [[career-os]] — planned for containerizing `services/*` runtime components (Phase 2+)
