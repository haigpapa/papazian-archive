# STORYLINES
## 3D Spatial Knowledge Graph

**Tier:** Lead Project  
**Type:** Deployed Application  
**Status:** Live  
**Stack:** React · TypeScript · Google Gemini · Three.js · Cloudflare Workers KV · Vercel  

---

## The Premise

The canon of world literature is organized by alphabet, by author, by date, by genre. These are administrative categories. They tell you where a book lives on a shelf. They tell you nothing about which ideas in that book are in conversation with ideas in a book shelved three floors away, written a century earlier, in a language no one speaks anymore.

STORYLINES is built on a different premise: **intellectual proximity is not alphabetical but gravitational.** Ideas with thematic mass attract each other across time and language. The force-directed physics engine is not a visualization metaphor — it is the most accurate model available for how literary influence actually works.

---

## The Application

STORYLINES is a deployed browser-based application that transforms literary archives into navigable 3D knowledge graphs.

A user enters a corpus of texts. The system analyzes semantic relationships using AI inference, assigns each text a node in three-dimensional space, and calculates gravitational forces between nodes based on thematic adjacency. The resulting constellation is interactive: nodes can be queried, connections explored, clusters reveal emergent patterns that no single reading of any individual text would surface.

### Core Features

| Feature | Description |
|---------|-------------|
| **Force Physics** | Nodes repel and attract based on semantic distance computed by AI embedding models. The 3D layout is not designed — it emerges from the data's own structure. Every constellation is unique to the corpus that generated it. |
| **Real-Time Query** | Users search by theme, word, or concept. Matching nodes illuminate; non-matching nodes recede. The graph re-orients around the query without losing its underlying structure. |
| **Connection Rendering** | Edges between nodes are rendered with variable weight and opacity based on connection strength. The visual grammar distinguishes strong thematic overlap from weak associative resonance. |
| **Temporal Layer** | An optional time-axis collapses or expands the constellation chronologically, revealing how ideas cluster differently across historical periods. |

---

## Why Force-Directed Physics Is Not Just a Visual Choice

Standard knowledge graphs are hierarchical: a root concept branches into subcategories. The hierarchy is imposed by whoever designed the taxonomy. STORYLINES rejects this.

A force-directed graph has no imposed hierarchy — every node's position is determined by its relationship to every other node. The resulting structure is the graph's own argument about what matters and what connects.

When STORYLINES places Mahmoud Darwish in gravitational proximity to Czesław Miłosz despite the fact that they wrote in different languages, on different continents, about different specific displacements, it is not making a curatorial claim — it is reporting what the texts themselves produce when analyzed for semantic structure.

**Intelligence is a consequence of proximity.** Two texts that never cite each other may be in closer conversation than any two books on the same shelf.

---

## Technical Stack

- **React / TypeScript** — application framework
- **Three.js** — 3D rendering
- **Google Gemini** — semantic embedding and AI inference
- **Force-directed graph algorithm** — custom implementation
- **Cloudflare Workers KV** — edge caching (7-day TTL, ~90% API cost reduction)
- **Vercel** — deployment

The edge caching architecture reduces Gemini API costs by approximately 90% for returning queries. Literary and cultural data changes slowly, making a 7-day cache effective for the vast majority of requests. This is not a technical footnote — it is evidence of systems thinking applied to deployment economics.

---

## Applications

1. **Literary Research** — Scholars exploring a corpus for emergent structural patterns rather than confirming pre-existing interpretive frameworks. The graph does not know what it's supposed to find.

2. **Archival Navigation** — Institutions with large document archives (libraries, foundations, publishing houses) that need a non-keyword interface for exploratory discovery. Useful when you don't know what you're looking for.

3. **Educational Context** — Teaching literary history by showing students how ideas travel across language, culture, and time rather than presenting a canonical sequence of individual authors.

4. **Creative Development** — Writers and composers mapping the intellectual neighborhood of a project before building it — understanding what already occupies the territory they're moving into.

---

## Strategic Position

STORYLINES is deployed. It runs. A reviewer can open a browser, enter a corpus, and watch the system think in real time. This is not a prototype, a mockup, or a described capability. It is functioning software with an interaction model that is immediately comprehensible and immediately surprising.

It demonstrates the most transferable competency in the portfolio: the ability to take an abstract concept (thematic proximity as gravitational force) and implement it as a working system that produces outputs a human couldn't have produced without it.

---

## Methodology Connection

STORYLINES and Codeverse Explorer share the same underlying methodology: force-directed 3D graphs where proximity encodes semantic relationship rather than administrative category. STORYLINES applies this to literary corpora. Codeverse applies it to code repositories.

The insight — that spatial layout computed from relational data reveals structure that hierarchical organization obscures — is identical in both cases. This is not coincidence. It is the Systems Choreography methodology working across domains.

---

## Documentation Gaps

- 30-second screen recording needed
- Use-case one-pager needed
- **Best single-click proof-of-competency in the portfolio**
