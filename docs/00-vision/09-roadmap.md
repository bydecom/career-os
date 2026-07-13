# CareerOS Roadmap

**Status:** Accepted  
**Version:** 3.0  

CareerOS is built progressively based on **Business Capabilities**, moving from foundational knowledge structuring to fully automated AI experiences.

---

## Phase 0: Foundation
*Goal: Establish the Architecture and Design Language before writing code.*
- [x] Define Vision & Philosophy
- [x] Write Architecture Decision Records (ADRs)
- [x] Design Knowledge Ontology
- [x] Design Markdown Schema & Folder Conventions
- [x] Set Naming Conventions

## Phase 1: Knowledge Engine Core
*Goal: CareerOS can compile Markdown into Knowledge.*
- [x] Implement Zod Schemas for AST and FrontMatter Validation
- [x] Build the `packages/compiler` (Markdown Lexer, AST Parser, Semantic Analyzer) — originally planned as `services/parser`
- [x] Build the Ontology Validator
- [x] Build the Graph Construction Worker
- [x] Create CLI tools (e.g., `career compile`)

## Phase 2: Knowledge Retrieval Engine
*Goal: CareerOS can deterministically retrieve facts and semantic context.*
- [x] Implement BM25 Keyword Indexing
- [x] Implement Graph Traversal (Bidirectional PageRank)
- [x] Implement Vector Embeddings (Qdrant)
- [x] Implement Reciprocal Rank Fusion (RRF) for Hybrid Ranking
- [x] Establish Retrieval Benchmarks (Precision/Recall testing)

## Phase 3: Knowledge Conversation Engine
*Goal: The AI can logically formulate responses based on retrieved evidence.*
- [ ] Build the Intent & Strategy Planner
- [ ] Build the Knowledge Package Assembler
- [ ] Implement Vercel AI SDK (LLM Verbalization)
- [ ] Integrate Confidence Scoring Logic

## Phase 4: User Experiences
*Goal: Expose the compiled knowledge to human and machine readers.*
- [ ] Develop the "IDE for Career" Portfolio Frontend
- [ ] Develop the PDF Resume Generator
- [ ] Build the Interactive Graph Explorer View
- [ ] Build the MCP (Model Context Protocol) Server for Cursor/Claude

## Phase 5: Knowledge Authoring
*Goal: Make the process of adding knowledge seamless.*
- [ ] Build a VS Code Extension / Obsidian Plugin for live Node Validation
- [ ] Broken Link Checker
- [ ] Duplicate Alias Detection
- [ ] Node Recommendation System

## Phase 6: Automation
*Goal: Zero-touch deployments.*
- [ ] GitHub Actions for CI/CD
- [ ] Auto-compile Knowledge on `git push`
- [ ] Auto-generate and upload Vector Embeddings
- [ ] Re-deploy Vercel Frontend on IR change
