import { gzipSync } from 'node:zlib';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { CANONICAL_PROJECT_SLUGS } from '../src/data/canonicalProjects';
import { GENERATED_PROJECT_GALLERIES } from '../src/data/generated/content';

const root = process.cwd();
const dist = path.join(root, 'dist');
const errors: string[] = [];
const warnings: string[] = [];
const MAX_JS_CHUNK_BYTES = 600 * 1024;
const MAX_ENTRY_BYTES = 450 * 1024;
const MAX_TOTAL_JS_GZIP_BYTES = 560 * 1024;

function requireMatch(html: string, pattern: RegExp, label: string) {
  if (!pattern.test(html)) errors.push(`Missing ${label}`);
}

const manifestPath = path.join(dist, '.vite', 'manifest.json');
if (!existsSync(manifestPath)) errors.push('Missing Vite build manifest.');
const viteManifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, { file: string; imports?: string[]; dynamicImports?: string[]; isEntry?: boolean; isDynamicEntry?: boolean }>
  : {};

const jsFiles = readdirSync(path.join(dist, 'assets')).filter((file) => file.endsWith('.js'));
let totalGzip = 0;
for (const file of jsFiles) {
  const diskPath = path.join(dist, 'assets', file);
  const bytes = statSync(diskPath).size;
  const gzipBytes = gzipSync(readFileSync(diskPath)).byteLength;
  totalGzip += gzipBytes;
  if (bytes > MAX_JS_CHUNK_BYTES) errors.push(`JavaScript chunk ${file} is ${(bytes / 1024).toFixed(1)} KB; limit is 600 KB.`);
}
if (totalGzip > MAX_TOTAL_JS_GZIP_BYTES) errors.push(`Total JavaScript gzip is ${(totalGzip / 1024).toFixed(1)} KB; limit is 560 KB.`);

const entry = Object.values(viteManifest).find((item) => item.isEntry);
if (!entry) errors.push('Unable to identify the Vite entry chunk.');
if (entry) {
  const entryBytes = statSync(path.join(dist, entry.file)).size;
  if (entryBytes > MAX_ENTRY_BYTES) errors.push(`Entry chunk is ${(entryBytes / 1024).toFixed(1)} KB; limit is 450 KB.`);
}

if (jsFiles.some((file) => file.includes('vite-browser-external'))) {
  errors.push('Browser build contains a Node.js external shim.');
}

const toneFile = jsFiles.find((file) => readFileSync(path.join(dist, 'assets', file), 'utf8').includes('ToneAudioNode'));
if (!toneFile) errors.push('Unable to identify the deferred Tone.js chunk.');
if (entry && toneFile && entry.file.endsWith(toneFile)) errors.push('Tone.js was bundled into the entry chunk.');
const toneManifestEntry = Object.entries(viteManifest).find(([key]) => key.includes('node_modules/tone/'))?.[1];
if (!toneManifestEntry?.isDynamicEntry) errors.push('Tone.js is not marked as a dynamic entry in the Vite manifest.');

const rootHtml = readFileSync(path.join(dist, 'index.html'), 'utf8');
requireMatch(rootHtml, /<title>[^<]+<\/title>/, 'root title');
requireMatch(rootHtml, /name="description"\s+content="[^"]+"/, 'root description');
requireMatch(rootHtml, /rel="canonical" href="https:\/\/papazian\.studio/, 'root canonical URL');
requireMatch(rootHtml, /"@type":"WebSite"/, 'WebSite structured data');
requireMatch(rootHtml, /"@type":"CollectionPage"/, 'CollectionPage structured data');
requireMatch(rootHtml, /id="static-shell"/, 'crawlable root shell');

const expectedHtml = [
  ...['works', 'index', 'map', 'essays'].map((route) => path.join(dist, route, 'index.html')),
  ...CANONICAL_PROJECT_SLUGS.map((slug) => path.join(dist, 'case-studies', slug, 'index.html')),
];
const socialImages = new Map<string, string[]>();
const descriptions = new Map<string, string[]>();
for (const htmlPath of expectedHtml) {
  if (!existsSync(htmlPath)) { errors.push(`Missing static route ${path.relative(dist, htmlPath)}`); continue; }
  const html = readFileSync(htmlPath, 'utf8');
  requireMatch(html, /<title>[^<]+<\/title>/, `${path.relative(dist, htmlPath)} title`);
  requireMatch(html, /name="description"\s+content="[^"]+"/, `${path.relative(dist, htmlPath)} description`);
  requireMatch(html, /property="og:image" content="https:\/\/papazian\.studio\/[^"]+"/, `${path.relative(dist, htmlPath)} Open Graph image`);
  requireMatch(html, /id="static-shell"/, `${path.relative(dist, htmlPath)} crawlable shell`);
  if (htmlPath.includes(`${path.sep}case-studies${path.sep}`)) {
    requireMatch(html, /"@type":"CreativeWork"/, `${path.relative(dist, htmlPath)} CreativeWork data`);
    const slug = path.basename(path.dirname(htmlPath));
    const description = html.match(/name="description"\s+content="([^"]+)"/)?.[1];
    const socialImage = html.match(/property="og:image" content="([^"]+)"/)?.[1];
    if (description) descriptions.set(description, [...(descriptions.get(description) || []), slug]);
    if (socialImage) socialImages.set(socialImage, [...(socialImages.get(socialImage) || []), slug]);
  }
}
for (const [description, slugs] of descriptions) {
  if (slugs.length > 1) errors.push(`Duplicate project description for ${slugs.join(', ')}: ${description.slice(0, 80)}`);
}
for (const [image, slugs] of socialImages) {
  if (slugs.length > 1) errors.push(`Duplicate project Open Graph image for ${slugs.join(', ')}: ${image}`);
}

for (const slug of CANONICAL_PROJECT_SLUGS) {
  const gallery = (GENERATED_PROJECT_GALLERIES as Record<string, Array<{ type?: string; src?: string; poster?: string; label?: string }>>)[slug];
  if (!gallery?.length) {
    errors.push(`Canonical project ${slug} is missing its generated canonical gallery.`);
    continue;
  }
  for (const [index, asset] of gallery.entries()) {
    const source = asset.src || asset.poster || '';
    if (!asset.label?.trim() || asset.label.trim().length < 3) errors.push(`Canonical project ${slug} asset ${index + 1} has malformed alt text.`);
    if ((asset.type === 'image' || !asset.type) && source && !source.startsWith(`/images/projects/${slug}/`) && !/^https?:\/\//.test(source)) {
      errors.push(`Canonical project ${slug} uses a noncanonical media path: ${source}`);
    }
  }
}

const sitemap = readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>/g)].length;
const expectedUrlCount = 1 + 4 + CANONICAL_PROJECT_SLUGS.length;
if (sitemapUrls !== expectedUrlCount) errors.push(`Sitemap contains ${sitemapUrls} URLs; expected ${expectedUrlCount}.`);

const mediaManifestPath = path.join(root, 'public', 'media-manifest.json');
if (!existsSync(mediaManifestPath)) errors.push('Missing public/media-manifest.json.');
if (existsSync(mediaManifestPath)) {
  const media = JSON.parse(readFileSync(mediaManifestPath, 'utf8')) as { projects: Array<{ projectId: string; assets: Array<{ status: string; role: string; digest: string | null; src: string }> }> };
  const byProject = new Map(media.projects.map((project) => [project.projectId, project]));
  for (const slug of CANONICAL_PROJECT_SLUGS) {
    const project = byProject.get(slug);
    if (!project?.assets.length) errors.push(`Canonical project ${slug} has no media-manifest assets.`);
    for (const asset of project?.assets || []) {
      if (asset.status === 'missing') errors.push(`Missing asset: ${asset.src}`);
      if (asset.status === 'needs-review') warnings.push(`Dimensions need review: ${asset.src}`);
    }
  }
  const primaryDigests = new Map<string, string[]>();
  for (const project of media.projects) {
    const primary = project.assets.find((asset) => asset.role === 'primary' && asset.digest);
    if (!primary?.digest) continue;
    primaryDigests.set(primary.digest, [...(primaryDigests.get(primary.digest) || []), project.projectId]);
  }
  for (const slugs of primaryDigests.values()) {
    if (slugs.length > 1) errors.push(`Duplicate primary media: ${slugs.join(', ')}`);
  }
}

for (const warning of warnings) console.warn(`WARN ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exit(1);
}

console.log(`Build verification passed: ${jsFiles.length} JS chunks, ${(totalGzip / 1024).toFixed(1)} KB total gzip, ${expectedHtml.length + 1} HTML pages, ${sitemapUrls} sitemap URLs.`);
