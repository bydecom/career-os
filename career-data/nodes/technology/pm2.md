---
id: pm2
type: technology
name: "PM2"
schemaVersion: "1"
tags:
  - process-manager
  - devops
  - node
status: active
level: intermediate
category: infrastructure
created: "2026-06-01"
updated: "2026-07-13"
---

## Problem

A Node.js process is single-threaded and will crash-and-stay-down on an
uncaught error unless something supervises it; and a single instance can't
use more than one CPU core, capping throughput on a multi-core machine.

## Solution / Concept

PM2 is a process manager for Node.js. Cluster mode forks N worker processes
(one per core) behind a shared port, `pm2 reload` swaps them one at a time
for zero-downtime deploys, and `max_memory_restart` auto-restarts a process
that leaks memory past a threshold. `wait_ready` + `process.send('ready')`
lets PM2 know a new instance has actually finished booting (DB/Redis
connected) before it starts routing traffic to it.

## Tradeoffs

- **Pro**: Zero-downtime reloads without a separate orchestrator (Kubernetes, etc.) for a single-VM deployment
- **Pro**: `max_memory_restart` is a cheap safety net against slow memory leaks staying unnoticed
- **Con**: Cluster mode is not free correctness — code has to be cluster-safe first (no per-instance in-memory rate-limit counters, no per-instance cron-like intervals without a distributed lock), or scaling to N instances just multiplies the same bug N times
- **Con**: `listen_timeout` needs empirical tuning against real cold-start latency (e.g. Neon serverless Postgres wake-up), not a guessed default

## Used In

- [[ecommerce-platform]] — API cluster mode, dedicated `fork`-mode processes for the email/AI workers, `--dns-result-order=ipv4first` to avoid IPv6 DNS stalls on EC2, and graceful SIGTERM handling tied to `wait_ready`/`kill_timeout` for zero-downtime deploys
