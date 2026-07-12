/**
 * Post-build SSG pass: rewrites dist/index.html metadata and emits static
 * shells for /case-studies/<slug> and mode routes so crawlers, link previews,
 * and AI assistants see real per-page titles, descriptions, Open Graph tags,
 * JSON-LD, and crawlable body text. The SPA removes #static-shell on mount.
 *
 * Also generates dist/sitemap.xml from the same data so it can never drift
 * from the content.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAtlasNodes, type AtlasNode } from '../src/data/atlas.ts';
import { CANONICAL_PROJECT_SET } from '../src/data/canonicalProjects.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://papazian.studio';
const PERSON = {
  '@type': 'Person',
  name: 'Haig Papazian',
  url: BASE_URL,
};

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function absolute(url: string): string {
  if (!url) return `${BASE_URL}/og-image.jpg`;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
}

/** Replace the head's title/description/canonical/OG/Twitter values in place. */
function applyMeta(template: string, meta: { title: string; desc: string; url: string; image: string }): string {
  const title = esc(meta.title);
  const desc = esc(meta.desc);
  const image = esc(meta.image);
  const url = esc(meta.url);

  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[\s\S]*?(")/, `$1${desc}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:title" content=")[\s\S]*?(")/, `$1${title}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[\s\S]*?(")/, `$1${desc}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${image}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[\s\S]*?(")/, `$1${title}$2`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[\s\S]*?(")/, `$1${desc}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${image}$2`);
}

function injectJsonLd(html: string, data: object): string {
  const script = `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
  return html.replace('</head>', `    ${script}\n  </head>`);
}

/** Crawlable body content; the app removes #static-shell when it mounts. */
function injectShellBody(html: string, body: string): string {
  const shell = `<div id="static-shell" style="font-family:monospace;background:#000;color:#bbb;padding:24px;max-width:720px;line-height:1.6">${body}</div>`;
  return html.replace('<div id="root"></div>', `<div id="root"></div>\n    ${shell}`);
}

function projectBody(node: AtlasNode, projects: AtlasNode[]): string {
  const parts: string[] = [];
  parts.push(`<p><a href="/" style="color:#d7e7ef">← Haig Papazian — Spatial Archive</a></p>`);
  parts.push(`<h1>${esc(node.title)}</h1>`);
  parts.push(`<p>${esc([node.year, node.domains.join(', ')].filter(Boolean).join(' · '))}</p>`);
  if (node.thesis) parts.push(`<p><em>${esc(node.thesis)}</em></p>`);
  for (const para of (node.fullDescription || '').split(/\n\n+/).filter(Boolean)) {
    parts.push(`<p>${esc(para)}</p>`);
  }
  if (node.highlights?.length) {
    parts.push(`<ul>${node.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>`);
  }
  const related = (node.relatedSlugs || []).filter((slug) => projects.some((p) => p.slug === slug));
  if (related.length) {
    parts.push(
      `<p>Related: ${related
        .map((slug) => `<a href="/case-studies/${slug}" style="color:#d7e7ef">${esc(slug.replace(/-/g, ' '))}</a>`)
        .join(' · ')}</p>`
    );
  }
  return parts.join('\n');
}

function rootBody(projects: AtlasNode[]): string {
  const items = projects
    .map(
      (p) =>
        `<li><a href="/case-studies/${p.slug}" style="color:#d7e7ef">${esc(p.title)}</a> (${esc(p.year)}) — ${esc(
          p.shortDescription || p.summary || ''
        )}</li>`
    )
    .join('\n');
  return [
    `<h1>Haig Papazian — Spatial Archive</h1>`,
    `<p>A living archive of works spanning music, architecture, software, and cultural infrastructure.</p>`,
    `<h2>Works</h2>`,
    `<ul>${items}</ul>`,
    `<p><a href="/essays" style="color:#d7e7ef">Essays</a> · <a href="/cv.pdf" style="color:#d7e7ef">CV</a></p>`,
  ].join('\n');
}

async function generateShells() {
  const distDir = path.resolve(__dirname, '../dist');
  const indexHtmlPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    console.error('dist/index.html not found. Run build first.');
    process.exit(1);
  }
  const template = fs.readFileSync(indexHtmlPath, 'utf-8');

  const nodes = await fetchAtlasNodes();
  const projects = nodes.filter((node) => CANONICAL_PROJECT_SET.has(node.slug));

  // ── Root page: ItemList JSON-LD + crawlable works list ──
  let rootHtml = injectJsonLd(template, {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Works — Haig Papazian',
    itemListElement: projects.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.title,
      url: `${BASE_URL}/case-studies/${p.slug}`,
    })),
  });
  rootHtml = injectShellBody(rootHtml, rootBody(projects));
  fs.writeFileSync(indexHtmlPath, rootHtml);
  console.log('Enhanced root index.html');

  // ── Mode routes ──
  const modeRoutes = [
    { path: 'works', title: 'Works — Haig Papazian', desc: 'Twenty selected works spanning music, architecture, software, and cultural infrastructure.' },
    { path: 'index', title: 'Index — Haig Papazian', desc: 'The full archive grid: 120 records filterable by world, medium, and type.' },
    { path: 'map', title: 'Map — Haig Papazian', desc: 'A spatial atlas of projects and the relations between them.' },
    { path: 'essays', title: 'Essays — Haig Papazian', desc: 'Writings and operating statements from the archive.' },
  ];
  for (const route of modeRoutes) {
    let html = applyMeta(template, {
      title: route.title,
      desc: route.desc,
      url: `${BASE_URL}/${route.path}`,
      image: `${BASE_URL}/og-image.jpg`,
    });
    html = injectShellBody(html, rootBody(projects));
    const dir = path.join(distDir, route.path);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
  }
  console.log(`Generated ${modeRoutes.length} mode route shells`);

  // ── Case-study pages ──
  for (const node of projects) {
    const url = `${BASE_URL}/case-studies/${node.slug}`;
    const desc = node.shortDescription || node.summary || 'A project in the Papazian Archive.';
    let html = applyMeta(template, {
      title: `${node.title} — Haig Papazian`,
      desc,
      url,
      image: absolute(node.thumbnail || node.image),
    });
    html = injectJsonLd(html, {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: node.title,
      url,
      dateCreated: node.year,
      description: desc,
      abstract: node.thesis || undefined,
      image: absolute(node.thumbnail || node.image),
      keywords: node.domains.join(', '),
      author: PERSON,
    });
    html = injectShellBody(html, projectBody(node, projects));
    const dir = path.join(distDir, 'case-studies', node.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
  }
  console.log(`Generated ${projects.length} case-study shells`);

  // ── Sitemap (single source of truth: this data) ──
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${BASE_URL}/`, priority: '1.0' },
    ...modeRoutes.map((r) => ({ loc: `${BASE_URL}/${r.path}`, priority: '0.8' })),
    ...projects.map((p) => ({ loc: `${BASE_URL}/case-studies/${p.slug}`, priority: '0.7' })),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap);
  console.log(`Generated sitemap.xml with ${urls.length} URLs`);
}

generateShells().catch((error) => {
  console.error(error);
  process.exit(1);
});
