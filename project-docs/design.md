# Papazian Archive — Design System Document
*Status: Living document. Maintained across sessions for continuity with any AI model.*
*Last updated: 2026-06-22*

---

## 0. What This Document Is For

This is the canonical design reference for the **Papazian Archive** — a multi-modal, Three.js-based portfolio engine for artist/architect/musician Haig Papazian. Use this document to resume or extend work without re-explaining the codebase, philosophy, or prior decisions.

It covers:
- System identity and visual DNA
- All five current modes (Orbit, Works, Index, Map, Essays)
- The horizontal project rail — design critique and principles
- The core tension this document resolves: how to give each mode its own sovereign function
- Proposed designs for Index (discovery photo archive) and Map (relational diagram)
- Design system tokens and typography rules
- Audio identity

---

## 1. Project Identity

### 1.1 What It Is
A **spatial portfolio engine** — not a website, not a case study deck. The archive treats the artist's 30-year body of work as navigable territory. Works are nodes in a field; the viewer moves through them via orbit, scroll, grid, diagram, and text.

The technical stack is: **React + TypeScript + Three.js + Framer Motion + Tone.js + Vite**.

### 1.2 The Practice
**Haig Papazian** — born Beirut, based New York. Co-founder of Mashrou' Leila. Architect (Bartlett). Musician, sound artist, cultural infrastructure builder (MEKENA NYC), AI music researcher (HAH-WAS / Resonance Atlas), writer (Sometimes I Wake Up Elsewhere / Cartography of Absence), instrument builder (Space Time Tuning Machine / Kardia / Photon+). The archive holds ~50+ nodes across 6 conceptual worlds.

The practice's own label is **Systems Choreography** — the method of treating space, time, code, narrative, and performance as related structures that can be rehearsed, tuned, and reassembled.

### 1.3 The Six Conceptual Worlds
The projects are organized into thematic eras — these are not categories, they are periods with their own logic and mood:

| ID | Name | Systems | Definition |
|----|------|---------|-----------|
| 01 | FOUNDATION | Image · Space · Breakdown | Early architectural and visual thinking |
| 02 | PUBLIC CULTURE | Stage · Audience · Risk | Cultural infrastructure era |
| 03 | EXILE MACHINES | Sound · Memory · Performance | Post-band performance / instrument era |
| 04 | MEMORY INTERFACES | Text · Archive · Navigation | Literary and hypertext systems era |
| 05 | SONIC INTELLIGENCE | AI · Listening · Cultural Bias | Research and AI-audit era |
| 06 | SPATIAL FUTURES | Shelter · Code · Infrastructure | Outward-facing infrastructure era |

---

## 2. Design DNA — Visual Identity

### 2.1 Aesthetic Register
The archive reads as: **forensic + cinematic + archival**. Think evidence board, not portfolio. Think scientific atlas, not gallery. Think film title sequence, not brochure. The interface behaves like a **precision instrument** — not decorative, but operative.

Specific aesthetic references:
- Terminal + dossier UIs (redacted documents, stamped forms, metadata tables)
- Astronomical atlas / navigation charts
- Film archival materials (Criterion Collection treatment)
- Found-footage documentary as UX mode (Index section)
- Geological survey maps (Map section)
- Structural engineering drawings (type hierarchy)

### 2.2 Color System

```
Background (deep black):      #050505 / #0a0a0a
Surface (panels/overlays):    #111213 / #111827 (with bg-opacity ~95%)
Border (structural lines):    rgba(255,255,255,0.08-0.18)
Text primary:                 #ffffff
Text body:                    rgba(255,255,255,0.72-0.82)
Text muted:                   rgba(255,255,255,0.40-0.54)
Accent (alert/active/signal): #d7e7ef  (cool blue-white — domain: image/primary)
Accent warm:                  #c7b28a  (domain: space)
Accent green:                 #9fd6bf  (domain: sound)
Accent blue:                  #7aa6ff  (domain: code)
Accent systems:               #8fa8c2
Accent text-domain:           #d5a2a2
```

**Domain-to-accent mapping** (used in node coloring, tag pills, mode emphasis):
- `sound` -> `#9fd6bf` (sage green)
- `code` -> `#7aa6ff` (steel blue)
- `image` -> `#d7e7ef` (cool white-blue)
- `space` -> `#c7b28a` (warm sand)
- `systems` -> `#8fa8c2` (slate)
- `text` -> `#d5a2a2` (dusty rose)

**Tier-to-accent mapping:**
- `lead` -> `#d7e7ef`
- `secondary` -> `#8fa8c2`
- `archive` -> `#666a6f`

### 2.3 Typography

```css
font-display:   'Syne', condensed display — used for project titles, large headers
font-body:      system sans / 'Inter' — used for prose and reading copy
font-mono:      'JetBrains Mono' or 'Space Mono' — used for ALL metadata, labels, system text
```

**Typographic rules:**
- ALL metadata, section labels, counters, status text -> `font-mono`, `text-[8-11px]`, `tracking-[0.2-0.4em]`, `UPPERCASE`
- Project titles -> `font-display`, bold, `tracking-tight` or `tracking-tighter`, UPPERCASE
- Reading body -> `font-body`, `text-sm / text-base`, `leading-relaxed`, normal case
- Number formatting: always zero-padded (`001`, `012`) and monospaced
- Status indicators use slash-delimited strings: `WORKS / ML-001 / 2014` or `LAT / 33.8938 N / LON: 35.5018 E`

### 2.4 Spacing and Layout Grid

The UI lives in a **fixed inset** of `20px` on all sides. The bottom bar is fixed at `bottom-5`. The top header is `top-5`.

**Component-level spacing:**
- Panel padding: `p-10` on desktop, `p-4` on mobile
- Section gaps: `space-y-4`, `gap-2-4`
- Border radius: **none** — the archive does not use rounded corners on structural elements
- Separators: `1px` borders, `rgba(255,255,255,0.08-0.18)`
- Accent line: `1px` top line on bottom bar (progress bar, accent color, scaleX from MotionValue)

### 2.5 The GLSL Shader (Visual Fingerprint)
All image tiles share a custom Three.js fragment shader with these behaviors:
- **Chromatic aberration** on scroll velocity (RGB channel split — amount proportional to `uVelocity`)
- **Grayscale Xerox filter** in horizontal/cinematic rail mode only (`uIsHorizontalMode`)
- Hover **color return**: grayscale tiles restore color on hover (`mix(grayscale, color, uHover)`)
- **Pulsing accent glow** on hover
- **Video/audio media type overlays** baked into shader: play button disc (video) and audio waveform icon (audio) drawn in GLSL — no DOM overlay needed for the 3D tiles

Shader uniform reference:
```glsl
uniform sampler2D uMap;
uniform float uVelocity;       // scroll velocity -> chromatic aberration
uniform float uHover;          // hover state -> color restoration
uniform float uSearchHighlight;// search filter -> dim non-matching tiles
uniform float uModeVisibility; // transition visibility
uniform float uTime;           // animation time
uniform float uSlideKind;      // 0=image, 1=text, 2=video, 3=audio
uniform float uAspect;         // tile aspect ratio
uniform vec3 uColor;           // node accent color fallback
uniform float uIsHorizontalMode; // 1.0 when in rail mode (Xerox on)
```

### 2.6 Animation Principles
- Entry/exit transitions: `spring` damping 20-25, stiffness 100-200, OR easing `[0.22,1,0.36,1]`
- Duration range: 0.35-0.6s for UI panels, 0.2-0.35s for micro-interactions
- All 3D positioning animated with GSAP inside NodeManager
- Progress bar: `useMotionValue` piped from scene scroll -> `scaleX` on 1px accent line
- Camera transitions: GSAP timeline with custom easing, not spring
- Hover states: `transition-colors` utility only — no extra transform on hover
- **No bounce. No elastic. No playful.**

---

## 3. Architecture — Modes

The archive has five **public modes** plus one internal state:

| Mode ID | Label | Scene | UI Layer | Entry Point |
|---------|-------|-------|---------|------------|
| `cylinder` | Home | Orbit — nodes on rotating cylinder | HomeOrbitPanel | Default |
| `vertical` | Works | Linear vertical scroll spine — 20 canonical nodes | World typographic overlay | Bottom nav |
| `grid` | Index | Unwrapped grid — all nodes + images | (Currently: minimal) | Bottom nav |
| `map` | Map | Relational diagram — connections as lines | (Currently: minimal) | Bottom nav |
| `essays` | Essays | Orbit bg + reading panel overlay | EssaysPanel | Bottom nav |
| `horizontal` | (Project Rail) | Cinematic horizontal scroll | Right sidebar dossier | Clicking any node |

**Key rule:** `horizontal` is not a public mode. It is entered from `vertical`, `grid`, or `map`, and always remembers `returnMode` to restore the previous view on close.

**App mode flow:**
```
cylinder -> [user clicks Works] -> vertical
vertical -> [user clicks node] -> horizontal (returnMode = 'vertical')
horizontal -> [Escape / Close] -> returnMode
grid -> [user clicks node] -> horizontal (returnMode = 'grid')
map -> [user clicks node] -> horizontal (returnMode = 'map')
```

---

## 4. The Bottom Navigation Bar (Archive Instrument)

The bottom bar is the **primary navigation surface**. It is a `64px` tall fixed footer spanning the full width of the viewport. It is never hidden.

### 4.1 Structure (left to right)

```
[+ INFO] [AUDIO] | [METADATA / SEARCH DISPLAY area] | [Home] [Works] [Index] [Map] [Essays]
```

- `+` button: Opens the ArchiveInfoConsole (About, CV, Contact, Press tabs)
- Audio button: Mute/unmute toggle — same square size as `+`
- Metadata center: Three-line display that updates contextually
  - In `horizontal` mode: shows `WORKS / [SLUG] / [YEAR]`, project title, `INDEX / TOTAL / CHAPTER`
  - Otherwise: shows current project or "Archive field" + count/status
  - Click -> opens inline search
- Right mode buttons: 5 square buttons, one per public mode, with hover tooltip label above

### 4.2 Mode Button Spec
- Size: `64x64px` square — equal to the `+` and audio buttons
- Icon only (no text label visible in resting state)
- Active state: lighter gray background only, **NO border**
- Hover state: tooltip rectangle appears **above** the button, same width as button, with mode label
- Tooltip spec: exact width match to button, label text fits without padding overflow

### 4.3 Progress Indicator
A `1px` accent-colored line runs along the very top of the bottom bar. Its `scaleX` is driven by `rawScrollValue` (MotionValue from scene). It reads as a scrubber for both vertical scroll position and rail position.

---

## 5. Mode: Orbit / Home (`cylinder`)

### 5.1 Scene
All nodes arranged on an invisible rotating cylinder. Nodes orbit slowly. The viewer sees a cloud of image tiles circling at varying speeds. Node clicks are disabled in this mode.

### 5.2 Overlay: HomeOrbitPanel
A floating glass panel (center-bottom on desktop, full-screen on mobile):
- Header: "Systems Choreography" in mono uppercase, "Home / Orbit Intro" secondary
- Large display type: "Systems / of Meaning" — editorial statement
- Bio: "Born in Beirut and based in New York, Haig Papazian works across sound, architecture, film, AI, narrative, and cultural infrastructure."
- Stats grid: Selected Works count + modes list
- Three editorial case study cards (Mashrou' Leila, MEKENA NYC, STTM)
- CV link + Contact + Search

---

## 6. Mode: Works (`vertical`)

### 6.1 Scene
A vertical linear scroll spine — 20 canonical projects arranged along the Y axis. Camera moves up/down. The "active" (centered) node determined by camera proximity. Node cards sized by tier: `lead` = large, `secondary` = medium, `archive` = small.

### 6.2 Overlay
- **World typographic overlay** on left side (desktop only): shows current world's name/number/systems/definition — fades in/out as camera scrolls through different worlds
- Bottom bar: `line1` = `WORKS / [PROJECT_CODE] / [YEAR]`, `line2` = project title, `line3` = `INDEX / TOTAL / CHAPTER`
- Clicking any node opens the project rail -> horizontal mode

### 6.3 Interaction
- Scroll: mouse wheel / trackpad / touch
- Arrow keys: navigate between nodes
- Enter: open selected node in horizontal rail
- Hover: nodes scale up + shader hover glow

---

## 7. Mode: Horizontal / Project Rail (`horizontal`)

This is the **cinematic case study experience**. Each project has a curated gallery of slides.

### 7.1 Scene
Nodes from a single project's gallery arranged on the X axis. Camera moves horizontally. Each slide is a full-frame image tile with the custom GLSL shader in Xerox-grayscale mode. Hover restores color.

### 7.2 Gallery Slide Types
Each slide in `ProjectGalleryImage` has:
- `type`: `'image' | 'text' | 'video' | 'audio'`
- `role`: `'hero' | 'context' | 'process' | 'system' | 'evidence' | 'coda'`
- `layout`: `'hero' | 'wide' | 'portrait' | 'diagram' | 'compact'`
- `chapter`: string — groups slides into named sections
- `beat`: string — the active caption/narrative text shown in the sidebar
- `relatedSlugs`: string[] — cross-links to other projects

Video and audio slides render a play-button or audio-wave overlay in GLSL (no DOM overlay on the tile). Clicking a video/audio tile in the sidebar triggers `VideoLightbox`.

### 7.3 Right Sidebar (Dossier Panel)
Fixed right sidebar, `clamp(420px, 30vw, 480px)` wide. Appears on project entry with spring animation.
Contains:
- Project title (font-display, large, uppercase)
- Tier/year tags
- World classification (accent left-border, mono)
- Tag pills (domains, stack)
- Thesis statement (font-display, 18px)
- Short description
- Highlights ("Signals" section)
- Related slugs ("Relations" cross-links)
- Slide-level metadata when in rail: label, chapter/type/role readout, beat/caption, Play button for media
- Forensic metadata footer (latency, entropy, fault rate — generative from slug/title chars, decorative)

**Collapse behavior:** Sidebar auto-collapses when entering horizontal mode for immersive full-screen. A vertical "INFO" button on the right edge re-opens it. Can also be toggled with "Hide Info" button.

### 7.4 Chapter Scrubber (bottom bar when in horizontal mode)
In the bottom bar metadata area, a chapter-grouped progress scrubber shows:
- Chapter names (numbered 01, 02...) as headers
- Individual slide dots per chapter — clickable to jump to slide
- Active chapter/slide highlighted in white, others in `rgba(255,255,255,0.1)`

### 7.5 Design Critique — The Rail

**What works well:**
- The grayscale->color hover is genuinely cinematic and creates a discovery rhythm
- Chapter grouping in the scrubber turns a flat scroll into a structured argument
- The forensic metadata footer (LATENCY / ENTROPY / FAULT RATE) earns its place — feels archival, not gimmicky
- The GLSL media-type overlays (play/audio icons in shader) are elegant — no UI cost
- The spring animation for the sidebar is appropriate — not too bouncy, lands with weight

**Critical issues (design):**

1. **The rail is the only deep mode.** Every other view (Works, Index, Map) is currently a gateway to the horizontal rail. Index and Map have no sovereign function — they're just alternative entry points to the same rail.

2. **Text slides disappear in 3D.** Slides with `type: 'text'` have no image to show in the Three.js scene. They appear as placeholder color tiles, breaking visual rhythm. Text slides should live in the sidebar only, or have a rendered text-texture approach.

3. **The sidebar shows too much at once.** Thesis + description + highlights + world + tags + related all visible without scrolling. In horizontal mode, slide-level info should dominate, not project overview. Consider: above the fold = slide info, below the fold = project context.

4. **Mobile sheet state is confusing.** The `peek` / `full` toggle on mobile is a good concept but the affordance is not obvious.

5. **Related slugs as raw text chips** (`hah-was`, `maqamai`) look like debugging output. Should show human-readable titles, not slugs.

6. **The Xerox grayscale resting state needs more contrast.** Currently `clamp((luma - 0.5) * 1.35 + 0.5, 0.0, 1.0)` reads as mild desaturation more than forensic Xerox. Consider pushing contrast further or adding slight noise grain.

---

## 8. Mode: Index / Grid (`grid`) — Problem and Proposal

### 8.1 Current State
The grid mode arranges all nodes in a 3D grid (9-wide, variable rows). There is no overlay UI specific to grid mode. Clicking any tile opens the horizontal rail. The grid is purely a passive discovery surface.

### 8.2 What the Index Should Be
The Index is **not a gateway to the project rail**. It is a **media archive** — a different epistemological register from Works mode. Where Works presents projects as curated arguments, Index presents the **raw material**: photographs, documentation, video links, audio clips, process images — things that are part of projects but not organized as case studies.

The Index should feel like:
- A **photo archive contact sheet** (analog photographer's light table)
- A **found footage index** (each item tagged, typed, timestamped)
- A **specimen collection** (each item can be examined without triggering the project's narrative arc)

### 8.3 Index Design Proposal

**Scene behavior:**
- Maintain grid layout but allow **free pan and zoom** navigation — camera drifts freely in 2D (x/y) at fixed z depth
- Tiles render at smaller size initially — the grid reads as a dense field, not a list
- On hover, a tile scales up (in-place) without navigating away
- Items optionally grouped by domain color (subtle background regions or clustering)

**Media type distinction in grid:**
- Image tiles: render normally
- Video tiles: GLSL play-button overlay (already implemented via `uSlideKind`)
- Audio tiles: GLSL audio-wave overlay (already implemented)
- Text slides: should NOT appear in index — they have no visual. Text-only content belongs in Essays.

**Overlay UI for Index (does NOT open the horizontal rail):**
- Hover -> minimal floating label: `[PROJECT TITLE] / [SLIDE LABEL] / [TYPE] / [CHAPTER]`
- Click -> opens an **in-place lightbox** for that single artifact:
  - Image: full-screen with caption, beat text, and optional "See in [PROJECT] Rail" link
  - Video: embedded YouTube player in lightbox (no rail trigger)
  - Audio: audio player in lightbox (no rail trigger)
- ESC closes lightbox and returns to grid
- "Open in Rail" is an *optional* bridge, not the default behavior

**Filtering / search surface:**
- Domain filter pills: `[ALL] [SOUND] [IMAGE] [SPACE] [CODE] [TEXT] [SYSTEMS]`
- Media type filter: `[ALL] [PHOTO] [VIDEO] [AUDIO]`
- Activating a filter dims non-matching tiles using the existing `uSearchHighlight` uniform

**Bottom bar in Index mode:**
- `line1`: `INDEX / [FILTERED COUNT] / [TOTAL COUNT]`
- `line2`: Hovered item label or "Photo Archive"
- `line3`: Hovered item's project + year + type

### 8.4 The Sovereign Function of Index
The Index is a **browsing/discovery** mode. Its output is NOT a project argument — it's a direct encounter with individual artifacts. The user may watch a video, hear an audio clip, zoom into a photograph — without ever entering the "case study" framing of the horizontal rail. This preserves the distinction between *documentation* and *presentation*.

---

## 9. Mode: Map (`map`) — Problem and Proposal

### 9.1 Current State
Map mode places nodes at approximately relational positions in 3D space, with lines drawn between connected nodes (`relationLines` in NodeManager). Camera is closer (z=3.8 vs vertical's z=8.5). There is no overlay UI specific to map mode. Clicking opens the horizontal rail.

The map currently implements `NO_DATA_ZONE` polygons — geographic zones with diagnostic readout (coordinates, zone ID). This is a clever device worth keeping.

### 9.2 What the Map Should Be
The Map is a **relational diagram** — an intellectual topology of the practice. It answers: *"How do these projects relate to each other? What patterns emerge when you look at connections between works rather than the works themselves?"*

The Map should feel like:
- A **force-directed graph** (projects as nodes, connections as weighted edges)
- An **atlas legend** or network diagram from an academic publication
- Something between Gephi and a hand-drawn constellation chart

### 9.3 Map Design Proposal

**Scene behavior:**
- Each node positioned in 2D space (z fixed) by force or curated layout:
  - Nodes with more `relatedSlugs` connections pulled toward each other
  - Nodes in the same conceptual world have slight gravitational clustering
  - Lead-tier nodes slightly larger, acting as attractors
- Relation lines between connected nodes — line weight proportional to connection strength
- Line style: thin (1px), accent-colored (domain of source node), low opacity (0.15-0.35)
- On hover: hovered node's connections light up (lines brighter, related nodes highlight)
- Fixed camera showing the full constellation at once

**Domain cluster coloring:**
- Node glow color = domain accent (sound=green, code=blue, etc.)
- The six Worlds appear as subtle background regions — low-contrast overlays

**Overlay UI for Map (does NOT open the horizontal rail by default):**
- Hover -> floating mini-dossier card near cursor: node title, year, tier, connection count, world classification
- Click -> **focuses** the node: map redraws with clicked node at center, first-degree connections highlighted, second-degree dimmed
  -> A minimal edge info panel expands (not full sidebar): project title, thesis, connection list with clickable links
  -> "Open in Works Rail" button available if user wants the case study
- Arrow keys: jump between connected nodes
- Click a relation line: highlight both endpoints + show shared connections
- Escape: return to full constellation view (deselect)

### 9.4 The Sovereign Function of Map
Map answers the question *"How does this practice think?"* — through connections, distances, clusters, and patterns. It is the only mode where the **relations between works** are the primary subject, not the works themselves. The horizontal rail is available but not the default exit.

---

## 10. Mode: Essays (`essays`)

### 10.1 Current State
Essays mode renders the Orbit scene in the background and overlays `EssaysPanel` — a full-height reading panel with six essay texts.

**Essays currently in archive:**
1. Systems of Meaning (Statement, 2026)
2. The Localization Gap (AI / Music / Cultural Bias, 2024)
3. The Cost of Being Queer and Arab (Visibility / Risk, 2020)
4. The Cartography of Absence (Forms / Exile / Bureaucracy, 2024)
5. Architecture in Low Res (Architecture / Image, 2015)
6. Why We're Like This (Video Essay / Cultural Mood, 2026)

### 10.2 Design Notes
- Essays should be self-contained reading experiences — no mode switching mid-read
- Consider adding "projects mentioned in this essay" cross-link section at the end of each essay
- Long-term: essays should be full-length, not truncated. Currently they are 3-paragraph sketches.

---

## 11. The Central Design Problem: Preventing Rail Collapse

Every mode currently defaults to the horizontal rail as its only interactive output. This causes:
- Loss of mode identity (Index and Map feel like the same thing)
- Conceptual flattening (all content becomes a case study)
- No discovery modality (everything is framed as a presentation)

**The three-tier interaction principle:**
1. **Browse** (passive, no commitment) — available in all modes via hover
2. **Inspect** (in-place examination) — Index lightbox, Map focus state
3. **Enter** (full case study immersion) — the horizontal rail

Only tier 3 triggers the horizontal rail. Tiers 1 and 2 are mode-sovereign.

**The sovereign function of each mode:**

| Mode | Question it answers | Primary output |
|------|---------------------|----------------|
| Home (Orbit) | Who is this? | Introduction — oriented toward Works |
| Works (Vertical) | What are the projects? | Curated project sequence — leads to Rail |
| Index (Grid) | What is the raw material? | Single artifact examination (lightbox) |
| Map | How does the practice think? | Relational topology — focused node view |
| Essays | What does the practice argue? | Reading — leads to related projects |
| Rail (Horizontal) | What is this project? | Full cinematic case study |

---

## 12. Audio System

### 12.1 Tone.js Engine
The archive has a spatial audio engine (`useAudioEngine`, built on Tone.js) with these layers:
- **Ambient drone** — always playing, mode-dependent, filtered
- **Node hover sounds** — triggered on `onNodeHover`, pitch/timbre varies by domain
- **Project stems** — registered per-project, crossfade on `onProjectEnter`
- **Scroll velocity** -> modulates ambient filter frequency

### 12.2 Registered Project Stems
```
tebr                           -> /audio/stems/tebr.mp3
space-time-tuning-machine      -> /audio/stems/space-time-tuning-machine.mp3
sometimes-i-wake-up-elsewhere  -> /audio/stems/sometimes-i-wake-up-elsewhere.mp3
fictive-environments           -> /audio/stems/fictive-environments.mp3
```
These stems are from Haig's own music (TEBR project / Saltwater track).

### 12.3 Audio Design Principles
- Drone should NOT overpower project stems — keep at less than -18dB relative to stems
- Stems should loop cleanly (6-second loops)
- Click/UI interaction sounds: avoid unless very subtle and purposeful
- The audio mute button is the same square size as the `+` info button (`64x64px`)
- Audio is optional — the archive is fully functional without sound

---

## 13. Key Data Structures

### 13.1 AtlasNode
```typescript
interface AtlasNode {
  id: number;
  order: number;
  slug: string;           // URL-safe identifier (e.g. 'mashrou-leila')
  title: string;
  year: string;
  tier: 'lead' | 'secondary' | 'archive';
  domains: string[];      // e.g. ['sound', 'image', 'systems']
  stack: string[];        // technical stack
  connections: string[];  // related project slugs
  image: string;          // primary image path
  thumbnail: string;
  hasProjectPage: boolean;
  summary: string;        // = thesis
  shortDescription: string;
  fullDescription: string;
  thesis?: string;
  highlights?: string[];
  relatedSlugs?: string[];
  category: string;       // = primaryDomain
  tags: string[];         // tier + domains + stack
  accentColor: string;
  evidenceStatus?: string;
  gallery: AtlasImage[];
}
```

### 13.2 AtlasImage (Gallery Slide)
```typescript
interface AtlasImage {
  id: string;
  projectId: string;
  projectTitle: string;
  type?: 'image' | 'text' | 'video' | 'audio';
  src: string;
  poster?: string;
  youtubeId?: string;
  embedUrl?: string;
  externalUrl?: string;
  label: string;
  caption?: string;
  body?: string | string[];
  role?: 'hero' | 'context' | 'process' | 'system' | 'evidence' | 'coda';
  layout?: 'hero' | 'wide' | 'portrait' | 'diagram' | 'compact';
  emphasis?: 'primary' | 'secondary' | 'quiet';
  chapter?: string;
  beat?: string;
  relatedSlugs?: string[];
  isPrimary: boolean;
}
```

### 13.3 Gallery Role Guide
- `hero`: Opening thesis image — full bleed, first slide
- `context`: Background / lineage / institutional setting
- `process`: Documentation, working material, studio shots
- `system`: Diagrams, charts, data visualizations, maps
- `evidence`: Proof-of-scale moments (press, audiences, metrics)
- `coda`: Closing image or forward-looking connection

---

## 14. Key Components

| File | Responsibility |
|------|---------------|
| `src/App.tsx` | Root state, mode routing, event handling |
| `src/components/Overlay.tsx` | All 2D UI overlay (~1685 lines) |
| `src/components/VideoLightbox.tsx` | YouTube embed lightbox |
| `src/core/Scene.ts` | Three.js scene init, camera, lighting |
| `src/core/NodeManager.ts` | 3D node positioning for all modes, shader, hover, rail |
| `src/core/ScrollEngine.ts` | Scroll velocity tracking |
| `src/data/atlas.ts` | AtlasNode fetch + parse from CSV |
| `src/data/projectContent.ts` | Thesis/description/highlights per project |
| `src/data/projectGalleries.ts` | Curated gallery slides per project |
| `src/data/canonicalProjects.ts` | Ordered list of the 20 canonical works |
| `src/data/siteInfo.ts` | About/CV/Contact panel tab content |
| `src/audio/useAudioEngine.ts` | Tone.js audio engine hook |

---

## 15. Known Issues and Debt

1. **Overlay.tsx is ~1685 lines** — contains sub-components (`HomeOrbitPanel`, `EssaysPanel`, `ArchiveInfoConsole`, `ModeButton`) that should be extracted into separate files
2. **`any` types throughout** — App.tsx and Overlay.tsx use `any` for node objects; should be typed with `AtlasNode`
3. **Text slides in 3D scene** — `type: 'text'` slides have no visual in Three.js; render as accent-colored placeholder tiles which breaks rhythm
4. **Related slug display** — currently shows raw slugs, not human-readable titles
5. **No deep linking for Index or Map** — only `#node=&mode=` params; grid/map positions not URL-addressable
6. **Mobile experience** — grid and map modes are not optimized for touch; only vertical and horizontal have proper touch handling

---

## 16. Decisions Already Made (Do Not Revisit)

- **No rounded corners** on structural UI elements
- **No case study framing** in Index mode — Index is NOT a gateway to the rail by default
- **Bottom nav hover tooltip**: rectangle same width as button, appears above button
- **Audio mute button**: same 64x64px size as `+` info button
- **Active mode button**: lighter gray background only — no border
- **PAPAZIAN logo**: top left, clicking returns to cylinder/home mode
- **Grayscale Xerox filter**: active only in horizontal mode, restores on hover
- **World overlay**: left side in vertical mode, disappears in all other modes
- **Drone audio**: kept subtle, never overpowers project stems
- **No modal dialogs** for navigation — all transitions are in-place or sliding panels

---

## 17. Open Design Questions (for next session)

1. **Index lightbox** — Should clicking an image in Index open a full-screen DOM overlay (blocking 3D) or an in-3D zoom (camera moves in, stays in scene)? Recommendation: DOM overlay lightbox for image and video; in-3D zoom for audio tiles to maintain spatial relationship.

2. **Map force layout** — Should map positions be fixed (from `nodes.json` or CSV coordinates) or dynamically computed via a force simulation? Dynamic is more accurate but requires running d3-force or a custom simulation. Fixed positions are faster but require manual curation.

3. **Text slides** — Three options: (a) skip text slides in grid mode entirely, (b) render them as typography textures in Three.js, (c) render them as a special DOM overlay tile. Option (a) is lowest risk.

4. **Index filter bar** — Where does it live? Option A: horizontal strip above the scene. Option B: inside the bottom bar metadata area. Option C: a floating pill bar centered near the top.

5. **Map -> Works linking** — When a node is focused in Map mode, should "Open in Works Rail" take the user directly to horizontal mode, or first animate to vertical mode showing the node's position, then enter horizontal? The latter preserves spatial context.

---

*End of design.md — update this document after any significant design decision.*
