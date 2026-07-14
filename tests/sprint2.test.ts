import assert from 'node:assert/strict';
import test from 'node:test';
import { getIndexAssetMedium, sortIndexAssets } from '../src/utils/indexAssets';

const assets = [
  { id: 'b-1', projectId: 'mashrou-leila', projectTitle: 'Mashrou Leila', year: '2014', domains: ['sound'], assetIndex: 0 },
  { id: 'a-2', projectId: 'architecture-in-low-res', projectTitle: 'Architecture in Low Res', year: '2015', domains: ['space'], assetIndex: 1 },
  { id: 'a-1', projectId: 'architecture-in-low-res', projectTitle: 'Architecture in Low Res', year: '2015', domains: ['image'], assetIndex: 0 },
];

test('mobile Index project sorting groups records and preserves their asset order', () => {
  assert.deepEqual(
    sortIndexAssets(assets, 'project').map((asset) => asset.id),
    ['a-1', 'a-2', 'b-1'],
  );
});

test('mobile Index year sorting is newest-first and stable inside a project', () => {
  assert.deepEqual(
    sortIndexAssets(assets, 'year').map((asset) => asset.id),
    ['a-1', 'a-2', 'b-1'],
  );
});

test('mobile Index supports world and medium sorting without mutating source data', () => {
  const sourceOrder = assets.map((asset) => asset.id);
  assert.deepEqual(sortIndexAssets(assets, 'world').map((asset) => asset.id), ['a-1', 'a-2', 'b-1']);
  assert.deepEqual(sortIndexAssets(assets, 'medium').map((asset) => asset.id), ['a-1', 'b-1', 'a-2']);
  assert.deepEqual(assets.map((asset) => asset.id), sourceOrder);
  assert.equal(getIndexAssetMedium({ category: 'systems' }), 'systems');
});
