# Presentation Layer (The IDE View)

**Author:** Bang Thai Minh  
**Status:** Accepted  
**Version:** 2.0  

---

## 1. The UX Problem

A common mistake with Graph-based projects is greeting the user with a massive, interactive 3D node graph. **95% of recruiters will close the tab.** They do not want to parse a graph; they want to know:
- Is this person good?
- What have they built?
- Are they worth interviewing?

Therefore, the Presentation Layer of CareerOS is not a raw graph dump. It is a carefully curated story, designed to look and feel like an **IDE for your Career**.

---

## 2. The IDE Concept

CareerOS replaces the traditional "Portfolio" with an "Engineering Notebook" or "Knowledge Explorer". 

The core UI resembles a clean, professional development environment (like VS Code or Obsidian). 

```text
+-------------------------------------------------------------+
| CareerOS                                      ● Connected   |
+-------------------------------------------------------------+
| 📁 Experiences       | [RabbitMQ] ✕  | [ADR-001] |          |
|   ├── FPT Software   | ──────────────────────────────────── |
|   ├── Freelance      |                                      |
|                      | # Overview                           |
| 📁 Projects          | RabbitMQ is an open-source message...|
|   ├── GraphRAG-Code  |                                      |
|   ├── E-Commerce     | # Projects                           |
|                      | - E-Commerce Platform                |
| 📁 Technologies      | - Medical Citation Agent             |
|   ├── RabbitMQ       |                                      |
|   ├── Redis          | # Architecture Decisions             |
|                      | - Decoupled Order Queue (ADR-003)    |
| 📁 Decisions (ADRs)  |                                      |
|   ├── ADR-001        |                                      |
|                      |                                      |
|                      | ──────────────────────────────────── |
|                      | 💬 Ask AI about this node...         |
+-------------------------------------------------------------+
```

When a recruiter clicks a node on the left, it opens in a Tab on the right, providing structured sections (Overview, Architecture, Metrics, Evidence). At the bottom of every tab is the context-aware Chat.

---

## 3. The Landing Page Story Arc

For mobile users or those wanting a quick scroll, the landing page follows a strict narrative flow:

1. **Hero**: Minimalist, strong typography. No heavy 3D shaders.
   > *"I build deterministic AI systems that prioritize evidence over hallucination."*
2. **Featured Projects**: Clean, expandable cards showing the tech stack and metrics.
3. **Technical Journey**: A chronological timeline (MVC ➔ Freelance ➔ FPT ➔ Applied AI).
4. **Engineering Philosophy**: Expandable principles (Knowledge First ➔ Evidence First).
5. **Knowledge Explorer**: The entry point into the Graph (Search or click a skill).
6. **AI Chat**: Placed at the very end. *("Still have questions? Ask my AI.")*

---

## 4. Deep-Dive Pages

The true power of the IDE layout shines when recruiters dive into specific nodes.

### Project Detail
- Overview
- Problem Statement
- Interactive Architecture Diagram (SVG) - Clicking a database opens its Technology Node.
- Key Decisions (ADRs)
- Metrics (Before / After)
- Lessons Learned

### Technology Page (e.g., RabbitMQ)
- Overview
- Where I used it (Projects)
- Architecture Decisions made involving it
- Related Concepts (Inheritance graph)

---

## 5. Mobile vs Desktop Experience

- **Desktop**: The full IDE experience. Split panes, Tabs, and the Interactive Graph Explorer.
- **Mobile**: The Graph is completely disabled. The UI degrades gracefully into a linear feed of Timeline, Project Cards, and a floating Chat button.

---

## 6. Animation Philosophy

CareerOS relies on **subtle, purposeful animations** (via Framer Motion). 
- Expanding a card.
- Highlighting a node in the graph.
- Seamless tab switching.

We explicitly reject particle effects, WebGL galaxies, or scroll-jacking. The design must scream "Senior Engineer" through its organization of knowledge, not its CSS tricks.
