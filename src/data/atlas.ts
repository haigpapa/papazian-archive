import { getProjectGallery, type GalleryEmphasis, type GalleryLayout, type GalleryRole, type GallerySlideType } from './projectGalleries';
import { getProjectContent } from './projectContent';
import { ATLAS_IMAGE_FILENAMES } from './atlasImageFilenames';
import { CANONICAL_PROJECT_SLUGS } from './canonicalProjects';
import { GENERATED_PROJECT_RECORDS } from './generated/content';

export type ProjectTier = 'lead' | 'secondary' | 'archive';

export interface AtlasNode {
  id: number;
  order: number;
  slug: string;
  title: string;
  year: string;
  tier: ProjectTier;
  domains: string[];
  stack: string[];
  connections: string[];
  image: string;
  thumbnail: string;
  hasProjectPage: boolean;
  summary: string;
  shortDescription: string;
  fullDescription: string;
  thesis?: string;
  highlights?: string[];
  relatedSlugs?: string[];
  category: string;
  tags: string[];
  accentColor: string;
  evidenceStatus?: string;
  gallery: AtlasImage[];
}

export interface AtlasImage {
  id: string;
  projectId: string;
  projectTitle: string;
  type?: GallerySlideType;
  src: string;
  poster?: string;
  youtubeId?: string;
  embedUrl?: string;
  externalUrl?: string;
  label: string;
  caption?: string;
  body?: string | string[];
  role?: GalleryRole;
  layout?: GalleryLayout;
  emphasis?: GalleryEmphasis;
  chapter?: string;
  beat?: string;
  relatedSlugs?: string[];
  isPrimary: boolean;
}

const ATLAS_CSV_URL = '/images/atlas/atlas.csv';

const ATLAS_IMAGES = ATLAS_IMAGE_FILENAMES.map((filename) => ({ filename }));

const TIER_ACCENTS: Record<ProjectTier, string> = {
  lead: '#d7e7ef',
  secondary: '#8fa8c2',
  archive: '#666a6f',
};

const DOMAIN_ACCENTS: Record<string, string> = {
  code: '#7aa6ff',
  image: '#d7e7ef',
  sound: '#9fd6bf',
  space: '#c7b28a',
  systems: '#8fa8c2',
  text: '#d5a2a2',
};

const GENERATED_PROJECT_BY_SLUG = new Map(
  GENERATED_PROJECT_RECORDS.map((project) => [project.slug, project])
);

export async function fetchAtlasNodes(): Promise<AtlasNode[]> {
  const response = await fetch(ATLAS_CSV_URL);

  if (!response.ok) {
    throw new Error(`Unable to load atlas data: ${response.status}`);
  }

  return parseAtlasCsv(await response.text());
}

export function parseAtlasCsv(csv: string): AtlasNode[] {
  const [headerLine, ...rows] = csv.trim().split(/\r?\n/);
  const headers = parseCsvLine(headerLine);

  const nodes = rows
    .map((line) => rowToObject(headers, parseCsvLine(line)))
    .filter((row) => row.id && row.title)
    .map((row) => {
      const generated = GENERATED_PROJECT_BY_SLUG.get(row.id);
      const tier = normalizeTier(generated?.tier || row.tier);
      const domains = generated?.domains?.length ? [...generated.domains] : splitPipeList(row.domains);
      const stack = generated?.stack?.length ? [...generated.stack] : splitPipeList(row.stack);
      const connections = generated?.connections?.length ? [...generated.connections] : splitPipeList(row.connections);
      const primaryDomain = domains[0] || stack[0]?.toLowerCase() || 'project';
      const content = getProjectContent(row.id);
      const relatedSlugs = uniqueList([...(content?.relatedSlugs || []), ...connections]);

      const node = {
        id: Number(row.order),
        order: Number(row.order),
        slug: row.id,
        title: generated?.title || row.title,
        year: generated?.year || row.year,
        tier,
        domains,
        stack,
        connections,
        image: row.image,
        thumbnail: row.image,
        hasProjectPage: typeof generated?.hasProjectPage === 'boolean' ? generated.hasProjectPage : row.hasProjectPage.toLowerCase() === 'yes',
        summary: content?.thesis || row.summary,
        shortDescription: content?.shortDescription || row.summary,
        fullDescription: content?.fullDescription || buildFullDescription(tier, domains, connections),
        thesis: content?.thesis,
        highlights: content?.highlights || [],
        relatedSlugs,
        category: primaryDomain,
        tags: uniqueList([tier, ...domains, ...stack]),
        accentColor: DOMAIN_ACCENTS[primaryDomain] || TIER_ACCENTS[tier],
        evidenceStatus: generated?.evidenceStatus || '',
        gallery: [],
      };

      return node;
    });

  const nodesWithSynthetic = addMissingCanonicalNodes(nodes);

  return nodesWithSynthetic.map((node) => ({
    ...node,
    gallery: buildGalleryForNode(node, nodesWithSynthetic),
  }));
}

function addMissingCanonicalNodes(nodes: Array<Omit<AtlasNode, 'gallery'>>) {
  const bySlug = new Map(nodes.map((node) => [node.slug, node]));
  const nextOrder = Math.max(...nodes.map((node) => node.order), 0) + 1;
  let syntheticOffset = 0;

  uniqueList([
    ...CANONICAL_PROJECT_SLUGS,
    ...GENERATED_PROJECT_RECORDS.map((project) => project.slug),
  ]).forEach((slug) => {
    if (bySlug.has(slug)) return;

    const content = getProjectContent(slug);
    if (!content) return;

    const generated = GENERATED_PROJECT_BY_SLUG.get(slug);
    const image = getSyntheticNodeImage(slug);
    const domains = generated?.domains?.length ? [...generated.domains] : getSyntheticNodeDomains(slug);
    const node = {
      id: nextOrder + syntheticOffset,
      order: nextOrder + syntheticOffset,
      slug,
      title: generated?.title || titleFromSlug(slug),
      year: generated?.year || '2024-26',
      tier: normalizeTier(generated?.tier || 'secondary'),
      domains,
      stack: generated?.stack?.length ? [...generated.stack] : [],
      connections: generated?.connections?.length ? [...generated.connections] : content.relatedSlugs || [],
      image,
      thumbnail: image,
      hasProjectPage: generated?.hasProjectPage ?? true,
      summary: content.thesis,
      shortDescription: content.shortDescription,
      fullDescription: content.fullDescription,
      thesis: content.thesis,
      highlights: content.highlights || [],
      relatedSlugs: content.relatedSlugs || [],
      category: domains[0],
      tags: uniqueList([generated?.tier || 'secondary', ...domains]),
      accentColor: DOMAIN_ACCENTS[domains[0]] || TIER_ACCENTS.secondary,
    };

    syntheticOffset += 1;
    bySlug.set(slug, node);
    nodes.push(node);
  });

  return nodes;
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

function rowToObject(headers: string[], values: string[]) {
  return headers.reduce<Record<string, string>>((row, header, index) => {
    row[header] = values[index] || '';
    return row;
  }, {});
}

function normalizeTier(tier: string): ProjectTier {
  if (tier === 'lead' || tier === 'secondary' || tier === 'archive') {
    return tier;
  }

  return 'archive';
}

function splitPipeList(value: string): string[] {
  return value
    .split('|')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function buildFullDescription(tier: ProjectTier, domains: string[], connections: string[]) {
  const tierLabel = tier === 'lead' ? 'Lead work' : tier === 'secondary' ? 'Secondary work' : 'Archive node';
  const domainLabel = domains.length ? `Domains: ${domains.join(', ')}.` : '';
  const connectionLabel = connections.length ? `Connected to ${connections.join(', ')}.` : '';

  return [tierLabel, domainLabel, connectionLabel].filter(Boolean).join(' ');
}

function buildGalleryForNode(node: Omit<AtlasNode, 'gallery'>, allNodes: Array<Omit<AtlasNode, 'gallery'>>): AtlasImage[] {
  const curatedGallery = getProjectGallery(node.slug, node.title);
  if (curatedGallery) return curatedGallery;

  const primary = normalizePublicImage(node.image);
  const used = new Set<string>();
  const gallery: AtlasImage[] = [];

  const addImage = (src: string, isPrimary = false) => {
    const normalizedSrc = normalizePublicImage(src);
    if (!normalizedSrc || used.has(normalizedSrc)) return;
    used.add(normalizedSrc);
    gallery.push({
      id: `${node.slug}-${gallery.length}`,
      projectId: node.slug,
      projectTitle: node.title,
      type: 'image',
      src: normalizedSrc,
      label: labelFromFilename(normalizedSrc),
      caption: isPrimary ? node.summary : undefined,
      role: isPrimary ? 'hero' : 'evidence',
      layout: isPrimary ? 'hero' : 'wide',
      emphasis: isPrimary ? 'primary' : 'secondary',
      chapter: isPrimary ? 'Thesis' : 'Evidence',
      beat: isPrimary ? node.shortDescription : undefined,
      relatedSlugs: node.relatedSlugs,
      isPrimary,
    });
  };

  addImage(primary, true);

  const nodeTokens = tokenSet([
    node.slug,
    node.title,
    ...node.domains,
    ...node.stack,
    ...node.connections,
  ]);
  const otherPrimaryImages = new Set(
    allNodes
      .filter((entry) => entry.slug !== node.slug)
      .map((entry) => normalizePublicImage(entry.image))
  );

  ATLAS_IMAGES.forEach((asset) => {
    const src = `/images/atlas/${asset.filename}`;
    if (otherPrimaryImages.has(src)) return;

    const assetTokens = tokenSet([asset.filename]);
    const directSlugHit = normalizeToken(asset.filename).includes(normalizeToken(node.slug));
    const tokenHits = [...assetTokens].filter((token) => nodeTokens.has(token)).length;

    if (directSlugHit || tokenHits >= 2) {
      addImage(src);
    }
  });

  return gallery;
}

function uniqueList(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function normalizePublicImage(src: string) {
  if (!src) return '';
  const filename = src.split('/').pop() || src;
  return `/images/atlas/${filename}`;
}

function tokenSet(values: string[]) {
  const tokens = new Set<string>();

  values.forEach((value) => {
    normalizeToken(value)
      .split('-')
      .filter((token) => token.length > 2)
      .forEach((token) => tokens.add(token));
  });

  return tokens;
}

function normalizeToken(value: string) {
  return value
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function labelFromFilename(src: string) {
  const filename = src.split('/').pop() || src;
  return filename
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function titleFromSlug(slug: string) {
  const titles: Record<string, string> = {
    'why-were-like-this': "WHY WE'RE LIKE THIS",
    'music-engines': 'music-engines',
  };

  return titles[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function getSyntheticNodeImage(slug: string) {
  const images: Record<string, string> = {
    'why-were-like-this': '/images/atlas/why-were-like-this-interface.webp',
    'music-engines': '/images/atlas/music-engines-research-engine.webp',
  };

  return images[slug] || '/images/atlas/meaning-stack-github-constellation.webp';
}

function getSyntheticNodeDomains(slug: string) {
  const domains: Record<string, string[]> = {
    'why-were-like-this': ['image', 'text', 'systems'],
    'music-engines': ['sound', 'code', 'systems'],
  };

  return domains[slug] || ['systems'];
}
