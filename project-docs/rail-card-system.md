# Papazian Archive — Rail Card System
## Design critique, card taxonomy, per-project story critique, and proposed improvements
*Companion to design.md — Last updated: 2026-06-22*

---

## 0. The Problem This Document Solves

The horizontal rail currently works as follows:
- Every slide is a Three.js mesh rendered to the same fixed canvas height
- Aspect ratio is derived from `role` and `layout` fields (hero=4:3, system=1.75:1 wide, portrait=3:4)
- Text-only and diagram-only slides use a Canvas2D-generated texture (3 card styles: `intertitle`, `system`, `dossier`)
- Domain accent colors exist in the data but are not surfaced in rail cards — the rail is effectively grayscale on default, color-restored on hover
- There is no collage/multi-artifact structure — every card is a single artifact at one position

This document proposes:
1. A complete **card taxonomy** with distinct visual identities
2. A **per-project story critique** — what should the sequence be?
3. Rules for **aspect ratios** as semantic choices, not just display modes
4. How to render **text, system, and diagram cards** so they earn their place
5. Whether and how **domain color** enters the rail
6. Whether **multi-artifact / collage panels** make sense and when

---

## 1. Card Taxonomy — The Six Card Types

The archive produces six fundamentally different kinds of content in the rail.
Each needs its own visual register. Currently only 3 card styles exist (`intertitle`, `system`, `dossier`).
The proposed taxonomy has 6.

### 1.1 PHOTOGRAPHIC — `type: image`
**What it is:** A photograph, scan, performance still, installation shot, archival image.
**Rendered as:** Full-bleed image texture through the GLSL shader (Xerox grayscale / color-on-hover).
**Aspect ratio logic:**
- `layout: hero` → **4:3 (1.333)** — cinematic widescreen cover. The first slide of every project.
- `layout: wide` → **16:9 (1.777)** — landscape documentation, stage photography, live event coverage
- `layout: portrait` → **3:4 (0.75)** — magazine covers, album sleeves, person-centered images
- `layout: compact` → **2:3 (0.667)** — dense evidence grids, detail crops, small proofs
- `layout: diagram` → **square (1:1)** — interface screenshots, data visualizations, UI documentation
**Domain color role:** The image tile sits inside a domain-accented **border vignette** that is visible only in non-hover state. When the shader switches from Xerox to color on hover, the accent border fades out. This creates a bidirectional shift: color image / no accent border vs. grayscale image / accent border present.

### 1.2 VIDEO — `type: video`
**What it is:** A YouTube music video, performance recording, documentary clip, or interview.
**Rendered as:** Poster image (the same GLSL shader) with a **play button disc rendered in GLSL** (`uSlideKind = 2`). Already implemented. Clicking triggers `VideoLightbox`.
**Aspect ratio:** Always **16:9 (1.777)** — the native video ratio. No exceptions.
**Caption:** The caption in the sidebar identifies the video's role in the project: is this documentation, argument, or evidence?
**Story function:** Video cards should appear where an argument needs to move. Not as decoration. A video slide should have a clear reason: this is the proof of scale (Tiny Desk), this is the visual language established (music video), this is the methodology demonstrated live (STTM performance).

### 1.3 AUDIO — `type: audio`
**What it is:** A stem, recording, or audio clip embedded in the project's argument.
**Rendered as:** A dedicated audio card texture — NOT the generic card. Audio is its own register.
**Aspect ratio:** **Square (1:1)** — audio is temporal, not spatial. The square signals: this is listening time, not looking time.
**What the texture looks like (proposed redesign):**
- Background: deep black with subtle waveform or frequency-bar decoration (generative, based on project slug hash)
- Large domain accent color (e.g. green for sound projects)
- Top-left: `AUDIO / STEM` or `AUDIO / LOOP` in mono uppercase
- Center: Track/clip title in display type, large, white
- Below title: Duration (if known), beat descriptor
- Bottom: domain accent bar (full-width, 4px, domain color)
- GLSL audio-wave icon overlay already handles the `play` affordance
**Domain color role:** For audio cards, the domain accent is **primary**, not secondary. The card field itself uses the domain color as a tint source.

### 1.4 TEXT / INTERTITLE — `type: text`, `role: context | coda | thesis`
**What it is:** A text-only card that articulates a conceptual claim, frames what comes before/after, or closes a chapter.
**Current rendering:** `intertitle` card style — black field, scan-line texture, white display title, mono caption. **This is correct but underused.** The problem is these cards are just thrown in without a visual identity that earns them parity with photographic cards.
**Aspect ratio:** **3:4 (0.75)** — portrait, like a printed page or a film intertitle frame. Text is a narrow register. It should feel like turning a page, not watching a panorama.
**Proposed visual redesign:**

```
[intertitle card — 3:4 proportion]

 Background: #080808 + 1.5px scan-line texture (already done)
 
 Top-left: CHAPTER NAME / TEXT in mono, 9px, accent/40 opacity
 
 Main text: Display font (Syne), NOT mono
             Large tracking-tight title
             2-3 lines max, white
             
 Caption: Mono, 10px, text-muted, below main text
 
 Body: Mono, 10px, text/80, wrapped, 3 lines max
       This is the argumentative content
       
 Bottom rule: 1px white/10
 Bottom left: PROJECT / YEAR
 Bottom right: THESIS | CONTEXT | CODA (role)
 
 No cross-hatch grid. No dossier layout.
 Just typography with precise breathing room.
```

**The critical rule:** An intertitle card should feel like a **film title card between scenes** — it marks a transition, articulates a concept, and then gets out of the way. It should be brief, declarative, and visually lighter than its neighboring photographic cards.

### 1.5 SYSTEM / DIAGRAM — `type: text`, `role: system | process`, or `type: image`, `layout: diagram`
**What it is:** A card that represents a *system* — a research protocol, an infrastructure diagram, a data visualization, a methodology flowchart. This is the most conceptually important card type and currently the weakest visually.
**Current rendering:** `system` card style — amber/gold tint, column-grid background lines, amber title. **Too decorative and inconsistent with the Xerox/archival register.**

**Proposed redesign — two sub-types:**

**A. DIAGRAM CARD (image with `layout: diagram`):**
The image should be a genuine diagram, chart, or UI screenshot. These should always render as:
- **Square (1:1)** — equal width and height, like a system schematic page
- Full-bleed image with the same GLSL shader — but WITHOUT the Xerox grayscale filter
  → system diagrams should retain their color in the rail, because they are informational, not evocative
  → This requires a new shader conditional: `uIsSystemSlide` uniform, bypasses grayscale
- Hover: accent glow only, no color shift (color is already present)

**B. SYSTEM TEXT CARD (text with `role: system`):**
A text card that diagrams a relationship, a protocol, a methodology.
```
[system text card — 1.75:1 wide proportion, like a printed ledger page]

Background: #080604 (warmer than default black)
Domain accent color bar: full-height left edge, 4px, domain color
Column-grid overlay: very low opacity (0.06) — structural, not decorative

Top row: SYSTEM / PROTOCOL or SYSTEM / PROCESS in mono, accent color
Title: Mono font (not display), medium weight, white, large
Subtitle: The claim or thesis of this system in 1 sentence

Body grid: Items arranged in a 2-column or 3-column structure
           Each item: numbered (01, 02...), item text
           Domain accent for the numbers
           
Bottom left: Input → Process → Output (abbreviated system diagram)
Bottom right: PROJECT / YEAR in mono
```

The visual key: system cards should feel like **engineering specifications or research protocols**, not editorial essays.

### 1.6 EVIDENCE / METRICS — `type: text`, `role: evidence`, body contains numbers/scales
**What it is:** A card carrying quantified proof — audience numbers, streaming counts, critical metrics, spatial measurements.
**Current rendering:** `dossier` style — two concentric circles, PAPAZIAN ARCHIVE stamp, numbered grid. **This is the most developed card style but its visual metaphor (the official stamp/dossier) is strong and should be preserved.**
**Aspect ratio:** **4:3 (1.333)** — same as hero, but used for evidence. Reads as official document page.
**Proposed refinement:**
- Keep the dossier visual metaphor (circles, stamp)
- But strip the PAPAZIAN ARCHIVE text watermark — the project title already appears in the footer
- Replace the watermark circle with a **large numeric** (primary metric) in the circle — the most important number of the evidence card
- Body: the numbered grid of 2–6 items remains
- The circle becomes a **data display element**, not a branding element

---

## 2. Aspect Ratio as Semantic System

Every aspect ratio should carry a meaning, not just a display preference.

| Ratio | Name | Meaning | When to use |
|-------|------|---------|------------|
| 4:3 (1.333) | **Cinema** | Opening statement, historical evidence | Hero slides, dossier evidence |
| 16:9 (1.777) | **Video** | Time-based media, live documentation | All video slides |
| 1:1 (1.000) | **Interface / Audio** | Software, data, listening time | UI screenshots, audio cards, square crops |
| 3:4 (0.750) | **Page / Portrait** | Text cards, printed matter, publications | Intertitle text cards, magazine covers, portrait photos |
| 1.75:1 (1.750) | **Ledger / Wide** | Systems, data, research infrastructure | System text cards, process documentation |
| 2:3 (0.667) | **Detail / Compact** | Evidence crops, proof details, close readings | Secondary evidence within a chapter |

**The current code has this partially right:**
```
hero/role:hero → 1.333 (correct — cinema aspect)
authorship/role chapter → 1.35 (close to cinema — correct for dossier)
thesis/coda/context → 0.70 (close to 3:4 — correct for page)
system/process → 1.75 (correct — ledger/wide)
default → 0.75 (3:4 portrait — correct default)
```

**What needs to change:**
- Add `1:1` as a valid customAspect for interface screenshots and audio cards
- Add `16:9` as a valid customAspect for all video slides (currently video slides inherit the default role-based aspect)
- `layout: compact` should map to `2:3 (0.667)` not the current `0.92`
- The condition for `system/process` should also include `type: audio` → maps to `1:1`

**In NodeManager.ts, the aspect ratio logic should become:**
```javascript
// type always wins for video and audio
if (slideType === 'video') customAspect = 1.777;
else if (slideType === 'audio') customAspect = 1.0;
// then layout
else if (layout === 'hero' || role === 'hero' || assetIndex === 0) customAspect = 1.333;
else if (layout === 'diagram') customAspect = 1.0;  // square for interfaces
else if (layout === 'wide') customAspect = 1.777;   // or 1.5 for non-video wide
else if (layout === 'portrait') customAspect = 0.75;
else if (layout === 'compact') customAspect = 0.667;
else if (role === 'system' || role === 'process') customAspect = 1.75;
else customAspect = 0.75;
```

---

## 3. Should Domain Colors Enter the Rail?

**Current state:** Domain accent colors exist in `data.accentColor` and are used:
- In the card texture's accent lines and typography (system cards use amber, others use white)
- As the node's glow color in the shader
- As fallback background when image hasn't loaded

**Proposed approach — the accent should be structural, not decorative:**

The domain accent should appear in exactly **three places** in the rail:

1. **Chapter label in the sidebar** — the chapter name uses the domain accent color. When you're in a `sound` chapter, the chapter label reads in sage green. When in a `code` chapter, steel blue. This is already partially there.

2. **Left edge of text cards** — system cards and intertitle cards get a `4px` left-edge accent bar in the domain color. This replaces the amber tint that currently makes system cards feel like a different design system.

3. **Slide marker dots in the chapter scrubber** — each dot in the scrubber could use a domain-tinted white instead of pure white/pure dimmed. Very subtle — `rgba(domainColor, 0.6)` for active, `rgba(domainColor, 0.08)` for inactive. This creates a color language across the full length of the rail.

**What the domain color should NOT do in the rail:**
- It should NOT dramatically change the card background (ruins the Xerox/archival register)
- It should NOT be the primary text color (makes cards feel thematically branded rather than evidence-based)
- It should NOT be the accent for photographic cards (the photograph's own palette is the accent)

---

## 4. Multi-Artifact / Collage Layout — Should It Exist?

**The question:** Should a single rail "slide" be able to hold multiple images side by side, or image+video together?

**The answer: One artifact per slide, but chapters can have sub-slides that share a chapter heading.**

The reason: The horizontal rail works because each slide is a clear, singular proposition. The grayscale→color hover works because you're making a choice about one image. Collage introduces composition complexity that fights the archival register.

**BUT:** The chapter scrubber already handles grouping. What's missing is a within-chapter visual rhythm. The proposal is:

**Chapter Pairs** — A chapter can contain a `hero` slide (large) followed by immediately adjacent `compact` slides (smaller). In the 3D scene, compact slides within the same chapter could:
- Sit at `85%` of the standard height (slightly shorter)
- Use tighter gap spacing between them
- Share a visible chapter annotation above the cluster (text in the 3D scene)

This creates a visual **rhythm of expansion and compression** without breaking the single-artifact principle.

For **music videos + images in the same chapter:** keep them as sequential slides with the same chapter label. The chapter scrubber already groups them. In the sidebar, both slides show the same chapter name — the viewer reads them as related without needing a collage.

---

## 5. Per-Project Rail Critique and Story Proposal

### 5.1 TEBR
**Current sequence:** Violin Waveform → 427 Track Archive → STTM Lineage → Cultural Map → MaqamAI Coda
**Story arc:** Research → Data → Lineage → Territory → Human Ear
**Critique:**
- The 427 Track Archive image (`427-tracks-notion-taxonomy`) is a Notion database screenshot — it renders well as a diagram but its visual register (white Notion UI) clashes with the Xerox aesthetic. It would be better presented as a system text card.
- There is no audio slide — this is a sound project that has actual audio stems. An audio card of a TEBR stem loop should be the second or third slide, before the diagram evidence.
- The STTM Lineage slide uses an STTM installation photo — this is a related project's image, not TEBR's own. The caption earns it ("subtractive instrument gives TEBR its memory logic") but it reads as a gap in TEBR's own documentation.
- The Cultural Map (`arabic-pop-1925-2025-archive-map`) is strong and should stay.

**Proposed sequence:**
1. `hero 4:3` — Violin Waveform → The entry. A body becoming a signal.
2. `audio 1:1` — TEBR stem loop (6s) → Listen before you read. The work is sound first.
3. `system 1.75:1` text — "427 Generated Tracks" system card → The data as methodology, not screenshot
4. `diagram 1:1` — Arabic Pop 1925–2025 Archive Map → The cultural territory
5. `wide 16:9` — STTM installation photo → With explicit caption: "inherited instrument logic"
6. `portrait 3:4` — MaqamAI interface → The coda: what you learn to hear

**Images to find/add:** TEBR-specific performance or process documentation beyond the violin waveform.

---

### 5.2 MASHROU' LEILA
**Current sequence:** Baalbeck → "Not a Band" text → "Counter-Public Infrastructure" text → Scale I text → Scale II text → "The Design Problem" text → Self-Titled EP → El Hal Romancy → Raasuk → Ibn El Leil → Tiny Desk video → Olympia → Exit Festival → Roman video → Fasateen video → Raksit Leila video → Rolling Stone portrait → GQ Cover portrait → Yo-Yo Ma → "Creative Direction" system text → "Crisis Operations" system text → Stage Architecture → Annex Stage → "The Band as System" coda text

**Story arc:** Counter-Public (hero) → Reframing (3 text) → Scale (2 text+evidence) → Design Problem → Origin Surface → Album Sequence → Direct-to-Fan → Album World → Live Proof → Touring System → Music Video × 3 → Visibility × 2 → Recognition → System × 2 → Live System → Stage Logic → Coda

**Critique:**
- This is the longest rail at ~24 slides. It's a full documentary.
- **The opening is too text-heavy.** Three consecutive text slides immediately after the Baalbeck hero. This stalls the rail before it builds momentum. The "Not a Band" reframe is necessary, but it should come AFTER at least one more visual slide — let the photographs carry the argument first, then bring in the text frame.
- **The album sequence (EP → El Hal Romancy → Raasuk → Ibn El Leil) is four consecutive portrait slides.** This is a tight visual rhythm that actually works — it reads like flipping through vinyl sleeves. Keep this grouping but mark it explicitly as a chapter: "ALBUM SEQUENCE / WORLD BUILDING".
- **Three consecutive music videos** (Roman, Fasateen, Raksit Leila) creates momentum but they're all `wide` layout. Consider making the first video `16:9` and the subsequent two `compact 2:3` — like watching the main video and then catching clips.
- **The system text cards ("Creative Direction", "Crisis Operations") appear late**, after the visual evidence. This feels backwards — the system cards should either open a chapter or close it, not appear in the middle of a sequence.
- **The Tiny Desk video** is the strongest evidence slide in the whole archive. It should be later and treated as a climax, not buried between the albums and the Rolling Stone cover.
- **GQ Cover and Rolling Stone appear adjacent** — both portrait, both magazine. This doubling actually works: "the image becomes evidence / the image becomes risk."

**Proposed restructure — chapter logic:**
- Chapter 1: COUNTER-PUBLIC (hero → 1 text → 1 visual) — Baalbeck, "Not a Band" text, Olympia live
- Chapter 2: ALBUM WORLD (4 album covers) — Self-Titled, El Hal Romancy, Raasuk, Ibn El Leil
- Chapter 3: SCALE (2 evidence text cards + 2 metric cards) — Scale I/II text, then numbers
- Chapter 4: MUSIC VIDEO (Roman + Fasateen as a pair, Raksit Leila) — video language established
- Chapter 5: VISIBILITY (Rolling Stone + GQ) — the image as cultural infrastructure
- Chapter 6: LIVE PROOF (Tiny Desk as climax, then Baalbeck/Exit Festival)
- Chapter 7: SYSTEM (Creative Direction + Crisis Operations as system cards) — the operations behind
- Chapter 8: CODA (Stage Architecture → "The Band as System" text)

**Images available but unused:**
- `cavalry-music-video-militarized.webp` — strong political image, should be in chapter 4
- `barbican-release-london-performance.webp` — European scale evidence
- `baalbeck-international-festival-2017.webp` — existing, possibly duplicated with hero
- `mashrou-leila-npm-desk.jpg` — this IS the Tiny Desk (should be `16:9 video` slide, currently listed as image)

---

### 5.3 MEKENA NYC
**Current sequence:** Queens Exterior → Building Schematic → Fictive Environments → Generative Architecture
**Story arc:** Place → Infrastructure → Studio → Speculative Form

**Critique:**
- Too short for the institutional weight of this project. MEKENA is a major infrastructure project.
- **The hero image (Queens Exterior) is the right choice** — the building as argument.
- **Building Schematic as slide 2** is correct — immediately moves from place to system.
- **Fictive Environments and Menara are related-project slides**, not MEKENA documentation. The coda should be MEKENA's OWN process: what happens inside the building?
- **Missing:** Documentation of the residency program, the artists who've used it, the Westbeth partnership, the emergency housing function. These are what make MEKENA an institution, not just a building.

**Proposed sequence:**
1. `hero 4:3` — Queens Exterior → The building as argument
2. `diagram 1:1` — Building Schematic → What it contains
3. `system 1.75:1` text — "Makan / Place / Position" → The naming logic + program description
4. `wide` — Residency documentation (process/interior images if available)
5. `evidence text 4:3` — Westbeth Safe Haven, artist counts, emergency housing numbers
6. `coda portrait 3:4` — Fictive Environments / Menara as "what MEKENA produces" → related projects

**Images available but unused:**
- `the-waiting-room-installation.webp` — possibly a MEKENA-housed work?
- `ants-design-store-interior.webp` — possible related spatial work?

---

### 5.4 SOMETIMES I WAKE UP ELSEWHERE (SIWUE)
**Current sequence:** Manuscript Fragment → Bureaucratic Texture → Predecessor System (Cartography)
**Story arc:** Dream Log → Forms → Shadow Text

**Critique:**
- Only 3 slides for a 28,000-word autofiction manuscript. This is a text-heavy project and the rail doesn't reflect that.
- **The `siwue-hallway-cat.png` and `siwue-still-room.png` images exist in the atlas folder** but are not in the gallery. These are clearly internal imagery from the work itself — stills from rooms, objects, locations that appear in the dream cycle. They should be in the rail.
- **The manuscript fragment is an image of text** — it's a `portrait 3:4` that renders correctly (page of text is a portrait ratio). Good.
- **The bureaucratic texture** is the right second image — immediately shows the form-aesthetic.
- **Missing:** An audio reading? A text card with an excerpt from the actual prose?

**Proposed sequence:**
1. `hero 4:3` — Manuscript Fragment → Entry into the text
2. `portrait 3:4` — `siwue-hallway-cat.png` → One image from inside the work: ordinary, specific
3. `portrait 3:4` — `siwue-still-room.png` → Another image from inside: the room that recurs
4. `diagram 1:1` — Bureaucratic Texture → The form-aesthetic as visual system
5. `intertitle 3:4` text — "62 entries / 28,000 words / surrealism without announcement" → Scale card
6. `system 1.75:1` text — SIWUE system: Dream → Detail → Bureaucratic form → Errand → Animal → Recurrence
7. `portrait 3:4` — Cartography of Absence (related) → Shadow system coda

**Images available:**
- `siwue-hallway-cat.png` ✓ in folder, not in gallery
- `siwue-still-room.png` ✓ in folder, not in gallery  
- `siwue-algorithmic-displacement-audit.webp` — could work as system evidence
- `nowhere-elsewhere-transit-visual.webp` — displacement register

---

### 5.5 CARTOGRAPHY OF ABSENCE
**Current sequence:** Bureaucratic Form → Void Trace → Absence Index
**Story arc:** Administrative Dream → Trace → Index

**Critique:**
- Very short (3 slides) for a modular manuscript system of nine thematic "houses."
- The sequence is conceptually tight and correct — form → trace → index is the right logic.
- **What's missing:** The "nine thematic houses" are not represented. A system card could list them as a structure diagram.
- **The `walaw-manifesto-origin-text.webp` image** exists in atlas and would fit as an adjacent-text evidence slide.

**Proposed additions:**
- Add: `system 1.75:1` text card listing the nine thematic houses (like a table of contents as evidence)
- Add: `intertitle 3:4` — an actual excerpt from the bureaucratic form language of the work
- Add: `portrait 3:4` — `map-of-the-wound-literary-visual.webp` (spatial literature, related register)

---

### 5.6 ARCHITECTURE IN LOW RES
**Current sequence:** Low-Res Render → Bartlett Thesis → Beirut Phantom (coda)
**Story arc:** Compression → Research Ground → Afterimage

**Critique:**
- Correct but thin (3 slides).
- **The thesis image (`architecture-low-res-thesis-render.webp`)** as hero is right — it immediately enacts the argument (a low-res render).
- **Missing:** Documentation of the actual buildings being studied. Low-res images of contested, destroyed, or partial sites would be the strongest evidence.

**Proposed additions:**
- Add: `wide 16:9` or `compact` — `2006-reconstruction-south-lebanon.webp` → literal site evidence
- Add: `diagram 1:1` — `post-conflict-urbanism-south-lebanon.webp` → the research field
- Add: `intertitle 3:4` text — "The broken image is more honest than the polished render" — the thesis statement as a card

---

### 5.7 SPACE TIME TUNING MACHINE (STTM)
**Current sequence:** The Broad (hero) → Strings at Rest → Photon+ (coda)
**Story arc:** Installation → Resonance → Digital Twin

**Critique:**
- Only 3 slides for a landmark work that premiered at SXSW and showed at The Broad. Severely underrepresented.
- **The Broad hero image is correct** — the installed environment is the entry point.
- **Missing SXSW documentation.** The world premiere deserves its own slide.
- **Missing:** Any audio/sound material from the instrument. This is fundamentally a sound piece.
- **Missing:** The subtractive logic as a system card — what does it mean to begin with noise and subtract?

**Proposed sequence:**
1. `hero 4:3` — The Broad installation (existing)
2. `audio 1:1` — STTM stem loop → Hear the instrument
3. `wide 16:9` — SXSW performance documentation (if image exists: `vessel-orchestra-met-documentation.webp` as proxy)
4. `system 1.75:1` text — "From Noise to Silence: the subtractive method" — the logic
5. `diagram 1:1` — Photon+ interface → The digital twin
6. `portrait 3:4` — Strings at Rest → The quiet hinge

**Images available:**
- `vessel-orchestra-met-documentation.webp` and `vessel-orchestra-met-performance.webp` — could these be STTM or related sound works?
- `loop-corridor-feedback-system.webp` — feedback system related to subtractive logic?

---

### 5.8 HAH-WAS
**Current sequence:** Detection Interface → Binary Channel → Rejection Log → FRANK (adjacent system)
**Story arc:** Sieve → Protocol → Failure Log → Adjacent System

**Critique:**
- The sequence is logically correct — methodology → protocol → evidence → context.
- **The Detection Interface hero is strong** — it reads as both beautiful and critical.
- **The Binary Channel (`hah-was-binary-channel-barcode-waveform.webp`)** as a diagram card is exactly right.
- **Missing:** The actual test outputs — what does a failed maqam hallucination sound like? An audio card of a model-generated maqam (intentionally wrong) would be devastating.
- **The FRANK slide** is low emphasis (`emphasis: 'quiet'`) but it's actually a very interesting adjacent system — civic bias detection. It could earn a more prominent position.

**Proposed addition:**
- Add between Rejection Log and FRANK: `audio 1:1` — "Hallucinated Maqam" audio card (a model output that fails the maqam test). Caption: "What the model hears."
- Consider: `localization-gap-batch-processing-yield-terminal.webp` → the terminal output as evidence

**Images available but unused:**
- `localization-gap-maqam-spectrogram.webp` — spectrogram of maqam vs. model output, very strong
- `localization-gap-batch-processing-yield-terminal.webp` — terminal evidence
- `lede-nyc-civic-intelligence-ui.webp` — possible FRANK-adjacent

---

### 5.9 KARDIA
**Current sequence:** Body Signal → Topographic Mesh → Maintenance Log
**Story arc:** Biofeedback → Signal Terrain → Body Archive

**Critique:**
- Only 3 slides. Short but conceptually coherent.
- The `sunburn-weather-rehearsal-climate-synthesis.webp` and `sunburn-weather-sonification.webp` images in the atlas are tagged to `the-weather-rehearsal` which shares conceptual territory with Kardia.
- **Audio card would be powerful here** — what does the Iso-Principle sound like? A biofeedback-driven audio clip.

**Proposed additions:**
- Add: `audio 1:1` — Kardia output clip → What the instrument sounds like when the body is measured
- Add: `intertitle 3:4` text — "The Iso-Principle: match the body's energy, then guide it toward calm"

---

### 5.10 DERIVE
**Current sequence:** Memory Navigation → Vector Flow → Sorted Blocks → Emerging Structure
**Story arc:** Memory Field → Flow → Negentropy → Emergence

**Critique:**
- This is one of the better-structured rails — four slides, four distinct system states.
- `derive-boids-vector-flow-field.webp` as a `diagram` slide is correct.
- **The `derive-entropy-reducing-structure-emerging.webp` as coda** is exactly right — you end on structure arriving, not structure imposed.
- **Missing:** What does DERIVE sound like? If it has an audio component, it should be there.
- The `derive-negentropic-machine-noise-order.webp` and `derive-negentropic-sorted-blocks-grid.webp` are both in the atlas — both should probably appear. The two states of the negentropy process.

**Proposed addition:**
- Split slide 3 into two: `derive-negentropic-sorted-blocks-grid.webp` (existing) + add `derive-negentropic-machine-noise-order.webp` as preceding compact slide — shows both before/after

---

### 5.11 RESONANCE ATLAS
**Current sequence:** Spatial Sound Map → 427 Track Metadata → Evaluation Protocol (HAH-WAS)
**Story arc:** Sound Territory → Dataset → Protocol Link

**Critique:**
- Short but correct for a research infrastructure project.
- **The atlas map image is strong.** The cultural territory as a map is exactly the right hero.
- **The 427 Track Metadata is shared with TEBR.** Both projects reference this image. This is fine — the archive is a shared system — but the caption should differentiate.
- **Missing:** Audio samples from the atlas dataset itself. A clip of a correctly-rendered maqam vs. a model hallucination would be powerful.

---

### 5.12 MAQAMAI
**Current sequence:** MaqamAI Interface → Maqam Synthesizer → Archive Map
**Story arc:** Ear Training → Modal Grammar → Cultural Field

**Critique:**
- Short but tight. Correct sequence.
- **Could benefit from an audio card** — demonstrate the maqam before explaining the interface.

**Proposed restructure:**
1. `audio 1:1` — A maqam scale being played (correct microtonal rendering) → Hear first
2. `hero 4:3` — MaqamAI Interface → The tool
3. `diagram 1:1` — Maqam Synthesizer → The grammar made playable
4. `wide` — Archive Map → The cultural field this belongs to

---

## 6. The Question of Systems Projects

Some projects are **primarily systems, not artifacts** — they don't have performances or photographs. They have research outputs, UI screenshots, and data. These include:

- HAH-WAS (evaluation protocol)
- Resonance Atlas (dataset + map)
- MaqamAI (web application)
- music-engines (backend infrastructure)
- 3D Beat Synth (browser instrument)
- Storylines (graph tool)
- Codeverse Explorer (3D codebase)
- Kardia (mobile instrument)
- Photon+ (browser instrument)

**For these projects, the rail sequence should be:**
1. **Interface hero** (4:3) — the app/system in use. Don't apologize for showing UI.
2. **System text card** (1.75:1) — the methodology in one screen: what problem does it solve, how
3. **Diagram/data card** (1:1) — the output: a waveform, a graph, a spectrogram, a data grid
4. **Audio card** (1:1) if sound-producing — what it sounds like
5. **Related project link** (portrait 3:4) — what ecosystem does it belong to

The mistake would be to treat systems projects as depleted versions of performance projects. They have their own visual register: **the UI is the artifact**. The interface screenshot should be treated with the same care as a performance photograph.

---

## 7. Does the Rail Need Its Own design.md?

**Yes — but it should be this document, not a separate one.**

The card taxonomy in this document, combined with the per-project critique, constitutes a complete spec for the rail. What needs to happen next is:

**Implementation priorities (in order):**
1. Fix the aspect ratio logic in NodeManager.ts (type wins: video=16:9, audio=1:1)
2. Redesign the audio card texture (`createCardTexture` for audio type)
3. Add `uIsSystemSlide` uniform to bypass grayscale on diagram cards
4. Redesign the intertitle card to use display font (not mono) for the title
5. Add the 4px domain accent left-bar to all text cards
6. Redesign the dossier card to replace the PAPAZIAN stamp with a large primary metric
7. Add missing slides to: TEBR, Mashrou' Leila (restructure chapters), SIWUE, STTM, HAH-WAS
8. Implement chapter-aware compact slide grouping (85% height for compact slides within a chapter)

---

*End of rail-card-system.md — update after any card system implementation.*
