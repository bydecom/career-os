---
id: rabbitmq
type: technology
name: "RabbitMQ"
schemaVersion: "1"
aliases:
  - rabbit
  - mq
tags:
  - message-broker
  - async
  - amqp
status: active
level: intermediate
category: messaging
created: "2024-01-01"
updated: "2026-07-13"
---

## Problem

Synchronous HTTP calls between services create tight coupling. A slow downstream service blocks the entire request chain and causes cascading failures.

## Solution / Concept

RabbitMQ is a message broker implementing AMQP. Producers publish messages to exchanges; consumers pull from queues. Decoupling is achieved because producers never wait for consumers.

## Why (First Principles)

```
Problem  → Direct HTTP: caller blocks until callee responds
          → One slow service = entire pipeline degraded

Solution → Message Queue: caller publishes and moves on
          → Consumer processes at its own pace
          → Backpressure: queue absorbs traffic spikes
```

## Tradeoffs

- **Pro**: Decoupling, backpressure, retry on failure, dead-letter queues (DLQ)
- **Pro**: Durable messages survive broker restarts
- **Con**: Adds operational complexity (broker to manage, monitor)
- **Con**: At-least-once delivery requires idempotent consumers
- **Con**: Message ordering not guaranteed across multiple consumers

## Failure Modes

- Consumer crashes mid-processing → message returned to queue if `ack` not sent
- Queue fills up → publisher blocks (if `mandatory` flag set)
- Network partition → publisher cannot confirm delivery

## Evidence

- Used in [[career-os]] for async pipeline processing
- Dead-letter queue pattern: unprocessable messages routed to DLQ for inspection

## Used In

- [[career-os]] — async compilation events routed between services
