# ADR-0010: Resume as a Projection

**Status:** Accepted  
**Date:** 2026-07-13  
**Updated:** 2026-07-14  
**Owner:** Bang Thai Minh

---

# Context

Candidates typically maintain multiple PDF resumes for different roles (e.g., Backend Developer, Fullstack Developer, AI Engineer). This leads to fragmentation and desynchronization of career details. When a skill is updated, it must be manually edited across all PDF/Word templates.

---

# Requirements

- A resume should not be a static document.
- The system must be able to generate a customized resume when a Job Description (JD) is provided.
- A master resume must still be generable with no JD (`career resume`).
- Information must remain consistent across all generated resumes (Single Source of Truth = Knowledge Graph).

---

# Considered Options

## Option A — Multiple Static Markdown/PDF Resumes
### Advantages
- Easy to manage individually.
### Disadvantages
- Painful to sync updates across files.
- Static and not tailored to specific JDs.

Decision:
❌ Rejected

## Option B — Resume as a Graph Projection (with optional JD query)
### Advantages
- Master resume = deterministic projection of the full graph (`scope: "master"`).
- Tailored resume = same projection pipeline constrained by a JD query (`scope: "tailored"`, v1.1+).
- Ensures all updates are centralized (Single Source of Truth).
- HTML / PDF / JSON Resume / LaTeX can all render from the same `ResumeIR`.
### Disadvantages
- Requires a layout compiler (Markdown → HTML → PDF) for later slices.

Decision:
✅ Accepted

---

# Decision

**A Resume is a projection of the Career Knowledge Graph. A Job Description is an optional query that constrains the projection to produce a tailored resume.**

```text
Knowledge Graph
      ↓
Resume Projection (scope: master | tailored)
      ↓
ResumeIR
      ↓
Renderer (Markdown → HTML → PDF …)
```

| Scope | Meaning | Runtime |
|---|---|---|
| `master` | Project all resume-relevant nodes (profile, experience, projects, skills, …) | **No** Retriever / BM25 / RRF / Vector / LLM |
| `tailored` | Constrain projection by JD (v1.1+) | May use Retriever |

JD is one kind of query. It is **not** the definition of Resume.

---

# v1 design notes (locked for Markdown slice)

| Decision | Rule |
|---|---|
| API | `projectResume(graph, { scope: "master" \| "tailored" })` — business language, not `query: "all"` |
| Profile | `type: profile` is a **presentation node**. May merge into `Person` in v2 — do not overthink |
| Skills | collect → dedupe by id → sort by name → render (never dump duplicate techs) |
| Body | Resume ≠ Portfolio: only Summary / Key Decisions / Metrics (capped) — no Architecture dump |
| Stable sort | Experiences: `startDate DESC`, then `id ASC`. Projects: `updated DESC`, then `id ASC` |
| Diagnostics | Projection returns `{ ir, diagnostics }`; CLI prints compiler-style counts + warnings |
| Output slices | v1.0.0 Markdown → v1.0.1 HTML → v1.0.2 PDF; JD orthogonal (`--jd` later) |

---

# Design Principles

This decision directly implements the following core principles:
- **Composable Knowledge**: Tri thức có thể lắp ghép linh hoạt.
- **Single Source of Truth**: Sửa thông tin ở một Node sẽ cập nhật tất cả các CV được sinh ra sau này.
- **Deterministic over Magic**: Master resume compiles directly from the graph.
