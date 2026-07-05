import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contentDir = path.join(root, 'content');
const projectsDir = path.join(contentDir, 'projects');
const publicDir = path.join(root, 'public');
const outputPath = path.join(root, 'src/data/generated/content.ts');

type Row = Record<string, string>;

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

function splitPipe(value: string) {
  return value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseMarkdownSections(markdown: string) {
  const sections: Record<string, string> = {};
  const matches = [...markdown.matchAll(/^##\s+(.+)$/gm)];

  matches.forEach((match, index) => {
    const title = normalizeKey(match[1]);
    const start = (match.index || 0) + match[0].length;
    const end = matches[index + 1]?.index ?? markdown.length;
    sections[title] = markdown.slice(start, end).trim();
  });

  return sections;
}

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function linesFromSection(value = '') {
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*]\s+/, '').trim())
    .filter(Boolean);
}

function validateYouTubeId(id: string) {
  return !id || /^[a-zA-Z0-9_-]{6,20}$/.test(id);
}

function publicAssetExists(publicPath: string) {
  const diskPath = path.join(publicDir, publicPath.replace(/^\//, ''));
  return existsSync(diskPath);
}

// Serve the .webp sibling when one exists next to a png/jpeg source.
function preferWebp(publicPath: string) {
  if (!/\.(png|jpe?g)$/i.test(publicPath)) return publicPath;
  const webpPath = publicPath.replace(/\.(png|jpe?g)$/i, '.webp');
  return publicAssetExists(webpPath) ? webpPath : publicPath;
}

function main() {
  const warnings: string[] = [];
  const errors: string[] = [];

  const projectRows = existsSync(path.join(contentDir, 'projects.csv'))
    ? parseCsv(readFileSync(path.join(contentDir, 'projects.csv'), 'utf8'))
    : [];
  const featuredRows = existsSync(path.join(contentDir, 'featured-projects.csv'))
    ? parseCsv(readFileSync(path.join(contentDir, 'featured-projects.csv'), 'utf8'))
    : [];

  const seenSlugs = new Set<string>();
  const projectRecords = projectRows.map((row) => {
    if (!row.slug) errors.push('Project row missing slug.');
    if (seenSlugs.has(row.slug)) errors.push(`Duplicate project slug: ${row.slug}`);
    seenSlugs.add(row.slug);

    return {
      slug: row.slug,
      title: row.title,
      year: row.year,
      tier: row.tier || 'archive',
      domains: splitPipe(row.domains),
      stack: splitPipe(row.stack),
      connections: splitPipe(row.connections),
      status: row.status || 'public',
      showInWorks: row.showInWorks === 'true',
      hasProjectPage: row.hasProjectPage !== 'false',
      evidenceStatus: row.evidenceStatus || '',
    };
  });

  const projectContent: Record<string, unknown> = {};
  const projectGalleries: Record<string, unknown[]> = {};
  const featuredSlugs = featuredRows
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    .map((row) => row.slug)
    .filter(Boolean);
  const seenFeatured = new Set<string>();
  const projectSlugs = new Set(projectRows.map((row) => row.slug).filter(Boolean));

  featuredSlugs.forEach((slug) => {
    if (seenFeatured.has(slug)) errors.push(`Duplicate featured slug: ${slug}`);
    seenFeatured.add(slug);
    if (!projectSlugs.has(slug)) errors.push(`Featured project missing from content/projects.csv: ${slug}`);

    const dir = path.join(projectsDir, slug);
    if (!existsSync(dir)) errors.push(`Featured project missing folder: content/projects/${slug}`);
    if (!existsSync(path.join(dir, 'project.md'))) errors.push(`Featured project missing project.md: ${slug}`);
    if (!existsSync(path.join(dir, 'gallery.csv'))) errors.push(`Featured project missing gallery.csv: ${slug}`);
  });

  if (existsSync(projectsDir)) {
    readdirSync(projectsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .forEach((entry) => {
        const slug = entry.name;
        const dir = path.join(projectsDir, slug);
        const markdownPath = path.join(dir, 'project.md');
        const galleryPath = path.join(dir, 'gallery.csv');

        if (existsSync(markdownPath)) {
          const markdown = readFileSync(markdownPath, 'utf8');
          const sections = parseMarkdownSections(markdown);
          projectContent[slug] = {
            thesis: linesFromSection(sections.thesis).join(' '),
            shortDescription: linesFromSection(sections['short-description']).join(' '),
            fullDescription: linesFromSection(sections['full-description']).join('\n\n'),
            highlights: linesFromSection(sections.highlights),
            relatedSlugs: linesFromSection(sections['related-projects']),
          };
        }

        if (existsSync(galleryPath)) {
          projectGalleries[slug] = parseCsv(readFileSync(galleryPath, 'utf8'))
            .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
            .map((row, index) => {
              const type = row.type || 'image';
              const file = row.file;
              const rawSrc = file ? `/images/projects/${slug}/${file}` : '';
              const src = rawSrc ? preferWebp(rawSrc) : '';

              if (file && !publicAssetExists(rawSrc) && !publicAssetExists(src)) errors.push(`Missing image for ${slug}: ${rawSrc}`);
              if (!validateYouTubeId(row.youtubeId)) errors.push(`Invalid YouTube ID for ${slug} row ${row.order || index + 1}: ${row.youtubeId}`);
              if ((type === 'video' || type === 'audio') && !row.youtubeId) warnings.push(`Media slide without YouTube ID for ${slug} row ${row.order || index + 1}.`);

              return {
                type,
                src,
                poster: type === 'video' || type === 'audio' ? src : undefined,
                youtubeId: row.youtubeId || undefined,
                externalUrl: row.youtubeId ? `https://www.youtube.com/watch?v=${row.youtubeId}` : undefined,
                label: row.title,
                caption: row.caption,
                body: row.body.includes('|') ? splitPipe(row.body) : row.body || undefined,
                role: row.role || (index === 0 ? 'hero' : 'evidence'),
                layout: index === 0 ? 'hero' : 'wide',
                chapter: row.chapter,
                beat: row.caption,
                emphasis: row.emphasis || (index === 0 ? 'primary' : 'secondary'),
              };
            });
        }
      });
  }

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  warnings.forEach((warning) => console.warn(warning));

  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `/* Auto-generated by scripts/build-content.ts. Edit content/ instead. */
export const GENERATED_PROJECT_RECORDS = ${JSON.stringify(projectRecords, null, 2)};

export const GENERATED_CANONICAL_PROJECT_SLUGS = ${JSON.stringify(featuredSlugs, null, 2)};

export const GENERATED_PROJECT_CONTENT = ${JSON.stringify(projectContent, null, 2)};

export const GENERATED_PROJECT_GALLERIES = ${JSON.stringify(projectGalleries, null, 2)};
`);

  console.log(`Generated ${path.relative(root, outputPath)}`);
}

main();
