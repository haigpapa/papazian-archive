import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AudioInitializationTimeoutError,
  withAudioTimeout,
} from '../src/audio/audioInitialization';
import {
  MAX_RAIL_INPUT_DELTA_PX,
  clampRailInputDelta,
  normalizeRailInputDelta,
} from '../src/core/scrollInput';
import { findClosestRailIndex, getAdjacentRailIndex } from '../src/core/railState';

test('audio initialization rejects a never-resolving stage within its deadline', async () => {
  const neverResolves = new Promise<void>(() => {});
  const startedAt = performance.now();

  await assert.rejects(
    withAudioTimeout(neverResolves, 20, 'reverb generation'),
    (error: unknown) => error instanceof AudioInitializationTimeoutError
      && error.stage === 'reverb generation',
  );

  assert.ok(performance.now() - startedAt < 250);
});

test('audio initialization clears its timeout when the stage resolves', async () => {
  const value = await withAudioTimeout(Promise.resolve('ready'), 50, 'module loading');
  assert.equal(value, 'ready');
});

test('audio initialization preserves a stage rejection for recovery handling', async () => {
  const failure = new Error('context blocked');
  await assert.rejects(
    withAudioTimeout(Promise.reject(failure), 50, 'audio context start'),
    (error: unknown) => error === failure,
  );
});

test('a large rail wheel gesture is limited to less than one logical slide step', () => {
  assert.equal(
    normalizeRailInputDelta(-520, { deltaY: 520, deltaMode: 0 }, 844),
    -MAX_RAIL_INPUT_DELTA_PX,
  );
});

test('rail input normalizes line deltas and clamps non-wheel gestures', () => {
  assert.equal(normalizeRailInputDelta(-3, { deltaY: 3, deltaMode: 1 }), -48);
  assert.equal(clampRailInputDelta(500), MAX_RAIL_INPUT_DELTA_PX);
  assert.equal(clampRailInputDelta(Number.NaN), 0);
});

test('rail metadata and snapping share one closest-slide rule', () => {
  const slides = [
    { distance: 8 },
    { distance: 0.25 },
    { distance: 3 },
  ];

  assert.equal(findClosestRailIndex(slides, (slide) => slide.distance), 1);
  assert.equal(findClosestRailIndex([], () => 0), 0);
});

test('keyboard and rail buttons advance one slide with bounded wraparound', () => {
  assert.equal(getAdjacentRailIndex(0, 40, 1), 1);
  assert.equal(getAdjacentRailIndex(39, 40, 1), 0);
  assert.equal(getAdjacentRailIndex(0, 40, -1), 39);
  assert.equal(getAdjacentRailIndex(12, 0, 1), 0);
});
