import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

type Row = Record<string, string>;

const root = process.cwd();
const contentDir = path.join(root, 'content');
const projectsDir = path.join(contentDir, 'projects');
const imagesDir = path.join(root, 'public/images/projects');
const publicDir = path.join(root, 'public');

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

function countFiles(dir: string) {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter((file) => !file.startsWith('.') && !file.endsWith('.md')).length;
}

function existsPublicAsset(slug: string, file: string) {
  return existsSync(path.join(publicDir, 'images/projects', slug, file));
}

function main() {
  const projects = parseCsv(readFileSync(path.join(contentDir, 'projects.csv'), 'utf8'));
  const featured = parseCsv(readFileSync(path.join(contentDir, 'featured-projects.csv'), 'utf8')).map((row) => row.slug);
  const projectSlugs = new Set(projects.map((row) => row.slug));
  const statusCounts = projects.reduce<Record<string, number>>((counts, project) => {
    const status = project.status || 'public';
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});

  const missingFolders: string[] = [];
  const missingProjectMd: string[] = [];
  const missingGallery: string[] = [];
  const missingMetadata = featured.filter((slug) => !projectSlugs.has(slug));
  const missingImages: string[] = [];
  const completeRails: string[] = [];
  const fallbackRails: string[] = [];

  featured.forEach((slug) => {
    const projectDir = path.join(projectsDir, slug);
    const galleryPath = path.join(projectDir, 'gallery.csv');
    const imageCount = countFiles(path.join(imagesDir, slug));

    if (!existsSync(projectDir)) missingFolders.push(slug);
    if (!existsSync(path.join(projectDir, 'project.md'))) missingProjectMd.push(slug);
    if (!existsSync(galleryPath)) {
      missingGallery.push(slug);
      fallbackRails.push(slug);
      return;
    }

    const rows = parseCsv(readFileSync(galleryPath, 'utf8'));
    rows.forEach((row) => {
      if (row.file && !existsPublicAsset(slug, row.file)) {
        missingImages.push(`${slug}/${row.file}`);
      }
    });

    if (rows.length && imageCount) completeRails.push(slug);
    if (!rows.length || !imageCount) fallbackRails.push(slug);
  });

  console.log([
    'Portfolio Content Report',
    '========================',
    `Total project metadata rows: ${projects.length}`,
    `Featured Works count: ${featured.length}`,
    `Complete starter rails: ${completeRails.length}`,
    `Projects still using fallback/empty rail: ${fallbackRails.length}`,
    `Projects missing folders: ${missingFolders.length}`,
    `Projects missing project.md: ${missingProjectMd.length}`,
    `Projects missing gallery.csv: ${missingGallery.length}`,
    `Missing image references: ${missingImages.length}`,
    `Featured slugs missing metadata: ${missingMetadata.length}`,
    `Status counts: ${JSON.stringify(statusCounts)}`,
    '',
    missingMetadata.length ? `Missing metadata: ${missingMetadata.join(', ')}` : 'Missing metadata: none',
    fallbackRails.length ? `Fallback/empty rails: ${fallbackRails.join(', ')}` : 'Fallback/empty rails: none',
    missingImages.length ? `Missing images: ${missingImages.join(', ')}` : 'Missing images: none',
  ].join('\n'));
}

main();
