# Papazian Archive Spatial Portfolio Audit

Date: 2026-05-12

Implementation status: the first P0 pass has started. The live app now loads the CSV/local-image atlas through `src/data/atlas.ts`, uses 119 real records, gates case-study CTAs with `hasProjectPage`, applies tier-aware node scale, and disposes Three.js mesh resources on teardown.

## Executive Read

This portfolio has the right underlying instinct: a black-field spatial archive where projects are navigated as positions, not pages. The current build already suggests a cinematic instrument more than a normal portfolio. The problem is that the implementation is still exposing its scaffolding. It feels like a prototype of a spatial system, not yet the authored system itself.

The biggest issue is not polish. It is authorship. The live scene renders 99 nodes from `src/data/nodes.json`, but those nodes collapse into 9 repeated title families and 9 repeated remote thumbnails. Meanwhile, the project already contains a much stronger source of truth: `public/images/atlas/atlas-node-update-FINAL.updated.csv` with 119 real rows, 14 lead projects, 58 secondary projects, 47 archive projects, project-page flags, connections, summaries, and local image paths. Until the real atlas powers the interface, the spatial experience cannot feel intelligent, emotional, or precise.

The second issue is wayfinding. The site has five modes, but they currently feel like alternate demos rather than a coherent spatial grammar. Horizontal, vertical, grid, cylinder, and list all use the same visual unit and similar interaction rules, so the user changes layout without understanding why the world changed. A premium spatial portfolio needs each mode to answer a different question: "What matters?", "How are things connected?", "Where am I in the archive?", "What is the cinematic sequence?", and "How do I quickly find something?"

The third issue is technical invisibility. The loader says "Initializing Spatial Engine," the case-study links go to routes that do not appear implemented, hidden scrollbars remove orientation, the bundle is almost 1 MB before gzip, and Three.js resources are not fully disposed. These details make the technology visible in the wrong way.

## What Works

- The black field is the correct world. It gives the work room to behave like artifacts, scenes, or signals instead of portfolio cards.
- The minimal top brand plus bottom instrument panel is directionally strong. It avoids the generic vertical marketing-page structure.
- The WebGL plane gallery is a valid base for a cinematic archive. It can become a genuinely memorable interface if the data, hierarchy, and motion are made more intentional.
- The list mode is useful as a counterweight to immersion. It gives the user a way out of pure spatial browsing.
- The project drawer has the right macro behavior: select an artifact, camera moves, detail enters from the side. The bones are good.

## Ranked Findings

### P0 - The live archive content is placeholder-grade

Evidence: `src/App.tsx` imports `src/data/nodes.json` directly, and that data drives both the scene and overlay. The live JSON has 99 entries, but only 9 unique title families and 9 unique thumbnails. The browser list view confirms the repetition: "Systems Choreography 1," "MEKENA NYC 1," "Impossible Instruments 1," then the same families repeated by year.

Why it hurts: the interface asks to be read as an intelligent archive, but the content reads as generated filler. That breaks trust immediately.

Recommendation: promote the CSV/local image atlas into the live data source before deeper visual polish. Normalize the CSV into a typed module with `id`, `slug`, `title`, `year`, `tier`, `domains`, `stack`, `connections`, `image`, `hasProjectPage`, and `summary`. Keep the current spatial engine, but feed it real work.

### P0 - Tier hierarchy exists in data but not in the experience

Evidence: the CSV contains 14 lead, 58 secondary, and 47 archive rows. The live UI treats every node as a same-size 6 by 4 plane with the same shader, same hover, same drawer structure, and same case-study CTA.

Why it hurts: the brief depends on dense Tier 1 case studies and lighter atmospheric archive browsing. The current interface cannot create that rhythm because all works have the same visual weight.

Recommendation: make tier visible through behavior rather than labels.

- Lead projects: larger image plane, slower parallax, stronger focus lock, richer drawer, "enter case study" transition.
- Secondary projects: medium plane, concise drawer, connection chips, related lead project.
- Archive projects: smaller artifact, fast browse, image plus year/domain, no heavy drawer unless selected.

### P0 - Case-study affordance overpromises

Evidence: every drawer shows `VIEW CASE STUDY`, generated from `/case-studies/${activeNode.slug}`. The data itself has a `hasProjectPage` flag in the CSV, but the current live JSON does not use it.

Why it hurts: if a lower-tier or archive project sends users into a dead or thin route, the experience feels unfinished. A premium interface is allowed to be minimal, but it cannot lie about depth.

Recommendation: gate the CTA by `hasProjectPage`. For archive-only items, replace it with "Trace connections" or "Hold in archive." Lead items should earn a real cinematic entry.

### P1 - The navigation panel reads as control hardware, but not yet as wayfinding

Evidence: the bottom bar contains an info toggle, search/status area, and layout switcher. The mode switcher is icon-only, hidden behind a menu, and the current mode is only implied by an icon.

Why it hurts: icon-only layout switching is elegant for experts, but this archive has conceptual modes. The user needs to understand where they are and why changing mode matters.

Recommendation: redesign the bottom bar as an "archive instrument":

- Left: identity/info as a restrained glyph.
- Center: current coordinate, mode name, hovered/selected project, and progress through the archive.
- Right: mode rail with visible labels on desktop and icon plus tooltip on compact screens.
- Add a tiny spatial minimap or progress strip above the bar. It should feel like an architectural section drawing, not a gamer HUD.

### P1 - The five modes need distinct jobs

Current behavior:

- Horizontal: cinematic reel, but all nodes have equal weight.
- Vertical: editorial column, but no text rhythm or chaptering.
- Grid: archive overview, but no tier/domain grouping.
- Cylinder: conceptually interesting, but not justified by visible orientation markers.
- List: useful, but currently exposes placeholder repetition and lacks tier/domain filtering.

Recommendation: assign one purpose per mode.

- Sequence: horizontal filmstrip for curated lead/secondary progression.
- Index: grid grouped by domain and tier.
- Essay: vertical mode for editorial reading and project clusters.
- Orbit: cylinder only for relational or temporal constellations, with anchor labels and visible rotation logic.
- Table: list mode for search, filtering, and fast access.

### P1 - Spatial transitions feel mechanical rather than cinematic

Evidence: mode changes animate every mesh with the same `expo.inOut` duration and small per-index delay. Node focus adds a bounce, then offsets the camera for the side drawer.

Why it hurts: bounce animation is too toy-like for this tone. The work asks for editorial cuts, dolly moves, parallax holds, and quiet snap-to-focus moments.

Recommendation: replace bounce with cinematic focus language.

- On hover: slight luminance lift, title lock, very small scale or depth shift.
- On select: image holds, surrounding nodes dim into depth, camera shifts with a measured ease, drawer arrives after the camera settles.
- On mode switch: use a two-phase transition: collapse into a thin index line, then unfold into the new topology.

### P1 - Loading copy breaks the spell

Evidence: the loader says "Initializing Spatial Engine." In the browser, this was visible before the scene appeared.

Why it hurts: "Spatial Engine" names the machinery. The brief asks for technology to disappear.

Recommendation: use archive-native loading language and avoid percentages unless they are beautifully integrated.

Options:

- "Assembling archive"
- "Locating works"
- "Drawing field"
- A thin scanning line that resolves into the first spatial axis.

### P1 - Image treatment is not yet authored

Evidence: the live scene uses repeated Unsplash-like remote images. The local atlas folder contains many specific `.webp` assets, but they are not the live source.

Why it hurts: cinematic framing only works when the images carry the actual work. Generic or repeated images make the interface feel template-like.

Recommendation: use local atlas images first, then art-direct by tier:

- Lead: strong full-bleed crop option in drawer and case-study entry.
- Secondary: consistent 3:2 artifact frames.
- Archive: small visual evidence, allowed to be quieter and more indexical.

### P2 - Search is visually elegant but underpowered

Evidence: search filters title, tag, and category by fading unmatched meshes. In list mode it filters only titles.

Why it hurts: this archive is cross-disciplinary. Search should understand domains, stack, year, tier, project-page availability, and connections.

Recommendation: search should become "find by relation," not just string matching. Support domain filters and related-work jumps. When a query matches, reposition or cluster results rather than only dimming misses.

### P2 - Hidden scrollbars and infinite wrapping reduce orientation

Evidence: global CSS hides all scrollbars. NodeManager wraps nodes infinitely in vertical, horizontal, and grid modes.

Why it hurts: infinite space can feel immersive, but without an index, horizon, or section marker it becomes placeless. The user cannot tell whether they are moving through a curated system or drifting through a loop.

Recommendation: keep infinite motion only where it has a reason. Add soft orientation cues: mode label, current cluster, archive count, and a tiny linear/circular progress indicator.

### P2 - Mobile behavior needs a separate spatial grammar

Evidence: global `touch-action: none`, fixed bottom controls, a full-width drawer, hidden scrollbars, and WebGL pointer handling suggest mobile is treated as a compressed desktop.

Why it hurts: a spatial portfolio on mobile should feel like a tactile reel or stack, not a shrunken control room.

Recommendation: mobile should default to vertical editorial/reel mode. Keep one persistent bottom strip, expose search as a sheet, and make mode switching secondary. Lead projects should open as full-screen editorial cards; archive items can open as compact bottom sheets.

## Layout Sketches

### 1. Bottom Navigation: Archive Instrument

Desktop:

`PAPAZIAN` stays top left. Bottom bar becomes three zones:

`+` info glyph | `VERTICAL / 037 of 119 / SYSTEMS + SOUND / TEBR` | `Sequence Index Essay Orbit Table`

The active mode is text-first, with icons as secondary. A 1-pixel progress line sits above the bar. Hovering a mode reveals one sentence: "Sequence moves through curated works" or "Index groups by domain."

Mobile:

`PAPAZIAN` top left, current project title top right when hovered/selected. Bottom bar shows only current mode, search, and close/back. Mode rail opens as a sheet.

### 2. Project Drawer

Lead project drawer:

- Large title, year range, domains.
- One strong image crop or still.
- 2-3 sentence thesis.
- Connections as quiet chips.
- CTA: "Enter case study."

Secondary drawer:

- Title, year, domain.
- Summary.
- "Related to" lead project.
- CTA only if `hasProjectPage`.

Archive drawer:

- Smaller, faster, almost archival label.
- Image evidence, year, domain.
- No big CTA unless there is a real page.

### 3. Grid / Index Mode

The grid should stop being a uniform wall. Group by domain bands: Sound, Space, Code, Text, Image, Systems. Lead projects interrupt the grid as larger anchors. Archive projects become small dense cells. This gives the user a map, not wallpaper.

### 4. Cylinder / Orbit Mode

Use orbit mode only when the archive is organized around relationships. Anchor the cylinder with 4-6 named lead projects, then let secondary/archive works orbit around them by connection. Add subtle radial guide lines and a current anchor label so the user knows why the topology exists.

### 5. Case-Study Entry

When selecting a lead project, do not jump to a normal route. Let the selected plane expand, the field fall away, and the first case-study section emerge from the same image. The transition should feel like entering a room from the map.

## Technical Architecture Findings

### Data model

Move from untyped JSON to a normalized atlas module. The minimum useful shape:

```ts
type ProjectTier = 'lead' | 'secondary' | 'archive';

interface AtlasProject {
  id: number;
  slug: string;
  title: string;
  year: string;
  tier: ProjectTier;
  domains: string[];
  stack: string[];
  connections: string[];
  image: string;
  hasProjectPage: boolean;
  summary: string;
}
```

The CSV should be converted once into this module or parsed at build time. The scene should not know about CSV details.

### Rendering and cleanup

Three.js documentation expects explicit disposal of geometries, materials, and textures. The current `Scene.dispose()` disposes the renderer and managers, but `NodeManager.dispose()` only removes mouse/click listeners. It does not dispose mesh geometry, shader materials, or loaded textures. Fix this before long-running interactive testing.

### Texture loading

Current `LoadingManager.onError` calls `onLoadComplete` immediately. One failed texture can dismiss the loader before the archive is actually ready. Use local `.webp` paths, aggregate failures, and render intentional placeholders per missing asset.

### Bundle and code splitting

The production JS bundle is 975.91 kB before gzip. Split the 3D engine from any future editorial/case-study routes. Defer heavy systems until after the shell appears. Remove unused imports such as Lenis if it remains unused.

### Interaction engine

The scroll engine maps all input into two target values and applies one global lerp. That is simple and good for prototyping, but the modes need mode-specific physics:

- Horizontal: stable reel with snap thresholds.
- Vertical: editorial inertia with readable resting positions.
- Grid: pan with gentle bounds or elastic edges.
- Orbit: rotational damping and anchor snapping.
- List: normal scroll behavior, not WebGL gesture capture.

### Accessibility

Keyboard navigation exists, but the spatial state is not exposed as a navigable list/grid to assistive tech. Buttons need fuller labels. Mode buttons use `title`, but should also expose `aria-label`. Project drawer should manage focus and return focus on close.

## Benchmark Positioning

Against Awwwards-level experimental portfolios, the current site has a stronger conceptual base than many template-heavy dark portfolios, but weaker authorship in execution. The black field, spatial modes, and archive-as-interface idea are promising. The repeated content, generic image set, and undifferentiated modes make it feel closer to an interactive prototype than a finished creative-technologist portfolio.

Against architecture studios, it has the right restraint but not enough spatial legibility. Architecture interfaces use section, axis, scale, and plan logic. This site should borrow that discipline: visible axes, clusters, thresholds, and clear transitions between overview and detail.

Against cinematic editorial experiences, it needs stronger sequencing. Right now every project arrives with the same visual grammar. A cinematic editor would vary duration, scale, silence, and cut rhythm between lead works and archive fragments.

Against creative technology labs, the system needs to hide its machinery. The user should feel that the archive is alive because the work demands it, not because a Three.js engine is announcing itself.

## Redesign Roadmap

### Must fix before the site can feel real

1. Replace live placeholder JSON with normalized real atlas data from the CSV/local images.
2. Implement tier-aware rendering and drawer behavior.
3. Gate case-study CTAs with `hasProjectPage`.
4. Rename loading language and remove overt "engine" copy.
5. Add clear active mode labels and orientation/progress cues.

### Experience elevation

1. Give each mode a distinct purpose and visual grammar.
2. Replace bounce/filler motion with cinematic focus, dimming, and topology transitions.
3. Redesign the bottom bar as an archive instrument.
4. Add domain/tier filtering and relationship-driven search.
5. Design lead case-study entry as an expansion from the spatial field.

### Technical hardening

1. Dispose all Three.js geometries, materials, and textures.
2. Make texture loading resilient and local-first.
3. Code-split the WebGL engine and future case-study routes.
4. Add mode-specific gesture physics.
5. Add focus management, `aria-label`s, and reduced-motion behavior.

## Final Creative Direction

The site should not become more decorative. It should become more inevitable.

The right target is a black architectural field where the projects behave like evidence: some are monuments, some are rooms, some are fragments, some are references in the margins. The interface should feel like a quiet machine for moving through a life of work, not a gallery of cards and not a tech demo. The current build has the seed of that. The next version needs to make the archive real, make the modes meaningful, and make the technology disappear.
