# The Papazian Archive: Spatial Atlas Engine & Coordinate System Specification

---

## 1\. Executive Summary & Core Strategic Intent

This document serves as the definitive Source of Truth for the Spatial Atlas Engine (Map View) of the Papazian Archive. It consolidates previous research, technical specifications, and UI/UX critiques into a single, cohesive schematic.  
The Map View rejects static, chronological portfolios in favor of Systems Choreography—treating 15 years of creative capital (spanning music, architecture, text, and code) as a navigable, relational coordinate space. By organizing the archive as a Negentropic Machine, the visual interface uses physical, spatial, and algorithmic logic to resist memory erasure.  
---

## 2\. The Cartesian Coordinate System

The entire dataset of 147 project nodes is mapped within a 3D WebGL Cartesian coordinate grid using three discrete thematic parameters:

### 2.1 Geographic Axis (X)

Specifies the physical or digital location of project inception:  
0.0 (Beirut): Foundational Middle Eastern works, early architectural designs (DW5), and collective band history.  
0.5 (Europe / MENA): Inter-regional collaborations, tours, and European co-productions.  
0.8 (LA / Transit): In-between states, trans-regional performances, and works of migration.  
1.0 (New York City): Active NYC studio operations, code-level R\&D, and Queens-based residencies.

### 2.2 Chronological Axis (Y)

Specifies the literal year of creation or publication, ranging continuously from 2004 to 2026\.

### 2.3 Impact & Gravity Axis (Z)

Determines the node's visual prominence, scale, and detailing in the spatial field:  
Z \= 1 (Flagship Nodes / Core Anchors): Massive visual anchors that act as the structural stars of the constellation.  
Z \= 2 (Strong Secondary Nodes / Technical Grid): Experimental, technical, and architectural secondary systems.  
Z \= 3 (Archive & Texture Nodes / Fine Detail): Individual songs, documentary clippings, and raw process files providing texture.  
---

## 3\. Map View Mechanics & Visual DNA

The Map View is designed to feel like an active diagnostic terminal or a scientific instrument rather than a standard website.

### 3.1 Taxonomy Color System

To allow immediate visual sorting across the coordinate field, the engine assigns colors to nodes, connection pathways, and metadata indicators based on their native domain:  
Sound: \#9fd6bf (Sage Green) — Alternative CRT high-contrast: \#ff6b35 (Active Orange)  
Code: \#7aa6ff (Steel Blue)  
Image: \#d7e7ef (Cool White-Blue) — Alternative CRT high-contrast: \#22d3ee (Active Cyan)  
Space: \#c7b28a (Warm Sand)  
Systems: \#8fa8c2 (Slate)  
Text: \#d5a2a2 (Dusty Rose) — Alternative CRT high-contrast: \#c084fc (Active Purple)

### 3.2 Visual & Shader Specifications

Grey-Field Xerox Post-Processing: To enhance the forensic atmosphere, node meshes default to grayscale using a custom luma filter: clamp((luma \- 0.5) \* 1.35 \+ 0.5, 0.0, 1.0).  
Hover Color Restoration: When a user hovers over or approaches a node, its custom uHover uniform interpolates to 1.0, restoring full color spectrum fidelity in-place.  
Chromatic Aberration: Scroll and panning velocity are linked directly to an RGB channel-split via the uVelocity shader parameter.  
CRT Scanline Layer: A post-processing CRT filter projects faint, moving scanlines, subtle barrel distortion, and an illuminated phosphor bloom over colored elements in the WebGL scene.  
---

## 4\. Brutalist UI/UX Schematic Refinements

To resolve visual clutter and ground the interface in Bureaucratic Brutalism, the Map View enforces five strict architectural refinements:  
Orthographic Circuit Routing: Replaces loose, diagonal, force-directed graph lines with rigid, 90-degree Manhattan routing. Connection lines between nodes must look like clean, technical circuitry rather than a biological spiderweb.  
Rigid Framing & Metadata: Every node thumbnail is bound in a sharp, 1px grey container overlayed with monospaced metadata text tags on focus (e.g., \[ID: OBJ-042\] // \[TGT: SOUND\] // \[DATE: 2021\]).  
Cartesian Axis Background Grid: Implements a faint, structural coordinate grid in the background of the black void. Coordinates (X, Y, Z) and Sector divisions are mapped to prevent user navigation vertigo.  
Desaturated Navigation Minimap: Replaces colored dots in the upper-right Field Map with desaturated whites and geometric glyphs (squares for Text, circles for Image, triangles for Systems) that match the filter taxonomy.  
Environmental Typography: Floating giant, low-opacity text labels directly behind 3D clusters (e.g., SYS\_01 or SOUND\_CLUST) to serve as literal typographic landmarks as the camera rotates.  
---

## 5\. Master Atlas Project Ledger (The 147 Nodes)

The project database maps all 147 nodes across their spatial coordinate coordinates:

### 5.1 Tier A: Flagship Nodes (The Core Anchors / Z \= 1\)

| Project Name | Year (Y) | X (Geography) | Z (Impact) | Primary Domain(s) | Description | Connections |
| :---- | :---: | :---: | :---: | :---: | :---- | :---- |
| TEBR | 2024–26 | 0.9 | 1 | Sound, Code | Synthesis of violin, voice, and generative AI systems. | Fictive Environments, STTM |
| Mashrou' Leila | 2008–22 | 0.5 | 1 | Sound, Visual, Impact | Global music collective; Creative Direction & Performance. | Rolling Stone, Ibn El Leil |
| Fictive Environments | 2025–26 | 1.0 | 1 | Architecture, Code, Narrative | Primary solo studio identity and "operating system." | All NYC nodes |
| MEKENA NYC | 2025–26 | 1.0 | 1 | Architecture, Impact | Adaptive reuse and residency program in Queens. | Fictive Environments |
| Sometimes I Wake Up Elsewhere | 2025–26 | 1.0 | 1 | Narrative | 108-entry modular literary manuscript. | Cartography of Absence |
| The Localization Gap | 2024 | 1.0 | 1 | Code, Impact | Forensic AI audit of cultural and linguistic bias. | HAH-WAS, FRANK |
| The Cost of Being Queer & Arab | 2020 | 1.0 | 1 | Narrative, Impact | NYT op-ed and advocacy manifesto. | Mashrou' Leila |
| The Cartography of Absence | 2024 | 1.0 | 1 | Narrative, Visual | Bureaucratic autofiction exploring displaced identity. | Walaw Studio |
| The Crane Song | 2020 | 0.8 | 1 | Narrative, Sound | Literary fiction and multimedia performance piece. | Variations on Cranes |
| 427 AI Tracks Archive | 2024 | 1.0 | 1 | Sound, Code | Repository of generative audio experiments. | TEBR, Meaning Stack |
| The Meaning Stack | 2025 | 1.0 | 1 | Code | Technical framework for cross-disciplinary logic. | Systems Choreography |
| Systems Choreography | 2024 | 1.0 | 1 | Code, Architecture | Core methodology at the intersection of code/sound. | Fictive Environments |
| Rolling Stone Cover | 2017 | 0.2 | 1 | Visual, Impact | Historic first Arabic band cover; cultural milestone. | Mashrou' Leila |
| Lede.nyc | 2026 | 1.0 | 1 | Code, Narrative | Digital identity and domain project for New York. | Fictive Environments |

### 5.2 Tier B: Strong Secondary (Technical & Architectural / Z \= 2\)

| Project Name | Year (Y) | X (Geography) | Z (Impact) | Primary Domain(s) | Description | Connections |
| :---- | :---: | :---: | :---: | :---: | :---- | :---- |
| Sophie’s World | 2012 | 0.6 | 2 | Visual, Code | Early AI short film; Bartlett dissertation companion. | Low Res Thesis |
| Architecture in Low Res | 2015 | 0.6 | 2 | Architecture, Visual | Master’s thesis on digital architectural perception. | Sophie's World |
| B018 Nightclub | 2008 | 0.0 | 2 | Architecture | Architectural work on iconic Beirut club. | Plot House |
| The Labyrinth | 2024 | 1.0 | 2 | Narrative, Visual | Recursive novel/script involving Sayat Nova. | The Annex |
| The Annex | 2024 | 1.0 | 2 | Architecture, Narrative | Stage design script exploring memory space. | The Labyrinth |
| Vessel Orchestra | 2019 | 1.0 | 2 | Sound, Architecture | Performance at The Met using artifacts. | Mashrou' Leila |
| Space Time Tuning Machine | 2021 | 0.9 | 2 | Sound, Code | AI-augmented instrument and performance engine. | TEBR, DÉRIVE |
| Yo-Yo Ma Collaboration | 2021 | 0.1 | 2 | Sound | Performance in Byblos; synthesis of cello/voice. | Mashrou' Leila |
| Ibn El Leil | 2015 | 0.4 | 2 | Sound, Visual | Third studio album; baroque pop narrative. | Raasuk |
| Raasük | 2013 | 0.2 | 2 | Sound, Visual | Second studio album; focus on movement/grit. | El Hal Romancy |
| El Hal Romancy | 2011 | 0.0 | 2 | Sound, Visual | EP exploring romantic bureaucracy. | Leila (2009) |
| Plot House | 2009 | 0.0 | 2 | Architecture | Residential architectural project in Beirut (DW5). | B018 |
| FRANK | 2026 | 1.0 | 2 | Code, Impact | News analysis application for bias detection. | Localization Gap |
| SUNBURN | 2026 | 1.0 | 2 | Sound, Architecture | Climate data sonification installation. | Systems Choreography |
| Post-Apocalyptic Walking Tour | 2020 | 0.0 | 2 | Visual, Architecture | AR performance overlaying future ruins on Beirut. | Variations on Cranes |
| Skyline of Insomnia | 2018 | 0.0 | 2 | Visual, Architecture | Visual study of nocturnal urban density. | Beirut School |
| Bureaucratic Surrealism | 2024 | 1.0 | 2 | Narrative, Visual | Aesthetic framework for institutional absurdity. | Cartography of Absence |
| Telescode | 2025 | 1.0 | 2 | Code | Code visualization and interactive mapping tool. | Meaning Stack |
| MENARA | 2025 | 1.0 | 2 | Architecture, Code | Generative architectural visualization project. | MEKENA NYC |
| ITP Camp Prototypes | 2024 | 1.0 | 2 | Code, Sound | Experimental tech objects from NYU. | Systems Choreography |
| Artistic Freedom Initiative | 2023 | 1.0 | 2 | Impact, Narrative | Campaigns for human rights and creative liberty. | Cost of Being Queer |
| Souad | 2014 | 0.6 | 2 | Narrative, Visual | Installation and novella exploring family archive. | Elsewhere |
| The Beirut School | 2019 | 0.0 | 2 | Sound, Visual | Anthology project and performance cycle. | Mashrou' Leila |
| Material for a Novel | 2014 | 0.6 | 2 | Visual, Narrative | Video essay on tragic endings and memory. | Sophie's World |
| HAH-WAS | 2026 | 1.0 | 2 | Code | Hallucination-detection engine for LLMs. | Localization Gap |
| Plot \#1063 Tower | 2010 | 0.0 | 2 | Architecture | Architectural high-rise in Beirut (DW5). | DW5 |
| 2006 Reconstruction | 2006 | 0.0 | 2 | Architecture, Impact | Post-conflict urban mapping/planning projects. | AUB |
| New York Voices | 2023 | 1.0 | 2 | Sound, Visual | Commissioned performance at Joe's Pub. | Public Theater |
| People Like Us Podcast | 2021 | 1.0 | 2 | Sound, Visual | Original score and visual identity for series. | New York |
| Museum of Architecture | 2009 | 0.0 | 2 | Architecture | Award-winning AUB design project. | Fawzi Azar Award |
| Arabic Pop 1925–2025 | 2025 | 0.5 | 2 | Sound, Code | Interactive mapping of musical evolution. | TEBR |
| Stage Architecture | 2015–22 | 0.5 | 2 | Architecture, Visual | Narrative scenography for global tours. | Mashrou' Leila |
| NOWHERE/ELSEWHERE | 2022 | 0.8 | 2 | Visual, Narrative | Visual media study on transit states. | Crane Song |
| Kardia | 2021 | 0.9 | 2 | Code, Visual | Medical/Biological data visualization project. | Body Log |
| Loop Corridor | 2025 | 1.0 | 2 | Architecture, Sound | Virtual architectural space for sound. | Loop Corridor |
| 3D-Beat-Synth | 2025 | 1.0 | 2 | Sound, Code | Physical/Digital instrument prototype. | ITP Camp |
| STORYLINES | 2024 | 1.0 | 2 | Narrative, Code | Interactive fiction/logic engine. | Labyrinth |
| Architectures of Belonging | 2021 | 1.0 | 2 | Architecture, Narrative | Research on spatial agency and identity. | NYU Residency |
| The Codex Project | 2025 | 1.0 | 2 | Code, Visual | Visualizing hidden metadata in archives. | Meaning Stack |
| Speculative Narrative Design | 2025 | 1.0 | 2 | Narrative, Architecture | Future-casting workshop materials. | Fictive Environments |
| The Autopsy Interface | 2024 | 1.0 | 2 | Code, Visual | Visual neural network game/memory tool. | Labyrinth |
| Archive of Unwritten Songs | 2024 | 1.0 | 2 | Sound, Code | Generative art project on melodic loss. | 427 Tracks |
| Vessel Orchestra (MET) | 2019 | 1.0 | 2 | Sound, Architecture | Documenting the performance at the Met. | Performance Cluster |
| Codeverse Explorer | 2025 | 1.0 | 2 | Code, Architecture | 3D cartography for visual codebases. | Telescode |
| The Erasure Protocols | 2024 | 1.0 | 2 | Narrative, Code | Interactive fiction archive. | SYBIL's Archive |
| Inʿiṭāf (The Turn) | 2024 | 1.0 | 2 | Code, Narrative | Progressive Web App ritual generator. | Systems Choreography |
| Tuning Fork | 2025 | 1.0 | 2 | Code, Visual | Image decay and visualization software. | Low Res |
| Heroes of a Transitional Time | 2012 | 0.0 | 2 | Visual, Impact | Visual art critique on masculinity. | Sharjah Art |
| AUB Architecture (B.Arch) | 2004–09 | 0.0 | 2 | Architecture | Foundational degree and projects. | Beirut |
| The Bartlett (M.Arch) | 2014–15 | 0.6 | 2 | Architecture | Master's research and projects. | London |
| Marra.tein Residency | 2012 | 0.0 | 2 | Visual, Architecture | Art residency and exhibition in Beirut. | Heroes |
| Home Workspace (HWP) | 2013 | 0.0 | 2 | Visual, Narrative | Ashkal Alwan interdisciplinary program. | Beirut |
| NYU Kevorkian Residency | 2017 | 1.0 | 2 | Visual, Impact | Artist-in-residence and \\"Great Gig\\" exhibition. | New York |
| Banksy/Block 9 Retreat | 2018 | 0.5 | 2 | Visual, Impact | Creative collaboration retreat. | Global |
| AUB 150th Documentary | 2016 | 0.0 | 2 | Visual, Sound | Visual/Music collaboration for anniversary. | Beirut |
| The Great Gig in the Sky | 2017 | 1.0 | 2 | Visual, Impact | Exhibition at NYU Kevorkian. | NYU Residency |
| Variations on Cranes | 2020 | 0.0 | 2 | Visual, Narrative | Video performance piece. | Crane Song |
| How to Walk with Friends | 2020 | 0.0 | 2 | Visual, Impact | Video work on public space agency. | Beirut |
| Auditions for a Battle | 2013 | 0.0 | 2 | Visual, Impact | Performance and video art piece. | Beirut |
| Kabooos (Kaleidoscope) | 2009 | 0.0 | 2 | Visual | Early stop-motion visual work. | Lilly |
| Lilly doesn’t care anymore | 2008 | 0.0 | 2 | Visual | Early 2D stop-motion experiment. | Kaboos |
| Post-Conflict Urbanism | 2006 | 0.0 | 2 | Architecture, Impact | Research and mapping in South Lebanon. | AUB |
| Fawzi Azar Award | 2009 | 0.0 | 2 | Architecture | Recognition for architectural excellence. | Museum project |

Based on the [Portfolio Atlas UI/UX Critique](https://docs.google.com/document/d/1Bz7eybry-lbR3D8D-Jg8npFGAJY8vgdmEY14iUXSty0/edit?usp=drivesdk&ouid=107934024842050398226), the current interface will undergo a series of strict structural corrections to enforce the "Brutalist" design language:

1. **From Nebula to Schematic (Orthographic Routing):** Replace loose, biological-looking force-directed graph lines in Map Mode with rigid, **90-degree Manhattan routing**. Connecting pathways must look like structured circuitry, not a spiderweb.  
2. **Rigid Framing:** Every WebGL node mesh must be enclosed in a strict, 1px gray border featuring a monospaced ID tag (e.g., `[OBJ-042] // [TGT: SOUND]`).  
3. **Axis/Coordinate Grid:** Render a faint, background Cartesian grid (X, Y, Z axes) in the main void to provide spatial reference and prevent navigation vertigo.  
4. **Desaturate the Minimap:** Strip neon color dots from the Field Map to reduce cognitive load. Replace them with opacities of white or geometric glyphs (squares for Text, circles for Image, triangles for Systems) that match the active view.  
5. **Environmental Typography:** Embed massive, low-opacity typographic anchors directly into the 3D void behind clusters (e.g., a giant `SYS_01` floating in the background) so nodes orbit around physical, text-based landmarks.

---

## 5\. Technical Stack & Experience Principles

| Layer | Recommended Default | Purpose |
| :---- | :---- | :---- |
| **Frontend Framework** | SvelteKit or Next.js App Router | UI Shell, metadata panels, routing |
| **Rendering Layer** | Three.js / WebGL / React Three Fiber | GPU-accelerated node meshes, 3D scenes |
| **Motion Engine** | GSAP (GreenSock) | Smooth camera transitions and stagger easing |
| **Input Abstraction** | Custom Virtual Scroll Manager | Captures wheel, touch, and pointer drag deltas |
| **Data Storage** | Postgres \+ pgvector / Notion API | Project metadata, coordinates, and embeddings |

### Experience Principles

* **No Playful Easing:** Transitions must use spring damping or strict cubic bezier curves (`[0.22, 1, 0.36, 1]`) with zero elastic bounce.  
* **Performance Targets:** Under 100 ms for cached 3D scenes; under 400 ms for first text rendering; under 2 seconds for fresh scene generations at the 95th percentile.

---

## 6\. Master Project Ledger (147-Node Coordinate Mapping)

The atlas organizes the master project dataset using a strict Cartesian coordinate logic:

* **X (Geography):** `0.0` (Beirut) | `0.5` (Europe/MENA) | `0.8` (LA/Transit) | `1.0` (New York)  
* **Y (Time):** Year of creation (`2004`–`2026`)  
* **Z (Impact/Gravity):** `1` (Flagship Nodes) | `2` (Secondary/Grid) | `3` (Archive/Texture)

### 6.1 Sample Flagship Nodes (Tier 1\)

| Project Name | Year (Y) | X (Geography) | Z (Impact) | Primary Domain | Description | Connections |
| :---- | :---: | :---: | :---: | :---: | :---- | :---- |
| **TEBR** | 2024–26 | 0.9 | 1 | Sound, Code | Synthesis of violin, voice, and generative AI systems. | Fictive Environments, STTM |
| **Mashrou' Leila** | 2008–22 | 0.5 | 1 | Sound, Visual, Impact | Global music collective; Creative Direction & Performance. | Rolling Stone, Ibn El Leil |
| **Fictive Environments** | 2025–26 | 1.0 | 1 | Architecture, Code, Narrative | Primary solo studio identity and "operating system." | All NYC nodes |
| **MEKENA NYC** | 2025–26 | 1.0 | 1 | Architecture, Impact | Adaptive reuse and residency program in Queens. | Fictive Environments |
| **Sometimes I Wake Up Elsewhere** | 2025–26 | 1.0 | 1 | Narrative | 108-entry modular literary manuscript. | Cartography of Absence |
| **The Localization Gap** | 2024 | 1.0 | 1 | Code, Impact | Forensic AI audit of cultural and linguistic bias. | HAH-WAS, FRANK |
| **The Cost of Being Queer & Arab** | 2020 | 1.0 | 1 | Narrative, Impact | NYT op-ed and advocacy manifesto. | Mashrou' Leila |
| **The Cartography of Absence** | 2024 | 1.0 | 1 | Narrative, Visual | Bureaucratic autofiction exploring displaced identity. | Walaw Studio |
| **The Crane Song** | 2020 | 0.8 | 1 | Narrative, Sound | Literary fiction and multimedia performance piece. | Variations on Cranes |
| **427 AI Tracks Archive** | 2024 | 1.0 | 1 | Sound, Code | Repository of generative audio experiments. | TEBR, Meaning Stack |
| **The Meaning Stack** | 2025 | 1.0 | 1 | Code | Technical framework for cross-disciplinary logic. | Systems Choreography |
| **Systems Choreography** | 2024 | 1.0 | 1 | Code, Architecture | Core methodology at the intersection of code/sound. | Fictive Environments |
| **Rolling Stone Cover** | 2017 | 0.2 | 1 | Visual, Impact | Historic first Arabic band cover; cultural milestone. | Mashrou' Leila |

### 6.2 Sample Secondary Nodes (Tier 2\)

| Project Name | Year (Y) | X (Geography) | Z (Impact) | Primary Domain | Description | Connections |
| :---- | :---: | ----- | ----- | ----- | :---- | :---- |
| **Sophie’s World** | 2012 | 0.6 | 2 | Visual, Code | Early AI short film; Bartlett dissertation companion. | Low Res Thesis |
| **Architecture in Low Res** | 2015 | 0.6 | 2 | Architecture, Visual | Master’s thesis on digital architectural perception. | Sophie's World |
| **B018 Nightclub** | 2008 | 0.0 | 2 | Architecture | Architectural work on iconic Beirut club. | Plot House |
| **The Labyrinth** | 2024 | 1.0 | 2 | Narrative, Visual | Recursive novel/script involving Sayat Nova. | The Annex |
| **The Annex** | 2024 | 1.0 | 2 | Architecture, Narrative | Stage design script exploring memory space. | The Labyrinth |
| **Vessel Orchestra** | 2019 | 1.0 | 2 | Sound, Architecture | Performance at The Met using artifacts. | Mashrou' Leila |
| **Space Time Tuning Machine** | 2021 | 0.9 | 2 | Sound, Code | AI-augmented instrument and performance engine. | TEBR, DÉRIVE |
| **FRANK** | 2026 | 1.0 | 2 | Code, Impact | News analysis application for bias detection. | Localization Gap |
| **SUNBURN** | 2026 | 1.0 | 2 | Sound, Architecture | Climate data sonification installation. | Systems Choreography |
| **Telescode** | 2025 | 1.0 | 2 | Code | Code visualization and interactive mapping tool. | Meaning Stack |
| **MENARA** | 2025 | 1.0 | 2 | Architecture, Code | Generative architectural visualization project. | MEKENA NYC |
| **HAH-WAS** | 2026 | 1.0 | 2 | Code | Hallucination-detection engine for LLMs. | Localization Gap |
| **Stage Architecture** | 2015–22 | 5.3 Sample Archive & Texture Nodes (Z \= 3\) | Below is a representative selection of Tier 3 nodes providing historical context and granular archive textures: |  **Project Name** **Year (Y)** **X (Geography)** **Z (Impact)** **Primary Domain(s)** **Description** **Fasateen (MV)** 2010 0.0 3 Visual, Sound Breakthrough music video. **Raksit Leila (MV)** 2010 0.0 3 Visual, Sound Iconic music video/performance. **Exit Festival** 2011 0.5 3 Sound Live performance in Serbia. **NPR Tiny Desk** 2016 1.0 3 Sound, Impact Global breakout performance. **Roman (MV)** 2017 0.0 3 Visual, Impact Feminist/Queer manifesto video. **Greenpeace Campaign** 2014 0.4 3 Impact Renewable energy awareness. **Body Maintenance Log** 2021 1.0 3 Narrative, Impact Document art on visa/health. **The Mirage Room** 2012 0.6 3 Architecture, Visual Optical illusion installation. **Bourj Hammoud Thesis** 2009 0.0 3 Architecture, Narrative Urban research/Architectural thesis. **Map of the Wound** 2024 1.0 3 Narrative, Visual Composite literary/visual work. **Toronto PRIDE** 2016 1.0 3 Impact, Sound Performance/Advocacy. **Hercules & Love Affair** 2017 0.5 3 Sound Collaboration: "Are You Still Certain?". **Roisin Murphy** 2018 0.5 3 Sound Collaboration: "Salam". **Cavalry (MV)** 2019 0.0 3 Visual, Impact Music video on militarized space. **Walaw Manifesto** 2021 1.0 3 Narrative The origin text of Walaw Studio. **The Beirut School (Album)** 2019 0.0 3 Sound Final anthology album.  |  |  |

