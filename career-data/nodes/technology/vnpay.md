---
id: vnpay
type: technology
name: "VNPay"
schemaVersion: "1"
tags:
  - payment
  - fintech
  - integration
status: active
level: intermediate
category: payment
created: "2026-06-01"
updated: "2026-07-13"
---

## Problem

Accepting real payments in Vietnam requires integrating a local payment
gateway with its own signature scheme, callback (IPN) contract, and strict
correctness requirements — a bug here means either losing money or charging
a customer without fulfilling the order.

## Solution / Concept

VNPay is a Vietnamese payment gateway. The integration has two legs: (1)
building a signed "create payment" URL the browser redirects to, and (2) an
IPN (Instant Payment Notification) webhook VNPay calls back with a signed
payload that must be verified and processed idempotently — VNPay retries the
webhook if the response `RspCode` isn't `00`, which is a feature (a free
retry mechanism), not something to route around.

## Tradeoffs

- **Pro**: Signature-based create/verify prevents URL/parameter tampering
- **Pro**: IPN retry-until-acknowledged behavior gives free at-least-once delivery, if you respect the `RspCode` contract instead of trying to fake immediate success
- **Con**: Sandbox accounts (free tier) can't reliably receive real IPN callbacks to a developer's public IP — end-to-end testing has to rely on unit tests + manually simulated webhook calls
- **Con**: Amount/timezone (GMT+7) formatting must be exact or the signature check silently fails

## Used In

- [[ecommerce-platform]] — checkout payment (sandbox create URL + IPN verify), with Prisma-transaction-wrapped status updates, `P2002`-based duplicate-IPN handling, and 25 unit tests covering signature verification and IPN edge cases
