import fs from 'node:fs';
import path from 'node:path';

type Row = Record<string, string>;

const ROOT = process.cwd();
const ATLAS_CSV = path.join(ROOT, 'public/images/atlas/atlas-node-update-FINAL.updated.csv');
const OUTPUT_CSV = path.join(ROOT, 'content/project-master.csv');

const EXTRA_CSV = `Project ID / Name,Tier / Hierarchy,Parent Project ID,Core Thesis / Description,Creation Date / Timeline,Geographic / Spatial Location,Taxonomy / Category,Domains Engaged,Key Entities & Characters,Relationships & Conceptual Patterns,Technological / Tool Stack,Aesthetic Directive
systems-choreography / SYSTEMS CHOREOGRAPHY,Tier 1 [Main],,Generative core methodology framing space time and code as isomorphic logic structures requiring continuous rehearsal.,2024-2026,Digital / Strategic,Methodological Framework / Creative OS,Code|Systems|Space,The Systems Choreographer,Foundational matrix governing MEKENA NYC and Fictive Environments.,Markdown|Algorithmic Constraints,Strategic mapping and procedural diagrams.
fictive-environments / FICTIVE ENVIRONMENTS,Tier 1 [Main],,Primary studio identity using speculative narrative design and fiction as a rigorous executable method for urban architecture.,2025-2026,New York City,Cultural Infrastructure / Systems Design,Space|Code|Text,Studio OS,Parent node for MEKENA NYC Lede.nyc and SIWUE.,Systems Architecture|Bureaucratic Logic,Architectural renderings and stark Walaw mark on black.
mekena-nyc / MEKENA NYC,Tier 1 [Main],fictive-environments,Adaptive reuse of 1920s brick building into a physical operating system providing radical hospitality for diasporic artists.,2025-2026,Long Island City NY,Spatial Environment,Space|Systems,Mekena Lorian,Physical realization of Architectures of Belonging thesis.,IoT Sensors|LiDAR|Raw Concrete,Brutalist subtractive composition with warm amber lighting.
sometimes-i-wake-up-elsewhere / SOMETIMES I WAKE UP ELSEWHERE,Tier 1 [Main],fictive-environments,28000-word autofiction manuscript distributed across a 100-node modular memory architecture tracking temporal debt.,2025-2026,Web / Spatial Archive,Textual System / Hypertext Engine,Text|Code|Systems,Beau|Griffin|Nebucat,Integrates with Cartography of Absence and Mobius Engine.,React|WebGL|Typographic Shaders,Typographic shatter and deterministic visual decay.
lede-nyc / LEDE.NYC,Tier 1 [Main],fictive-environments,Autonomous civic intelligence engine parsing municipal JSON payloads to expose the metropolis as a computable data structure.,2026,Manhattan NY,Civic Infrastructure,Code|Text|Systems,Civic Intelligence Agent,Technical application of Fictive Environments methodology.,Next.js 15|BigQuery|MCP,8px Bento Grid with dark-mode glassmorphism.
tebr / TEBR,Tier 1 [Main],,Solo electronic research persona treating AI failure and microtonal collapse as forensic records of cultural memory.,2024-2026,Digital Network,Diegetic Prototype / Sonic Universe,Sound|Code|Systems,TEBR,Directly utilizes 427 AI Tracks Archive; inputs from STTM.,Ableton|Python|Generative AI,Diasporic Futurism glitch and high-contrast waveforms.
localization-gap / THE LOCALIZATION GAP,Tier 1 [Main],,Forensic systemic audit proving computational colonialism by red-teaming AI music systems for Arabic maqam erasure.,2024,Research / Academic,Systemic Audit,Code|Systems|Sound,Forensic Auditor,Intellectual spine for HAH-WAS FRANK and 427 AI Tracks.,Python|API Pipelines|librosa,Data-forward spectrograms on black background.
427-ai-tracks-archive / 427 AI TRACKS ARCHIVE,Tier 1 [Main],localization-gap,Generative audio evidentiary record mapping failure taxonomies of AI models to prove structural exclusion.,2024,Internal Database,Repository / Data Set,Sound|Code,The Algorithm,Raw material processed by the DERIVE engine.,Suno|Notion API|Python,Dense taxonomic spreadsheets and waveform grids.
meaning-stack / THE MEANING STACK,Tier 1 [Main],,Federated technical architecture modeling culture as a physical dimension through strict sequential processing layers.,2025,GitHub Federation,Methodological Infrastructure,Code|Systems,The Conductor,Foundational code layer governing Lede.nyc TEBR and DERIVE.,MediaPipe|ChromaDB|Python,Network constellation graphs and node connections.
derive / DERIVE,Tier 1 [Main],meaning-stack,Negentropic memory engine modeling trauma retrieval by discarding chronological time for force-directed emotional adjacency.,2024,Digital / Live Environment,Generative Software Engine,Code|Systems|Sound,Drift Algorithm,Software evolution of the physical Space Time Tuning Machine.,Python|ChromaDB|Suno v4,Aesthetic of rupture and Gaussian noise dispersion.
mashrou-leila / MASHROU' LEILA,Tier 1 [Main],,14-year counter-public geopolitical performance vector routing dissent through commercial music to bypass state suppression.,2008-2022,Beirut / Global,Cultural Infrastructure / Performance,Sound|Image|Space|Systems,Mashrou' Leila,Ancestral node driving portfolio's pivot to policy architecture.,Live Performance|Ableton,Theatrical scenography and precarious architectural ruins.
hah-was / HAH-WAS,Tier 1 [Main],localization-gap,Epistemic defense system inverting the Turing test to gamify media literacy and catch cultural hallucinations in AI.,2026,Mobile PWA,Veracity Protocol,Code|Systems|Text,Hallucination Hunter,Definitive veracity shield acting upon the Meaning Stack.,React 19|Gemini 2.5|Max/MSP,Forensic cybernetic UI with diagnostic spectral graphs.
cartography-of-absence / THE CARTOGRAPHY OF ABSENCE,Tier 1 [Main],,Bureaucratic surrealism project weaponizing clinical administrative forms to document the emotional dimensions of exile.,2024,Print / Archival,Textual System,Text|Systems,The Composite Tongue,Structurally integrated with SIWUE and SparrowOS mythology.,Typography|Bureaucratic Forms,Redacted impossible visa applications and medical intake forms.
cost-of-being-queer-and-arab / COST OF BEING QUEER AND ARAB,Tier 1 [Main],mashrou-leila,Institutional vulnerability manifesto outlining the precise threshold where public visibility becomes physical risk.,2020,The New York Times,Advocacy Framework,Text|Image|Systems,Advocacy Network,Catalyst for MEKENA NYC sanctuary architecture.,Editorial Synthesis,Clean typography rendering dense political manifestos.
99-nodes / 99 NODES SPATIAL ENGINE,Tier 1 [Main],,Negentropic cartography engine rendering 14 years of creative capital as a navigable WebGL Cartesian grid.,2026,Walaw Studio Archive,Spatial Environment / Strategic Graph,Space|Code|Systems,Digital Twin,Master meta-project encapsulating all portfolio entities.,Three.js|React Three Fiber,Spatial Z-axis hierarchies in a navigable virtual cylinder.
space-time-tuning-machine / SPACE TIME TUNING MACHINE,Tier 2,,Diegetic somatic hardware instrument translating live kinetic movement into generative dialogue with AI agents.,2021,Broad Museum LA,Hardware System,Sound|Space|Systems,Biological Conductor,Physical somatic predecessor to the DERIVE software engine.,Hacked Electronics|Max/MSP,Scrap hardware bricolage and raw wiring.
kardia / KARDIA,Tier 2,,Somatic biofeedback synthesizer guiding the autonomic nervous system from chaos to harmony via the Iso-Principle.,2021,Therapeutic Trials,Body-Signal Interface,Code|Sound|Systems,The Patient,Somatic relief matrix linked to the Body Maintenance Log.,React Native|AudioKit,Heart rate abstraction mapped into fluid waveform textures.
3d-beat-synth / 3D-BEAT-SYNTH,Tier 2,meaning-stack,Zero-hardware spatial orchestrator interface utilizing machine vision to turn human hands into invisible tuning forks.,2025,Web Browser,Interactive WebGL Instrument,Code|Sound|Image,The User,Foundational input mechanism for Meaning Stack sensorium.,MediaPipe|WebGL|Web Audio,Spatial node interfaces floating in pitch-black 3D space.
storylines / STORYLINES,Tier 2,,Relational knowledge graph applying physics engines to semantic data to visualize emotional adjacencies in literature.,2024,Web Portals,Spatial Interface,Code|Text|Image,Semantic Nodes,Visualization architecture traversing SIWUE and The Labyrinth.,React 19|Three.js|Rapier,Gravitational semantic clustering in 3D constellations.
mobius-engine / THE MOBIUS ENGINE,Tier 2,sometimes-i-wake-up-elsewhere,Non-Euclidean cognitive processor tracking Temporal Debt to trigger violent state inversions across narrative interfaces.,2025,SIWUE Backend,Logical Framework,Code,The Traumatized Subject,Absolute backend logic dictating the SIWUE digital experience.,Python|Topological Logic,Fractured topology diagrams and recursive logic loops.
codeverse-explorer / CODEVERSE EXPLORER,Tier 2,,MRI for codebases utilizing AST parsing to translate flat text files into structurally navigable dependency galaxies.,2025,Technical Archives,3D Visualization Tool,Code|Systems|Space,Software Architect,Translates STORYLINES spatial relational methods into engineering.,Three.js|AST Parsing,Acetate-layer depth navigation and spatial code blocks.
frank / FRANK,Tier 2,localization-gap,Textual media bias detector extending forensic auditing to expose structural assumptions in journalistic framing.,2026,Journalism Watchdogs,Analytical Tool,Code|Systems,Media Auditor,Textual counterpart to the HAH-WAS audio veracity protocol.,Python|NLP|LLMs,Comparative textual markup and hallucination highlight UI.
sparrowos / SPARROWOS,Tier 2,sometimes-i-wake-up-elsewhere,Speculative avian bureaucracy and surveillance mythology tracking the transparency decay of displaced subjects.,2025,Digital Narrative,Mythological Framework,Text|Systems,Avian Bureaucrats,Primary antagonistic framework across textual portfolio.,Textual Lore|UI Design,Glitch-logs and clinical absurd surveillance readouts.
archive-of-unwritten-songs / ARCHIVE OF UNWRITTEN SONGS,Tier 2,,Generative audio scroll deliberately restricting AI from completing musical phrases to visualize the negative space of loss.,2024,Web Platform,Generative Audio Project,Sound|Code,Fragmented Memories,Poetic subtractive counterpart to the 427 AI Tracks Archive.,Generative AI|Infinite Scroll,Empty notation staves and infinite generative decay.
sunburn / SUNBURN,Tier 2,,Climate data sonification translating invisible urban weather telemetry into inescapable somatic acoustic environments.,2026,Public Installations,Spatial Installation,Sound|Space,The Climate,Spatial application of Systems Choreography data routing.,Urban APIs|Max/MSP,Meteorological data mapping superimposed on urban structures.
autopsy-beirut-phantom / THE AUTOPSY / BEIRUT PHANTOM,Tier 2,,Recursive gamified simulation loop demanding active classification of low-resolution post-conflict urban fragments.,2024,Speculative Portals,Spatial Media / Simulation,Space|Image|Systems,The Researcher,Expands Architecture in Low Res thesis into interactive media.,Game Engines|3D Models,Fragmented photogrammetry and chronological glitching.
nebucat / NEBUCAT,Tier 2,sometimes-i-wake-up-elsewhere,Conceptual avatar representing an anti-optimization cynic guide navigating the bureaucratic digital afterlife.,2020,Digital Networks,Character Design / Avatar,Text|Image,Nebucat|Beau|Griffin,Somatic character anchor within SIWUE and SparrowOS.,Digital Illustration,Nebular feline glitch rendering.
diasporic-blueprints / DIASPORIC BLUEPRINTS,Tier 2,,Computational framework translating architectural forms from the Global South into generative algorithms.,2024,Research Labs,Academic Research,Space|Code,Sarah Chen (Lead),Informing spatial logic for scalable urban settlements.,Rhino|Grasshopper|Python,Modular joints and sustainable growth patterns.
algorithmic-vernacular / ALGORITHMIC VERNACULAR,Tier 2,,Software toolkit suggesting sustainable local material alternatives based on machine learning analysis of traditional techniques.,2024,Research Labs,Software Toolkit,Code|Space|Systems,Marcus Thorne (Lead),Complements Diasporic Blueprints for physical assembly logic.,Machine Learning|Material APIs,Material cross-sections and data-driven schematics.
architecture-in-low-res / ARCHITECTURE IN LOW RES,Tier 3 [Archival],,Foundational academic thesis establishing that systemic breakdown and low resolution authentically represent diasporic reality.,2015,The Bartlett UCL,Academic Thesis,Space|Image|Text,Spatial Theorist,Seed crystal setting conditions for all later code-based decay logic.,Architectural Text|Renders,Deliberate low-resolution rendering of structural ruin.
project-zero / PROJECT ZERO,Tier 3 [Archival],,Speculative protocol establishing civic stillness as an active architectural constraint to prevent human capital consumption.,2026,Civic Institutions,Civic Protocol,Systems|Code,Civic Body,Parallels the physical isolation Black Room in MEKENA NYC.,Policy Logic|Pseudocode,Blank institutional forms denoting programmed absence.
1000-strings-at-rest / 1000 STRINGS AT REST,Tier 3 [Archival],,Multimedia sound sculpture mapping negative space via unplayed tensioned instruments to quantify geographic distance.,2022,Gallery Spaces,Spatial Installation,Sound|Space|Image,The Exiled Musician,Conceptual inverse to Mashrou' Leila mass public amplification.,Unplayed Instruments,Immersive silent architecture composed of taut strings.
body-maintenance-log / BODY MAINTENANCE LOG,Tier 3 [Archival],cartography-of-absence,Personal medical ledger mapping the physical fading of corporeal opacity due to bureaucratic violence.,2021,Personal Archive,Document Art,Text|Systems,The Fading Subject,Narrative precursor to the physiological repairs of KARDIA.,Visa Forms|Medical Records,Clinical aesthetics of state tracking layered with ink.
kaboos-kaleidoscope / KABOOS (KALEIDOSCOPE),Tier 3 [Archival],,Early undergraduate stop-motion visual work utilizing repetition and fragmentation to structure the nightmare.,2009,Beirut Lebanon,Stop-Motion Animation,Image,The Dreamer,Precursor to digital glitch and non-Euclidean looping loops.,Stop-Motion|Photography,Fragmented kaleidoscopic handmade visuals.
lilly-doesnt-care-anymore / LILLY DOESN'T CARE ANYMORE,Tier 3 [Archival],kaboos-kaleidoscope,Early 2D stop-motion experiment exploring character indifference and emotional refusal as a formal aesthetic quality.,2008,Beirut Lebanon,2D Animation,Image,Lilly,Earliest exploration of character-driven anti-optimization.,2D Animation|Stop-Motion,Rough charming hand-drawn frames rejecting legibility.
walaw-studio / WALAW STUDIO,Tier 3 [Archival],fictive-environments,Legacy placeholder and origin manifesto defining the practice. Slated for renaming and completely deprecated.,2021,New York City,Foundational Text / Legacy,Text|Systems,Walaw Studio,Replaced functionally and aesthetically by Fictive Environments.,Manifesto,The Arabic letter waw as a visual heartbeat spike.`;

const PROJECT_DOC_SLUGS: Record<string, string> = {
  derive: 'project-docs/01-DERIVE.md',
  'space-time-tuning-machine': 'project-docs/02-STTM.md',
  storylines: 'project-docs/03-STORYLINES.md',
  'mashrou-leila': 'project-docs/04-MASHROU-LEILA.md',
  'mekena-nyc': 'project-docs/05-MEKENA-NYC.md',
  'cartography-of-absence': 'project-docs/06-CARTOGRAPHY-OF-ABSENCE.md',
  'hah-was': 'project-docs/07-HAH-WAS.md',
  '3d-beat-synth': 'project-docs/08-3D-BEAT-SYNTH.md',
  'sometimes-i-wake-up-elsewhere': 'project-docs/09-SIWUE.md',
  tebr: 'project-docs/10-TEBR.md',
  'resonance-atlas': 'project-docs/11-RESONANCE-ATLAS.md',
  maqamai: 'project-docs/12-MAQAMAI.md',
  'autopsy-beirut-phantom': 'project-docs/13-AUTOPSY-BEIRUT-PHANTOM.md',
  'why-were-like-this': 'project-docs/14-WHY-WERE-LIKE-THIS.md',
  'photon-plus': 'project-docs/15-PHOTON-PLUS.md',
  'codeverse-explorer': 'project-docs/16-CODEVERSE-EXPLORER.md',
  kardia: 'project-docs/17-KARDIA.md',
  'music-engines': 'project-docs/18-MUSIC-ENGINES.md',
  'architecture-in-low-res': 'project-docs/19-ARCHITECTURE-IN-LOW-RES.md',
  '1000-strings-at-rest': 'project-docs/20-1000-STRINGS-AT-REST.md',
};

const KNOWN_PARENTS: Record<string, string> = {
  'rolling-stone-cover': 'mashrou-leila',
  'ibn-el-leil-album': 'mashrou-leila',
  'raasuk-album': 'mashrou-leila',
  'el-hal-romancy': 'mashrou-leila',
  'stage-architecture': 'mashrou-leila',
  'cost-of-being-queer-and-arab': 'mashrou-leila',
  'yo-yo-ma-collaboration': 'mashrou-leila',
  'fasateen-mv': 'mashrou-leila',
  'raksit-leila-mv': 'mashrou-leila',
  'roman-video': 'mashrou-leila',
  'cavalry-mv': 'mashrou-leila',
  'radio-romance-mv': 'mashrou-leila',
  'aoede-mv': 'mashrou-leila',
  '3-minutes-mv': 'mashrou-leila',
  'lil-watan-mv': 'mashrou-leila',
  'barbican-release': 'mashrou-leila',
  'shim-el-yasmeen': 'mashrou-leila',
  'the-beirut-school-album': 'mashrou-leila',
  'localization-gap': 'resonance-atlas',
  '427-ai-tracks-archive': 'localization-gap',
  frank: 'localization-gap',
  maqamai: 'localization-gap',
  'arabic-pop-1925-2025': 'localization-gap',
  'sometimes-i-wake-up-elsewhere': 'fictive-environments',
  'mobius-engine': 'sometimes-i-wake-up-elsewhere',
  nebucat: 'sometimes-i-wake-up-elsewhere',
  'bureaucratic-surrealism': 'cartography-of-absence',
  'body-maintenance-log': 'cartography-of-absence',
  'walaw-manifesto': 'fictive-environments',
  'walaw-studio': 'fictive-environments',
  'lede-nyc': 'fictive-environments',
  'new-york-voices': 'fictive-environments',
  'people-like-us-podcast': 'fictive-environments',
  'mekena-nyc': 'fictive-environments',
  menara: 'mekena-nyc',
  'architectures-of-belonging': 'mekena-nyc',
  'derive': 'meaning-stack',
  'photon-plus': 'space-time-tuning-machine',
  'telescode': 'codeverse-explorer',
  'autopsy-beirut-phantom': 'architecture-in-low-res',
  'ghost-city': 'architecture-in-low-res',
  'bourj-hammoud-thesis': 'architecture-in-low-res',
  'map-of-the-wound': 'architecture-in-low-res',
  '2006-reconstruction': 'architecture-in-low-res',
  'post-conflict-urbanism': 'architecture-in-low-res',
  '1000-strings-at-rest': 'space-time-tuning-machine',
};

const TAXONOMY_BY_DOMAIN: Record<string, string> = {
  sound: 'Sonic System / Listening Infrastructure',
  image: 'Visual System / Evidence Field',
  text: 'Textual System / Narrative Architecture',
  code: 'Software System / Computational Interface',
  space: 'Spatial Environment / Architectural System',
  systems: 'Methodological Infrastructure / Protocol',
};

function parseCsv(text: string): Row[] {
  const lines = text.trim().split(/\r?\n/);
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).filter(Boolean).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
  });
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

function toCsv(rows: Row[], headers: string[]) {
  return [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => quoteCsv(row[header] || '')).join(',')),
  ].join('\n') + '\n';
}

function quoteCsv(value: string) {
  const clean = String(value).replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  if (/[",\n]/.test(clean)) return `"${clean.replace(/"/g, '""')}"`;
  return clean;
}

function slugFromProjectIdName(value: string) {
  return value.split('/')[0].trim();
}

function titleFromSlug(slug: string) {
  return slug
    .split('-')
    .map((part) => (part.length <= 3 ? part.toUpperCase() : part[0].toUpperCase() + part.slice(1)))
    .join(' ');
}

function readIfExists(relativePath: string) {
  const absolute = path.join(ROOT, relativePath);
  return fs.existsSync(absolute) ? fs.readFileSync(absolute, 'utf8') : '';
}

function parseMarkdownProject(slug: string) {
  const projectMd = readIfExists(`content/projects/${slug}/project.md`);
  if (!projectMd) return {};
  return {
    title: firstHeading(projectMd),
    thesis: section(projectMd, 'Thesis'),
    shortDescription: section(projectMd, 'Short Description'),
    fullDescription: section(projectMd, 'Full Description'),
    relatedProjects: section(projectMd, 'Related Projects').replace(/^- /gm, '').replace(/\n/g, '|'),
  };
}

function firstHeading(markdown: string) {
  return (markdown.match(/^#\s+(.+)$/m)?.[1] || '').trim();
}

function section(markdown: string, heading: string) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = markdown.match(new RegExp(`^##\\s+${escaped}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, 'm'));
  return (match?.[1] || '').trim();
}

function parseProjectDoc(slug: string) {
  const docPath = PROJECT_DOC_SLUGS[slug];
  if (!docPath) return {};
  const markdown = readIfExists(docPath);
  if (!markdown) return {};
  const tier = markdown.match(/\*\*Tier:\*\*\s*([^\n]+)/)?.[1]?.trim() || '';
  const type = markdown.match(/\*\*Type:\*\*\s*([^\n]+)/)?.[1]?.trim() || '';
  const status = markdown.match(/\*\*Status:\*\*\s*([^\n]+)/)?.[1]?.trim() || '';
  const stack = markdown.match(/\*\*Stack:\*\*\s*([^\n]+)/)?.[1]?.trim().replace(/\s*·\s*/g, '|') || '';
  return { docPath, docTier: tier, docType: type, docStatus: status, docStack: stack };
}

function normalizeTier(atlasTier: string, overrideTier = '') {
  if (overrideTier) return overrideTier;
  if (atlasTier === 'lead') return 'Tier 1 [Main]';
  if (atlasTier === 'secondary') return 'Tier 2';
  return 'Tier 3 [Archival]';
}

function roleFor(row: Row, hasOverride: boolean) {
  if (row['hasProjectPage'] === 'yes') return 'Authored Work Page';
  if (hasOverride && row['tier'] === 'lead') return 'Atlas Gravity Anchor';
  if (row['tier'] === 'lead') return 'Main Atlas Anchor';
  if (row['tier'] === 'secondary') return 'Satellite / Relational System';
  return 'Archive / Lineage Node';
}

function taxonomyFor(row: Row, override = '') {
  if (override) return override;
  const domains = splitPipes(row.domains);
  if (domains.length > 1 && domains.includes('systems')) return 'Cross-Domain Systems Node';
  return TAXONOMY_BY_DOMAIN[domains[0]] || 'Archive Record';
}

function domainsFor(row: Row, override = '') {
  if (override) return override;
  return splitPipes(row.domains).map((item) => item[0]?.toUpperCase() + item.slice(1)).join('|');
}

function splitPipes(value = '') {
  return value.split('|').map((item) => item.trim()).filter(Boolean);
}

function relationships(row: Row, parent: string, override = '') {
  const parts = [override, parent ? `Parent: ${parent}` : '', row.connections ? `Atlas links: ${row.connections}` : ''].filter(Boolean);
  return [...new Set(parts)].join(' ');
}

function sourceFiles(slug: string, hasOverride: boolean, hasProjectContent: boolean, docPath = '') {
  const files = ['public/images/atlas/atlas-node-update-FINAL.updated.csv'];
  if (hasOverride) files.push('user-supplied hierarchy table');
  if (hasProjectContent) files.push(`content/projects/${slug}/project.md`, `content/projects/${slug}/gallery.csv`);
  if (docPath) files.push(docPath);
  files.push('docs/source-materials/*');
  return files.join('|');
}

function contentNextStep(row: Row, hasProjectContent: boolean) {
  if (hasProjectContent) return 'Maintain as authored work rail; refine final copy/media only.';
  if (row.hasProjectPage === 'yes') return 'Create or reconcile missing project folder before treating as public case study.';
  if (row.tier === 'lead') return 'Decide whether this anchor deserves a full project rail or remains atlas-only.';
  if (row.tier === 'secondary') return 'Keep as relational satellite unless documentation depth increases.';
  return 'Keep as archive lineage record; only expand if needed for narrative continuity.';
}

const atlasRows = parseCsv(fs.readFileSync(ATLAS_CSV, 'utf8'));
const extraRows = parseCsv(EXTRA_CSV);
const extraBySlug = new Map(extraRows.map((row) => [slugFromProjectIdName(row['Project ID / Name']), row]));

const outputRows = atlasRows.map((atlas) => {
  const slug = atlas.id;
  const extra = extraBySlug.get(slug);
  const project = parseMarkdownProject(slug);
  const bible = parseProjectDoc(slug) as Record<string, string>;
  const hasProjectContent = Boolean(project.thesis || project.shortDescription || project.fullDescription);
  const parent = extra?.['Parent Project ID'] || KNOWN_PARENTS[slug] || '';
  const title = extra?.['Project ID / Name']?.split('/')[1]?.trim() || project.title || atlas.title || titleFromSlug(slug);
  const thesis = extra?.['Core Thesis / Description'] || project.thesis || project.shortDescription || atlas.summary;
  const stack = extra?.['Technological / Tool Stack'] || bible.docStack || atlas.stack;
  const taxonomy = taxonomyFor(atlas, extra?.['Taxonomy / Category']);
  const hasOverride = Boolean(extra);

  return {
    order: atlas.order,
    project_id: slug,
    project_name: title,
    tier_hierarchy: normalizeTier(atlas.tier, extra?.['Tier / Hierarchy']),
    atlas_tier: atlas.tier,
    portfolio_role: roleFor(atlas, hasOverride),
    parent_project_id: parent,
    core_thesis_description: thesis,
    creation_date_timeline: extra?.['Creation Date / Timeline'] || atlas.year,
    geographic_spatial_location: extra?.['Geographic / Spatial Location'] || inferLocation(slug, atlas),
    taxonomy_category: taxonomy,
    domains_engaged: domainsFor(atlas, extra?.['Domains Engaged']),
    key_entities_characters: extra?.['Key Entities & Characters'] || inferEntities(slug, title),
    relationships_conceptual_patterns: relationships(atlas, parent, extra?.['Relationships & Conceptual Patterns']),
    technological_tool_stack: stack,
    aesthetic_directive: extra?.['Aesthetic Directive'] || inferAesthetic(atlas, taxonomy),
    atlas_connections: atlas.connections,
    image_path: atlas.image,
    has_project_page: atlas.hasProjectPage,
    authored_content_status: hasProjectContent ? 'authored project material present' : 'atlas-only or source-material record',
    source_confidence: hasOverride && hasProjectContent ? 'high' : hasOverride || hasProjectContent || bible.docPath ? 'medium-high' : 'atlas-derived',
    source_files: sourceFiles(slug, hasOverride, hasProjectContent, bible.docPath),
    content_next_step: contentNextStep(atlas, hasProjectContent),
  };
});

const extraMissingAtlas = extraRows
  .map((row) => slugFromProjectIdName(row['Project ID / Name']))
  .filter((slug) => !atlasRows.some((atlas) => atlas.id === slug));

const extraOnlyRows = extraRows
  .filter((row) => extraMissingAtlas.includes(slugFromProjectIdName(row['Project ID / Name'])))
  .map((extra, index) => {
    const slug = slugFromProjectIdName(extra['Project ID / Name']);
    const title = extra['Project ID / Name']?.split('/')[1]?.trim() || titleFromSlug(slug);
    const domains = extra['Domains Engaged'] || '';
    const pseudoAtlas = {
      order: String(atlasRows.length + index + 1),
      id: slug,
      title,
      year: extra['Creation Date / Timeline'] || '',
      tier: extra['Tier / Hierarchy']?.includes('Tier 1') ? 'lead' : extra['Tier / Hierarchy']?.includes('Tier 2') ? 'secondary' : 'archive',
      domains: domains.toLowerCase(),
      stack: extra['Technological / Tool Stack'] || '',
      connections: '',
      image: '',
      hasProjectPage: 'no',
      summary: extra['Core Thesis / Description'] || '',
    };

    return {
      order: pseudoAtlas.order,
      project_id: slug,
      project_name: title,
      tier_hierarchy: extra['Tier / Hierarchy'] || normalizeTier(pseudoAtlas.tier),
      atlas_tier: 'not in atlas csv',
      portfolio_role: 'Source-Level Master Record / Pending Atlas Inclusion',
      parent_project_id: extra['Parent Project ID'] || KNOWN_PARENTS[slug] || '',
      core_thesis_description: extra['Core Thesis / Description'] || '',
      creation_date_timeline: extra['Creation Date / Timeline'] || '',
      geographic_spatial_location: extra['Geographic / Spatial Location'] || '',
      taxonomy_category: extra['Taxonomy / Category'] || taxonomyFor(pseudoAtlas),
      domains_engaged: domains,
      key_entities_characters: extra['Key Entities & Characters'] || inferEntities(slug, title),
      relationships_conceptual_patterns: extra['Relationships & Conceptual Patterns'] || '',
      technological_tool_stack: extra['Technological / Tool Stack'] || '',
      aesthetic_directive: extra['Aesthetic Directive'] || inferAesthetic(pseudoAtlas, extra['Taxonomy / Category'] || ''),
      atlas_connections: '',
      image_path: '',
      has_project_page: 'no',
      authored_content_status: 'extra hierarchy record; not present in atlas CSV',
      source_confidence: 'user-supplied',
      source_files: 'user-supplied hierarchy table|docs/source-materials/*',
      content_next_step: 'Decide whether to add to atlas CSV or keep as master-only reference node.',
    };
  });

outputRows.push(...extraOnlyRows);

const knownOutputSlugs = new Set(outputRows.map((row) => row.project_id));
const contentProjectSlugs = fs
  .readdirSync(path.join(ROOT, 'content/projects'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((slug) => !knownOutputSlugs.has(slug));

const contentOnlyRows = contentProjectSlugs.map((slug, index) => {
  const project = parseMarkdownProject(slug);
  const bible = parseProjectDoc(slug) as Record<string, string>;
  const pseudoAtlas = {
    order: String(outputRows.length + index + 1),
    id: slug,
    title: project.title || titleFromSlug(slug),
    year: '',
    tier: bible.docTier?.toLowerCase().includes('lead') ? 'lead' : bible.docTier?.toLowerCase().includes('archive') ? 'archive' : 'secondary',
    domains: inferDomainsFromProject(slug, `${project.thesis || ''} ${project.shortDescription || ''} ${bible.docType || ''}`).join('|'),
    stack: bible.docStack || '',
    connections: project.relatedProjects || '',
    image: '',
    hasProjectPage: 'yes',
    summary: project.thesis || project.shortDescription || '',
  };
  const parent = KNOWN_PARENTS[slug] || '';
  const taxonomy = taxonomyFor(pseudoAtlas, bible.docType);

  return {
    order: pseudoAtlas.order,
    project_id: slug,
    project_name: project.title || titleFromSlug(slug),
    tier_hierarchy: normalizeTier(pseudoAtlas.tier),
    atlas_tier: 'not in atlas csv',
    portfolio_role: 'Authored Work Page / Pending Atlas Inclusion',
    parent_project_id: parent,
    core_thesis_description: project.thesis || project.shortDescription || '',
    creation_date_timeline: '',
    geographic_spatial_location: inferLocation(slug, pseudoAtlas),
    taxonomy_category: taxonomy,
    domains_engaged: domainsFor(pseudoAtlas),
    key_entities_characters: inferEntities(slug, project.title || titleFromSlug(slug)),
    relationships_conceptual_patterns: relationships(pseudoAtlas, parent),
    technological_tool_stack: bible.docStack || pseudoAtlas.stack,
    aesthetic_directive: inferAesthetic(pseudoAtlas, taxonomy),
    atlas_connections: '',
    image_path: '',
    has_project_page: 'yes',
    authored_content_status: 'authored project material present; not present in atlas CSV',
    source_confidence: 'medium-high',
    source_files: sourceFiles(slug, false, true, bible.docPath),
    content_next_step: 'Add this authored work to atlas CSV or intentionally mark as non-atlas case study.',
  };
});

outputRows.push(...contentOnlyRows);

if (extraMissingAtlas.length) {
  console.warn(`Extra hierarchy rows not present in atlas CSV: ${extraMissingAtlas.join(', ')}`);
}

if (contentProjectSlugs.length) {
  console.warn(`Authored project folders not present in atlas CSV: ${contentProjectSlugs.join(', ')}`);
}

const headers = [
  'order',
  'project_id',
  'project_name',
  'tier_hierarchy',
  'atlas_tier',
  'portfolio_role',
  'parent_project_id',
  'core_thesis_description',
  'creation_date_timeline',
  'geographic_spatial_location',
  'taxonomy_category',
  'domains_engaged',
  'key_entities_characters',
  'relationships_conceptual_patterns',
  'technological_tool_stack',
  'aesthetic_directive',
  'atlas_connections',
  'image_path',
  'has_project_page',
  'authored_content_status',
  'source_confidence',
  'source_files',
  'content_next_step',
];

fs.writeFileSync(OUTPUT_CSV, toCsv(outputRows, headers));
console.log(`Wrote ${outputRows.length} rows to ${path.relative(ROOT, OUTPUT_CSV)}`);

function inferLocation(slug: string, row: Row) {
  if (/beirut|aub|bourj|leila|fasateen|raksit|roman/.test(slug)) return 'Beirut / Lebanon / Global';
  if (/nyc|new-york|mekena|lede|people-like-us/.test(slug)) return 'New York City';
  if (/bartlett|barbican/.test(slug)) return 'London';
  if (/broad|los-angeles|1000-strings/.test(slug)) return 'Los Angeles';
  if (/met|vessel-orchestra/.test(slug)) return 'New York / Metropolitan Museum of Art';
  return row.year ? 'Digital / Archive' : 'Archive';
}

function inferEntities(slug: string, title: string) {
  if (/mashrou|leila|album|mv|rolling-stone|concert|festival/.test(slug)) return "Mashrou' Leila|Audience|Counter-public";
  if (/tebr|maqam|arabic|localization|hah|frank|427|resonance/.test(slug)) return 'Forensic Auditor|Model Output|Cultural Signal';
  if (/siwue|elsewhere|cartography|mobius|nebucat|body-maintenance|bureaucratic/.test(slug)) return 'Displaced Subject|Witness|Archive Voice';
  if (/mekena|fictive|walaw|lede|new-york|people-like-us/.test(slug)) return 'Studio OS|Civic Body|Cultural Infrastructure';
  if (/derive|meaning|photon|codeverse|storylines|telescode/.test(slug)) return 'The Conductor|Semantic Nodes|System Memory';
  if (/architecture|beirut|ghost|bourj|post-conflict|map/.test(slug)) return 'Spatial Researcher|City Fragment|Digital Proxy';
  return title;
}

function inferAesthetic(row: Row, taxonomy: string) {
  const domains = splitPipes(row.domains);
  if (domains.includes('sound')) return 'Black-field sonic evidence: waveforms, spectrograms, instrument residue, and controlled signal decay.';
  if (domains.includes('space')) return 'Architectural evidence field: plans, low-resolution fragments, spatial axes, and austere black-ground presentation.';
  if (domains.includes('text')) return 'Typographic archive: forms, dossiers, redactions, marginalia, and controlled document degradation.';
  if (domains.includes('code')) return 'Computational interface: constellation graphs, procedural diagrams, terminal-like precision, and restrained motion.';
  if (taxonomy.includes('Systems')) return 'Systems diagramming: relational maps, protocols, matrices, and visible dependency structure.';
  return 'Archive record treatment: concise artifact image, thin-line label, and relational context over decorative polish.';
}

function inferDomainsFromProject(slug: string, text: string) {
  const sample = `${slug} ${text}`.toLowerCase();
  const domains: string[] = [];
  if (/sound|audio|music|sonic|listening|hrv|synth/.test(sample)) domains.push('sound');
  if (/space|architecture|building|urban|city|installation/.test(sample)) domains.push('space');
  if (/text|writing|essay|documentary|narrative|manuscript|story/.test(sample)) domains.push('text');
  if (/code|software|browser|web|api|pipeline|engine|interface|kernel/.test(sample)) domains.push('code');
  if (/image|visual|video|film|photogrammetry/.test(sample)) domains.push('image');
  domains.push('systems');
  return [...new Set(domains)];
}
