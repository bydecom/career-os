---
id: mongodb
type: technology
name: "MongoDB"
schemaVersion: "1"
tags:
  - database
  - nosql
status: active
level: beginner
category: database
created: "2026-01-01"
updated: "2026-07-13"
---

## Problem

Some data doesn't fit a fixed relational schema well — deeply nested,
variably-shaped documents (logs, flexible content models) are awkward to
force into rigid rows and columns, especially early in a project when the
shape of the data is still changing.

## Solution / Concept

MongoDB is a document-oriented NoSQL database storing JSON-like BSON
documents with a flexible schema. Related data can be embedded in a single
document instead of joined across tables, trading some consistency
guarantees for schema flexibility and simpler reads for document-shaped
data.

## Tradeoffs

- **Pro**: Schema flexibility is a real advantage when the data shape is still evolving or inherently variable
- **Pro**: Embedding related data avoids joins for read-heavy, document-shaped access patterns
- **Con**: Weaker cross-document transactional guarantees than a relational database by default
- **Con**: Denormalized/embedded data can drift out of sync if the same fact is duplicated across documents
