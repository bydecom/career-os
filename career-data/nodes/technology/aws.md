---
id: aws
type: technology
name: "AWS"
schemaVersion: "1"
aliases:
  - amazon-web-services
tags:
  - cloud
  - infrastructure
  - devops
status: active
level: intermediate
category: infrastructure
created: "2026-06-01"
updated: "2026-07-13"
---

## Problem

Running a production application needs compute, static hosting, a CDN, and
object storage — building and operating all of that yourself (racking
servers, running a CDN edge network) is not where engineering time should
go for a small team.

## Solution / Concept

AWS provides these as managed, pay-as-you-go services. In this project:
EC2 runs the API/workers under PM2, S3 stores product images, CloudFront
serves both the static frontend and S3-backed images through CDN edge
caching, and Origin Access Control (OAC) keeps the S3 bucket itself private
while still letting CloudFront serve its contents.

## Tradeoffs

- **Pro**: CloudFront edge caching cuts latency for users far from the origin, and cuts S3 egress cost
- **Pro**: S3 + presigned URLs let the browser upload directly to storage without the API ever streaming large binaries
- **Pro**: EC2 gives full control over the runtime (PM2, Docker for RabbitMQ) when a fully-managed PaaS would be too restrictive
- **Con**: Deploy ordering matters — blocking public S3 access before CloudFront OAC is verified breaks every image in production
- **Con**: A single EC2 instance is a single point of failure without extra work (auto-scaling groups, load balancer)

## Used In

- [[ecommerce-platform]] — EC2 (API + PM2 cluster + RabbitMQ container), S3 + CloudFront (frontend static hosting + product image CDN with OAC), presigned S3 uploads for the admin product form
