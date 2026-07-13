---
id: jwt
type: technology
name: "JWT"
schemaVersion: "1"
aliases:
  - json-web-token
tags:
  - auth
  - security
status: active
level: intermediate
category: security
created: "2026-06-01"
updated: "2026-07-13"
---

## Problem

A stateless API needs a way to verify "who is this request from" without
querying a session store on every single request — but that statelessness
creates a hard problem: how do you revoke a token before it naturally
expires?

## Solution / Concept

JWT is a signed, self-contained token format encoding claims (user ID,
role, a unique `jti`) that a server can verify without a database lookup.
The revocation problem is solved separately — typically with a short
expiry plus a blacklist (checked by `jti`) for the rare case a token must
be invalidated early (logout, compromise).

## Tradeoffs

- **Pro**: Stateless verification — no DB/session-store round trip to check "is this user authenticated"
- **Pro**: Short-lived access tokens + refresh rotation limits the blast radius of a stolen access token
- **Con**: Can't be revoked by design alone — needs a blacklist or short expiry as a workaround, which reintroduces some statefulness
- **Con**: If Redis (blacklist store) is down, you're forced into an explicit fail-open/fail-closed trade-off rather than a free lunch

## Used In

- [[ecommerce-platform]] — short-lived access JWT (in-memory client-side) + refresh-token rotation + `jti` blacklist on logout, with a hybrid fail-open/closed policy when Redis is unavailable
