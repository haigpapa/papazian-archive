import { getProjectWorld } from '../data/worlds';

export type IndexAssetSortMode = 'project' | 'year' | 'world' | 'medium';

export interface IndexAssetRecord {
  assetIndex?: number;
  category?: string;
  domains?: string[];
  id?: string;
  projectId?: string;
  projectTitle?: string;
  year?: string | number;
  [key: string]: unknown;
}

const compareText = (a: unknown, b: unknown) => String(a || '').localeCompare(
  String(b || ''),
  undefined,
  { numeric: true, sensitivity: 'base' },
);

export const getIndexAssetMedium = (asset: IndexAssetRecord): string => (
  asset.domains?.[0] || asset.category || 'archive'
);

export const sortIndexAssets = <T extends IndexAssetRecord>(
  assets: readonly T[],
  sortMode: IndexAssetSortMode,
): T[] => assets
  .map((asset, originalIndex) => ({ asset, originalIndex }))
  .sort((left, right) => {
    const a = left.asset;
    const b = right.asset;
    let comparison = 0;

    if (sortMode === 'year') {
      const yearA = Number.parseInt(String(a.year || ''), 10);
      const yearB = Number.parseInt(String(b.year || ''), 10);
      const normalizedA = Number.isFinite(yearA) ? yearA : Number.NEGATIVE_INFINITY;
      const normalizedB = Number.isFinite(yearB) ? yearB : Number.NEGATIVE_INFINITY;
      comparison = normalizedB - normalizedA;
    } else if (sortMode === 'world') {
      comparison = compareText(
        getProjectWorld(String(a.projectId || ''))?.name,
        getProjectWorld(String(b.projectId || ''))?.name,
      );
    } else if (sortMode === 'medium') {
      comparison = compareText(getIndexAssetMedium(a), getIndexAssetMedium(b));
    } else {
      comparison = compareText(a.projectTitle || a.projectId, b.projectTitle || b.projectId);
    }

    if (comparison !== 0) return comparison;

    const projectComparison = compareText(a.projectTitle || a.projectId, b.projectTitle || b.projectId);
    if (projectComparison !== 0) return projectComparison;

    const assetIndexComparison = (a.assetIndex ?? left.originalIndex) - (b.assetIndex ?? right.originalIndex);
    if (assetIndexComparison !== 0) return assetIndexComparison;

    return left.originalIndex - right.originalIndex;
  })
  .map(({ asset }) => asset);
