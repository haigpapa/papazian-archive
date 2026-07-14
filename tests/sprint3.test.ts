import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canCarryProjectToMode,
  getMapFilterContext,
  getModeTransitionDirection,
} from '../src/core/archiveContext';

test('mode transition direction follows the persistent console order', () => {
  assert.equal(getModeTransitionDirection('cylinder', 'map'), 1);
  assert.equal(getModeTransitionDirection('essays', 'grid'), -1);
  assert.equal(getModeTransitionDirection('vertical', 'vertical'), 0);
});

test('Index filters translate to the subset Map can express', () => {
  assert.deepEqual(getMapFilterContext({
    world: 'sonic-intelligence',
    medium: 'sound',
    assetType: 'video',
    sort: 'project',
    viewMode: 'hybrid',
  }), {
    world: 'sonic-intelligence',
    domain: 'sound',
    type: 'video',
  });

  assert.equal(getMapFilterContext({
    world: 'all',
    medium: 'all',
    assetType: 'hero',
    sort: 'project',
    viewMode: 'hybrid',
  }).type, 'all');
});

test('only canonical projects are carried into the curated Works spine', () => {
  assert.equal(canCarryProjectToMode('mashrou-leila', 'vertical'), true);
  assert.equal(canCarryProjectToMode('non-canonical-record', 'vertical'), false);
  assert.equal(canCarryProjectToMode('non-canonical-record', 'grid'), true);
  assert.equal(canCarryProjectToMode('mashrou-leila', 'essays'), false);
});
