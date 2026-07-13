# ADR-0009: Portfolio as a Projection

**Status:** Accepted  
**Date:** 2026-07-13  
**Owner:** Bang Thai Minh

---

# Context

Traditional portfolios are static websites. Developers spend weeks designing a "Projects" page and an "About" page, manually hardcoding text and images. When their skills evolve, updating the portfolio is a chore. CareerOS treats the portfolio differently.

---

# Decision

The Portfolio is not a static website; it is a **Projection** of the Knowledge Graph. 

There is no hardcoded "Projects" page. Instead, the Next.js frontend runs a graph query: `MATCH (n:Project) RETURN n ORDER BY n.endDate DESC`. It takes the resulting nodes and renders them. 

If a new Markdown node is committed to `career-data/nodes/project/`, the Portfolio automatically updates. 

## The Timeline View
The main interface of the Portfolio is a chronologically ordered Graph Explorer, allowing visitors to click on a Company, which expands into Projects, which expand into Skills and Evidence.

---

# Design Principles

## AI is a View (and so is the Portfolio)
Both the AI Chatbot and the visual Portfolio are equal-class citizens. They are just different lenses through which a user can query the Knowledge Graph.
