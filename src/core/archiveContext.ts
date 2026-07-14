import { CANONICAL_PROJECT_SET } from '../data/canonicalProjects';
import type { IndexFilters } from '../components/IndexFilterBar';

export type PublicArchiveMode = 'cylinder' | 'vertical' | 'grid' | 'map' | 'essays';
export type ModeTransitionDirection = -1 | 0 | 1;

export const PUBLIC_ARCHIVE_MODES: PublicArchiveMode[] = [
  'cylinder',
  'vertical',
  'grid',
  'map',
  'essays',
];

export const ARCHIVE_MODE_LABELS: Record<PublicArchiveMode, string> = {
  cylinder: 'Orbit',
  vertical: 'Works',
  grid: 'Index',
  map: 'Map',
  essays: 'Essays',
};

export function getModeTransitionDirection(
  from: PublicArchiveMode,
  to: PublicArchiveMode,
): ModeTransitionDirection {
  const fromIndex = PUBLIC_ARCHIVE_MODES.indexOf(from);
  const toIndex = PUBLIC_ARCHIVE_MODES.indexOf(to);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return 0;
  return toIndex > fromIndex ? 1 : -1;
}

export interface MapFilterContext {
  world: string;
  domain: string;
  type: 'all' | 'video' | 'audio';
}

export function getMapFilterContext(filters: IndexFilters): MapFilterContext {
  return {
    world: filters.world,
    domain: filters.medium,
    type: filters.assetType === 'video' || filters.assetType === 'audio'
      ? filters.assetType
      : 'all',
  };
}

export function canCarryProjectToMode(slug: string, mode: PublicArchiveMode): boolean {
  if (mode === 'essays') return false;
  if (mode === 'vertical') return CANONICAL_PROJECT_SET.has(slug);
  return true;
}

