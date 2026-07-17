import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import * as path from 'node:path';
import { chromium } from '@playwright/test';

const SERVER_URL = 'http://localhost:3008';
const ROOT_DIR = process.cwd();

async function checkUrl(url: string): Promise<{ status: number; duration: number; error?: string }> {
  const start = performance.now();
  try {
    const response = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'AssetAuditCrawler/1.0' } });
    const end = performance.now();
    return {
      status: response.status,
      duration: Math.round(end - start)
    };
  } catch (err: any) {
    const end = performance.now();
    return {
      status: 0,
      duration: Math.round(end - start),
      error: err.message || String(err)
    };
  }
}

async function main() {
  console.log('=== Content & Asset Audit Script ===');
  let hasErrors = false;

  // 1. Text Scraper: Scan codebase for 'lorem ipsum' placeholder text
  console.log('\nScanning codebase for "lorem ipsum" placeholder text...');
  const searchDirs = [
    path.join(ROOT_DIR, 'src'),
    path.join(ROOT_DIR, 'content')
  ];

  const filesWithLorem: string[] = [];

  function scanDirForLorem(dir: string) {
    if (!existsSync(dir)) return;
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDirForLorem(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.ts', '.tsx', '.json', '.csv', '.md', '.html', '.css'].includes(ext)) {
          const content = readFileSync(fullPath, 'utf8');
          if (content.toLowerCase().includes('lorem ipsum')) {
            filesWithLorem.push(fullPath);
          }
        }
      }
    }
  }

  for (const dir of searchDirs) {
    scanDirForLorem(dir);
  }

  if (filesWithLorem.length > 0) {
    console.error(`❌ Found "lorem ipsum" in the following files:`);
    filesWithLorem.forEach(f => console.error(`  - ${path.relative(ROOT_DIR, f)}`));
    hasErrors = true;
  } else {
    console.log('✅ No "lorem ipsum" placeholder text detected in codebase.');
  }

  // 2. Scan codebase for empty project descriptions/theses
  console.log('\nScanning project records for empty description or thesis fields...');
  const projectsCsvPath = path.join(ROOT_DIR, 'content', 'projects.csv');
  if (existsSync(projectsCsvPath)) {
    const csvContent = readFileSync(projectsCsvPath, 'utf8');
    const lines = csvContent.trim().split('\n').slice(1); // Skip header
    for (const [index, line] of lines.entries()) {
      const parts = line.split(',');
      const slug = parts[0];
      const title = parts[1];
      const showInWorks = parts[8];

      if (showInWorks === 'true') {
        // Look up its project.md description
        const projectMdPath = path.join(ROOT_DIR, 'content', 'projects', slug, 'project.md');
        if (!existsSync(projectMdPath)) {
          console.error(`❌ Empty description or missing folder for spine project "${title}" (${slug})`);
          hasErrors = true;
        } else {
          const mdContent = readFileSync(projectMdPath, 'utf8');
          if (!mdContent.trim() || mdContent.length < 50) {
            console.error(`❌ Short/empty description file for spine project "${title}" (${slug})`);
            hasErrors = true;
          }
        }
      }
    }
  }
  if (!hasErrors) {
    console.log('✅ All spine project description files are present and populated.');
  }

  // 3. Asset crawling & network status check
  console.log('\nStarting Playwright to crawl pages and collect assets...');

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  const pagesToCrawl = [
    '/',
    '/works',
    '/index',
    '/map',
    '/essays'
  ];

  const uniqueAssets = new Set<string>();

  for (const route of pagesToCrawl) {
    try {
      await page.goto(`${SERVER_URL}${route}`);
      await page.waitForLoadState('networkidle');

      // Extract all image src/srcset attributes
      const images = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img')).map(img => img.src);
      });

      // Extract all video src/poster/source attributes
      const videos = await page.evaluate(() => {
        const list: string[] = [];
        document.querySelectorAll('video').forEach(video => {
          if (video.src) list.push(video.src);
          if (video.poster) list.push(video.poster);
          video.querySelectorAll('source').forEach(source => {
            if (source.src) list.push(source.src);
          });
        });
        return list;
      });

      [...images, ...videos].forEach(src => {
        if (src && !src.startsWith('data:')) {
          uniqueAssets.add(src);
        }
      });
    } catch (err: any) {
      console.warn(`⚠️  Failed to crawl page ${route}: ${err.message}`);
    }
  }

  await browser.close();

  // Also include all assets from media-manifest.json if it exists
  const mediaManifestPath = path.join(ROOT_DIR, 'public', 'media-manifest.json');
  if (existsSync(mediaManifestPath)) {
    try {
      const manifest = JSON.parse(readFileSync(mediaManifestPath, 'utf8'));
      for (const project of manifest.projects || []) {
        for (const asset of project.assets || []) {
          if (asset.src) {
            const absoluteUrl = asset.src.startsWith('http') ? asset.src : `${SERVER_URL}${asset.src}`;
            uniqueAssets.add(absoluteUrl);
          }
        }
      }
    } catch (e: any) {
      console.warn(`⚠️  Failed to read media-manifest: ${e.message}`);
    }
  }

  console.log(`Found ${uniqueAssets.size} unique assets to check...`);

  let checked = 0;
  let broken = 0;
  let slow = 0;

  for (const asset of uniqueAssets) {
    const res = await checkUrl(asset);
    checked++;

    if (res.status === 404 || res.status === 0) {
      console.error(`❌ BROKEN LINK [${res.status}]: ${asset} ${res.error ? `(${res.error})` : ''}`);
      broken++;
      hasErrors = true;
    } else if (res.duration > 1500) {
      console.warn(`⚠️  SLOW LOAD [${res.duration}ms]: ${asset}`);
      slow++;
    }
  }

  console.log('\n--- Audit Summary ---');
  console.log(`Checked: ${checked} assets`);
  console.log(`Broken links: ${broken}`);
  console.log(`Slow links (>1500ms): ${slow}`);
  console.log('---------------------');

  if (hasErrors) {
    console.error('❌ Content & Asset Audit FAILED with errors.');
    process.exit(1);
  } else {
    console.log('✅ Content & Asset Audit PASSED successfully.');
  }
}

main().catch(err => {
  console.error('Fatal error during audit:', err);
  process.exit(1);
});
