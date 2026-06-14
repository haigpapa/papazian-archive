# Current Copy Inventory

Date: 2026-05-26  
Scope: current visible portfolio archive copy before the next editorial/image/case-study pass.  
Screenshot set: `docs/screenshots/2026-05-26/`

## Global Shell

Source: `src/App.tsx`, `src/components/Overlay.tsx`

| Location | Current copy |
| --- | --- |
| Header | `PAPAZIAN` |
| Loader | `Drawing Archive Field {progress}%` |
| Home mode | `Home` / `Orbit intro` |
| Works mode | `Works` / `20-project spine` |
| Index mode | `Index` / `Unwrapped grid` |
| Atlas mode | `Atlas` / `Relations` |
| Essays mode | `Essays` / `Writing panel` |
| Bottom status fallback | `Archive field` |
| Bottom count | `20 works / 218 images` in current browser state |
| Info button | `Open information` |
| Detail controls | `Return`, `Previous slide`, `Next slide`, `Copy direct link`, `Close detail view` |
| Media CTA | `Play in Archive` / `Video unavailable` |
| Archive-only fallback | `ARCHIVE NODE` or `SPATIAL RECORD` |

Notes:
- Mode names are strong and should be preserved unless the spatial grammar changes.
- The bottom instrument is clear on desktop; mobile stacking should be reviewed after final screenshots.

## Info Console

Source: `src/data/siteInfo.ts`, rendered by `src/components/Overlay.tsx`

### About

Location: Info console / About tab

Eyebrow: `Practice`  
Title: `Systems Choreography`

Body:

- Haig Papazian works across music, architecture, software, performance, and cultural infrastructure.
- This archive is organized as a spatial index of systems: bands as institutions, buildings as protocols, instruments as memory engines, and software as a way of moving through complexity.
- The portfolio is intentionally not a conventional case-study stack. It is a navigable field of works, fragments, relations, and chambers.

### Contact

Location: Info console / Contact tab

Eyebrow: `Signal`  
Title: `Contact / Collaboration`

Body:

- For commissions, residencies, collaborations, talks, and research conversations, use the primary email below.
- Selected links are placeholders for now and can be finalized during the public launch pass.

Links:

- Email: `studio@haigpapazian.com`
- Instagram: `final handle pending`
- MEKENA NYC: `space / residency / infrastructure`

Note: Instagram and possibly email should be confirmed before launch.

### News

Location: Info console / News tab

Eyebrow: `Updates`  
Title: `Current Signals`

Body:

- A compact update log for launches, performances, publications, and project milestones.

Entries:

- `2026` / `Archive rebuild in progress`: The portfolio is being rebuilt as a spatial archive with project rails, atlas views, and a curated works spine.
- `2026` / `MEKENA NYC`: Cultural infrastructure project in Queens moving through documentation and public positioning.
- `2025-26` / `DERIVE / HAH-WAS / TEBR`: AI music, memory, and cultural-specificity systems moving toward publication and demonstration.

### Colophon

Location: Info console / More tab

Eyebrow: `Colophon`  
Title: `Archive Notes`

Body:

- Built as a React, Vite, and Three.js spatial interface.
- Project writing lives in repo-local markdown and CSV files. Images are organized by project folder and prepared as WebP where possible.
- This version is an active working archive. Some rails use starter images and temporary copy while final documentation is assembled.

Footer:

- `Papazian Archive`
- `v1.0.5`

## Home / Orbit Intro

Source: `src/components/Overlay.tsx` / `HomeOrbitPanel`

Visible text:

- `Systems Choreography`
- `Home / Orbit Intro`
- `Systems of Meaning`
- `I build systems for memory, performance, and cultural translation.`
- `Sound / Space / Code / Text / Image / Systems`
- `Selected Works`
- `Modes`
- `Works / Index / Atlas / Essays`
- `About / Bio`
- `Born in Beirut and based in New York, Haig Papazian works across sound, architecture, film, AI, narrative, and cultural infrastructure. The work treats culture as an interface and technology as material, method, and critique.`
- `Editorial Case Studies`
- `CV`
- `Explore the Work`
- `Twenty works orbit a single spine: memory as architecture, performance as infrastructure, translation as a moving system.`

Editorial case-study cards:

- `Mashrou' Leila` / `Cultural architecture / performance system` / `A counter-public built through sound, image, language, identity, and collective risk.`
- `MEKENA NYC` / `Space / residency / radical hospitality` / `A physical operating system for artists, gathering, adaptive reuse, and diasporic belonging.`
- `Space Time Tuning Machine` / `AI / sound / live instrument` / `A speculative performance engine for memory, displacement, and machine listening.`

Notes:
- Bio is useful but should be rewritten in the final voice pass.
- `CV` links to `/cv.pdf`; confirm the PDF exists before launch.

## Works / Index / Atlas Modes

Source: `src/components/Overlay.tsx`, `src/data/atlas.ts`, `content/projects/*/project.md`, `content/projects/*/gallery.csv`, `content/project-master.csv`

These modes primarily display generated/project data rather than standalone page prose.

Common visible copy:

- Mode labels from the bottom instrument
- Project title
- Project tier
- Project year
- Project domains
- Project thesis
- Project short description
- Project full description when detail view is expanded
- Project highlights
- Related project chips
- Rail slide title, caption, chapter, role, and body

Notes:
- The current app has no separate route per core mode; modes are represented as hash states such as `#mode=vertical`, `#mode=grid`, `#mode=atlas`, and `#mode=essays`.
- `src/components/Overlay.tsx` still contains an old `list` block that is not part of the public mode list.

## Essays / Writing Panel

Source: `src/components/Overlay.tsx` / `ESSAY_RECORDS`

### Systems of Meaning

Location: Essays / Writing Panel

Eyebrow: `Statement`  
Date: `2026`  
Read time: `4 min`

Dek:

> A short operating statement for the archive: memory, performance, and cultural translation as systems rather than isolated works.

Body:

- I build systems for memory, performance, and cultural translation. The work moves across sound, space, code, text, image, and systems because the subject keeps changing scale: a song becomes a public architecture, a building becomes a social protocol, a manuscript becomes a software engine, and a data set becomes a record of cultural pressure.
- Systems Choreography names the method behind that movement. It treats space, time, code, narrative, and performance as related structures that can be rehearsed, tuned, and reassembled. The archive is not a neutral container for finished objects. It is a way of showing how the objects think together.
- The point is not to make technology look magical. It is to make cultural structure visible: who gets translated, what gets flattened, where memory is stored, and how people build forms of belonging under pressure.

### The Localization Gap

Location: Essays / Writing Panel

Eyebrow: `AI / Music / Cultural Bias`  
Date: `2024`  
Read time: `6 min`

Dek:

> A forensic argument about what generative music systems erase when they treat Arabic music as style instead of structure.

Body:

- The Localization Gap begins from a simple failure: generative music systems can often imitate the surface of Arabic music while missing the systems that make the music culturally legible. Maqam, dialect, ornamentation, tuning behavior, phrasing, and regional memory are compressed into generic global signals.
- That failure is not only aesthetic. It is infrastructural. A model that cannot hear cultural specificity cannot preserve it, translate it, or build with it responsibly. The audit treats failed outputs as evidence rather than accidents.
- The work compares prompts, outputs, phonetic artifacts, tuning assumptions, and genre defaults to show how computational systems can reproduce colonial listening habits through technical convenience.

### The Cost of Being Queer and Arab

Location: Essays / Writing Panel

Eyebrow: `Visibility / Risk / Public Culture`  
Date: `2020`  
Read time: `5 min`

Dek:

> A public argument about the point where cultural visibility becomes personal, institutional, and physical risk.

Body:

- Visibility is often framed as liberation, but visibility also creates coordinates. It tells institutions, publics, borders, and hostile systems where to look. For queer Arab artists, that contradiction is not theoretical. It is lived as pressure on bodies, families, venues, visas, stages, and futures.
- The argument is not against publicness. It is against a simple story of representation that ignores cost. Cultural work can create shelter and danger at the same time. A song can become a home for one person and evidence against another.
- This writing sits close to Mashrou' Leila, but it also points toward later spatial work: if visibility produces risk, then cultural infrastructure has to design for protection, opacity, gathering, and repair.

### The Cartography of Absence

Location: Essays / Writing Panel

Eyebrow: `Forms / Exile / Bureaucracy`  
Date: `2024`  
Read time: `5 min`

Dek:

> Bureaucratic surrealism as a way to document what ordinary institutional language cannot admit.

Body:

- The Cartography of Absence uses administrative language as literary material. Forms, intake sheets, redactions, stamps, and impossible applications become tools for mapping emotional and political conditions that official systems prefer to flatten.
- The project is not parody. It is a recognition that bureaucracy already writes fiction onto displaced bodies. It invents categories, imposes timelines, edits names, and asks people to make their pain legible in fields too small to hold it.
- By exaggerating those forms only slightly, the work shows the violence already present in the original structure. The page becomes a border, a clinic, an archive, and a stage.

### Architecture in Low Res

Location: Essays / Writing Panel

Eyebrow: `Architecture / Image / Breakdown`  
Date: `2015`  
Read time: `5 min`

Dek:

> A foundational thesis on low resolution, ruin, and systemic breakdown as authentic spatial language.

Body:

- Architecture in Low Res argues that the broken image can be more honest than the polished render. For diasporic and post-conflict space, resolution is not just a technical property. It is a political and emotional condition.
- The low-resolution image carries fragmentation, distance, partial memory, and infrastructural failure. It refuses the fantasy that architecture can always be represented as clean, complete, and available.
- Much of the later work inherits this logic: glitch, decay, degraded documents, unstable scans, and fractured interfaces are not decorative effects. They are structural evidence.

### Why We're Like This

Location: Essays / Writing Panel

Eyebrow: `Video Essay / Cultural Mood`  
Date: `2026`  
Read time: `4 min`

Dek:

> A scripted essay series about synthetic culture, contemporary psychological weather, and the systems that make people feel unreal.

Body:

- Why We're Like This treats the video essay as a diagnostic instrument. Voice, image, pacing, and performance become a way to read cultural mood at a moment when attention, identity, intimacy, and belief are increasingly mediated by machines.
- The work sits between documentary, performance text, audiovisual therapy, and cultural criticism. Its subject is not individual dysfunction, but the systems that make dysfunction feel personal.
- In the archive, it becomes one of the clearest bridges between writing, image-making, and interface: an essay that behaves like a sensor.

## Mashrou' Leila Project Case

Sources:

- `content/projects/mashrou-leila/project.md`
- `content/projects/mashrou-leila/gallery.csv`
- `public/images/projects/mashrou-leila/`

### Project Page Copy

Title: `Mashrou' Leila`

Thesis:

> A band that became cultural infrastructure: sound, image, stage, audience, and risk moving as one system.

Short description:

> As co-founder and creative director of Mashrou' Leila, Haig helped shape a Beirut-born project into an international counter-public.

Full description:

> For fourteen years, Mashrou' Leila operated less like a conventional band and more like a public architecture. Songs, album worlds, stage design, press, audience safety, crisis response, and political pressure had to move as one system.

> The project made specificity travel: Lebanese, Arabic, queer, architectural, unstable, public. Its visual and operational language became a way for audiences to recognize themselves before institutions knew how to hold them.

Highlights:

- First Middle Eastern act on the Rolling Stone cover
- 500M+ cross-platform streams
- 50+ countries toured
- 35,000-40,000 capacity venue moments
- $60K+ direct-to-fan crowdfunding
- 7+ censorship and crisis events managed

Related projects:

- `space-time-tuning-machine`
- `1000-strings-at-rest`
- `tebr`

### Gallery Rail Copy

| Order | Type | Chapter | Role | Title | Caption / Body |
| --- | --- | --- | --- | --- | --- |
| 1 | image | Counter-Public | hero | Baalbeck | The band at architectural scale: ruin, crowd, myth, and political consequence in one image. |
| 2 | text | Reframing | context | Not a Band | Mashrou' Leila was a public system disguised as a band. / A temporary public sphere built from songs, bodies, images, press, risk, and collective recognition. |
| 3 | text | Reframing | context | Counter-Public Infrastructure | The visible band sat on top of a larger operating architecture. / Sound, stage, image, community, crisis response, press narrative, and audience safety had to move as one system. |
| 4 | text | Scale | evidence | Scale I | Specificity travelled further than the market expected. / 500M+ cross-platform streams; 1.1M monthly listeners at peak; 50+ countries toured |
| 5 | text | Scale | evidence | Scale II | The project built institution-scale force without institutional safety. / 35,000-40,000 capacity venue moments; $60K+ direct-to-fan crowdfunding; 7+ censorship and crisis events managed |
| 6 | text | Public Image | system | The Design Problem | How do you make a fragile public visible without making it easy to destroy? / Every poster, video, interview, stage image, and show announcement had to carry desire, ambiguity, protection, and refusal at the same time. |
| 7 | image | Origin Surface | context | Self Titled EP | The origin surface before the project became institution, mythology, and pressure system. |
| 8 | image | Album Sequence | context | El Hal Romancy | The breakthrough album moves the project from campus mythology into a regional touring organism. |
| 9 | image | Direct-to-Fan | evidence | Raasuk | A direct-to-fan record and early crowdfunding proof point for an Arabic independent audience. |
| 10 | image | Album World | evidence | Ibn El Leil | The nocturnal visual universe makes the band legible as a complete world. |
| 11 | video | Live Proof | evidence | Tiny Desk Concert | The band compressed its live force into a bare room and still carried the full architecture of the project. |
| 12 | image | Touring System | evidence | L'Olympia | The project travels as a complete stage language: light, body, audience, and mythology. |
| 13 | image | Festival Scale | evidence | Exit Festival | Festival scale turns the archive into public infrastructure. |
| 14 | video | Music Video | context | Roman | The music video becomes a visual argument about gender, power, and the politics of representation. |
| 15 | video | Music Video | context | Fasateen | Early video language already treats social ritual as something to disassemble and restage. |
| 16 | video | Music Video | context | Raksit Leila | Performance image, pop form, and social code collide inside a compact visual world. |
| 17 | image | Visibility | evidence | Rolling Stone | Visibility becomes a public event, and the image becomes cultural infrastructure. |
| 18 | image | Visibility | evidence | GQ Cover | The media image becomes another stage where Arab identity, glamour, and risk are negotiated. |
| 19 | image | Recognition | evidence | Yo-Yo Ma / Byblos | Collaboration and place expand the band from scene to institution. |
| 20 | text | System | system | Creative Direction | Identity was not decoration. It was how the public learned to read the project. / Albums, videos, tours, press, merchandise, and stage language had to behave like chapters of one authored world. |
| 21 | text | System | system | Crisis Operations | The project was often designed under active pressure. / Safety, censorship, press escalation, market access, and audience trust were not side concerns. They were part of the instrument. |
| 22 | image | Live System | system | Stage Architecture | Touring becomes spatial practice: light, bodies, and narrative moving city to city. |
| 23 | image | Stage Logic | process | Annex Stage | A smaller stage still behaves as architecture: pressure, frame, crowd, and signal. |
| 24 | text | Coda | coda | The Band as System | Mashrou' Leila becomes the origin point for Systems Choreography. / The same structural rigor used to design physical space can construct cultural systems that survive pressure and generate meaning after the institution dissolves. |

## Authored Project Copy Index

Source: `content/projects/*/project.md`

Use this section as the edit map for the next copy pass. Each project has a `project.md` file for thesis/description/highlights and a `gallery.csv` file for rail slide copy.

| Project | Source | Thesis |
| --- | --- | --- |
| 1000 Strings at Rest | `content/projects/1000-strings-at-rest/project.md` | A silent field of tension where strings, bodies, distance, and memory remain suspended before performance. |
| 3D Beat Synth | `content/projects/3d-beat-synth/project.md` | A browser instrument that turns rhythm into an object you arrange in space. |
| Architecture in Low Res | `content/projects/architecture-in-low-res/project.md` | A thesis on degraded images as spatial evidence, where low resolution becomes a truthful condition rather than a flaw. |
| The Autopsy / Beirut Phantom | `content/projects/autopsy-beirut-phantom/project.md` | A post-conflict city held as an interactive afterimage: evidence, ruin, dream, and reconstruction layered together. |
| The Cartography of Absence | `content/projects/cartography-of-absence/project.md` | A bureaucratic dream architecture for what has been lost, filed, mistranslated, and made impossible to retrieve. |
| Codeverse Explorer | `content/projects/codeverse-explorer/project.md` | An MRI for codebases, turning files, dependencies, and architecture into a navigable spatial field. |
| DERIVE | `content/projects/derive/project.md` | A memory engine that abandons chronology and lets emotional force decide how fragments find each other. |
| HAH-WAS | `content/projects/hah-was/project.md` | A cultural hallucination test for AI music systems: what survives the model, and what gets filtered out before anyone hears it? |
| Kardia | `content/projects/kardia/project.md` | A body-signal instrument that turns physiological state into sound without trapping the user in numbers. |
| MaqamAI | `content/projects/maqamai/project.md` | An ear-training interface for the modal grammar that AI music systems keep flattening. |
| Mashrou' Leila | `content/projects/mashrou-leila/project.md` | A band that became cultural infrastructure: sound, image, stage, audience, and risk moving as one system. |
| MEKENA NYC | `content/projects/mekena-nyc/project.md` | A Queens building treated as a cultural operating system for artists, shelter, rehearsal, and return. |
| Music Engines | `content/projects/music-engines/project.md` | The backend listening system that turns audio research intuition into repeatable infrastructure. |
| Photon+ | `content/projects/photon-plus/project.md` | A browser twin of the Space Time Tuning Machine, translating a live tuning ritual into playable software. |
| Resonance Atlas | `content/projects/resonance-atlas/project.md` | An atlas of sound as territory, mapping where cultural specificity survives, distorts, or disappears. |
| Sometimes I Wake Up Elsewhere | `content/projects/sometimes-i-wake-up-elsewhere/project.md` | An autofiction dream cycle where exile is measured through rooms, errands, animals, forms, and recurring physical detail. |
| Space Time Tuning Machine | `content/projects/space-time-tuning-machine/project.md` | A speculative instrument played in reverse, tuning noise into memory, melody, and finally silence. |
| STORYLINES | `content/projects/storylines/project.md` | A spatial writing tool for stories that drift, double back, accumulate gravity, and refuse a straight line. |
| TEBR | `content/projects/tebr/project.md` | A sound-world where AI failure, maqam memory, and broken instruments become future folklore. |
| Why We're Like This | `content/projects/why-were-like-this/project.md` | A video-essay system for diagnosing the strange weather of contemporary life without reducing it to explanation. |

## Broader Data Copy

Source: `public/images/atlas/atlas-node-update-FINAL.updated.csv`, `content/project-master.csv`, `src/data/atlas.ts`

The spatial field also displays atlas-level copy:

- `title`
- `year`
- `tier`
- `domains`
- `stack`
- `connections`
- `summary`
- `hasProjectPage`

`content/project-master.csv` tracks broader editorial state, source confidence, project role, and next steps. It should be used as the planning sheet for deciding which atlas-only records become fuller authored case studies.
