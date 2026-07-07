import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAtlasNodes } from '../src/data/atlas.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://papazian.co';

async function generateShells() {
  const distDir = path.resolve(__dirname, '../dist');
  const indexHtmlPath = path.join(distDir, 'index.html');
  
  if (!fs.existsSync(indexHtmlPath)) {
    console.error('dist/index.html not found. Run build first.');
    return;
  }
  
  const template = fs.readFileSync(indexHtmlPath, 'utf-8');
  
  const routes = [
    { path: 'works', title: 'Works — Haig Papazian', desc: 'A chronological view of works and projects.', image: `${BASE_URL}/og-image.jpg` },
    { path: 'index', title: 'Index — Haig Papazian', desc: 'Grid view of the archive.', image: `${BASE_URL}/og-image.jpg` },
    { path: 'map', title: 'Map — Haig Papazian', desc: 'Spatial map of relational concepts.', image: `${BASE_URL}/og-image.jpg` },
    { path: 'essays', title: 'Essays — Haig Papazian', desc: 'Writings and essays.', image: `${BASE_URL}/og-image.jpg` },
  ];
  
  const nodes = await fetchAtlasNodes();
  for (const node of nodes) {
    let imageUrl = '/og-image.jpg';
    if (node.thumbnail && !node.thumbnail.startsWith('http')) {
      imageUrl = node.thumbnail;
    }
    
    const cleanImageUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : `${BASE_URL}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;

    routes.push({
      path: `case-studies/${node.slug}`,
      title: `${node.title} — Haig Papazian`,
      desc: node.summary || node.shortDescription || 'A project in the Papazian Archive.',
      image: cleanImageUrl
    });
  }
  
  for (const route of routes) {
    const routeDir = path.join(distDir, route.path);
    fs.mkdirSync(routeDir, { recursive: true });
    
    // Replace <title>
    let html = template.replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`);
    
    // Inject OG tags
    const ogTags = `
    <meta property="og:title" content="${route.title}" />
    <meta property="og:description" content="${route.desc}" />
    <meta property="og:image" content="${route.image}" />
    <meta property="og:url" content="${BASE_URL}/${route.path}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${route.title}" />
    <meta name="twitter:description" content="${route.desc}" />
    <meta name="twitter:image" content="${route.image}" />
    `;
    
    html = html.replace('</head>', `${ogTags}\n</head>`);
    
    fs.writeFileSync(path.join(routeDir, 'index.html'), html);
    console.log(`Generated shell for /${route.path}`);
  }
}

generateShells().catch(console.error);
