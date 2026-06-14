import { GENERATED_PROJECT_CONTENT } from './generated/content';

export interface ProjectContent {
  thesis: string;
  shortDescription: string;
  fullDescription: string;
  highlights: string[];
  relatedSlugs?: string[];
}

export const PROJECT_CONTENT: Record<string, ProjectContent> = {
  tebr: {
    thesis: 'Displacement is treated as a frequency problem: what happens to a voice when the room it was built for no longer exists?',
    shortDescription: 'TEBR is a sound-text work that turns forced exile, machine failure, Arabic maqam, and archival residue into a deliberate compositional territory.',
    fullDescription: 'The project uses the violin as a probe into cultural memory, letting AI mistranslation become material rather than noise. Field recording, maqam logic, generated fragments, and subtractive synthesis are organized as evidence of a voice passing through unstable systems.',
    highlights: [
      'Research-led performance and installation, 2024-26',
      'Uses AI failure as a faulty transducer of cultural memory',
      'Connects Arabic maqam, field recording, and subtractive composition',
      'Built from archive residue and hundreds of generated fragments',
    ],
    relatedSlugs: ['space-time-tuning-machine', 'maqamai', 'resonance-atlas', 'hah-was'],
  },
  'mashrou-leila': {
    thesis: 'A band that became a counter-public: sound, image, stage, and political pressure operating at institutional scale.',
    shortDescription: "Mashrou' Leila began at the American University of Beirut and became one of the most consequential bands to emerge from the region.",
    fullDescription: "Across fourteen years, the band moved through concerts, album worlds, bans, visual systems, and public argument. Haig's role as co-founder and creative director positioned music as a spatial and political practice, not only a catalog of songs.",
    highlights: [
      'First Middle Eastern act on the Rolling Stone cover',
      '500M+ streams across forty countries',
      'Crowds of 35,000+ at peak performances including Baalbeck',
      'Systematically banned across MENA for political and queer-visibility content',
    ],
    relatedSlugs: ['ibn-el-leil-album', 'rolling-stone-cover', 'archive-of-bans', 'space-time-tuning-machine'],
  },
  'mekena-nyc': {
    thesis: 'A spatial institution for work that existing categories do not know how to hold.',
    shortDescription: 'MEKENA NYC builds infrastructure for experimental and interdisciplinary practice in Queens, New York.',
    fullDescription: 'Founded and directed by Haig, MEKENA operates as a counter-public institution: not a gallery, not a school, but a place for production support, residency, emergency housing, and technical collaboration. It makes the portfolio\'s systems thinking visible at the scale of an actual building.',
    highlights: [
      'Artist residency and cultural infrastructure in Queens',
      'Named for Arabic makan: place, position, site',
      'Westbeth Safe Haven partner for emergency residency access',
      'Designed for interdisciplinary work at the edges of existing institutions',
    ],
    relatedSlugs: ['fictive-environments', 'menara', 'westbeth-safe-haven'],
  },
  'sometimes-i-wake-up-elsewhere': {
    thesis: 'An autofiction dream cycle where displacement is measured through rooms, forms, errands, animals, and recurring physical detail.',
    shortDescription: 'Sometimes I Wake Up Elsewhere is an active manuscript of approximately 28,000 words across 62 entries.',
    fullDescription: 'The work is funny, nightmarish, tender, and mundane at once. Its surrealism is never announced as strange; it arrives through ordinary objects and bureaucratic structures that quietly fail to protect the body moving through them.',
    highlights: [
      'Autofiction / dream cycle across 62 entries',
      'Surrealism built from physical detail rather than declared conceit',
      'Treats bureaucratic language as texture and pressure',
      'Linked to The Cartography of Absence as predecessor and shadow system',
    ],
    relatedSlugs: ['cartography-of-absence', 'bureaucratic-surrealism'],
  },
  'cartography-of-absence': {
    thesis: 'A bureaucratic dream architecture for what has been lost, misplaced, filed, and made impossible to retrieve.',
    shortDescription: 'The Cartography of Absence is a modular manuscript system cast in forms, reports, inventories, and clinical language.',
    fullDescription: 'Organized into thematic houses, the work lets structure carry the emotional argument. It is less a linear book than a navigable administrative ruin, where displacement is recorded through the language that normally erases it.',
    highlights: [
      'Earlier linked manuscript to Sometimes I Wake Up Elsewhere',
      'Nine thematic houses as architectures of displacement',
      'Bureaucratic language used as literary texture, not parody',
      'One of the clearest textual statements of the broader practice',
    ],
    relatedSlugs: ['sometimes-i-wake-up-elsewhere', 'walaw-manifesto', 'bureaucratic-surrealism'],
  },
  'architecture-in-low-res': {
    thesis: 'Degraded representation is not a failure state; it is often the condition through which contested space becomes knowable.',
    shortDescription: 'Architecture in Low-Res studies built space as it survives in memory, testimony, satellite images, low-resolution photographs, and drawings made without site access.',
    fullDescription: 'The research asks what architecture becomes when the original site is destroyed, inaccessible, compressed, or politically unstable. Low resolution becomes an epistemic condition: partial, damaged, but still capable of carrying spatial truth.',
    highlights: [
      'Research on compressed representations of built space',
      'Works through testimony, memory, satellite imagery, and degraded photographs',
      'Focused on contested, destroyed, and inaccessible sites',
      'Bridges architectural training with later spatial media work',
    ],
    relatedSlugs: ['autopsy-beirut-phantom', 'ghost-city-sculpture', 'bartlett-thesis'],
  },
  'space-time-tuning-machine': {
    thesis: 'An instrument played in reverse: tuning noise into sound, melody, and finally silence.',
    shortDescription: 'The Space Time Tuning Machine is a performance and installation about exile, longing, acoustic memory, and subtractive composition.',
    fullDescription: 'Rather than producing sound from silence, the work begins with noise and removes, tunes, and reconstructs. It behaves like memory: not retrieval, but a continuous rebuilding of the room in which a sound might once have belonged.',
    highlights: [
      'World premiere at SXSW 2022',
      'Presented at The Broad Museum, Los Angeles',
      'Subtractive instrument moving from noise toward silence',
      'A key bridge between sound, space, and systems in the portfolio',
    ],
    relatedSlugs: ['tebr', 'photon-plus', '1000-strings-at-rest', 'mashrou-leila'],
  },
  'hah-was': {
    thesis: 'A sieve for cultural specificity: what passes through AI music systems, and what gets filtered out before anyone hears it?',
    shortDescription: 'HAH-WAS is an evaluation protocol for testing AI music generation systems against maqam accuracy, microtonality, and cultural specificity.',
    fullDescription: 'Named for the Arabic idea of sifting, HAH-WAS treats hallucination and erasure as measurable consequences of training assumptions. It red-teams model outputs across cultural music systems and turns failure into evidence.',
    highlights: [
      'Evaluation protocol for cultural specificity in AI music',
      'Tests maqam-accurate microtonal structures against Western defaults',
      'Part of the broader Localization Gap research',
      'Connects model behavior, music theory, and cultural accountability',
    ],
    relatedSlugs: ['localization-gap', 'maqamai', 'resonance-atlas', 'tebr'],
  },
  kardia: {
    thesis: 'A body-signal instrument that excavates music from physiological state instead of adding music on top of it.',
    shortDescription: 'Kardia is a mobile biofeedback instrument that turns heart-rate data into sound using the Iso-Principle.',
    fullDescription: 'The system begins by matching the body\'s energy with sonic texture, then guides it toward calm as the body changes. It avoids raw BPM displays that create anxiety loops, abstracting biosignal into density, texture, and movement.',
    highlights: [
      'Biofeedback instrument based on the Iso-Principle',
      'Heart rate shapes harmonic density without displaying BPM',
      'Mobile-first interaction model for calm and attention',
      'Extends body-as-signal logic into therapeutic territory',
    ],
    relatedSlugs: ['body-maintenance-log', '3d-beat-synth', 'the-weather-rehearsal'],
  },
  '3d-beat-synth': {
    thesis: 'What if rhythm had a third dimension?',
    shortDescription: '3D-Beat-Synth is a browser-native audiovisual instrument where rhythm is sculpted as spatial form.',
    fullDescription: 'Each beat cell is a physical object in 3D space, and composition becomes arrangement rather than linear sequencing. The work makes technical experimentation immediately legible: sound, interface, and spatial position become the same action.',
    highlights: [
      'Browser-native instrument using Web Audio and Three.js',
      'Beat matrix arranged in 3D space instead of a flat grid',
      'Stereo field mirrors the spatial arrangement',
      'Rhythm treated as sculpture',
    ],
    relatedSlugs: ['itp-camp-prototypes', 'kardia', 'photon-plus'],
  },
  storylines: {
    thesis: 'Stories do not move linearly; they drift, double back, collapse, and accumulate gravity.',
    shortDescription: 'STORYLINES is a graph-based tool that maps narrative as a force-directed network of moments, causes, clusters, and themes.',
    fullDescription: 'The project makes visible the architecture of how meaning accumulates in a story. Nodes become moments, edges become causality, and clusters become thematic pressure, letting narrative behave as a spatial system.',
    highlights: [
      'Graph-based narrative mapping tool',
      'Nodes as moments, edges as causality, clusters as thematic gravity',
      'Built to expose nonlinear story architecture',
      'Connects writing practice to interface and systems design',
    ],
    relatedSlugs: ['the-labyrinth', 'codeverse-explorer', 'meaning-stack'],
  },
  'autopsy-beirut-phantom': {
    thesis: 'A city held in three temporal layers: before the blast, the blast itself, and the reconstruction that follows.',
    shortDescription: 'Autopsy / Beirut Phantom is a spatial archive that maps Beirut as navigable memory rather than documentary record.',
    fullDescription: 'The work extends Architecture in Low-Res into a more immersive environment. It treats urban trauma as a layered spatial condition: partial, haunted, and repeatedly rebuilt through image, model, and movement.',
    highlights: [
      'Spatial archive of Beirut before, during, and after rupture',
      'Extends Architecture in Low-Res into navigable media',
      'Treats the city as dream space and evidence field',
      'Connects architectural memory to cinematic interface',
    ],
    relatedSlugs: ['architecture-in-low-res', 'beirut-sonic-map', 'ghost-city-sculpture'],
  },
  'codeverse-explorer': {
    thesis: 'A codebase is also a landscape: paths, clusters, gravity, dead ends, and zones of intensity.',
    shortDescription: 'Codeverse Explorer translates engineering infrastructure into a navigable spatial field.',
    fullDescription: 'The project applies the same relational method used in Storylines and the atlas to software itself. Files and systems become spatial objects, allowing structure to be inspected through position, density, and relation.',
    highlights: [
      '3D explorer for codebase structure',
      'Turns engineering relationships into spatial navigation',
      'A technical sibling to Storylines and Meaning Stack',
      'Makes infrastructure readable without flattening it into a table',
    ],
    relatedSlugs: ['storylines', 'meaning-stack', '99-nodes'],
  },
  '1000-strings-at-rest': {
    thesis: 'A quiet hinge between band, instrument, installation, and memory.',
    shortDescription: '1000 Strings at Rest carries emotional and methodological weight by bridging Mashrou Leila, STTM, and later spatial sound systems.',
    fullDescription: 'Even as an archive-scale work, it behaves like a major connective tissue in the practice: string, body, resonance, and installation held in suspension rather than performance spectacle.',
    highlights: [
      'Links Mashrou Leila, STTM, and DERIVE',
      'Treats strings as spatial and emotional infrastructure',
      'Archive entry with disproportionate conceptual weight',
      'Useful hinge between performance and installation work',
    ],
    relatedSlugs: ['mashrou-leila', 'space-time-tuning-machine', 'derive'],
  },
  'why-were-like-this': {
    thesis: 'A poetic documentary system for diagnosing modern neurosis without flattening it into explanation.',
    shortDescription: "WHY WE'RE LIKE THIS is a scripted video essay series about contemporary psychological weather, synthetic culture, and the systems that make people feel unreal.",
    fullDescription: 'The work sits between documentary, essay film, performance text, and audiovisual therapy. Its case-study role is to show how narrative, voice, and image can behave as a diagnostic interface for cultural mood.',
    highlights: [
      'Poetic documentary series with season scripts complete',
      'Uses voice, image, and essay structure as cultural diagnosis',
      'Connects synthetic media, dream logic, and contemporary neurosis',
      'A moving-image sibling to SIWUE and Cartography of Absence',
    ],
    relatedSlugs: ['sometimes-i-wake-up-elsewhere', 'cartography-of-absence', 'derive'],
  },
  'photon-plus': {
    thesis: 'A browser twin of the Space Time Tuning Machine: the live instrument translated into an interactive web object.',
    shortDescription: 'Photon+ is a grid-based browser instrument that turns STTM\'s subtractive and spatial logic into playable software.',
    fullDescription: 'Built with Web Audio and 3D interface logic, the work carries a performance system into the browser without reducing it to documentation. It is both a tool and a diagram of the original instrument.',
    highlights: [
      'Digital twin of Space Time Tuning Machine',
      'Browser instrument built with Web Audio and 3D interaction',
      'Part of the Meaning Stack software family',
      'Turns subtractive composition into interface behavior',
    ],
    relatedSlugs: ['space-time-tuning-machine', '3d-beat-synth', 'meaning-stack'],
  },
  derive: {
    thesis: 'A navigation system for entropy: finding order in movement, noise, and emerging structure.',
    shortDescription: 'DERIVE is a generative spatial system where memory, sorting, flow fields, and negentropic behavior become navigable forms.',
    fullDescription: 'Across its fragments, DERIVE studies how structure emerges from unstable movement. It belongs to the same family as the atlas: not a static visualization, but a way of moving through complexity until a pattern starts to appear.',
    highlights: [
      'Generative system for movement, memory, and ordering',
      'Uses boids, flow fields, sorting, and topology as visual logic',
      'A bridge between code experiments and spatial thought',
      'Connects directly to Meaning Stack and archive navigation',
    ],
    relatedSlugs: ['meaning-stack', '1000-strings-at-rest', '99-nodes'],
  },
  'resonance-atlas': {
    thesis: 'An atlas of sound as territory: cultural listening mapped through gaps, defaults, and surviving specificity.',
    shortDescription: 'Resonance Atlas maps sonic knowledge embedded in AI music systems across cultural traditions.',
    fullDescription: 'The project turns generated and annotated tracks into research infrastructure for the Localization Gap. It treats missingness as cartographic evidence, showing where models hear, flatten, misrecognize, or erase.',
    highlights: [
      'Research infrastructure for Localization Gap',
      'Maps musical systems as overlapping cultural geographies',
      'Built from generated, annotated, and analyzed tracks',
      'Gives AI music research a cumulative spatial form',
    ],
    relatedSlugs: ['hah-was', 'maqamai', 'tebr', 'arabic-pop-1925-2025'],
  },
  maqamai: {
    thesis: 'An ear-training tool for the modal grammar that AI music systems keep flattening.',
    shortDescription: 'MaqamAI teaches and preserves Arabic maqam as emotional, cultural, and microtonal grammar.',
    fullDescription: 'The project responds to the erasure of quarter-tone and modal structures in AI music generation. It fills the human infrastructure gap between recognizing model failure and actually hearing what is missing.',
    highlights: [
      'Ear-training tool for Arabic maqam',
      'Responds to microtonal erasure in AI music systems',
      'Connects listening practice to model evaluation',
      'A human-scale companion to HAH-WAS and Resonance Atlas',
    ],
    relatedSlugs: ['hah-was', 'resonance-atlas', 'tebr'],
  },
  'music-engines': {
    thesis: 'An audio analysis kernel that turns research intuition into infrastructure.',
    shortDescription: 'music-engines is the backend analysis system powering HAH-WAS, DERIVE, and TEBR research.',
    fullDescription: 'The system extracts features, transcribes, clusters, and persists audio knowledge so larger cultural and generative questions can be asked at scale. It is the quiet engine behind the more visible music-AI systems.',
    highlights: [
      'Async audio analysis infrastructure for AI music research',
      'Supports HAH-WAS, DERIVE, and TEBR pipelines',
      'Built around feature extraction, transcription, embeddings, and graph-like querying',
      'A technical proof of the portfolio methodology at backend scale',
    ],
    relatedSlugs: ['hah-was', 'derive', 'tebr', 'resonance-atlas'],
  },
};

export function getProjectContent(slug: string): ProjectContent | undefined {
  return (GENERATED_PROJECT_CONTENT as Record<string, ProjectContent>)[slug] || PROJECT_CONTENT[slug];
}
