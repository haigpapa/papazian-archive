import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { CANONICAL_PROJECT_SET } from '../src/data/canonicalProjects';

type Dimensions = { width: number; height: number } | null;

function webpDimensions(buffer: Buffer): Dimensions {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') return null;
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const type = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (type === 'VP8X' && data + 10 <= buffer.length) {
      return { width: buffer.readUIntLE(data + 4, 3) + 1, height: buffer.readUIntLE(data + 7, 3) + 1 };
    }
    if (type === 'VP8 ' && data + 10 <= buffer.length && buffer[data + 3] === 0x9d && buffer[data + 4] === 0x01 && buffer[data + 5] === 0x2a) {
      return { width: buffer.readUInt16LE(data + 6) & 0x3fff, height: buffer.readUInt16LE(data + 8) & 0x3fff };
    }
    if (type === 'VP8L' && data + 5 <= buffer.length && buffer[data] === 0x2f) {
      const bits = buffer.readUInt32LE(data + 1);
      return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
    }
    offset = data + size + (size % 2);
  }
  return null;
}

function jpegDimensions(buffer: Buffer): Dimensions {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) { offset += 1; continue; }
    const marker = buffer[offset + 1];
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
    }
    if (marker === 0xd8 || marker === 0xd9) { offset += 2; continue; }
    const size = buffer.readUInt16BE(offset + 2);
    if (size < 2) return null;
    offset += 2 + size;
  }
  return null;
}

function dimensions(buffer: Buffer, extension: string): Dimensions {
  if (extension === '.webp') return webpDimensions(buffer);
  if (extension === '.png' && buffer.length >= 24 && buffer.toString('ascii', 1, 4) === 'PNG') {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (extension === '.jpg' || extension === '.jpeg') return jpegDimensions(buffer);
  return null;
}

const root = process.cwd();
const publicDir = path.join(root, 'public');
const galleryPath = path.join(root, 'scripts', 'gallery-manifest.json');
const outputPath = path.join(publicDir, 'media-manifest.json');
const dimensionsOutputPath = path.join(root, 'src', 'data', 'generated', 'mediaDimensions.ts');
const gallery = JSON.parse(readFileSync(galleryPath, 'utf8')) as Record<string, string[]>;

const projects = Object.entries(gallery)
  .filter(([projectId]) => CANONICAL_PROJECT_SET.has(projectId))
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([projectId, sources]) => ({
    projectId,
    assets: sources.map((src, index) => {
      if (/^https?:\/\//.test(src)) {
        return { projectId, src, role: index === 0 ? 'primary' : 'gallery', status: 'external', width: null, height: null, aspectRatio: null, bytes: null, digest: null };
      }
      const diskPath = path.join(publicDir, src.replace(/^\//, ''));
      if (!existsSync(diskPath)) {
        return { projectId, src, role: index === 0 ? 'primary' : 'gallery', status: 'missing', width: null, height: null, aspectRatio: null, bytes: null, digest: null };
      }
      const buffer = readFileSync(diskPath);
      const size = dimensions(buffer, path.extname(diskPath).toLowerCase());
      return {
        projectId,
        src,
        role: index === 0 ? 'primary' : 'gallery',
        status: size ? 'matched' : 'needs-review',
        width: size?.width ?? null,
        height: size?.height ?? null,
        aspectRatio: size ? Number((size.width / size.height).toFixed(4)) : null,
        bytes: buffer.byteLength,
        digest: createHash('sha256').update(buffer).digest('hex').slice(0, 16),
      };
    }),
  }));

const assetCount = projects.reduce((total, project) => total + project.assets.length, 0);
writeFileSync(outputPath, `${JSON.stringify({ version: 1, projectCount: projects.length, assetCount, projects }, null, 2)}\n`);
const dimensionEntries: [string, { width: number; height: number }][] = [];
projects.flatMap((project) => project.assets).forEach((asset) => {
  if (asset.width && asset.height) {
    dimensionEntries.push([asset.src, { width: asset.width, height: asset.height }]);
    
    // Auto-detect and register the small.webp variant dimensions
    if (!asset.src.startsWith('http')) {
      const ext = path.extname(asset.src);
      const smallSrc = asset.src.slice(0, asset.src.lastIndexOf(ext)) + '-small.webp';
      const smallDiskPath = path.join(publicDir, smallSrc.replace(/^\//, ''));
      if (existsSync(smallDiskPath)) {
        try {
          const smallBuffer = readFileSync(smallDiskPath);
          const smallSize = dimensions(smallBuffer, '.webp');
          if (smallSize) {
            dimensionEntries.push([smallSrc, { width: smallSize.width, height: smallSize.height }]);
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }
});

writeFileSync(
  dimensionsOutputPath,
  `// Generated by scripts/build-media-manifest.ts. Do not edit manually.\nexport const MEDIA_DIMENSIONS: Record<string, { width: number; height: number }> = ${JSON.stringify(Object.fromEntries(dimensionEntries), null, 2)};\n`,
);
console.log(`Generated public/media-manifest.json with ${projects.length} projects and ${assetCount} assets`);
