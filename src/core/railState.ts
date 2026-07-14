export function findClosestRailIndex<T>(
  items: readonly T[],
  getDistance: (item: T, index: number) => number,
): number {
  if (items.length === 0) return 0;

  let closestIndex = 0;
  let closestDistance = Infinity;

  items.forEach((item, index) => {
    const distance = getDistance(item, index);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

export function getAdjacentRailIndex(
  index: number,
  total: number,
  direction: -1 | 1,
): number {
  if (!Number.isFinite(total) || total <= 0) return 0;
  const safeIndex = Number.isFinite(index) ? Math.trunc(index) : 0;
  return (safeIndex + direction + total) % total;
}
