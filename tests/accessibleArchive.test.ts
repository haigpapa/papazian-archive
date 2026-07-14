import assert from 'node:assert/strict';
import test from 'node:test';
import { filterArchiveNodes, resolveArchiveNode } from '../src/components/AccessibleArchiveIndex';

const nodes = [
  {
    slug: 'sonic-system',
    title: 'Sonic System',
    year: '2025',
    category: 'Music',
    summary: 'A listening instrument.',
    domains: ['Sonic Intelligence'],
    tags: ['audio'],
  },
  {
    slug: 'public-room',
    title: 'Public Room',
    year: '2022',
    category: 'Architecture',
    summary: 'A civic interior.',
    domains: ['Public Culture'],
    tags: ['space'],
  },
];

test('text archive search covers title, year, category, world, summary, and tags', () => {
  assert.deepEqual(filterArchiveNodes(nodes, 'sonic').map((node) => node.slug), ['sonic-system']);
  assert.deepEqual(filterArchiveNodes(nodes, '2022').map((node) => node.slug), ['public-room']);
  assert.deepEqual(filterArchiveNodes(nodes, 'architecture').map((node) => node.slug), ['public-room']);
  assert.deepEqual(filterArchiveNodes(nodes, 'listening').map((node) => node.slug), ['sonic-system']);
  assert.deepEqual(filterArchiveNodes(nodes, 'public culture').map((node) => node.slug), ['public-room']);
  assert.deepEqual(filterArchiveNodes(nodes, 'audio').map((node) => node.slug), ['sonic-system']);
});

test('text archive selection stays inside the filtered result set', () => {
  const filtered = filterArchiveNodes(nodes, 'public');
  assert.equal(resolveArchiveNode(filtered, 'sonic-system')?.slug, 'public-room');
  assert.equal(resolveArchiveNode([], 'sonic-system'), null);
});
