import * as React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { getProjectWorld, WORLD_COLORS } from '../data/worlds';
import { getIndexAssetMedium } from '../utils/indexAssets';
import type { IndexFilters } from './IndexFilterBar';

interface MobileIndexListProps {
  assets: any[];
  filters: IndexFilters;
  contextProjectSlug?: string;
  contextProjectTitle?: string;
  onInspectRecord?: (record: any) => void;
  onOpenFilters: () => void;
}

export default function MobileIndexList({
  assets,
  filters,
  contextProjectSlug,
  contextProjectTitle,
  onInspectRecord,
  onOpenFilters,
}: MobileIndexListProps) {
  const projectCount = React.useMemo(
    () => new Set(assets.map((asset) => asset.projectId)).size,
    [assets],
  );
  const contextIsVisible = Boolean(
    contextProjectSlug && assets.some((asset) => asset.projectId === contextProjectSlug),
  );
  const firstContextIndex = contextProjectSlug
    ? assets.findIndex((asset) => asset.projectId === contextProjectSlug)
    : -1;

  return (
    <section className="mobile-index-panel pointer-events-auto md:hidden" aria-labelledby="mobile-index-heading">
      <div className="mobile-index-panel__header">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
            Index / Evidence register
          </p>
          <h2 id="mobile-index-heading" className="mt-1 font-display text-lg font-bold uppercase leading-none text-white">
            {assets.length} files / {projectCount} works
          </h2>
          <p className="mt-2 font-mono text-[11px] uppercase leading-relaxed tracking-[0.12em] text-text-muted">
            Sort: {filters.sort} · World: {filters.world === 'all' ? 'all' : filters.world.replace('-world', '')}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenFilters}
          className="flex min-h-[44px] shrink-0 items-center gap-2 border border-ui-border px-3 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:border-white hover:bg-ui-bg"
          aria-label="Open archive filters"
        >
          <SlidersHorizontal size={14} />
          Filter
        </button>
        {contextProjectSlug && contextProjectTitle && (
          <p className="mobile-index-panel__context font-mono text-[11px] uppercase leading-relaxed tracking-[0.1em] text-white">
            Context: {contextProjectTitle}{contextIsVisible ? '' : ' · outside active filter'}
          </p>
        )}
      </div>

      {assets.length > 0 ? (
        <ol className="divide-y divide-ui-border" aria-label="Filtered archive records">
          {assets.map((asset, index) => {
            const world = getProjectWorld(asset.projectId);
            const title = asset.label || asset.title || asset.projectTitle || 'Untitled record';
            const role = asset.role || asset.type || 'evidence';
            const medium = getIndexAssetMedium(asset);
            const key = `${asset.projectId || 'record'}-${asset.id || asset.assetIndex || index}`;
            const isContextProject = Boolean(contextProjectSlug && asset.projectId === contextProjectSlug);

            return (
              <li key={key} className={`mobile-index-row ${index >= 8 ? 'deferred-index-row' : ''}`}>
                <button
                  type="button"
                  onClick={() => onInspectRecord?.(asset)}
                  className={`group grid min-h-[78px] w-full grid-cols-[4px_1fr_auto] gap-3 px-3 py-3 text-left transition-colors hover:bg-white/[0.045] active:bg-white/[0.08] ${isContextProject ? 'bg-white/[0.065] shadow-[inset_2px_0_0_0_var(--color-accent)]' : ''}`}
                  aria-label={`${title}. ${asset.projectTitle || 'Archive project'}. ${world?.name || 'Archive'}, ${asset.year || 'year not listed'}, ${medium}. Open record.`}
                  aria-current={isContextProject && index === firstContextIndex ? 'true' : undefined}
                >
                  <span
                    className="h-full min-h-12 w-1"
                    style={{ backgroundColor: WORLD_COLORS[world?.id || ''] || '#d7e7ef' }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 self-center">
                    <span className="block truncate font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
                      {asset.projectTitle || asset.projectId || 'Archive'}
                    </span>
                    <span className="mt-1 block font-display text-[14px] font-bold uppercase leading-[1.08] text-white">
                      {title}
                    </span>
                    <span className="mt-1.5 block truncate font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted">
                      {world?.name || 'Archive'} · {asset.year || 'N/D'} · {medium}
                    </span>
                  </span>
                  <span className="flex min-w-[58px] flex-col items-end justify-between self-stretch font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">
                    <span>{String(index + 1).padStart(3, '0')}</span>
                    <span className="text-white/72 group-hover:text-white">{role}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="flex min-h-48 flex-col items-center justify-center border-t border-ui-border px-6 text-center">
          <p className="font-display text-lg font-bold uppercase text-white">No matching records</p>
          <button
            type="button"
            onClick={onOpenFilters}
            className="mt-4 min-h-[44px] border border-ui-border px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted transition-colors hover:border-white hover:text-white"
          >
            Adjust filters
          </button>
        </div>
      )}
    </section>
  );
}
