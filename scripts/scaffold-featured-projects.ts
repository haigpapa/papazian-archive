import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { getProjectContent } from '../src/data/projectContent';
import { getProjectGallery } from '../src/data/projectGalleries';

type Row = Record<string, string>;

const root = process.cwd();
const contentDir = path.join(root, 'content');
const projectsDir = path.join(contentDir, 'projects');
const publicDir = path.join(root, 'public');
const projectImagesDir = path.join(publicDir, 'images/projects');
const atlasCsvPath = path.join(publicDir, 'images/atlas/atlas-node-update-FINAL.updated.csv');
const featuredCsvPath = path.join(contentDir, 'featured-projects.csv');
const projectsCsvPath = path.join(contentDir, 'projects.csv');
const force = process.argv.includes('--force');

const DOC_BY_SLUG: Record<string, string> = {
  derive: '01-DERIVE.md',
  'space-time-tuning-machine': '02-STTM.md',
  storylines: '03-STORYLINES.md',
  'mashrou-leila': '04-MASHROU-LEILA.md',
  'mekena-nyc': '05-MEKENA-NYC.md',
  'sometimes-i-wake-up-elsewhere': '09-SIWUE.md',
  tebr: '10-TEBR.md',
  'hah-was': '07-HAH-WAS.md',
  '3d-beat-synth': '08-3D-BEAT-SYNTH.md',
  'resonance-atlas': '11-RESONANCE-ATLAS.md',
  maqamai: '12-MAQAMAI.md',
  'autopsy-beirut-phantom': '13-AUTOPSY-BEIRUT-PHANTOM.md',
  'cartography-of-absence': '06-CARTOGRAPHY-OF-ABSENCE.md',
  'why-were-like-this': '14-WHY-WERE-LIKE-THIS.md',
  'photon-plus': '15-PHOTON-PLUS.md',
  'codeverse-explorer': '16-CODEVERSE-EXPLORER.md',
  kardia: '17-KARDIA.md',
  'music-engines': '18-MUSIC-ENGINES.md',
  'architecture-in-low-res': '19-ARCHITECTURE-IN-LOW-RES.md',
  '1000-strings-at-rest': '20-1000-STRINGS-AT-REST.md',
};

const FALLBACK_IMAGE_BY_SLUG: Record<string, string> = {
  'why-were-like-this': '/images/atlas/why-were-like-this-interface.webp',
  'music-engines': '/images/atlas/music-engines-research-engine.webp',
};

const FALLBACK_DOMAINS_BY_SLUG: Record<string, string> = {
  'why-were-like-this': 'text|image|systems',
  'music-engines': 'sound|code|systems',
};

function tierForFeaturedIndex(index: number) {
  if (index < 7) return 'lead';
  if (index < 18) return 'secondary';
  return 'archive';
}

function parseCsv(csv: string): Row[] {
  const [headerLine, ...lines] = csv.trim().split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(headerLine);

  return lines.map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce<Row>((row, header, index) => {
      row[header] = values[index] || '';
      return row;
    }, {});
  });
}

function parseCsvLine(line: string) {
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

function csvEscape(value: unknown) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeCsv(filePath: string, headers: string[], rows: Row[]) {
  const csv = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ].join('\n') + '\n';

  writeFileSync(filePath, csv);
}

function normalizeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function titleFromSlug(slug: string) {
  return slug
    .split('-')
    .map((part) => part.toUpperCase() === 'AI' ? 'AI' : part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function splitPipe(value = '') {
  return value.split('|').map((item) => item.trim()).filter(Boolean);
}

function readDoc(slug: string) {
  const docName = DOC_BY_SLUG[slug];
  if (!docName) return '';
  const docPath = path.join(root, 'project-docs', docName);
  return existsSync(docPath) ? readFileSync(docPath, 'utf8') : '';
}

function extractSection(markdown: string, heading: string) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = markdown.match(new RegExp(`^##\\s+${escaped}\\s*$([\\s\\S]*?)(?=^##\\s+|\\z)`, 'im'));
  return match?.[1]?.trim() || '';
}

function firstParagraph(value: string) {
  return value
    .split(/\n\s*\n/)
    .map((item) => item.replace(/\*\*/g, '').trim())
    .find(Boolean) || '';
}

function markdownTitle(markdown: string) {
  return markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || '';
}

function projectMdFromDoc(slug: string, title: string, atlasSummary: string) {
  const doc = readDoc(slug);
  const content = getProjectContent(slug);
  const question = firstParagraph(extractSection(doc, 'The Question'));
  const premise = firstParagraph(extractSection(doc, 'Premise'));
  const reframing = firstParagraph(extractSection(doc, 'Reframing the Record'));
  const overview = firstParagraph(extractSection(doc, 'Overview'));
  const full = content?.fullDescription || question || premise || reframing || overview || atlasSummary;

  return `# ${markdownTitle(doc) || title}

## Thesis
${content?.thesis || atlasSummary || `${title} is part of the Systems Choreography archive.`}

## Short Description
${content?.shortDescription || atlasSummary || full}

## Full Description
${full}

## Highlights
${(content?.highlights?.length ? content.highlights : ['Starter case-study scaffold created from the project documentation.', 'Replace or expand this section during final curation.']).map((item) => `- ${item}`).join('\n')}

## Related Projects
${(content?.relatedSlugs?.length ? content.relatedSlugs : []).map((item) => `- ${item}`).join('\n') || '- '}
`;
}

function cleanFileStem(value: string) {
  return normalizeSlug(value.replace(/\.[a-z0-9]+$/i, '')) || 'slide';
}

function publicPathToDisk(publicPath: string) {
  return path.join(publicDir, publicPath.replace(/^\//, ''));
}

function extensionFor(publicPath: string) {
  return path.extname(publicPath).toLowerCase() || '.webp';
}

function copyAsset(slug: string, index: number, source: string, label: string) {
  if (!source || !source.startsWith('/images/')) return '';
  const sourcePath = publicPathToDisk(source);
  if (!existsSync(sourcePath)) return '';

  const filename = `${String(index).padStart(3, '0')}-${cleanFileStem(label)}${extensionFor(source)}`;
  const targetPath = path.join(projectImagesDir, slug, filename);
  if (!existsSync(targetPath)) copyFileSync(sourcePath, targetPath);
  return filename;
}

function buildGalleryRows(slug: string, title: string, atlasImage: string, atlasSummary: string) {
  const gallery = getProjectGallery(slug, title);
  const rows: Row[] = [];

  if (gallery?.length) {
    gallery.forEach((item, index) => {
      const type = item.type || 'image';
      const source = item.poster || item.src || '';
      const file = type === 'text' ? '' : copyAsset(slug, index + 1, source, item.label || title);
      rows.push({
        order: String(index + 1),
        type,
        file,
        youtubeId: item.youtubeId || '',
        chapter: item.chapter || (index === 0 ? 'Thesis' : 'Evidence'),
        role: item.role || (index === 0 ? 'hero' : 'evidence'),
        title: item.label || title,
        caption: item.caption || atlasSummary,
        body: Array.isArray(item.body) ? item.body.join('|') : item.body || '',
        emphasis: item.emphasis || (index === 0 ? 'primary' : 'secondary'),
      });
    });
  }

  if (!rows.length) {
    const file = copyAsset(slug, 1, atlasImage, title);
    rows.push({
      order: '1',
      type: file ? 'image' : 'text',
      file,
      youtubeId: '',
      chapter: 'Thesis',
      role: 'hero',
      title,
      caption: atlasSummary || `${title} starter rail.`,
      body: file ? '' : 'Starter rail card. Add images to the project folder and edit this gallery row.',
      emphasis: 'primary',
    });
  }

  if (!rows.some((row) => row.file) && atlasImage) {
    const file = copyAsset(slug, 1, atlasImage, title);
    if (file) {
      rows.unshift({
        order: '1',
        type: 'image',
        file,
        youtubeId: '',
        chapter: 'Thesis',
        role: 'hero',
        title,
        caption: atlasSummary || `${title} starter rail.`,
        body: '',
        emphasis: 'primary',
      });
      rows.forEach((row, index) => {
        row.order = String(index + 1);
        if (index > 0 && row.emphasis === 'primary') row.emphasis = 'secondary';
      });
    }
  }

  return rows;
}

function main() {
  const featured = parseCsv(readFileSync(featuredCsvPath, 'utf8'))
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    .map((row) => row.slug);
  const atlasRows = parseCsv(readFileSync(atlasCsvPath, 'utf8'));
  const atlasBySlug = new Map(atlasRows.map((row) => [row.id, row]));
  const existingProjectRows = existsSync(projectsCsvPath) ? parseCsv(readFileSync(projectsCsvPath, 'utf8')) : [];
  const existingBySlug = new Map(existingProjectRows.map((row) => [row.slug, row]));
  const projectRows: Row[] = [];

  mkdirSync(projectsDir, { recursive: true });
  mkdirSync(projectImagesDir, { recursive: true });

  featured.forEach((slug) => {
    const atlas = atlasBySlug.get(slug);
    const existing = existingBySlug.get(slug);
    const content = getProjectContent(slug);
    const doc = readDoc(slug);
    const title = existing?.title || atlas?.title || markdownTitle(doc) || titleFromSlug(slug);
    const domains = existing?.domains || atlas?.domains?.toLowerCase() || FALLBACK_DOMAINS_BY_SLUG[slug] || '';
    const stack = existing?.stack || atlas?.stack?.toLowerCase() || '';
    const connections = existing?.connections || atlas?.connections || content?.relatedSlugs?.join('|') || '';
    const year = existing?.year || atlas?.year || '';
    const tier = tierForFeaturedIndex(featured.indexOf(slug));
    const summary = atlas?.summary || content?.thesis || '';

    projectRows.push({
      slug,
      title,
      year,
      tier,
      domains,
      stack,
      connections,
      status: existing?.status || 'public',
      showInWorks: 'true',
      hasProjectPage: 'true',
    });

    const projectDir = path.join(projectsDir, slug);
    const imageDir = path.join(projectImagesDir, slug);
    mkdirSync(projectDir, { recursive: true });
    mkdirSync(imageDir, { recursive: true });

    const projectMdPath = path.join(projectDir, 'project.md');
    if (!existsSync(projectMdPath) || force) {
      writeFileSync(projectMdPath, projectMdFromDoc(slug, title, summary));
    }

    const galleryPath = path.join(projectDir, 'gallery.csv');
    if (!existsSync(galleryPath) || force) {
      writeCsv(galleryPath, ['order', 'type', 'file', 'youtubeId', 'chapter', 'role', 'title', 'caption', 'body', 'emphasis'], buildGalleryRows(slug, title, atlas?.image || FALLBACK_IMAGE_BY_SLUG[slug] || '', summary));
    }
  });

  writeCsv(projectsCsvPath, ['slug', 'title', 'year', 'tier', 'domains', 'stack', 'connections', 'status', 'showInWorks', 'hasProjectPage'], projectRows);

  writeFileSync(path.join(projectImagesDir, '_drop-new-images-here.md'), `# Project Image Intake

Create or use a project folder named after the project slug:

\`\`\`txt
public/images/projects/{slug}/
  001-hero-name.webp
  002-process-name.webp
  003-video-poster-name.webp
\`\`\`

Use WebP, sRGB, and preserve original aspect ratio.

- Hero: long edge around 2800px, quality around 82
- Rail: long edge around 2000px, quality around 80
- Thumbnail/poster: long edge around 1000px, quality around 75

Then reference the filename in \`content/projects/{slug}/gallery.csv\`.
`);

  console.log(`Scaffolded ${featured.length} featured project(s).`);
}

main();
