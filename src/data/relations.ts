export type RelationType =
  | 'lineage'
  | 'method'
  | 'material'
  | 'theme'
  | 'infrastructure'
  | 'public-consequence';

export type RelationWeight = 1 | 2 | 3;
export type RelationVisibility = 'overview' | 'neighborhood' | 'deep';

export interface RelationDetail {
  type: RelationType;
  typeName: string;
  claim: string;
  weight?: RelationWeight;
  directionality?: 'directed' | 'bidirectional';
  visibilityLevel?: RelationVisibility;
  evidenceRecordIds?: string[];
  isCurated?: boolean;
}

export interface AtlasRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  typeName: string;
  label: string;
  description: string;
  weight: RelationWeight;
  directionality: 'directed' | 'bidirectional';
  visibilityLevel: RelationVisibility;
  evidenceRecordIds?: string[];
  isCurated: boolean;
}

export const RELATION_TYPES_MAP: Record<RelationType, string> = {
  lineage: 'Lineage & Evolution',
  method: 'Method Transfer',
  material: 'Material Continuity',
  theme: 'Thematic Thread',
  infrastructure: 'Technical Infrastructure',
  'public-consequence': 'Public Consequence',
};

/** Visual encoding for each relation type in Maps mode */
export const RELATION_LINE_STYLES: Record<RelationType, { style: 'solid' | 'dashed' | 'dotted'; opacityMultiplier: number; widthMultiplier: number }> = {
  lineage: { style: 'solid', opacityMultiplier: 1.0, widthMultiplier: 1.0 },
  method: { style: 'dashed', opacityMultiplier: 0.9, widthMultiplier: 1.0 },
  material: { style: 'dotted', opacityMultiplier: 0.85, widthMultiplier: 1.0 },
  theme: { style: 'solid', opacityMultiplier: 0.4, widthMultiplier: 0.6 },
  infrastructure: { style: 'solid', opacityMultiplier: 1.0, widthMultiplier: 1.8 },
  'public-consequence': { style: 'solid', opacityMultiplier: 1.0, widthMultiplier: 1.2 },
};

// Map of [sourceSlug][targetSlug] -> RelationDetail
// Note: Since relationships are mutual/bi-directional in many places, we can look up bi-directionally.
const RELATION_DETAILS_RAW: Record<string, Record<string, Omit<RelationDetail, 'typeName'>>> = {
  "space-time-tuning-machine": {
    "derive": {
      type: "method",
      claim: "This relation represents the technique of translating raw, somatic kinetic bow signals into localized, associative vector-database search queries.",
      weight: 2,
      directionality: "bidirectional",
      visibilityLevel: "neighborhood",
    },
    "tebr": {
      type: "material",
      claim: "Links somatic microtonal physical bow interfaces to the digital feedback loops and dust composition parameters of TEBR.",
      weight: 3,
      directionality: "directed",
      visibilityLevel: "overview",
    },
    "mashrou-leila": {
      type: "lineage",
      claim: "Traces the structural evolution from collective public performance into solitary somatic instrument design.",
      weight: 3,
      directionality: "directed",
      visibilityLevel: "overview",
    },
    "chronocumulator": {
      type: "infrastructure",
      claim: "Shares the custom Web Audio API and real-time DSP pitch-tracking codebase built to map exilic soundscapes.",
      weight: 2,
      directionality: "bidirectional",
      visibilityLevel: "neighborhood",
    },
    "the-weather-rehearsal": {
      type: "method",
      claim: "Translates microtonal somatic systems into atmospheric, sensor-driven public performance rules.",
      weight: 2,
      directionality: "directed",
      visibilityLevel: "neighborhood",
    }
  },
  "mashrou-leila": {
    "cost-of-being-queer-and-arab": {
      type: "theme",
      claim: "This press node tracks the public argument around the band once visibility, censorship, and personal risk became impossible to separate.",
      weight: 2,
      directionality: "directed",
      visibilityLevel: "overview",
    },
    "why-were-like-this": {
      type: "lineage",
      claim: "Exposes the transitioning aesthetic strategy: from collective stadium concert visibility to surreal, curated, narrative-driven archives.",
      weight: 2,
      directionality: "directed",
      visibilityLevel: "neighborhood",
    },
    "sometimes-i-wake-up-elsewhere": {
      type: "theme",
      claim: "Maps the direct impact of exile, public censure, and displaced space on the band's late-stage literary and musical works.",
      weight: 2,
      directionality: "directed",
      visibilityLevel: "overview",
    }
  },
  "architecture-in-low-res": {
    "autopsy-beirut-phantom": {
      type: "lineage",
      claim: "Tracks direct chronological evolution from early architectural drawing into the fragment-aware logic of digital redaction.",
      weight: 2,
      directionality: "directed",
      visibilityLevel: "neighborhood",
    },
    "cartography-of-absence": {
      type: "lineage",
      claim: "Transitions the 'low-res spatial truth' thesis into the administrative, redemptive bureaucracy of cartographic voids.",
      weight: 3,
      directionality: "directed",
      visibilityLevel: "overview",
    },
    "sometimes-i-wake-up-elsewhere": {
      type: "theme",
      claim: "Connects early Bartlett architectural diagrams of damaged space to the hypertextual digital decay of exilic memory.",
      weight: 2,
      directionality: "bidirectional",
      visibilityLevel: "overview",
    }
  },
  "storylines": {
    "codeverse-explorer": {
      type: "method",
      claim: "Translates the force-directed semantic physics of storylines into the engineering dependencies of Codeverse Explorer.",
      weight: 2,
      directionality: "directed",
      visibilityLevel: "neighborhood",
    },
    "99-nodes": {
      type: "infrastructure",
      claim: "Shares the underlying Graph database schema, node hierarchy rules, and exilic mapping coordinates.",
      weight: 2,
      directionality: "bidirectional",
      visibilityLevel: "neighborhood",
    },
    "sometimes-i-wake-up-elsewhere": {
      type: "theme",
      claim: "Links the structured, force-directed graph timeline back to subjective literary fragments of displacement.",
      weight: 2,
      directionality: "bidirectional",
      visibilityLevel: "overview",
    }
  },
  "427-ai-tracks-archive": {
    "resonance-atlas": {
      type: "material",
      claim: "The generative audio database feeds the visual and acoustic structure of the Resonance Atlas.",
      weight: 2,
      directionality: "directed",
      visibilityLevel: "neighborhood",
    },
    "tebr": {
      type: "material",
      claim: "The raw digital audio archive serves as source material to construct somatic physical instruments.",
      weight: 3,
      directionality: "directed",
      visibilityLevel: "overview",
    }
  },
  "cost-of-being-queer-and-arab": {
    "mekena-nyc": {
      type: "theme",
      claim: "Maps the direct translation of public vulnerability and media risk into physical blueprints of sanctuary and care.",
      weight: 2,
      directionality: "directed",
      visibilityLevel: "overview",
    }
  },
  "sometimes-i-wake-up-elsewhere": {
    "the-forgery": {
      type: "infrastructure",
      claim: "The Möbius Engine infrastructure powers the hypertext structures of both digital manuscripts.",
      weight: 2,
      directionality: "bidirectional",
      visibilityLevel: "neighborhood",
    },
    "derive": {
      type: "method",
      claim: "Translates exilic displacement text into a physical, GPS-based narrative traversal of local city coordinates.",
      weight: 3,
      directionality: "bidirectional",
      visibilityLevel: "overview",
    }
  },
  "localization-gap": {
    "systems-choreography": {
      type: "public-consequence",
      claim: "The critique of Western tuning stands in friction with using Western software frameworks to build its own auditing tools.",
      weight: 2,
      directionality: "bidirectional",
      visibilityLevel: "neighborhood",
    },
    "hah-was": {
      type: "infrastructure",
      claim: "Forms the core algorithmic testing suite to identify phonetic and phonetic-contextual biases in language models.",
      weight: 3,
      directionality: "directed",
      visibilityLevel: "overview",
    }
  },
  "hah-was": {
    "maqamai": {
      type: "method",
      claim: "Applies the localized linguistic model rules to the acoustic training sets of microtonal Arabic melodies.",
      weight: 3,
      directionality: "directed",
      visibilityLevel: "overview",
    }
  },
  "sparrowos": {
    "sometimes-i-wake-up-elsewhere": {
      type: "infrastructure",
      claim: "SparrowOS operates as the conceptual subnode and hypertext file system context orbiting Inside Sometimes I Wake Up Elsewhere.",
      weight: 2,
      directionality: "directed",
      visibilityLevel: "neighborhood",
    },
    "derive": {
      type: "method",
      claim: "Translates the minimalist pixel-eye character registry of SparrowOS into exilic spatial database indexing.",
      weight: 1,
      directionality: "directed",
      visibilityLevel: "deep",
    }
  },
  "mekena-nyc": {
    "architectures-of-belonging": {
      type: "lineage",
      claim: "Traces how the structural blueprints of MEKENA NYC evolve into a NYU-supported research framework on spatial agency and identity.",
      weight: 3,
      directionality: "directed",
      visibilityLevel: "overview",
    }
  }
};

export function getRelationDetail(source: string, target: string): RelationDetail {
  const src = source.toLowerCase();
  const tgt = target.toLowerCase();

  // Try direct lookup
  let raw = RELATION_DETAILS_RAW[src]?.[tgt] || RELATION_DETAILS_RAW[tgt]?.[src];

  if (raw) {
    return {
      ...raw,
      typeName: RELATION_TYPES_MAP[raw.type],
      isCurated: true,
    };
  }

  // Fallback generation based on naming or domain
  // We can provide smart fallbacks:
  const prettify = (slug: string) => slug.replace(/-/g, ' ');
  let type: RelationType = 'theme';
  let claim = `Establishes a contextual association between the conceptual frameworks of ${prettify(source)} and ${prettify(target)}.`;

  if (
    src.includes('mv') ||
    tgt.includes('mv') ||
    src.includes('album') ||
    tgt.includes('album') ||
    src === 'mashrou-leila' ||
    tgt === 'mashrou-leila'
  ) {
    type = 'material';
    claim = `Material Continuity: This subnode represents key creative work (video, audio, or performance) directly emerging from the primary Mashrou' Leila catalog.`;
  } else if (src.includes('thesis') || tgt.includes('thesis')) {
    type = 'lineage';
    claim = `Lineage: Traces how the structural and academic ideas in early theses evolved into practical, physical applications.`;
  }

  return {
    type,
    typeName: RELATION_TYPES_MAP[type],
    claim,
    weight: 1,
    directionality: 'bidirectional',
    visibilityLevel: 'neighborhood',
    isCurated: false,
  };
}

/** Get all relations for a given node slug (both as source and target). */
export function getRelationsForNode(slug: string, allNodes?: Array<{ slug: string; connections?: string[]; relatedSlugs?: string[] }>): AtlasRelation[] {
  const relations: AtlasRelation[] = [];
  const seen = new Set<string>();
  const lowerSlug = slug.toLowerCase();

  // Gather from RELATION_DETAILS_RAW
  for (const [sourceSlug, targets] of Object.entries(RELATION_DETAILS_RAW)) {
    for (const [targetSlug, detail] of Object.entries(targets)) {
      if (sourceSlug === lowerSlug || targetSlug === lowerSlug) {
        const key = [sourceSlug, targetSlug].sort().join('__');
        if (seen.has(key)) continue;
        seen.add(key);
        relations.push({
          id: `rel-${key}`,
          sourceId: sourceSlug,
          targetId: targetSlug,
          type: detail.type,
          typeName: RELATION_TYPES_MAP[detail.type],
          label: `${sourceSlug} → ${targetSlug}`,
          description: detail.claim,
          weight: detail.weight || 1,
          directionality: detail.directionality || 'bidirectional',
          visibilityLevel: detail.visibilityLevel || 'neighborhood',
          evidenceRecordIds: detail.evidenceRecordIds,
          isCurated: true,
        });
      }
    }
  }

  // If allNodes provided, also find uncurated connections
  if (allNodes) {
    const node = allNodes.find(n => n.slug.toLowerCase() === lowerSlug);
    const connections = [...(node?.connections || []), ...(node?.relatedSlugs || [])];
    for (const targetSlug of connections) {
      const key = [lowerSlug, targetSlug.toLowerCase()].sort().join('__');
      if (seen.has(key)) continue;
      seen.add(key);
      const detail = getRelationDetail(slug, targetSlug);
      relations.push({
        id: `rel-${key}`,
        sourceId: lowerSlug,
        targetId: targetSlug.toLowerCase(),
        type: detail.type,
        typeName: detail.typeName,
        label: `${slug} ↔ ${targetSlug}`,
        description: detail.claim,
        weight: detail.weight || 1,
        directionality: detail.directionality || 'bidirectional',
        visibilityLevel: detail.visibilityLevel || 'neighborhood',
        evidenceRecordIds: detail.evidenceRecordIds,
        isCurated: detail.isCurated || false,
      });
    }
  }

  return relations;
}

/** Get all unique relations across all nodes. */
export function getAllRelations(allNodes: Array<{ slug: string; connections?: string[]; relatedSlugs?: string[] }>): AtlasRelation[] {
  const relations: AtlasRelation[] = [];
  const seen = new Set<string>();

  // First: all curated relations
  for (const [sourceSlug, targets] of Object.entries(RELATION_DETAILS_RAW)) {
    for (const [targetSlug, detail] of Object.entries(targets)) {
      const key = [sourceSlug, targetSlug].sort().join('__');
      if (seen.has(key)) continue;
      seen.add(key);
      relations.push({
        id: `rel-${key}`,
        sourceId: sourceSlug,
        targetId: targetSlug,
        type: detail.type,
        typeName: RELATION_TYPES_MAP[detail.type],
        label: `${sourceSlug} → ${targetSlug}`,
        description: detail.claim,
        weight: detail.weight || 1,
        directionality: detail.directionality || 'bidirectional',
        visibilityLevel: detail.visibilityLevel || 'neighborhood',
        evidenceRecordIds: detail.evidenceRecordIds,
        isCurated: true,
      });
    }
  }

  // Then: uncurated from node connections
  for (const node of allNodes) {
    const connections = [...(node.connections || []), ...(node.relatedSlugs || [])];
    for (const targetSlug of connections) {
      const key = [node.slug.toLowerCase(), targetSlug.toLowerCase()].sort().join('__');
      if (seen.has(key)) continue;
      seen.add(key);
      const detail = getRelationDetail(node.slug, targetSlug);
      relations.push({
        id: `rel-${key}`,
        sourceId: node.slug.toLowerCase(),
        targetId: targetSlug.toLowerCase(),
        type: detail.type,
        typeName: detail.typeName,
        label: `${node.slug} ↔ ${targetSlug}`,
        description: detail.claim,
        weight: detail.weight || 1,
        directionality: detail.directionality || 'bidirectional',
        visibilityLevel: detail.visibilityLevel || 'neighborhood',
        isCurated: detail.isCurated || false,
      });
    }
  }

  return relations;
}

/** Filter relations by type. */
export function getRelationsByType(relations: AtlasRelation[], type: RelationType): AtlasRelation[] {
  return relations.filter(r => r.type === type);
}
