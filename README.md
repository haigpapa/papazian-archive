# Papazian Archive

Spatial portfolio archive for Haig Papazian. The site is a black-field WebGL interface for works, essays, project rails, and relationships across sound, space, code, text, image, and systems.

This is an active pre-launch archive. The structure is in place; the remaining work is mostly editorial: final copy, project images, deeper case-study polish, and launch QA.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

If the default host binding is blocked in a local sandbox, run:

```bash
npx vite --port=3000 --host=127.0.0.1
```

Then open:

```txt
http://127.0.0.1:3000/
```

## Build And Check

Typecheck:

```bash
npm run lint
```

Production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Content System

The archive combines atlas data, authored project copy, gallery rails, and UI copy.

- `public/images/atlas/atlas-node-update-FINAL.updated.csv` is the main atlas data source for the spatial field.
- `content/projects/{slug}/project.md` holds project thesis, short description, full description, highlights, and related projects.
- `content/projects/{slug}/gallery.csv` holds the image/text/video/audio rail slides for each authored project.
- `public/images/projects/{slug}/` holds project rail images and posters.
- `src/data/siteInfo.ts` holds the info-console copy.
- `src/components/Overlay.tsx` currently holds the Home panel, Essays panel, mode labels, and some interface text.
- `content/project-master.csv` is the broader editorial tracking sheet for atlas/project status.

After editing project markdown or gallery CSV files, rebuild generated content:

```bash
npm run content:build
```

Check content completeness:

```bash
npm run content:report
```

## Documentation Workflow

The current copy inventory lives at:

```txt
docs/current-copy-inventory.md
```

Screenshot references for the current documentation pass live at:

```txt
docs/screenshots/2026-05-26/
```

The screenshot set captures desktop and mobile views for Home, Works, Index, Atlas, Essays, Info, and the Mashrou' Leila project case rail.

## Current Status

Implemented:

- Vite + React + Three.js spatial archive shell
- Home / Works / Index / Atlas / Essays modes
- Project rail deep links such as `/case-studies/mashrou-leila`
- 20 authored project folders with gallery rails
- 119-row atlas CSV feeding the spatial field
- Info console, media lightbox, related project links, and mobile project sheet states

Still to do:

- Finalize project copy and public-facing tone
- Replace temporary or weak images with final project evidence
- Expand and polish case-study rails
- Decide deployment target after editorial cleanup
- Run a final desktop/mobile/browser QA pass before launch
