# Walkthrough — Post-Deployment QA Audit Fix Sprint

**Session:** 2026-07-15
**Scope:** Post-deployment QA audit of papazian.studio → 9 implemented fixes
**Build status:** ✅ TypeScript: 0 errors | Vite: 22 chunks, 455.6 KB gzip, 25 pages

---

## What Was Completed

### Audit
- Browsed live production site (papazian.studio) via HTTP inspection
- Cross-referenced all chunks, cache headers, compression (Brotli confirmed)
- Spawned 2 research subagents for deep code analysis of WebGL engine + React state/design system
- Produced audit_report.md with 2 Critical, 4 High, 6 Medium, 4 Low findings

### Implemented Fixes (9 items)

#### C1: GPU Texture Memory Leak Fix
**File:** src/core/NodeManager.ts
- Added `disposeOldTexture()` helper that safely disposes the current `uMap` texture before replacement (skips the shared placeholder)
- Called at every texture replacement point: successful load and all 3 error fallback branches

#### C2: Frame-Rate Invariant Animations
**File:** src/core/NodeManager.ts
- Converted 3 hardcoded `0.08`/`0.1` lerps to `1 - Math.exp(-k * dt)` exponential decay
  - Horizontal rail perspective: `k=5.0`
  - Map mode camera interpolation: `k=5.0`
  - Map opacity transitions: `k=6.0`
- Added `dt` computation at the top of `update()` method using the existing `lastRenderTime` clock

#### H1: Projected Positions Debounce
**File:** src/App.tsx
- Replaced direct `setProjectedPositions(positions)` call (was firing at up to 60fps from animation loop) with RAF-debounced pattern using `useRef`

#### H2: Memoize filteredNodes
**File:** src/components/Overlay.tsx
- Wrapped `filteredNodes` in `React.useMemo([nodes, searchQuery])` — previously recomputed on every render of the 1954-line Overlay component

#### H4: WebGL Context Loss Render Pause
**File:** src/core/Scene.ts
- Added `contextLost` boolean flag, set on context loss, cleared on restore
- `animate()` now skips the entire render body when `contextLost` is true
- On restore, resets `lastFrameTime` to prevent a dt jump

#### M1: PlaneGeometry Reduction
**File:** src/core/NodeManager.ts
- Reduced from `PlaneGeometry(6, 4, 32, 32)` (1024 vertices/card) to `PlaneGeometry(6, 4, 4, 4)` (25 vertices/card) — ~40× vertex reduction

#### M2: Remove Mode from Hash Params
**File:** src/App.tsx
- Stopped writing `mode` to hash (pathname is now authoritative)
- Kept reading `mode` from hash for backward-compatible deep links

#### M3: History replaceState for Mode Switching
**File:** src/App.tsx
- Mode transitions now use `replaceState` (prevents Back-button cycling through modes)
- Case study navigation retains `pushState` as the only history-pushing action

#### L3: Cached matchMedia for Reduced Motion
**File:** src/core/NodeManager.ts
- Added `_prefersReducedMotion` field cached from `MediaQueryList` in constructor
- Added `change` event listener for live updates + cleanup in `dispose()`
- Replaced all 5 synchronous `window.matchMedia(...)` calls with the cached field

---

## What Was Tested
- **TypeScript:** `npx tsc --noEmit` — 0 errors
- **Production build:** `npm run build` — 22 chunks, 455.6 KB gzip, 25 HTML pages, 25 sitemap URLs
- **Build validator:** `validate-build.ts` script passed

---

## What Remains
- **Deploy:** `npx vercel --prod --yes` or git push to trigger Vercel deployment
- **H3 (Overlay split):** 1954-line Overlay.tsx decomposition into per-mode sub-components — larger refactor for future sprint
- **M4 (Mobile swipe gesture):** Bottom sheet needs swipe-up/down touch gesture handler
- **M6 (`any` types):** App.tsx state variables need proper TypeScript interfaces

---

## Files Changed
| File | Changes |
|---|---|
| src/core/NodeManager.ts | C1, C2, M1, L3 |
| src/core/Scene.ts | H4 |
| src/App.tsx | H1, M2, M3 |
| src/components/Overlay.tsx | H2 |
