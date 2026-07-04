export type RelationType =
  | 'lineage'
  | 'method'
  | 'material'
  | 'resonance'
  | 'infra'
  | 'tension';

export interface RelationDetail {
  type: RelationType;
  typeName: string;
  claim: string;
}

export const RELATION_TYPES_MAP: Record<RelationType, string> = {
  lineage: 'Lineage & Evolution',
  method: 'Method Transfer',
  material: 'Material Continuity',
  resonance: 'Thematic Resonance',
  infra: 'Technical Infrastructure',
  tension: 'Structural Tension',
};

// Map of [sourceSlug][targetSlug] -> RelationDetail
// Note: Since relationships are mutual/bi-directional in many places, we can look up bi-directionally.
const RELATION_DETAILS_RAW: Record<string, Record<string, Omit<RelationDetail, 'typeName'>>> = {
  "space-time-tuning-machine": {
    "derive": {
      type: "method",
      claim: "This relation represents the technique of translating raw, somatic kinetic bow signals into localized, associative vector-database search queries."
    },
    "tebr": {
      type: "material",
      claim: "Links somatic microtonal physical bow interfaces to the digital feedback loops and dust composition parameters of TEBR."
    },
    "mashrou-leila": {
      type: "lineage",
      claim: "Traces the structural evolution from collective public performance into solitary somatic instrument design."
    },
    "chronocumulator": {
      type: "infra",
      claim: "Shares the custom Web Audio API and real-time DSP pitch-tracking codebase built to map exilic soundscapes."
    },
    "the-weather-rehearsal": {
      type: "method",
      claim: "Translates microtonal somatic systems into atmospheric, sensor-driven public performance rules."
    }
  },
  "mashrou-leila": {
    "cost-of-being-queer-and-arab": {
      type: "resonance",
      claim: "This press node tracks the public argument around the band once visibility, censorship, and personal risk became impossible to separate."
    },
    "why-were-like-this": {
      type: "lineage",
      claim: "Exposes the transitioning aesthetic strategy: from collective stadium concert visibility to surreal, curated, narrative-driven archives."
    },
    "sometimes-i-wake-up-elsewhere": {
      type: "resonance",
      claim: "Maps the direct impact of exile, public censure, and displaced space on the band's late-stage literary and musical works."
    }
  },
  "architecture-in-low-res": {
    "autopsy-beirut-phantom": {
      type: "lineage",
      claim: "Tracks direct chronological evolution from early architectural drawing into the fragment-aware logic of digital redaction."
    },
    "cartography-of-absence": {
      type: "lineage",
      claim: "Transitions the 'low-res spatial truth' thesis into the administrative, redemptive bureaucracy of cartographic voids."
    },
    "sometimes-i-wake-up-elsewhere": {
      type: "resonance",
      claim: "Connects early Bartlett architectural diagrams of damaged space to the hypertextual digital decay of exilic memory."
    }
  },
  "storylines": {
    "codeverse-explorer": {
      type: "method",
      claim: "Translates the force-directed semantic physics of storylines into the engineering dependencies of Codeverse Explorer."
    },
    "99-nodes": {
      type: "infra",
      claim: "Shares the underlying Graph database schema, node hierarchy rules, and exilic mapping coordinates."
    },
    "sometimes-i-wake-up-elsewhere": {
      type: "resonance",
      claim: "Links the structured, force-directed graph timeline back to subjective literary fragments of displacement."
    }
  },
  "427-ai-tracks-archive": {
    "resonance-atlas": {
      type: "material",
      claim: "The generative audio database feeds the visual and acoustic structure of the Resonance Atlas."
    },
    "tebr": {
      type: "material",
      claim: "The raw digital audio archive serves as source material to construct somatic physical instruments."
    }
  },
  "cost-of-being-queer-and-arab": {
    "mekena-nyc": {
      type: "resonance",
      claim: "Maps the direct translation of public vulnerability and media risk into physical blueprints of sanctuary and care."
    }
  },
  "sometimes-i-wake-up-elsewhere": {
    "the-forgery": {
      type: "infra",
      claim: "The Möbius Engine infrastructure powers the hypertext structures of both digital manuscripts."
    },
    "derive": {
      type: "method",
      claim: "Translates exilic displacement text into a physical, GPS-based narrative traversal of local city coordinates."
    }
  },
  "localization-gap": {
    "systems-choreography": {
      type: "tension",
      claim: "The critique of Western tuning stands in friction with using Western software frameworks to build its own auditing tools."
    },
    "hah-was": {
      type: "infra",
      claim: "Forms the core algorithmic testing suite to identify phonetic and phonetic-contextual biases in language models."
    }
  },
  "hah-was": {
    "maqamai": {
      type: "method",
      claim: "Applies the localized linguistic model rules to the acoustic training sets of microtonal Arabic melodies."
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
    };
  }

  // Fallback generation based on naming or domain
  // We can provide smart fallbacks:
  let type: RelationType = 'resonance';
  let claim = `Establishes a contextual association between the conceptual frameworks of ${source} and ${target}.`;

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
  };
}
