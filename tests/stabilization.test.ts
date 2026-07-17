import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fetchAtlasNodes, getEmbeddedArchiveNodes } from '../src/data/atlas';
import { CANONICAL_PROJECT_SLUGS } from '../src/data/canonicalProjects';
import { MEDIA_DIMENSIONS } from '../src/data/generated/mediaDimensions';

test('embedded archive fallback remains useful without the mutable atlas CSV', () => {
  const nodes = getEmbeddedArchiveNodes();

  assert.ok(nodes.length >= 20);
  assert.equal(new Set(nodes.map((node) => node.slug)).size, nodes.length);
  assert.ok(nodes.every((node) => node.title && node.summary));
  assert.ok(nodes.some((node) => node.gallery.length > 0));
  assert.ok(nodes.some((node) => node.slug === 'mashrou-leila'));
});

test('every canonical project has a complete cinematic narrative rail', () => {
  const nodes = getEmbeddedArchiveNodes();
  const nodesBySlug = new Map(nodes.map((node) => [node.slug, node]));

  CANONICAL_PROJECT_SLUGS.forEach((slug) => {
    const node = nodesBySlug.get(slug);
    assert.ok(node, `Missing canonical project: ${slug}`);

    const gallery = node.gallery;
    assert.ok(gallery.length >= 8, `${slug} has a thin rail with only ${gallery.length} slides`);
    assert.equal(gallery[0]?.role, 'hero', `${slug} must open with a hero frame`);
    assert.equal(gallery.at(-1)?.role, 'coda', `${slug} must close with a coda frame`);
    assert.ok(
      gallery.every((slide) => slide.label && slide.caption && slide.chapter),
      `${slug} has incomplete rail metadata`,
    );
  });
});

test('every canonical rail image has a known aspect ratio before hydration', () => {
  const nodes = getEmbeddedArchiveNodes();
  const canonicalSlugs = new Set(CANONICAL_PROJECT_SLUGS);

  nodes
    .filter((node) => canonicalSlugs.has(node.slug))
    .flatMap((node) => node.gallery)
    .filter((slide) => (slide.type || 'image') === 'image' && slide.src)
    .forEach((slide) => {
      assert.ok(MEDIA_DIMENSIONS[slide.src], `Missing media dimensions for ${slide.src}`);
    });
});

test('atlas requests require cache revalidation', async () => {
  const originalFetch = globalThis.fetch;
  let requestCache: RequestCache | undefined;

  globalThis.fetch = async (_input, init) => {
    requestCache = init?.cache;
    return new Response('', { status: 503 });
  };

  try {
    await assert.rejects(fetchAtlasNodes, /Unable to load atlas data: 503/);
    assert.equal(requestCache, 'no-cache');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Vercel applies an exact revalidation policy to atlas.csv', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  const atlasRule = config.headers.find((rule: { source: string }) => (
    rule.source === '/images/atlas/atlas.csv'
  ));

  assert.ok(atlasRule);
  assert.deepEqual(atlasRule.headers, [
    { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
  ]);
});
