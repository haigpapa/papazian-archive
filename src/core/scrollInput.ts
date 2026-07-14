const LINE_HEIGHT_PX = 16;
export const MAX_RAIL_INPUT_DELTA_PX = 72;

interface WheelDeltaLike {
  deltaY: number;
  deltaMode?: number;
}

export function clampRailInputDelta(
  delta: number,
  maxDelta = MAX_RAIL_INPUT_DELTA_PX,
): number {
  if (!Number.isFinite(delta)) return 0;
  return Math.max(-maxDelta, Math.min(maxDelta, delta));
}

export function normalizeRailInputDelta(
  observerDelta: number,
  event?: WheelDeltaLike | null,
  viewportHeight = 800,
): number {
  if (!event) return clampRailInputDelta(observerDelta);

  const unit = event.deltaMode === 1
    ? LINE_HEIGHT_PX
    : event.deltaMode === 2
    ? Math.max(1, viewportHeight)
    : 1;
  const magnitude = Math.abs(event.deltaY * unit);
  const directionSource = observerDelta || -event.deltaY;
  const normalized = Math.sign(directionSource) * magnitude;

  return clampRailInputDelta(normalized);
}

