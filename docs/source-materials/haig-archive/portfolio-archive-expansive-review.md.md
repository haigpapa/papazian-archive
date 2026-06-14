---
sourceFile: "portfolio-archive-expansive-review.md"
exportedBy: "Kortex"
exportDate: "2026-05-28T19:55:51.689Z"
---

# portfolio-archive-expansive-review.md

cc682800-b8ba-41f3-8fab-4994a1da1fef

portfolio-archive-expansive-review.md

65315c1a-421c-4eb4-9fd9-edab12a4e2b4

01- FULL DESIGN AUDIT

Executive Read

The archive has a strong world but an unstable contract. It looks serious, cinematic, and distinctive, but it does not yet teach the visitor how to use it. The current interface assumes the user already understands the difference between Home, Works, Index, Atlas, Essays, and project rails. Most users will not.

The strongest state is the Mashrou’ Leila rail: it finally feels like a real case study rather than a concept demo. The weakest state is Atlas: visually compelling from a distance, but too dense, too unlabelled, and too hard to parse as a relationship system.

1. Information Hierarchy

The structure is conceptually strong but not self-explanatory.

#### The hierarchy currently reads as:

PAPAZIAN -> Archive Field -> modes -> images -> project rail -> text panel

That is elegant, but the user does not get enough orientation. “Archive Field” appears everywhere, even when the user is in a precise mode. The bottom instrument gives mode names, but not enough meaning. “Works / 20-project spine” is understandable. “Index / Unwrapped grid” is semi-understandable. “Atlas / Relations” is promising but under-explained. “Home / Orbit intro” sounds beautiful but does not tell users what they can do.

The major hierarchy problem: the system treats modes as equivalent, but they should not be equivalent. Home should introduce. Works should curate. Index should browse. Atlas should explain relationships. Essays should read. Project rail should deepen. Right now they are presented as five sibling buttons, so the conceptual model feels flatter than the content deserves.

2. Interaction Systems

Orbit view: Visually atmospheric, but overloaded by the centered Home panel. The cylinder background says “spatial archive,” while the panel says “editorial homepage.” Those two are fighting. The orbit should either be a true ambient intro with selected works orbiting meaningfully, or the Home panel should become less dominant.

Vertical works spine: This is the clearest browsing model. It gives a readable “20 works” idea and feels curated. But it lacks visible project labels until interaction. It needs a stronger “you are scrolling through the main works” cue.

Horizontal project rails: This is the best interaction pattern in the product. The Mashrou’ Leila rail feels like a cinematic evidence sequence. The split between image rail and right-hand text panel works. But the active slide can feel arbitrary because the rail loops and the current slide is mostly identified in the bottom bar. Put slide chapter/title closer to the image itself, not only in the bottom instrument and side panel.

Atlas mode: Most conceptually important, least legible. Lines show relationships, but there are no labels, anchors, clusters, legends, or relationship types. It currently reads as a beautiful network wallpaper, not an analytic atlas. The user can sense intelligence but cannot extract meaning.

Essays mode: Strongest as a conventional reading interface. It is readable and confident. But it uses the same giant uppercase visual language as the rest of the app, so the essay surface feels a little too loud for long-form thought.

Index/grid mode: Too sparse and under-structured. It says “Index,” but visually it is scattered images in space, not an index. An index needs grouping, labels, sort logic, and scanning affordance.

3. Spatial UX

The environment is cinematic, but often at the edge of chaos. The black field is correct. The thin relational lines are correct. The artifact-like image planes are correct. The problem is density without enough grammar.

#### Atlas mode has the right raw material, but it lacks:

cluster names

domain boundaries

selected anchors

visual priority between lead, secondary, archive nodes

orientation/minimap

relationship explanation

Discoverability is weak. The visitor can move, but they may not know what counts as an action. Clickable image planes are not always obviously clickable. The bottom nav is clear as UI, but the canvas itself needs more hover/selection language: labels, dimming, focus rings, or proximity titles.

Mobile is functional but cramped. Mobile Home feels like a desktop panel squeezed into a phone. Mobile Mashrou’ Leila is better because it simplifies: image, sheet, bottom nav. That should become the model for mobile generally.

4. Motion Language

The motion system is technically coherent but emotionally too uniform.

From the implementation, mode changes use broad

movement with small staggered delays, and the scroll engine uses one global virtual scroll/lerp model. That creates smoothness, but not enough authored rhythm. Everything glides with similar timing, so the modes do not feel behaviorally distinct.

Opening and closing panels feel competent but not cinematic enough. The project rail should feel like entering a room from the field. At the moment, it feels like the UI switches mode and the drawer appears.

Camera logic is restrained, which is good. But it is also underdramatic for lead projects. A lead project like Mashrou’ Leila deserves a more decisive focus moment: surrounding works dim, selected artifact holds, rail arrives after a beat, side panel follows. Right now the transition is useful, not memorable.

The infinite wrapping is risky. It keeps the archive alive, but it removes orientation. Endless movement without progress markers makes the archive feel placeless.

5. Editorial Systems

#### Strongest copy:

“A band that became cultural infrastructure”

“memory as architecture, performance as infrastructure”

“sound, image, stage, audience, and risk moving as one system”

Mashrou’ Leila’s gallery slide sequence, especially “Not a Band,” “Counter-Public Infrastructure,” “The Design Problem,” and “Crisis Operations”

These work because they are concrete and high-stakes.

#### Overwritten/theoretical copy:

“systems for memory, performance, and cultural translation”

“spatial index of systems”

“navigable field of works, fragments, relations, and chambers”

“technology as material, method, and critique”

These are not bad, but too many of them appear close together. The archive starts to explain its theory before proving it emotionally.

#### Most resonant sections:

Mashrou’ Leila case rail

The Cost of Being Queer and Arab

Architecture in Low Res

Cartography of Absence

The Design Problem slide

#### Least emotionally grounded:

Home intro bio

General “Systems Choreography” framing

Atlas mode copy/status, because it says “Relations” but does not show what kind of relations matter

Recommendation: reduce abstract nouns by 30 percent. Keep the theory, but make every theoretical line earn itself through a project, image, conflict, or consequence.

6. Design Language

Typography is confident but overused at maximum intensity. Large uppercase display type works for titles, but when everything is uppercase, the interface loses tonal range. Essays especially need softer hierarchy.

Spacing is generally strong on desktop. Panels feel architectural. The Home panel, though, is too dense vertically and competes with the moving archive behind it.

Contrast is good, sometimes too binary. Black/white/accent is sharp, but some secondary text is too faint, especially in screenshots where image noise sits behind panels.

Image scaling is uneven by mode. Project rail images feel strong. Index images feel random. Atlas images are often too small to identify, which weakens the archive’s promise.

Panel composition is best in Mashrou’ Leila. The right-side case panel gives the project dignity. Home is weaker because it contains too many functions: thesis, bio, stats, case previews, CV, CTA, footer note.

Atmosphere is strong. The archive feels nocturnal, serious, and cultural rather than tech-demo-ish. Do not brighten it too much. The issue is not mood; it is legibility.

7. Problems

#### High-priority problems:

The conceptual model is not taught.

Atlas mode does not yet function as an atlas.

Index mode does not function as an index.

Home panel over-explains while the spatial field under-explains.

Infinite movement weakens orientation.

Mode differences are visual but not behavioral enough.

Mobile Home is too packed and too desktop-like.

Essay mode is readable but typographically too loud.

Relationship lines lack meaning without labels or filtering.

The bottom instrument is polished but overloaded with status text that is not always useful.

#### UX dead ends:

appears, but if

is missing or unfinished, it breaks trust.

Atlas has no “what am I looking at?” affordance.

Index has no filter/sort/search affordance visible in the screenshot.

Project rail has strong content but no clear sense of “case study arc” beyond slide count.

8. Recommendations

Priority 1: make each mode have one job.

Home: “What is this practice?”

Works: “What are the 20 main works?”

Index: “How do I quickly scan/filter everything?”

Atlas: “How are projects related?”

Essays: “What is the thinking behind the work?”

Project rail: “What happened, why it matters, what evidence supports it?”

Priority 2: rebuild Atlas legibility.

Add 5 to 6 domain labels around the field.

Make lead projects persistent anchors.

Dim non-neighbor nodes when hovering/selecting.

Show relationship type: lineage, method, material, institution, research, media.

Add a small legend or “relation mode” strip.

Add a selected-node drawer that explains why connected nodes are connected.

Priority 3: make Index a real index.

Add visible grouping by domain or tier.

Add compact text labels on hover or always for lead projects.

Add filter chips: Sound, Space, Code, Text, Image, Systems.

Stop presenting it as scattered space; make it feel like an archival table unfolded into a field.

Priority 4: improve project rail choreography.

On entry: selected node expands, background dims, rail settles, panel enters after a short delay.

Put slide chapter/title as an overlay near the active image.

Add a visible rail progress line, not just

For lead projects, add a “case arc” structure: Origin, System, Scale, Pressure, Legacy.

Priority 5: reduce Home density.

Keep “Systems of Meaning.”

Cut the bio by half.

Show only one featured case at a time, or make the three case cards smaller.

Move CV/contact to info console.

Let the orbit field breathe.

Priority 6: editorial reduction.

Replace abstract system language with project-specific consequence.

Use fewer phrases like “spatial,” “systems,” “infrastructure,” “translation” per screen.

Keep the best line per idea. Remove the second and third explanation.

Make Mashrou’ Leila the tonal benchmark: concrete, public, risky, embodied.

Priority 7: mobile-specific redesign.

Mobile Home should become a vertical editorial card, not a full desktop panel.

Hide secondary case cards behind a “Selected works” sheet.

Keep project rail mobile behavior; it is the best mobile pattern.

Make Essays default to index first, then reader, which it mostly does already.

Bottom Line

This is close to being a serious creative technology portfolio, but it is not yet finished as an interaction product. The atmosphere is ahead of the UX. The content is ahead of the information architecture. The Mashrou’ Leila case rail shows the right direction: evidence, sequence, emotion, system. The rest of the archive should be reorganized around that level of clarity.

The main design task is not to add more. It is to make the archive teach itself.

02 — DESIGN LANGUAGE ANALYSIS

Core Diagnosis

The project’s visual language is strongest when it behaves like an archival instrument: black field, thin lines, image evidence, restrained panels, cold typography, and cinematic sequencing. It is weakest when it drifts into “creative tech dashboard”: mode buttons, counters, labels, generic status language, and equal-weight UI panels.

#### Right now it sits between four languages:

cinematic editorial website

museum archive terminal

spatial graph interface

dashboard/control panel

Those are compatible, but they need stricter rules.

Strongest Visual Decisions

The black spatial field is the best decision. It makes the work feel like evidence suspended in memory, not portfolio thumbnails on a webpage.

The thin linework in Atlas mode is strong. It has the right archival/diagrammatic quality. Keep it thin, quiet, and technical.

The Mashrou’ Leila rail is the clearest visual proof of concept. Large image evidence plus a strict right-hand editorial panel feels serious. It resembles an exhibition kiosk, a film archive, and a case-study room at once.

The monochrome UI with occasional image color is correct. The images carry the emotional temperature; the interface should stay colder.

The typography has authority. The uppercase mono labels, compressed metadata, and large grotesk headlines establish an institutional/editorial tone.

Weakest Visual Decisions

The bottom control bar is too dashboard-like. It is polished, but it reads as software UI more than cinematic archive. The icons, counters, and mode labels are useful, but they flatten the mystery.

The Home panel is too much. It combines thesis, bio, metrics, featured cards, CTA, and footer note. It feels like a landing page trapped inside an archive.

Index mode is visually weak. It is called an index but behaves like scattered image debris. It lacks columns, grouping, labels, hierarchy, or scanning logic.

Atlas mode is visually seductive but informationally vague. Lines exist, but meaning does not. Without labels, anchors, or relationship types, it reads as “network aesthetic.”

Some project images feel too screenshot-like or placeholder-like when scaled large. The system demands evidence-grade images, not merely available images.

Inconsistencies

The modes do not share a consistent grammar of what a user is supposed to do.

Home says: read me.

Works says: scroll me.

Index says: look around.

Atlas says: interpret me.

Essays says: read deeply.

Project rail says: move through evidence.

That is fine conceptually, but the UI treats them all as equivalent tabs.

The visual hierarchy between lead, secondary, and archive nodes is still not obvious enough. If this is an archive with tiers, the tiers must be visible as scale, persistence, label behavior, and interaction depth.

The language alternates between museum wall text and software telemetry. “Systems Choreography” and “Archive Field” belong to the world. “FIELD / 020” and repeated counters feel like instrumentation. Use instrumentation sparingly.

Brutalist editorial influence is present in the hard borders, monochrome palette, uppercase metadata, and refusal of softness. This is good. But brutalism here should mean structural honesty, not just rectangular severity. Some panels are severe without being clarifying.

Cinematic UI influence appears in the black frame, rail movement, large stills, and evidence sequencing. The project should lean further into shot logic: establishing shot, close-up, cutaway, evidence, coda.

Archival interface logic is promising but underdeveloped. The archive has records, metadata, relationships, and images, but not enough retrieval grammar: filters, provenance, categories, dates, relation types.

Dashboard language is the main contaminant. The bottom bar, counters, and mode grid make the experience feel like operating software rather than entering an archive. Some dashboard logic is needed, but it should feel like an archival console, not a SaaS toolbar.

Museum/archive aesthetics are strong in the project rail and essays panel. They are weaker in Atlas/Index because those modes lack captions, object labels, collection logic, and curatorial groupings.

Motion graphics logic is present but too uniform. Everything glides. There should be cuts, holds, reveals, dimming, and deliberate sequencing.

Spatial composition is strongest in Atlas from a distance and weakest in Index. Index needs spatial order; Atlas needs semantic order.

Typography is almost there. The issue is overuse of uppercase intensity. The system needs more contrast between metadata, title, body, caption, and evidence.

Comparisons

Compared to Locomotive-style cinematic sites: this is less polished in transition choreography, but more conceptually specific. Locomotive-style work often has better pacing, smoother reveals, and cleaner narrative beats. This archive has more original structure but rougher rhythm.

Compared to exhibition interfaces: the project has the right atmosphere, but it lacks object labels and interpretive hierarchy. Exhibition interfaces tell you what you are looking at, why it matters, and where to go next.

Compared to Criterion editorial systems: the essays and project rails are closest. Criterion succeeds because it gives each object dignity: title, still, essay, context, sequence. This archive should borrow that restraint.

Compared to brutalist archival design: the project has the surface language but needs more systematic rigor. Brutalist archive design should make structure unavoidable.

Compared to game-engine navigation: the spatial field has game-like movement, but lacks orientation tools. Games teach space through landmarks, minimaps, paths, anchors, and feedback. This archive has mood, not enough wayfinding.

Compared to spatial computing interfaces: the floating panels and image planes are relevant, but spatial computing requires depth cues, focus states, and predictable object behavior. Current depth is visual more than functional.

1. What Makes This Unique

The combination of cultural archive, cinematic rail, and spatial relationship field is genuinely distinct. The best idea is not “portfolio in 3D.” It is “a body of work as a navigable system of evidence.”

The Mashrou’ Leila case shows the unique thesis: cultural work as infrastructure, image as evidence, project as system. That is much stronger than a normal portfolio case study.

2. What Feels Derivative

The network graph aesthetic feels derivative when unlabeled. Lines between images are now a familiar “complexity” signal.

The black-background experimental portfolio look is also familiar unless the archive logic becomes sharper.

The bottom nav/control deck feels like many creative tech demos: impressive but generic as an interface pattern.

The giant uppercase editorial panel language can feel like contemporary brutalist portfolio styling unless paired with more specific archival behavior.

3. What Should Be Simplified

Simplify Home. It should do less.

Simplify the bottom bar. Reduce status noise. Prioritize current mode, current object, and one clear action.

Simplify Atlas at first glance. Show fewer relationship lines until the user selects or hovers.

Simplify copy. Reduce repeated “systems / spatial / infrastructure / translation” language.

Simplify mobile. Treat mobile as a guided reel, not a compressed desktop archive.

4. What Should Be Amplified

Amplify the evidence sequence in project rails. That is the strongest product language.

Amplify object labels and captions. Make the archive feel curated, not just visual.

Amplify lead-project hierarchy. Lead works should anchor the whole system.

Amplify relationship intelligence in Atlas. Relationship lines should explain lineage, influence, method, material, or consequence.

Amplify cinematic transitions: dim, hold, reveal, cut. Less generic glide.

Amplify editorial restraint. Let one strong line land instead of surrounding it with theory.

5. Global Visual Rules

Use black as the world, not as decoration.

Use white for primary editorial moments only. Most UI should live in off-white, gray, or low-opacity linework.

Every mode must have one job and one dominant visual grammar.

Lead projects are anchors: larger, persistent, labeled sooner, richer on selection.

Secondary projects are connectors: medium scale, visible in relation to anchors.

Archive nodes are evidence fragments: smaller, quieter, not equal-weight cards.

Lines only appear when they explain something. No decorative graph density.

Every image needs one of three roles: hero, evidence, or context. Style and scale should follow the role.

Metadata stays mono and small. Titles can be large. Body copy should breathe and should not be all uppercase.

#### Motion should follow editorial logic:

overview: slow drift

selection: hold and dim

rail: lateral evidence sequence

essay: stable reading

atlas: relation reveal

exit: clean return to map

No UI element should exist only because it looks technical. If it does not orient, explain, filter, reveal, or move the user forward, remove it.

Ruthless Bottom Line

The project already has a real visual identity. The danger is that it mistakes complexity for depth. The next pass should not add more visual systems. It should make the existing systems stricter, more legible, and more authored. The archive should feel less like “look at this rich interface” and more like “this body of work could not be understood any other way.”

03 - INTERACTION FLOW ANALYSIS

Core Diagnosis

As a spatial operating system, the archive has the right primitives but the wrong first-run behavior.

It has modes, objects, rails, relations, essays, and metadata. That is an OS-like structure. But the current experience does not yet behave like an operating system because it does not establish rules, affordances, or orientation early enough. A first-time visitor is dropped into a beautiful spatial field with a polished control deck, but the system does not clearly say:

What am I looking at?

What can I touch?

What is the difference between modes?

Where should I start?

How do I know I have understood the work?

Right now the archive is expressive before it is legible.

1. Onboarding Clarity

The Orbit Intro currently acts like a homepage panel floating over a spatial world. It introduces the practice, but not the operating system.

The first-time visitor sees “Systems of Meaning,” “Archive Field,” and mode labels. The tone is strong, but the interaction model is not taught. The user has to infer that the background is navigable, that images are nodes, that modes reorganize the same body of work, and that project rails are case-study interiors.

#### The onboarding should establish a simple mental model:

This archive has 20 main works, 119 records, 5 ways to navigate, and each project can open into an evidence rail.

That can be done elegantly without tutorial copy. The first screen needs a short operational line, not more theory.

#### Better first-run hierarchy:

Enter the archive

Start with Works

Open a project

Trace relations

Read essays

The current Home tries to introduce the practice and preview the archive at the same time. It should choose one: orient the visitor.

2. Discoverability

Discoverability is uneven.

Bottom mode rail is visible.

Project rail controls are understandable.

Essays panel is readable.

Mashrou’ Leila rail makes the case-study model clear once entered.

Canvas objects do not consistently advertise clickability.

Atlas lines do not explain themselves.

Index has no clear scanning/filtering behavior.

“Archive Field” is repeated, but does not tell the user what to do next.

Related project chips are useful, but too quiet.

#### The archive needs curiosity loops:

Hover a node -> label appears.

Click a node -> project preview.

Open rail -> evidence sequence.

Select relation -> connected works dim/brighten.

Finish rail -> suggested next relation.

At the moment, curiosity often dead-ends after “that looks interesting.”

3. Emotional Pacing

The pacing is front-loaded with abstraction. The user receives “Systems Choreography,” “systems of meaning,” and archive language before receiving a concrete emotional project.

That is backwards for first-time visitors. Lead with one emotionally specific object, then reveal the system.

Best opening candidate: Mashrou’ Leila, TEBR, or MEKENA NYC. They have stakes. They explain why the archive exists.

#### Current pacing:

concept -> interface -> modes -> project

#### Better pacing:

image/evidence -> project stakes -> archive model -> relations -> essays

The project rail has the best emotional pacing because it moves through image, thesis, scale, pressure, coda. The rest of the archive should learn from that.

4. Interaction Fatigue

The fatigue comes from mode ambiguity, not from interaction quantity.

#### The user has to remember:

Orbit rotates.

Works scrolls vertically.

Index pans spatially.

Atlas pans and shows lines.

Rail scrolls horizontally.

Essays uses panel reading.

Bottom nav is always present.

Info console overlays everything.

That is a lot of grammar. It can work, but each mode needs a stronger “mode law.”

#### Recommended mode laws:

Orbit: passive orientation, low interaction.

Works: vertical curated sequence, easiest entry.

Index: fast scanning and filtering.

Atlas: relationship tracing only.

Essays: stable reading, minimal spatial movement.

Rail: cinematic evidence sequence.

Do not make every mode feel equally exploratory. That exhausts users.

5. Spatial Orientation

Orientation is currently the biggest weakness.

#### The archive needs spatial anchors:

current mode

current project

position in mode

what is clickable

what is selected

what is related

where to go next

The bottom bar covers some of this, but it is too abstract. “FIELD / 020” is not meaningful enough.

#### Better orientation system:

A small mode-specific orientation strip.

Work 04 / 20

Slide 01 / 24: Counter-Public

Mashrou’ Leila selected / 7 relations visible

Sound + Systems / Lead projects shown

Essay 01 / 06

#### Atlas especially needs a legend:

Line = relation

Large = lead

Medium = secondary

Small = archive

Bright = selected path

6. Narrative Sequencing

The archive currently offers navigation before it offers sequence. That works for returning users, but not for first-time users.

#### A spatial OS needs both:

free navigation

recommended paths

#### Add three narrative paths:

Start with the practice

: Home -> Works -> Essays

Start with proof

: Mashrou’ Leila -> MEKENA NYC -> TEBR

Start with systems

: Atlas -> DERIVE -> HAH-WAS -> Resonance Atlas

These could be subtle, not like marketing CTAs. Think “curatorial paths” or “routes.”

Refined Interaction Hierarchy

The system should have three layers, not five equal modes.

Primary layer: orientation

Orbit Intro

Works Spine

#### Exploration layer:

#### Depth layer:

Project Rail

Info Console

#### This means the default journey should be:

Orbit -> Works -> Project Rail -> Related Project or Atlas -> Essay

The current bottom nav should visually reflect this hierarchy. Works should feel like the primary entry, not just one tab among five.

Better Mode Transitions

#### Orbit to Works:

The orbit should slow.

Lead works align into a vertical spine.

The Home panel dissolves or compresses.

The first work becomes readable.

#### Works to Project Rail:

Selected project image holds.

Other works dim and recede.

Camera moves laterally.

Rail assembles from project evidence.

Detail panel enters last.

#### Project Rail to Atlas:

Current project remains selected.

Its connected works appear first.

Then the rest of the graph fades in.

Lines should reveal from selected project outward.

#### Atlas to Index:

Relation lines fade.

Nodes flatten into grouped bands.

Labels appear.

The mode changes from “meaning” to “lookup.”

#### Essays to Works:

Reading panel closes like a dossier.

Spatial field resumes.

Last referenced project, if any, is highlighted.

Stronger Cinematic Pacing

#### Use film logic:

Establishing shot: Orbit

Tracking shot: Works

Cutaway/evidence: Project Rail

Diagram shot: Atlas

Essay insert: Essays

Contact sheet: Index

#### Motion should not always glide. Use:

cut-like mode switches

delayed panel entrances

selective dimming

focus locks

The most important cinematic improvement: when a project opens, the system should feel like it has chosen a subject. Right now it feels like it has switched layout.

Improved Focus States

Focus should operate at three levels.

#### Object focus:

hovered node gets label, slight brightness, relation preview.

non-hovered neighbors dim slightly.

#### Project focus:

selected project becomes anchor.

related projects remain visible.

unrelated field softens.

#### Mode focus:

only mode-relevant UI stays active.

in Essays, spatial controls quiet down.

in Atlas, relation legend comes forward.

in Rail, slide controls and progress become primary.

Current hover is too subtle for the conceptual weight of the interface.

Reducing Cognitive Overload

Reduce simultaneous messages.

#### Home should not show:

selected works

footer thesis

#### Pick three:

title/thesis

one sentence of orientation

start button/path

#### Atlas should not show all lines by default. Show:

lead anchors

selected domain

hover relations

then full graph only on request

#### Bottom bar should not always show the same density. It should adapt:

Home: simple entry controls

Works: work count and current work

Rail: slide progress

Atlas: selected node and relation count

Essays: essay title and progress

First-Time Visitor Experience

#### Current first-time experience:

“Interesting, serious, beautiful. I’m not fully sure what to do.”

“I understand this is an archive of works. I know Works is the place to start. I can open a project, then trace relations or read essays.”

#### For first-timers:

Default to Works after a short Orbit intro, or make Works the most obvious primary action.

Show one operational sentence.

Make first click rewarding.

Avoid showing all complexity immediately.

Curator Experience

A curator wants structure, lineage, relationships, and interpretive depth.

#### Current strengths:

Atlas concept.

Project rails.

Strong intellectual framing.

#### Current weaknesses:

Relationship types unclear.

No provenance or curatorial labels.

Hard to distinguish major works from fragments at a glance.

#### Curator improvements:

Add relation labels.

#### Add project roles:

archive node

research system

Add curatorial paths.

Let Atlas become a real interpretive tool, not just a map.

Recruiter Experience

#### A recruiter wants to know:

What did this person make?

What was their role?

What skills are demonstrated?

Where is the proof?

Can I quickly scan?

#### Current strengths:

Strong distinction.

Technical ambition.

Case-study rails provide proof.

#### Current weaknesses:

Role and outcome are not always immediate.

Too much theory before evidence.

Index does not help fast evaluation enough.

CV access may be too quiet or risky if unfinished.

#### Recruiter improvements:

In Works, each lead project needs role/outcome metadata.

Add a recruiter-friendly “Selected Work” route or filtered Index.

#### Make skills visible without turning it into LinkedIn:

creative direction

AI music research

spatial systems

Put concrete outcomes earlier in project rails.

Art Institution Experience

An institution wants seriousness, context, public relevance, and exhibition potential.

#### Current strengths:

Atmosphere.

Cultural specificity.

Museum-like black field.

Strong essay system.

Mashrou’ Leila as cultural infrastructure is compelling.

#### Current weaknesses:

The interface sometimes feels like a prototype rather than an exhibition system.

Atlas needs interpretive clarity.

Copy can over-theorize.

Some images need stronger evidence quality.

#### Institution improvements:

Add exhibition-style object labels.

Add “works as rooms” framing.

Let project rails feel like installations.

Make Atlas show institutional relevance: publics, geographies, media, systems, risks.

Final Interaction Principle

#### The archive should behave like a spatial operating system with three commands:

Enter a work.

Trace its relations.

Read its argument.

Everything else should support those three actions.

04- TECHNICAL / DESIGN SYSTEM AUDIT

Executive Diagnosis

The architecture is good enough for a prototype and fragile for a real launchable archive. The strongest decision is the split between React UI and an imperative Three.js scene engine. The weakest decision is that too much product logic lives between them informally:

owns interaction state,

NodeManager

owns spatial state,

owns UI state, and gallery/content state is partly generated, partly hardcoded, partly CSV-driven.

This can scale to a polished v1 if tightened now. If you keep adding case studies, modes, images, transitions, and editorial layers without refactoring, it will become hard to reason about quickly.

Architecture Scalability

#### The current architecture has three broad layers:

#### React app shell:

src/App.tsx

/Users/vhnmns/projects/papazian-archive/src/App.tsx

#### UI overlay:

src/components/Overlay.tsx

/Users/vhnmns/projects/papazian-archive/src/components/Overlay.tsx

#### Imperative spatial engine:

src/core/Scene.ts

/Users/vhnmns/projects/papazian-archive/src/core/Scene.ts

src/core/NodeManager.ts

/Users/vhnmns/projects/papazian-archive/src/core/NodeManager.ts

src/core/ScrollEngine.ts

/Users/vhnmns/projects/papazian-archive/src/core/ScrollEngine.ts

That split is directionally correct. React should not render the Three.js graph. Three.js should not own editorial panels. But the boundary is leaky.

#### The problem:

NodeManager

is not only rendering nodes. It is also doing layout strategy, interaction picking, relation rendering, gallery rail state, generated card texture creation, search visual state, hover behavior, and resource cleanup. It is doing too much.

If this becomes a 100+ node, 20+ case-study, multi-mode archive,

NodeManager

should become a coordinator around smaller systems:

LayoutEngine

TextureRegistry

RelationRenderer

RailRenderer

PickingController

SpatialStateProjector

Right now it is a single powerful machine room.

Maintainability

Overlay.tsx

is also too large. It contains:

mode definitions

essay records

project detail drawer

bottom instrument

essays panel

info console

mobile sheet logic

This is manageable today, but it is already a sign that the UI layer is becoming a document, a router, and a design system all at once.

#### Split it into:

ArchiveShell

BottomInstrument

ProjectDetailPanel

EssaysPanel

InfoConsole

MobileProjectSheet

Do not over-abstract styling yet. Just split by conceptual surface.

Interaction State Management

#### Current state is scattered but understandable:

currentMode

activeMedia

hoveredNode

focusedIndex

searchQuery

The issue is that mode transitions are procedural.

openProjectRail

handleModeChange

handleCloseNode

, deep-link handling, scene switching, and focus behavior all manually coordinate state. This works until you add more mode rules.

This should become an explicit interaction state machine.

#### Recommended model:

type ArchiveMode =
  | 'orbit'
  | 'works'
  | 'index'
  | 'atlas'
  | 'essays'
  | 'projectRail';

interface ArchiveInteractionState {
  mode: ArchiveMode;
  previousMode: Exclude<ArchiveMode, 'projectRail'>;
  activeProjectSlug?: string;
  activeSlideIndex?: number;
  hoveredSlug?: string;
  searchQuery: string;
  infoPanelOpen: boolean;
  media?: ActiveMedia;
}

Use a reducer or Zustand store, not scattered

. The app is spatial and modal; a reducer would make transitions auditable.

#### Example events:

OPEN\_PROJECT

CLOSE\_PROJECT

SET\_ACTIVE\_SLIDE

APPLY\_SEARCH

HYDRATE\_FROM\_URL

This would reduce bugs around return modes, deep links, and project rail focus.

Content Systems

The content system is promising and better than the average prototype. Markdown + CSV + generated TypeScript is a reasonable local CMS.

content/projects/{slug}/project.md

is readable for editing.

gallery.csv

makes rails easy to author.

scripts/build-content.ts

validates missing image references and YouTube IDs.

content:report

gives useful editorial health checks.

The project has a real copy inventory now.

Content sources are split across too many places.

Essays are hardcoded in

Overlay.tsx

Home panel copy is hardcoded in

Overlay.tsx

Info console copy is in

siteInfo.ts

Atlas CSV and project markdown can disagree.

projectGalleries.ts

still contains curated/hardcoded gallery data while generated galleries also exist.

#### Ideal v1 structure:

content/
  site/
    home.md
    info.md
    essays.json or essays/\*.md
  projects/
    {slug}/
      project.md
      gallery.csv
      metadata.json
  atlas/
    nodes.csv
    relations.csv

#### Generated output:

src/data/generated/
  content.ts
  atlas.ts
  essays.ts

Rule: React and Three.js should consume generated typed data only. They should not be parsing editorial formats at runtime except for the atlas CSV if you deliberately want runtime editability.

Performance Risks

The production bundle is already large: about

before gzip. That is not catastrophic for an experimental archive, but it is too heavy for a refined portfolio if everything loads before the first meaningful view.

#### Main risks:

Three.js, GSAP, React, Motion, icons, and all app logic are in one main path.

All node textures are loaded into the scene up front.

218 image planes are represented in the current app state.

Canvas text cards are generated on the client.

Relation lines update repeatedly.

renderUpdate

iterates every mesh every frame to update shader uniforms.

Pixel ratio can go to 2, which is expensive on high-DPI displays.

Atlas mode renders many lines and many images at once.

#### Optimization priorities:

Code-split Essays and VideoLightbox.

Lazy-load project rails only when a project opens.

Load lower-resolution thumbnails for spatial modes; load high-res media only in rail/detail.

Add texture caching and eviction.

Add mode-specific render budgets.

prefers-reduced-motion

Consider adaptive pixel ratio under load.

Do not optimize prematurely by gutting the cinematic system. Optimize around loading tiers.

Media Loading Logic

The current

LoadingManager

approach is simple but blunt. It waits for texture loading, then the archive becomes ready. That is okay for a small set but not ideal for 218+ assets.

#### Better strategy:

Critical assets: first view / lead anchors / Home orbit thumbnails.

Secondary assets: Works spine.

Deferred assets: project rail galleries.

On-demand assets: video posters and high-res hero images.

TextureRegistry

getThumbnailTexture(slug)

preloadProject(slug)

releaseProject(slug)

fallback texture per domain/tier

loading/error state per asset

Right now failed textures warn but do not meaningfully affect UI. The user should never see random black gaps without intentional placeholders.

Animation Systems

GSAP is the right tool here. The problem is orchestration. Animations are currently attached locally to mesh position, mesh rotation, visibility, hover, lines, camera, and panels. There is no central cinematic timeline per transition.

That leads to uniform motion: everything glides with similar easing.

#### Recommended:

Define transition presets by mode.

#### Create named timelines:

orbitToWorks

worksToProjectRail

projectRailToAtlas

atlasToIndex

closeProjectRail

#### Let UI panels subscribe to transition phases:

spatialTransform

This gives you cinematic pacing without making React and Three.js fight.

#### Example transition contract:

interface TransitionContext {
  from: ArchiveMode;
  to: ArchiveMode;
  activeProjectSlug?: string;
  duration: number;
  phase: 'exit' | 'transform' | 'enter' | 'settled';
}

Spatial Rendering Strategy

The rendering strategy is conceptually good: image planes as artifacts, shader material, mode-dependent layouts.

#### But the strategy should separate:

object identity

visual representation

layout position

interaction state

loaded media

Currently mesh

is carrying a lot of application state. That is convenient, but it becomes dangerous as the system grows.

Keep a stable

SpatialNode

model outside Three.js.

Meshes only reference

UI/data lookups happen through registries/maps.

Layout functions operate on typed node models, not mesh userData.

This makes it easier to test layout without rendering.

Atlas Rendering Strategy

Atlas mode needs the biggest architectural rethink.

#### Current Atlas:

uses primary meshes

positions them by domain/radius/order

renders relation lines

pans via scroll input

This is acceptable as a first graph view. It is not enough for a serious relational atlas.

typed relations

relation filtering

selected-node neighborhood mode

anchor labels

domain grouping

line opacity by relevance

performance budget for lines

Data should move from

connections: string\[\]

to something richer:

interface AtlasRelation {
  source: string;
  target: string;
  type: 'lineage' | 'method' | 'material' | 'institution' | 'research' | 'media';
  weight?: number;
  label?: string;
}

Then Atlas can say something, not just connect things.

Component Organization

#### Recommended structure:

src/
  app/
    App.tsx
    archiveReducer.ts
    archiveTypes.ts
    urlState.ts
  components/
    archive-shell/
    bottom-instrument/
    project-detail/
    essays/
    info-console/
    media/
  core/
    scene/
      Scene.ts
      Renderer.ts
      CameraController.ts
    spatial/
      NodeManager.ts
      LayoutEngine.ts
      RelationRenderer.ts
      RailRenderer.ts
      PickingController.ts
      TextureRegistry.ts
      ScrollEngine.ts
  data/
    generated/
    adapters/
    schemas/

Do not make this refactor all at once. First split

. Then introduce reducer. Then split

NodeManager

Accessibility Without Breaking Atmosphere

The archive can be atmospheric and accessible. Accessibility does not require making it look generic.

#### Needed improvements:

Real semantic list fallback for Works and Index.

Keyboard mode navigation.

Keyboard node/project selection.

Focus trapping in Info, Essays, and Project Rail panels.

Return focus on close.

updates for active project/slide.

Labels for canvas interactions outside visual hover.

Reduced-motion mode that disables infinite drift and heavy camera movement.

Text contrast audit for muted metadata.

Make project rail controls larger/easier on mobile.

Best approach: create an invisible/alternate DOM navigation layer that mirrors spatial state:

list of 20 works

current active project

current rail slide

relation list for selected project

This lets assistive tech access the archive without compromising the visual canvas.

Ideal Improvement Roadmap

Phase 1: stabilize architecture

Overlay.tsx

Move essays/home copy out of components.

archiveReducer

Keep visual behavior unchanged.

Phase 2: strengthen content system

Generate essays, home, info, projects, galleries from

Eliminate hardcoded

PROJECT\_GALLERIES

duplication.

Add relation schema.

Phase 3: improve performance

Code-split non-critical panels.

Add thumbnail/high-res media tiers.

Add texture registry.

Lazy-load project rail assets.

Phase 4: cinematic orchestration

Add transition manager.

Define named mode transitions.

Add reduced-motion alternative.

Phase 5: atlas maturity

Relation types.

Filtered relation reveal.

Selected neighborhood mode.

Domain/tier legend.

What Not To Do

Do not move everything into a generic CMS yet. The project still benefits from local, versionable content.

Do not replace the custom Three.js engine with React Three Fiber right now. R3F would make some lifecycle work easier, but this app’s imperative cinematic behavior is already built around GSAP and custom layout logic. Refactor the engine first; do not migrate frameworks mid-polish.

Do not add more modes. The current modes are enough. The system needs clearer contracts, not more surfaces.

Do not over-optimize the visuals into blandness. The cinematic archive is the point. Optimize loading, state, and rendering budgets while preserving the black-field atmosphere.

Bottom Line

The system has the bones of a serious spatial portfolio OS, but it needs architectural discipline before the next big editorial expansion. The two urgent technical moves are:

Centralize interaction state into a reducer/state machine.

Split content and rendering responsibilities so

NodeManager

stop being giant mixed-purpose objects.

That will let the project stay cinematic while becoming maintainable enough to finish.

05 - PROJECT RAIL CRITIQUE

Core Diagnosis

The Mashrou’ Leila rail is the strongest content structure in the portfolio right now. It has a real narrative: public emergence, system logic, scale, visibility, pressure, and legacy. But it is too long, too front-loaded with text cards, and too evenly paced. It currently behaves like an excellent archive dump trying to become a film sequence.

The ideal version should feel less like 24 slides and more like a dossier cut into chapters.

#### The opening is strong:

Counter-Public Infrastructure

This establishes the central argument quickly: this was not just a band; it was a public system. That is the correct thesis. It is concrete, distinct, and emotionally loaded.

#### The strongest cards are:

: best opening image. It immediately gives scale, myth, public body, architecture, risk.

: excellent reframing card. Short, memorable, thesis-driven.

The Design Problem

: probably the strongest text card. “How do you make a fragile public visible without making it easy to destroy?” is the kind of sentence the whole case study should orbit.

Tiny Desk Concert

: strong evidence because it proves the system works even when stripped down.

Rolling Stone

: strong because it turns visibility into public event.

Crisis Operations

: strong because it reveals hidden labor and stakes.

The Band as System

: good final thesis, but the wording should be less generalized.

The strongest evidence moment is when the rail shifts from conceptual claim into measurable proof: streams, touring, venue scale, censorship, crowdfunding. That is where the argument becomes credible.

Where The Rail Slows

#### The biggest pacing issue is cards 2 through 6:

Counter-Public Infrastructure

The Design Problem

That is five consecutive text/system/evidence cards after one image. The ideas are good, but the rail stops breathing. In cinematic terms, it becomes voiceover before enough visual evidence has accumulated.

#### The second slowdown is cards 14-16:

Raksit Leila

Three music-video cards in a row flatten rhythm. They may be important, but as a sequence they read as “video, video, video” rather than escalation. One should be the hero example, the others should be supporting thumbnails or grouped into a single “music video language” chapter.

#### The third slowdown is cards 20-21:

Creative Direction

Crisis Operations

Both are strong, but both are system text cards. They should not sit back-to-back unless visually treated very differently.

Crisis Operations

is more emotionally urgent and should come after a public visibility/high-risk image.

Redundant Cards

Counter-Public Infrastructure

partially overlap. Keep both only if they do different jobs:

: conceptual reframing.

Counter-Public Infrastructure

: diagram of operating layers.

If both are text-only cards with similar visual treatment, they feel redundant. Make the second one a system diagram or compress them.

could be one card unless the visual treatment makes them feel like a dossier spread. The metrics are convincing, but splitting them into two consecutive text cards slows the rail.

Exit Festival

may overlap as “large public performance.” Keep both only if they show different kinds of scale: theater mythology vs festival/public mass.

Stage Architecture

Annex Stage

Stage Architecture

sounds stronger.

Annex Stage

should either become a process card showing design logic, or be cut from the main sequence.

Where Visual Rhythm Breaks

The rhythm breaks when text cards cluster too tightly. The rail should alternate between:

image impact

thesis/reframe

image proof

system card

consequence

#### Currently it has blocks:

text/text/text/text/text

image/image/image/image/video/image/image/video/video/video/image/image/image/text/text/image/image/text

That is not cinematic enough. It has chapters, but not enough montage logic.

Also, the final screenshot showed a text card and a live image side-by-side in the rail, which is visually interesting, but the active slide state can feel ambiguous. If the active slide is

, the adjacent text card should read as “previous/next evidence,” not as a competing current subject.

Where Text Gets Too Abstract

“A band that became cultural infrastructure”

“public system disguised as a band”

“fragile public visible without making it easy to destroy”

“institution-scale force without institutional safety”

#### Too abstract:

“operating architecture”

“specificity travelled”

“identity was not decoration”

“chapters of one authored world”

“structural rigor used to design physical space can construct cultural systems”

These are not bad ideas, but they need more physical nouns. Who did what? What was designed? What was at stake? What changed?

#### Example reduction:

“Albums, videos, tours, press, merchandise, and stage language had to behave like chapters of one authored world.”

“Every release, poster, show, interview, and stage image had to teach the public how to read the band.”

Where Evidence Becomes Convincing

#### Evidence becomes convincing when claim meets artifact:

Baalbeck image + public architecture claim

metrics + institution-scale claim

Tiny Desk + “compressed live force”

Rolling Stone + visibility claim

Crisis Operations + censorship/safety claim

The rail should intensify this pattern. Every major claim needs an artifact immediately beside or after it.

Ideal Project Rail Template

For major lead projects, use 12-16 cards, not 24.

#### Recommended structure:

Impact Image

One undeniable visual. No theory first.

Thesis Card

One sentence that reframes the project.

Origin / Context

Where it began, why it mattered.

System Diagram

How the project actually worked.

Major artifact: live image, interface, publication, object.

Scale / Proof

Metrics, reach, geography, institutional facts.

Conflict / Constraint

Risk, censorship, technical limitation, cultural pressure.

Evidence II

Artifact proving the conflict or response.

What Haig specifically designed, directed, built, shaped.

Public Reception / Visibility

Press, audience, institution, recognition.

Hidden Labor

Operations, safety, infrastructure, systems.

Legacy / Relation

How this project generates later works.

One quiet final card, not another thesis dump.

Ideal Mashrou’ Leila Sequence

#### I would restructure it like this:

Open with scale and myth.

Reframe immediately.

Self Titled EP

Origin surface.

Counter-Public Infrastructure

System card, but make it diagrammatic.

El Hal Romancy

Regional emergence.

Direct-to-fan proof.

Combine Scale I + Scale II into one dossier card.

The Design Problem

Emotional/intellectual pivot.

Ibn El Leil

Album-world evidence.

Use as the main music-video case.

Tiny Desk Concert

Proof that the system survives stripped-down conditions.

Exit Festival

Pick one as live scale.

Rolling Stone

Visibility as event.

Crisis Operations

Hidden pressure.

Stage Architecture

Spatial/live system.

The Band as System

Coda, reduced and more specific.

#### Cut or demote:

Raksit Leila

Yo-Yo Ma / Byblos

Annex Stage

Those can live in an expanded archive, not the primary rail.

Ideal Ratios

#### For a lead project rail:

45-55% image cards

15-20% text thesis/context cards

10-15% video cards

10-15% system/dossier cards

5-10% coda/quiet cards

#### For Mashrou’ Leila at 16 cards:

8 image cards

2 video cards

3 text/reframe cards

2 system/evidence dossier cards

1 coda card

The current 24-card rail is roughly too comprehensive for first viewing. It is archive-complete, not editorially cut.

How To Make Rails Cinematic

Stop thinking of rails as slides. Think of them as scenes.

#### Each card needs a job:

reveal hidden labor

#### Use chapter pacing:

Public Emergence

System Design

Scale and Risk

#### Visually, every chapter should have a different rhythm:

image-heavy opening

text/system middle

video/live proof escalation

#### Add a progress grammar:

Instead of only

COUNTER-PUBLIC / 01

SYSTEM / 04

PRESSURE / 14

#### Make the active card unmistakable:

active card full brightness

adjacent cards dimmed

active chapter/title near the card

side panel syncs only to active card

Use text cards sparingly. A text card should feel like a title card in a film or an intelligence dossier page. If it is just explanatory paragraph text, it belongs in the side panel, not the rail.

Criterion + Dossier + Exhibition Logic

#### Criterion influence:

open with iconic still

add essay-like framing

show extras as evidence, not decoration

#### Dossier influence:

metrics, dates, roles, risk events

visual proof

short declarative claims

#### Exhibition influence:

object labels

room/chapter structure

controlled pacing

one artifact per beat

The current rail has all three influences, but not enough discipline. It includes too much material because the material is good. The next edit should be curatorial: what is the shortest sequence that makes the project undeniable?

Bottom Line

Mashrou’ Leila should be the flagship rail, but it needs a tighter cut. The current rail proves there is enough material. The next step is to make it feel authored.

#### The rule should be:

Every rail is not a collection of assets.

Every rail is an argument made through evidence.

#### Additional info:

Yes. Here’s the current content payload I have locally. Short version: we have

20 public projects

, all with metadata, project copy, and gallery rails. But only

Mashrou’ Leila

is currently deep enough to feel like a real flagship case-study rail. The rest are mostly

starter dossiers

: thesis, short description, full description, 4 highlights, related projects, and usually 2-5 rail cards.

Overall Inventory

20 project metadata rows

20 featured works

20 complete project folders

gallery.csv

0 missing image references

All projects marked public

Most project copy files are around

116-157 words

Most rails are

#### Mashrou’ Leila is the outlier:

157 words + 24 rail cards

Project Content Depth

| Project | Tier | Words | Rail Cards | Current Info Level |

| --- | ---: | ---: | ---: | --- |

| DERIVE | lead | 142 | 4 | Starter case study |

| Space Time Tuning Machine | lead | 146 | 3 | Starter case study |

| STORYLINES | lead | 125 | 4 | Starter case study |

| Mashrou’ Leila | lead | 157 | 24 | Deep rail / flagship |

| MEKENA NYC | lead | 138 | 4 | Starter case study |

| Sometimes I Wake Up Elsewhere | lead | 152 | 3 | Starter case study |

| TEBR | lead | 147 | 5 | Medium starter, promising |

| HAH-WAS | secondary | 138 | 4 | Starter case study |

| 3D Beat Synth | secondary | 124 | 4 | Starter case study |

| Resonance Atlas | secondary | 127 | 3 | Starter case study |

| MaqamAI | secondary | 116 | 3 | Starter case study |

| Autopsy / Beirut Phantom | secondary | 136 | 3 | Starter case study |

| Cartography of Absence | secondary | 138 | 3 | Starter case study |

| Why We’re Like This | secondary | 148 | 3 | Starter case study |

| Photon+ | secondary | 133 | 3 | Starter case study |

| Codeverse Explorer | secondary | 128 | 3 | Starter case study |

| Kardia | secondary | 129 | 3 | Starter case study |

| Music Engines | secondary | 128 | 3 | Starter case study |

| Architecture in Low Res | archive | 144 | 3 | Starter case study |

| 1000 Strings at Rest | archive | 133 | 2 | Thinest rail |

What Each Project Currently Has

#### Each project has:

Short description

Full description

Related projects

Gallery rail cards with image/text/video/audio support

So the structure is good. The issue is depth, not absence.

Strongest Non-Mashrou Material

#### These feel most promising for full expansion:

Strong concept: AI failure, maqam memory, broken instruments, archive residue. Already has 5 cards and clear emotional/technical stakes.

Space Time Tuning Machine

Strong institutional proof: SXSW, The Broad, subtractive instrument, noise toward silence. Needs more visual/process evidence.

Strong real-world infrastructure project. Needs architectural images, plans, program logic, residency/shelter stakes.

Sometimes I Wake Up Elsewhere

Strong literary/emotional world. Needs excerpts, structure diagrams, manuscript fragments, “rooms/forms/debt” visual logic.

Good systems/cinematic fit. Needs clearer proof: screenshots, diagrams, motion logic, what the user does.

HAH-WAS / MaqamAI / Resonance Atlas

These form a strong AI music research cluster. Could become one powerful research trilogy.

Thinnest Areas

1000 Strings at Rest

only has 2 rail cards.

Architecture in Low Res

Autopsy / Beirut Phantom

Cartography

Resonance Atlas

, etc. have only 3 cards each.

Most non-Mashrou projects need actual evidence: images, screenshots, diagrams, video, process, outcomes.

Several projects have good thesis language but not enough proof yet.

The Main Pattern

Right now, the project set is structurally complete but editorially shallow.

It’s enough to populate the archive.

It’s not enough yet for all projects to feel like Criterion-style dossier rails.

The likely next move is to pick

4-6 flagship rails

and deepen those first:

Mashrou’ Leila

Space Time Tuning Machine

Sometimes I Wake Up Elsewhere

Then keep the rest as shorter archive nodes until there’s enough material.

The short answer: there are

three different CSV layers

, and they do different jobs.

1. Main App / 20 Featured Projects

The source of truth for the

20 main projects shown as Works / featured rails

content/projects.csv

/Users/vhnmns/projects/papazian-archive/content/projects.csv

#### That defines the curated project list metadata:

connections

showInWorks

hasProjectPage

#### The order of those 20 main projects comes from:

content/featured-projects.csv

/Users/vhnmns/projects/papazian-archive/content/featured-projects.csv

projects.csv

= which authored projects exist and their metadata

featured-projects.csv

= display/order list for the 20-project spine

2. Actual Copy For Main Projects

#### The project descriptions I’ve been summarizing are mostly from:

content/projects/{slug}/project.md

content/projects/mashrou-leila/project.md

/Users/vhnmns/projects/papazian-archive/content/projects/mashrou-leila/project.md

short description

full description

related projects

#### The rail/card content comes from:

content/projects/{slug}/gallery.csv

content/projects/mashrou-leila/gallery.csv

/Users/vhnmns/projects/papazian-archive/content/projects/mashrou-leila/gallery.csv

image/video file

These get compiled by

scripts/build-content.ts

/Users/vhnmns/projects/papazian-archive/scripts/build-content.ts

src/data/generated/content.ts

/Users/vhnmns/projects/papazian-archive/src/data/generated/content.ts

3. Spatial Atlas / 119 Nodes

The source of truth for the broader

119-node spatial atlas field

public/images/atlas/atlas-node-update-FINAL.updated.csv

/Users/vhnmns/projects/papazian-archive/public/images/atlas/atlas-node-update-FINAL.updated.csv

That feeds the live spatial scene through

src/data/atlas.ts

/Users/vhnmns/projects/papazian-archive/src/data/atlas.ts

#### This CSV has:

connections

hasProjectPage

Important: this is broader than the 20 main projects. It includes atlas-only nodes like

fictive-environments

localization-gap

cost-of-being-queer-and-arab

4. Editorial Master Sheet

#### The broadest planning/reference CSV is:

content/project-master.csv

/Users/vhnmns/projects/papazian-archive/content/project-master.csv

This is not the direct app source of truth for rendering. It’s more like the editorial control sheet. It tracks:

portfolio role

parent project

thesis description

source confidence

source files

This is the best file for deciding what needs expansion, but it is not the clean runtime source.

Practical Hierarchy

#### Use this mental model:

content/project-master.csv
= editorial planning map / broad project intelligence

public/images/atlas/atlas-node-update-FINAL.updated.csv
= source of truth for the 119-node spatial atlas

content/projects.csv + content/featured-projects.csv
= source of truth for the 20 main authored project list

content/projects/{slug}/project.md
= source of truth for main project prose

content/projects/{slug}/gallery.csv
= source of truth for project rail cards

So when I was talking about “the rest of the projects,” I was mostly pulling from:

content/projects.csv

/Users/vhnmns/projects/papazian-archive/content/projects.csv

content/projects/\*/project.md

content/projects/\*/gallery.csv

#### And for broader atlas-only context, the richer reference is:

content/project-master.csv

/Users/vhnmns/projects/papazian-archive/content/project-master.csv

