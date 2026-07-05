/**
 * Project Worlds — The six thematic eras of the Papazian Archive.
 * Extracted from Overlay.tsx to serve as the canonical data-layer source.
 */

export interface ProjectWorld {
  id: string;
  name: string;
  roman: string;
  systems: string;
  definition: string;
  slugs: string[];
}

export const WORLDS: ProjectWorld[] = [
  {
    id: 'foundation-world',
    name: 'FOUNDATION',
    roman: '01',
    systems: 'Image · Space · Breakdown',
    definition: 'Early architectural and visual thinking.',
    slugs: ['architecture-in-low-res', 'cartography-of-absence']
  },
  {
    id: 'public-culture-world',
    name: 'PUBLIC CULTURE',
    roman: '02',
    systems: 'Stage · Audience · Risk',
    definition: 'The cultural infrastructure era.',
    slugs: ['mashrou-leila', 'why-were-like-this']
  },
  {
    id: 'exile-machines-world',
    name: 'EXILE MACHINES',
    roman: '03',
    systems: 'Sound · Memory · Performance',
    definition: 'The post-band performance and instrument-building era.',
    slugs: ['space-time-tuning-machine', 'tebr', 'chronocumulator', 'the-weather-rehearsal']
  },
  {
    id: 'memory-interfaces-world',
    name: 'MEMORY INTERFACES',
    roman: '04',
    systems: 'Text · Archive · Navigation',
    definition: 'The literary and hypertext systems era.',
    slugs: ['sometimes-i-wake-up-elsewhere', 'derive', 'storylines', '99-nodes']
  },
  {
    id: 'sonic-intelligence-world',
    name: 'SONIC INTELLIGENCE',
    roman: '05',
    systems: 'AI · Listening · Cultural Bias',
    definition: 'The research and AI-audit era.',
    slugs: ['hah-was', 'maqamai', 'meaning-stack', 'localization-gap']
  },
  {
    id: 'spatial-futures-world',
    name: 'SPATIAL FUTURES',
    roman: '06',
    systems: 'Shelter · Code · Infrastructure',
    definition: 'The outward-facing infrastructure era.',
    slugs: ['mekena-nyc', 'codeverse-explorer', 'systems-choreography', 'fictive-environments']
  }
];

export const WORLD_NAMES = WORLDS.map(w => w.name);

/** Look up the world a project belongs to by slug. */
export const getProjectWorld = (slug: string): ProjectWorld | null => {
  return WORLDS.find(w => w.slugs.includes(slug)) || null;
};

/** Get all slugs assigned to a specific world. */
export const getWorldSlugs = (worldId: string): string[] => {
  return WORLDS.find(w => w.id === worldId)?.slugs || [];
};

/** World accent colors for cluster labels and filter chips. */
export const WORLD_COLORS: Record<string, string> = {
  'foundation-world': '#d5a2a2',       // Rose (text domain)
  'public-culture-world': '#d7e7ef',   // Cool white (image domain)
  'exile-machines-world': '#9fd6bf',    // Sage (sound domain)
  'memory-interfaces-world': '#c7b28a',// Sand (space domain)
  'sonic-intelligence-world': '#7aa6ff',// Steel (code domain)
  'spatial-futures-world': '#8fa8c2',   // Slate (systems domain)
};

/** Get the accent color for a world. */
export const getWorldColor = (worldId: string): string => {
  return WORLD_COLORS[worldId] || '#d7e7ef';
};
