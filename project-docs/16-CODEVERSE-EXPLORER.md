# Codeverse Explorer
## Visual Codebase Storyteller

**Tier:** Secondary Project  
**Type:** AST-Driven Cartography Tool  
**Status:** Active Development — 60%  
**Stack:** React · TypeScript · D3.js · AST parsing · Three.js · Gemini API  

---

## The Problem

Code repositories are typically navigated by file path. You know the folder structure, you know the file name, you open it. This is efficient for people who already understand the codebase.

It is impenetrable for everyone else — the new team member, the auditor, the collaborator who needs to understand a system's logic without reading every file sequentially.

**Codeverse Explorer transforms a static code repository into a navigable 3D constellation.** Every file is a node. Every import, function call, and dependency is an edge. Files that call each other frequently are placed in gravitational proximity. Isolated modules float at the periphery. The shape of the codebase becomes visible as spatial structure.

> *A codebase is not a filing system. It is a city — with neighborhoods of related function, highways of data flow, and isolated districts that haven't been integrated yet.*

---

## Technical Pipeline

| Stage | Tool | Output |
|-------|------|--------|
| **AST Parsing** | TypeScript compiler API / Babel parser | Structured representation of every function, class, import, and export. Language-agnostic at the graph level. |
| **Dependency Graph** | Custom graph construction | Directed graph of all inter-file relationships — who imports what, who calls whom, what is shared. |
| **Force Layout** | D3-force-3d | 3D spatial layout computed from graph structure. Proximity reflects actual coupling, not file-path proximity. |
| **Visual Rendering** | Three.js / React Three Fiber | Interactive 3D constellation — navigable, zoomable, searchable. Node color encodes language/file type; node size encodes line count. |
| **Narrative Layer** | Gemini API integration | On demand, generates a plain-language explanation of any selected node's role, dependencies, and place in the larger system. |

---

## The STORYLINES Connection

Codeverse Explorer and STORYLINES share the same underlying methodology: force-directed 3D graphs where proximity encodes semantic relationship rather than administrative category.

- STORYLINES applies this to literary corpora
- Codeverse applies it to code repositories

The insight — that spatial layout computed from relational data reveals structure that hierarchical organization obscures — is identical in both cases.

This is not coincidence. It is the Systems Choreography methodology working across domains. **The Systems Choreographer does not build a new tool for each new problem; they recognize the same structural pattern and instantiate the same solution in the appropriate substrate.**

---

## Use Cases

1. **Engineering teams onboarding new developers** — A spatial overview of a codebase that communicates architectural intent before a single file is opened. New team members understand the system's logic in 20 minutes instead of 2 weeks.

2. **Code auditors and technical due diligence** — Investors, acquirers, and compliance reviewers who need to assess a codebase's structure and identify architectural debt without reading every file.

3. **Refactoring and architectural planning** — Engineers planning large-scale refactors who need to understand the full dependency graph before moving components. The visual representation makes circular dependencies and over-coupled modules immediately apparent.

4. **Teaching and pedagogy** — CS instructors who want to show students how real-world systems are structured — not the toy examples in textbooks, but actual deployed codebases.

---

## Status

- 60% complete — core graph rendering done; narrative layer in progress
- **Target:** Developer tools market; engineering team tooling
- **Strategic frame:** Strongest proof of technical depth for software-adjacent roles
