# Walkthrough & Handoff Summary — Phase 1: Index/Archive Browser Overhaul

This walkthrough outlines the technical implementation, layout refactoring, and deep link integrations completed for the **Index/Archive Browser Overhaul (Phase 1)** of the Papazian Archive, including the recent layout and structural refinements.

---

## 1. What Was Completed
We have successfully implemented the structural and visual separation between **Index** and **Maps** modes as requested by the specification:

### 🔎 Shared Foundation (Sprint 0)
* **Worlds Data Layer** ([worlds.ts](file:///Users/vhnmns/Documents/projects/papazian-archive/src/data/worlds.ts)):
  * Extracted the 6 canonical project worlds (`Foundation`, `Public Culture`, `Exile Machines`, `Memory Interfaces`, `Sonic Intelligence`, `Spatial Futures`) and their mapping colors out of UI files into a reusable data module.
  * Updated [Overlay.tsx](file:///Users/vhnmns/Documents/projects/papazian-archive/src/components/Overlay.tsx) to consume this data layer.
* **Extended Schema** ([atlas.ts](file:///Users/vhnmns/Documents/projects/papazian-archive/src/data/atlas.ts)):
  * Added `world` (type `ProjectWorld | null`) and `hasRail` (computed from the presence of gallery items) to the `AtlasNode` interface and synthetic node builder.
* **Relations Modeling** ([relations.ts](file:///Users/vhnmns/Documents/projects/papazian-archive/src/data/relations.ts)):
  * Added `weight`, `directionality`, `visibilityLevel`, and `isCurated` to the `AtlasRelation` interface.
  * Renamed legacy relation type values (`resonance` → `theme`, `infra` → `infrastructure`, `tension` → `public-consequence`).
  * Created bidirectional lookup helpers (`getRelationsForNode`, `getAllRelations`) to support relationship modeling.

### 🔎 Artifact Inspector (Sprint 1)
* **ArtifactInspector Component** ([ArtifactInspector.tsx](file:///Users/vhnmns/Documents/projects/papazian-archive/src/components/ArtifactInspector.tsx)):
  * Implemented a forensic/archival preview panel displaying a centered media viewer (images, local video player, embedded YouTube iframe, and local audio player) alongside a monospace details sidebar.
  * Action buttons include: **Open Rail** (to enter horizontal cinematic mode), **Show in Maps** (to focus node in the atlas), copy link, and direct outbound links.
* **Wiring Grid & List Click Behaviors** ([App.tsx](file:///Users/vhnmns/Documents/projects/papazian-archive/src/App.tsx)):
  * Routed 3D grid cell clicks to open `ArtifactInspector` (setting `inspectedRecord`) instead of launching `VideoLightbox` or the cinematic rail directly.
  * Added keyboard navigation (Escape to close, Left/Right arrow keys to cycle records).
  * Wired text list clicks in the Overlay panel to open `ArtifactInspector` for the selected record via a new `onInspectNode` prop.

### 🔎 Index Filters, Sort, and Status (Sprint 2)
* **IndexFilterBar Component** ([IndexFilterBar.tsx](file:///Users/vhnmns/Documents/projects/papazian-archive/src/components/IndexFilterBar.tsx)):
  * Developed a compact, slide-out drawer filter bar rendered at the right side when toggled in Grid mode.
  * Options: **World** (the 6 canonical domains), **Medium** (domains), **Type** (evidence roles/types), **Sort** (Project, Year, World, Medium), and **View** (Image Only, Text Only, Hybrid).
* **3D Layout Repositioning** ([NodeManager.ts](file:///Users/vhnmns/Documents/projects/papazian-archive/src/core/NodeManager.ts) & [Scene.ts](file:///Users/vhnmns/Documents/projects/papazian-archive/src/core/Scene.ts)):
  * Updated `getVisibleMeshes('grid')` to dynamically filter and sort the 3D meshes depending on the selected `indexFilters`.
  * Non-matching meshes are instantly hidden, scale down, and fade out; remaining meshes smoothly animate to fill the grid layout slots cleanly.
* **HUD Status & URL Hash Syncing**:
  * Formatted bottom bar status to show active index filter values (W:world, M:medium, SORT, VIEW) and counts.
  * Serialized filters (`world`, `medium`, `type`, `sort`, `view`) and inspected records (`record`, `asset`) directly into the URL hash parameters for bookmarkable and shareable views.

### 🔎 Index View Modes & Polish (Sprint 3)
* **Visual vs. Hybrid vs. Text View Modes**:
  * **Visual**: Renders standard 3D meshes without hover tags or captions.
  * **Hybrid**: Displays an elegant HTML HUD tooltip floating near the mouse pointer on hover, showing titles, years, chapters, and helper text.
  * **Text**: Automatically activates the Overlay's Works list panel, matching the structured listing view.
* **World-Grouped Rows**:
  * Modified the slot calculation in `getGridSlot` to force a new grid row whenever the project's world changes when sorted by world, separating worlds cleanly.

### 🔎 Routing, SEO & Audit Polish (Sprints 4 & 5)
* **Client-Side Routing**: Integrated `window.history.pushState` in `App.tsx` so the browser URL syncs with internal modes. 
* **Static HTML Shells for SEO**: Created `scripts/generate-static-shells.ts` to generate static `dist/{route}/index.html` folders post-build.
* **2D DOM Safe Mode Fallback**: Implemented a responsive 2D HTML/CSS layout fallback in `Overlay.tsx` when WebGL fails.
* **Context Loss Recovery**: Configured `onContextRestored` event hook to automatically remount the 3D scene on mobile viewports.
* **Responsive Footer & Contrast**: Adjusted ModeButtons for fluid-width on mobile and updated `--color-text-muted-quiet` to `#8f8f8f` to satisfy WCAG AA contrast standards.
* **Comprehensive Eager Preloading**: Fully enabled eager loading for all asset slides (primary cover and gallery sub-slides) during initialization in `NodeManager.ts`. Combined this with default eager loading (`loading="eager"`) for all DOM image instances (`ImageWithFallback.tsx`), enabling the front-end loading screen overlay to track and cache the entire media archive before displaying the site.

---

## 2. Bureaucratic Brutalist Redesign & Layout Realignment
We have transitioned the visual interface into an industrialized, technical console following the **Bureaucratic Brutalism** design specifications:

* **Industrialized Slide-out Filter Panel**:
  * Collapsed the top multi-row filter bar into an elegant, vertical slide-out right drawer panel (`IndexFilterBar.tsx`).
  * Structured filter options (`WORLD`, `MEDIUM`, `TYPE`, `SORT`, `VIEW`) vertically with technical monospace labels (removed all brackets `[` and `]`).
  * Added a monochromatic backdrop scrim with matrix-blur transitions when opened.
  * Added a `⚡ FILTERS` geometric trigger button at `top-5 right-5` to toggle the drawer, resolving viewport clutter and keeping the brand logotype standalone.
* **Anchor-Locked Bounding Container Labels**:
  * Instead of a floating cursor tooltip, we now project the card's 3D top-right corner `(3, 2, 0)` into 2D screen space coordinates using camera projection in `NodeManager.ts`.
  * The metadata label (`Overlay.tsx`) locks strictly to the card's top-right coordinates, displaying ID, Category, World, Medium, and 3D coordinate tags `X: ... / Y: ...` with a clean industrial left border `border-l border-white/20`.
* **Tactile 2.5x Card Spacing**:
  * Cleaned up empty voids by maintaining the 2.5x card sizes, aligning the cards as a precise blueprint grid.

---

## 3. Cleaned Up Brackets & Navbar Labels (Latest Updates)
* **Removed Navbar Labels**: Stripped out text sublabels from the mode buttons at the footer, rendering only clean, minimal, intuitive icons (`Rows3`, `LayoutGrid`, `Map`, `BookOpen`, `Globe`) for navigation.
* **Removed All Brackets**: Eliminated bracket characters (`[` and `]`) from all buttons, filters, tooltips, and inspectors across the site (e.g. `⚡ FILTERS`, `CLOSE`, `CLICK TO INSPECT`, and coords display).
* **Removed Show Text List Button**: Discarded the toggle button in the footer to simplify the navigation model into a pure Media Index.
* **Display Layer Toggles**: Integrated a 3-state display layer selector:
  * **Image Only**: WebGL meshes are fully visible and active, text layers are hidden.
  * **Text Only**: WebGL meshes are completely hidden (`uModeVisibility = 0.0`), rendering only 2D HTML metadata cards projected exactly on top of their spatial coordinates.
  * **Hybrid (Both)**: WebGL meshes are dimmed in shaders (`uSearchHighlight = 0.35`), overlaid with the projected 2D HTML metadata cards.
* **Mashrou' Leila Video Archives**: Loaded the official YouTube video entries for Mashrou' Leila (*Lil Watan*, *Aoede*, *Bahr*, *Roman*, *Fasateen*, *Shim El Yasmine*, *Cavalry*) into the project's gallery database.

---

## 4. Animation Smoothness & Redundancy Polish (Recent updates)
* **Removed Stretchy Scaling Animations**:
  * Modified `setNodePosition` in `NodeManager.ts` to assign targets' scale dimensions instantly (`mesh.scale.set(...)`) inside grid mode, preventing cards from stretching or bouncing into place when layout/filter changes occur.
  * Removed staggered layout ripples (`delayVal = 0` for grid mode) and switched the position transition curve to a snappy, clean `power2.out` ease over a quick `0.45`s duration.
* **Eliminated Tooltip Redundancies**:
  * Restricted floating hover tooltips inside `Overlay.tsx` to display **only** in Visual (Image Only) mode.
  * When in Hybrid or Text modes, the persistent text labels are printed directly on top of the cards, so hover tooltips are automatically suppressed to avoid duplicate visual noise.

---

## 5. Launch Readiness — Sprint 1 Handoff (2026-07-04)

### Completed
- **C1**: Working tree committed (`3739a16` — Phase 1 + audit fixes)
- **C2**: Resume PDF → `public/cv.pdf` (fixes dead /cv.pdf link in HomeOrbitPanel)
- **C5**: AI-Studio template debris stripped:
  - Removed `GEMINI_API_KEY` define from `vite.config.ts`
  - Deleted `.env.example`, `metadata.json`
  - `package.json`: name=`papazian-archive`, version=`1.0.0`; removed `@google/genai`, `express`, `dotenv`, `@types/express`
- **S3**: Colophon fixed in `siteInfo.ts` → "Cabinet Grotesk, Satoshi, JetBrains Mono"; work count → 120
- **S6**: Created `public/robots.txt` + `public/sitemap.xml` (21 canonical URLs)
- **S2** (partial): YouTube verification via oEmbed API:
  - ✅ 3/7 confirmed: Lil Watan, Aoede, Bahr
  - ⚠️ 4/7 returned oEmbed 404: Roman, Fasateen, Shim El Yasmine, Cavalry — may be private, geo-restricted, or embedding-disabled. **Needs Haig's manual verification.**

All committed in `667f4ac`.

### In Progress
- **S2**: YouTube ID verification — 4 IDs need Haig's manual check

---

## 6. Sprint 2 — Deploy, Assets & Performance (2026-07-04)

### Completed
- **C4**: Generated OG image (`og-image.jpg`, 1200×630, wireframe cylinder) + apple-touch-icon (`apple-touch-icon.png`, P monogram)
- **C7**: Vendor chunk splitting in `vite.config.ts`:
  - `vendor-three` (508 KB), `vendor-tone` (253 KB), `vendor-gsap` (70 KB), `vendor-react` (12 KB)
  - App chunk reduced from 1.5 MB monolith to 675 KB
- **S4**: Pruned 209 unreferenced images — 150 MB freed (public/ 304 MB → 154 MB)
  - Quarantined to `/tmp/papazian-quarantine/` (recoverable within session)
  - 4 duplicate pairs found but both copies are referenced — noted for future symlink dedup
- **C3** (config): Created `vercel.json` — SPA rewrites for case-studies/modes + aggressive cache headers (immutable for hashed assets, 1-week for images)

### Deferred
- **S8**: WebP conversion — `cwebp` not installed; 30+ images ≥500 KB identified but needs Haig's approval for tool install
- **C3** (deploy): Vercel deploy needs Haig's CLI action (`npx vercel`)

All committed in `d5ef0d6`.

---

## 7. Sprint 3 — Mobile, Polish & Launch Assets (2026-07-04)

### Completed
- **C6**: Mobile QA — `viewport-fit=cover`, `env(safe-area-inset-*)` for footer/header/UI layer, 48px/44px touch targets. Committed in `579a2e6`.
- **S9**: First-visit hint overlay — localStorage-persisted navigation guide, updated to display the 5 active Brutalist console modes (Orbit, Works, Index, Map, Essays) with accurate descriptions and Lucide icons. Component: `FirstVisitHint.tsx`. Committed in `579a2e6` and updated in `a321b1c`.
- **S5**: Map legend — compact world color key with 6 swatches + roman numerals, desktop only, positioned bottom-left in Map mode. Committed in `bc2d4ac`.

### Remaining (needs Haig)
- **S1**: World assignments (5 projects without worlds)
- **S7**: Analytics (choice of provider)
- **S8**: WebP optimization (deferred from Sprint 2)
- Image deduplication (low priority, ~3.6 MB)
- Screenshots + press kit

### Decisions Pending
1. YouTube IDs: 4 videos need manual verification
2. World assignments: 5 unassigned projects
3. Deploy to Vercel + domain bind
4. Analytics provider choice
5. WebP tool install approval
6. CV freshness

### State
- Build: ✅ clean (2.96s, no warnings)
- Typecheck: ✅ clean
- Git: clean (only `docs/haig-papazian-resume (1).pdf` untracked)
- Commit log: `3739a16` → `667f4ac` → `d5ef0d6` → `579a2e6` → `bc2d4ac`

---

## 8. Mobile Map UI Polish & Post-Deployment QA Fixes (Latest Session)

### Completed
- **Map Tools Layout Fix**: Increased the mobile map tools drawer bottom placement to `bottom-[170px]` to sit perfectly above the two-row mobile footer navbar, resolving overlap.
- **Overlay HUD Overlap Fix**: Configured the main footer HUD to hide on mobile viewports whenever a project node or dossier is focused (`activeDetailNode` is not null), avoiding stacked control sandwiches.
- **Dossier Entry from Bottom Sheet**: Replaced the empty state (`null`) with a prominent, solid `OPEN DOSSIER →` CTA button inside the mobile bottom sheet when the active project has an available page, letting mobile users easily transition from map nodes into the case studies.
- **Expanded Mobile Tour Sheet**: Dynamically increased the peek state drawer height to `h-[280px]` when `activeRoute` (curated tour) is active, fully exposing the tour's step controls (`PREV STEP`, `NEXT STEP`, progress, `EXIT TOUR`) on mobile viewports.
- **WebGL Context Restore & Audio Resync**: Handled audio engine re-synchronization on WebGL context restoration using a React `activeNodeRef` cache, and added automated stem state cleanup on reset.
- **Actionable WebGL Error Banner**: Replaced the top-floating passive `loadError` toast with a centered, z-indexed modal dialog offering a "Reload Archive" CTA button in case of fatal WebGL failures.
- **Audio Initialization Race Mitigation**: Tracked user mute gestures during tone.js context initialization, disabling the UI sound toggle button and rendering a spinning `Loader2` indicator during `'loading'` state.
- **Mobile Prev/Next Overlay Overlap**: Repositioned `ArtifactInspector.tsx` previous/next navigation buttons from absolute floating chevrons to a fixed bottom flex footer bar on mobile screens.
- **Dynamic Lightbox Heights**: Replaced standard viewport heights (`h-[85vh]`) with address bar resilient dynamic viewport units (`h-[85svh]` and `max-height: 100svh`) in `VideoLightbox.tsx` and custom modal dialog styles.
- **Token Unification & Font Preload**: Aligned `--color-border` to `--color-ui-border` under the Tailwind `@theme` block, configured a distinct warm accent color `--color-accent-2` (`#e8d5c4`), pre-connected/preloaded Google Fontshare stylesheets with `display=optional` in `index.html`, and removed CSS `@import` parse chain blockers.
- **Stale Patches and Conflict Files**: Purged all `.rej`, `.orig`, and `.patch` files from the codebase and updated `.gitignore` rules.

### State
- Build: ✅ clean and compiled (zero errors)
- Git: ✅ clean (staged, committed, and pushed to `main` branch)

---

## 9. Phase 2 — Post-Deployment QA Bug Fixes (Current Session)

We have addressed and resolved all the issues identified in the Post-Deployment QA Audit report:

### Completed
* **Map/Orbit Layout Wedge**: Removed the duplicate `switchMode` call in `handleModeChange` (`App.tsx`), corrected the GSAP ease parameter from the invalid CSS-style cubic-bezier to `power4.out`, and implemented an active alignment self-correction logic inside `renderUpdate` in `NodeManager.ts` to ensure layout modes are idempotent and recover immediately from edge sequences.
* **Escape in Map Mode**: Registered a capturing window key listener inside `Overlay.tsx` to ensure pressing the Escape key immediately closes and dismisses map detail panels.
* **Missing Textures**: Removed 4 broken image entries (`beyrouth-et-beyrouth-beirut-school.webp`, `mobius-engine-visual-study.webp`, `salam-block9-roisin-murphy.webp`, `sparrowos-surveillance-dashboard-four-panel.webp`) from `atlasImageFilenames.ts` to prevent initial preloader 404 network warnings, and added a `failedUrls` cache in `NodeManager.ts` to immediately stop loading attempts for previously failed resources.
* **Drag/Click Disambiguation**: Tracked starting coordinate positions on `pointerdown` inside `NodeManager.ts` and set a 6px threshold in `onClick` to ignore clicks when orbiting/dragging. Also reduced the fine-pointer click snap-to-node proximity from 24px to 8px in `handleMapMiss`.
* **Hijack Timeout Cleanup**: Encapsulated the 1.5s project rail open timeout in a React `railTimeoutRef` and structured complete clearances on mode switches and unmount to prevent state changes on aborted entries.
* **Gesture zoom & pinch**: Prevented trackpad two-finger scroll gestures from zooming in map mode by isolating double-zoom logic to trackpad pinches (`ctrlKey` is true) and mouse wheels. Also added native touch event handlers for touch-screen pinch-to-zoom gestures.
* **Frame-Rate Independent Physics**: Replaced all fixed-factor lerp calculations in `ScrollEngine.ts`, `Scene.ts`, and `NodeManager.ts` with delta time (`dt`) exponent mappings (`1 - Math.exp(-k * dt)`) and normalized scroll velocity for frame-rate invariant shader uniforms.
* **Grid Projection Optimizations**: Implemented rendering throttle logic in `NodeManager.ts` to only re-project 3D nodes to 2D HTML markers when the camera/scroll position has actually shifted or the window has resized, dramatically reducing idle CPU overhead.
* **Route & Metadata Polish**: Synced `document.title` reactively based on active mode/node, sanitized double-encoded URL hashes (`#mode=map#mode=map`), and resolved stale bottom-bar count trackers to display live filtered totals.
* **Asset Loading Strategy**: Switched `isCore` dynamic check in `NodeManager.ts` to eagerly pre-cache only the primary cover slide for each project, deferring all sub-slide gallery images to run dynamically when a project is focused, improving startup times.

### State
- Build: ✅ clean and compiled (zero errors)
- Typecheck: ✅ clean (zero errors)
- Git: ✅ clean and fully verified

## 10. Phase 2 — Project Covers Generation & Optimization (Current Session)

### Completed
- **Covers Generated**: Generated high-fidelity, concept-accurate cover assets using Gemini Image generation (AspectRatio 4:3) for the following 13 projects:
  - `cartography-of-absence` (Stark minimalist governmental form / brutalist door)
  - `hah-was` (Technical wireframe sieve grid with digital blue pixels)
  - `architecture-in-low-res` (Pixelated low-res brutalist monument against sand horizon)
  - `space-time-tuning-machine` (Somatic sage green and black microtonal circular dial)
  - `why-were-like-this` (Modernist profile silhouette head partitioned into geometric chambers)
  - `localization-gap` (Technical neon blue frequency spectrum graph with central gap)
  - `the-weather-rehearsal` (Black violin bow intersecting geometric vector outline of a cloud, sand tan background)
  - `chronocumulator` (Concentric circular steel rings with audio waveform markers, sage green/black)
  - `storylines` (Clean minimalist network graph with points of light and high-contrast lines, dusty rose/charcoal)
  - `derive` (Dynamic flow field of vector arrows in a clean spiral, steel blue on dark grey)
  - `maqamai` (Piano keys vertical layout with microtonal division lines, sage green/black)
  - `99-nodes` (Grid of ninety-nine vector dots with one dot highlighted, steel blue)
  - `codeverse-explorer` (Structural dependency tree resembling a galaxy of connected dots, steel blue/white)- **WebP Conversion**: Processed all generated images through `cwebp` at `q=80` quality target and placed the final optimized `.webp` files at their designated public resource targets: `public/images/projects/[slug]/cover.webp`.

### State
- Build: ✅ clean and compiled
- Typecheck: ✅ clean

---

## 11. Phase 3 — Accessibility Remediation & Usability Optimization (Current Session)

We have successfully implemented accessibility upgrades to the frontend architecture and design systems of papazian.studio while strictly preserving its premium dark operating system aesthetic:

### Completed
* **Keyboard Access & Equivalent Text Archive**:
  - Created [FocusTrap.tsx](file:///Users/vhnmns/Documents/projects/papazian-archive/src/components/FocusTrap.tsx) to contain focus in drawers and the information console, with Escape dismissal and focus restoration.
  - Removed the invisible spatial proxy dashboard because it placed more than one hundred off-screen controls into the keyboard tab order.
  - Added [AccessibleArchiveIndex.tsx](file:///Users/vhnmns/Documents/projects/papazian-archive/src/components/AccessibleArchiveIndex.tsx), a native searchable text dialog with semantic record list, readable project detail, and a direct “Show in Works” action.
  - Added a visible-on-focus skip link and converted the PAPAZIAN wordmark into a real keyboard control.
* **Contrast & Typography System**:
  - Updated color tokens in [index.css](file:///Users/vhnmns/Documents/projects/papazian-archive/src/index.css) (`--color-text-muted-quiet` to `#b0b0b0`, `--color-text-muted` to `#b8b8b8`, and interface borders to `rgba(255, 255, 255, 0.36)`) to strengthen contrast against deep dark canvas backgrounds.
  - Introduced `--color-accent-blue-contrast` (`#7caeff`) for deep blue contrast corrections.
  - Configured relative unit font sizes and dynamic sizing selectors (`.hud-panel` utilizing `clamp()`) in [index.css](file:///Users/vhnmns/Documents/projects/papazian-archive/src/index.css) and adjusted [IndexFilterBar.tsx](file:///Users/vhnmns/Documents/projects/papazian-archive/src/components/IndexFilterBar.tsx) to prevent container overlaps at 200% text zoom.
* **Screen Reader Semantics**:
  - Kept a concise hidden archive description while moving project browsing into a visible, operable semantic interface.
  - Set up `aria-live` announcer regions in [Overlay.tsx](file:///Users/vhnmns/Documents/projects/papazian-archive/src/components/Overlay.tsx) to state changes dynamically for search queries, active filtering, and inspect dossier focuses.
* **Tone.js Audio Keybinding controls**:
  - Registered global "M" keyboard listener inside [App.tsx](file:///Users/vhnmns/Documents/projects/papazian-archive/src/App.tsx) to allow keyboard-only users to instantly toggle Tone.js sound mute states.
  - Wired live announcer alerts (`id="audio-announce-alert"` with `aria-live="assertive"`) to announce audio status updates.
* **Reduced Motion Camera Transitions**:
  - Wired `prefers-reduced-motion` media query detection inside [NodeManager.ts](file:///Users/vhnmns/Documents/projects/papazian-archive/src/core/NodeManager.ts).
  - Configured THREE.js layout repositionings, camera zooms, and orbital resets to teleport instantly when reduced motion is preferred by the OS.

### In Progress
- Manual VoiceOver, NVDA, physical-device zoom, and OS-level reduced-motion certification.

### Next Session Tasks
- Manual assistive-technology verification with Haig, followed by the Sprint 4 delivery-hardening work.

### State
- Tests: ✅ 15 passing
- Build: ✅ clean and compiled
- Typecheck: ✅ clean
- Browser QA: ✅ desktop, 640 px reflow, 390 px, and 320 px with no warnings

---

## 12. Phase 4 — Delivery Hardening & Text-Only Resilience

### Completed
- **Bundle boundaries:** Lazy-loaded Scene/Three.js, Overlay, onboarding, VideoLightbox, ArtifactInspector, generated archive content, and shared interface libraries. The production entry dropped from 730 KB to 266 KB.
- **Audio deferral verification:** Preserved the existing user-gesture-only Tone.js import and added a build assertion that fails if Tone.js enters the eager entry graph.
- **WebGL-independent archive:** Added `?view=text`, a searchable 20-project archive that does not initialize Scene or create a WebGL canvas. Fatal WebGL initialization errors now land on this usable surface instead of a reload-only modal.
- **No-JavaScript shell:** Static project links remain in the generated HTML when JavaScript never mounts, and the `<noscript>` message now links to the archive routes.
- **Media manifest:** Generated `public/media-manifest.json` for 20 canonical projects and 219 assets with dimensions, aspect ratio, byte size, status, role, and content digest.
- **Build enforcement:** Added chunk, gzip, media, static-route, structured-data, Open Graph, sitemap, browser-shim, and Tone.js deferral checks to every production build.
- **Structured metadata:** Added archive-level `WebSite` and `CollectionPage` graphs while retaining per-project `CreativeWork` data and 25 static sitemap routes.
- **Browser QA:** Verified normal Home → Works navigation and desktop/mobile text-only search → Retry 3D. No horizontal overflow, undersized mobile controls, framework overlay, console warning, or runtime error was observed.

### State
- Tests: ✅ 15 passing
- Typecheck: ✅ clean
- Production build: ✅ verified automatically
- Bundle: ✅ 19 chunks, 447.1 KB total gzip, 266 KB entry
- Static output: ✅ 25 HTML pages and 25 sitemap URLs
- Media manifest: ✅ 20 projects and 219 matched assets

### Remaining
- Split the monolithic Overlay further at Map, rail, and Essays mode boundaries.
- Consolidate project media into one canonical authoring field and reserve intrinsic image geometry during render.
- Complete distinct project social imagery/alt text, throttled mobile profiling, VoiceOver, and NVDA certification.
