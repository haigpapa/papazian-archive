import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { GENERATED_CANONICAL_PROJECT_SLUGS, GENERATED_PROJECT_GALLERIES } from '../src/data/generated/content';
import { PROJECT_GALLERIES } from '../src/data/projectGalleries';

const manifest: Record<string, string[]> = {};

GENERATED_CANONICAL_PROJECT_SLUGS.forEach((slug) => {
  const content = (GENERATED_PROJECT_GALLERIES as Record<string, any[]>)[slug] || PROJECT_GALLERIES[slug];
  if (content && Array.isArray(content)) {
    // Collect all image sources
    manifest[slug] = content
      .filter((item: any) => item.type === 'image' || !item.type) // default type is image
      .map((item: any) => item.src || item.poster || '')
      .filter(Boolean);
  } else {
    manifest[slug] = [];
  }
});

const outputPath = join(process.cwd(), 'scripts', 'gallery-manifest.json');
writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf-8');
console.log(`Exported gallery manifest with ${Object.keys(manifest).length} projects to ${outputPath}`);
