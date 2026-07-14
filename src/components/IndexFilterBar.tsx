import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MOTION_SPRING } from '../ui/motion';
import { WORLDS, WORLD_COLORS } from '../data/worlds';

export type IndexViewMode = 'visual' | 'hybrid' | 'text';
export type IndexSortMode = 'project' | 'year' | 'world' | 'medium';

export interface IndexFilters {
  world: string;
  medium: string;
  assetType: string;
  sort: IndexSortMode;
  viewMode: IndexViewMode;
}

export const DEFAULT_INDEX_FILTERS: IndexFilters = {
  world: 'all',
  medium: 'all',
  assetType: 'all',
  sort: 'project',
  viewMode: 'hybrid',
};

const MEDIUM_OPTIONS = ['all', 'sound', 'space', 'code', 'text', 'image', 'systems'];
const ASSET_TYPE_OPTIONS = ['all', 'hero', 'evidence', 'process', 'system', 'coda', 'video', 'audio'];
const SORT_OPTIONS: { value: IndexSortMode; label: string }[] = [
  { value: 'project', label: 'Project' },
  { value: 'year', label: 'Year' },
  { value: 'world', label: 'World' },
  { value: 'medium', label: 'Medium' },
];
const VIEW_OPTIONS: { value: IndexViewMode; label: string }[] = [
  { value: 'visual', label: 'Image Only' },
  { value: 'text', label: 'Text Only' },
  { value: 'hybrid', label: 'Hybrid' },
];

interface IndexFilterBarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: IndexFilters;
  onChange: (filters: IndexFilters) => void;
  onHoverFilter?: (category: 'world' | 'medium' | 'assetType' | null, value: string | null) => void;
}

const DOMAIN_ACCENTS: Record<string, string> = {
  sound: '#9fd6bf',
  space: '#c7b28a',
  code: '#7aa6ff',
  text: '#d5a2a2',
  systems: '#8fa8c2',
  image: '#d7e7ef',
};

export default function IndexFilterBar({
  isOpen,
  onClose,
  filters,
  onChange,
  onHoverFilter,
}: IndexFilterBarProps) {
  const update = (partial: Partial<IndexFilters>) => {
    onChange({ ...filters, ...partial });
  };

  // Close on Escape key press. Capture phase + stopImmediatePropagation so the
  // app-level Escape handler doesn't also fire and reset the grid scroll.
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Scrim with subtle blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] pointer-events-auto cursor-pointer"
          />

          {/* Slide-out Drawer Panel */}
          <motion.div
            id="archive-index-filters"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={MOTION_SPRING.drawer}
            className="fixed top-0 right-0 z-[150] flex h-[100dvh] w-full flex-col overflow-hidden border-l border-ui-border-hover bg-surface/98 pointer-events-auto font-mono text-[11px] text-text-muted md:w-[380px] md:text-[10px]"
            role="dialog"
            aria-modal="true"
            aria-label="Archive filters"
          >
            {/* Header */}
            <div className="index-filter-drawer__header flex shrink-0 items-center justify-between border-b border-ui-border px-4 pb-3 md:px-8 md:pt-8 md:pb-4">
              <span className="text-[12px] text-white tracking-[0.18em] uppercase font-bold md:text-[10px] md:tracking-[0.2em]">ARCHIVE FILTERS</span>
              <button
                onClick={onClose}
                className="min-h-[44px] text-text-muted hover:text-white text-[11px] tracking-wider cursor-pointer border border-ui-border hover:border-white px-3 py-1.5 transition-colors md:min-h-0 md:text-[9px] md:px-2.5"
                aria-label="Close archive filters"
              >
                CLOSE
              </button>
            </div>

            {/* Content Groupings */}
            <div className="index-filter-drawer__content flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto momentum-scroll px-4 pt-6 md:px-8 md:pt-8">
              {/* WORLD SELECTOR */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] text-text-muted uppercase tracking-[0.18em] font-bold border-b border-white/8 pb-1 md:text-[8px] md:tracking-[0.2em]">
                  WORLD SELECTOR
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <FilterChip
                    active={filters.world === 'all'}
                    label="All"
                    onClick={() => update({ world: 'all' })}
                    onMouseEnter={() => onHoverFilter?.('world', 'all')}
                    onMouseLeave={() => onHoverFilter?.(null, null)}
                  />
                  {WORLDS.map((w) => (
                    <FilterChip
                      key={w.id}
                      active={filters.world === w.id}
                      label={w.name}
                      accentColor={WORLD_COLORS[w.id]}
                      onClick={() => update({ world: filters.world === w.id ? 'all' : w.id })}
                      onMouseEnter={() => onHoverFilter?.('world', w.id)}
                      onMouseLeave={() => onHoverFilter?.(null, null)}
                    />
                  ))}
                </div>
              </div>

              {/* MEDIUM SELECTOR */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] text-text-muted uppercase tracking-[0.18em] font-bold border-b border-white/8 pb-1 md:text-[8px] md:tracking-[0.2em]">
                  MEDIUM SELECTOR
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {MEDIUM_OPTIONS.map((m) => (
                    <FilterChip
                      key={m}
                      active={filters.medium === m}
                      label={m}
                      accentColor={m !== 'all' ? DOMAIN_ACCENTS[m] : undefined}
                      onClick={() => update({ medium: filters.medium === m ? 'all' : m })}
                      onMouseEnter={() => onHoverFilter?.('medium', m)}
                      onMouseLeave={() => onHoverFilter?.(null, null)}
                    />
                  ))}
                </div>
              </div>

              {/* TYPE SELECTOR */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] text-text-muted uppercase tracking-[0.18em] font-bold border-b border-white/8 pb-1 md:text-[8px] md:tracking-[0.2em]">
                  TYPE SELECTOR
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ASSET_TYPE_OPTIONS.map((t) => (
                    <FilterChip
                      key={t}
                      active={filters.assetType === t}
                      label={t}
                      onClick={() => update({ assetType: filters.assetType === t ? 'all' : t })}
                      onMouseEnter={() => onHoverFilter?.('assetType', t)}
                      onMouseLeave={() => onHoverFilter?.(null, null)}
                    />
                  ))}
                </div>
              </div>

              {/* SORT SELECTOR */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] text-text-muted uppercase tracking-[0.18em] font-bold border-b border-white/8 pb-1 md:text-[8px] md:tracking-[0.2em]">
                  SORT SELECTOR
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SORT_OPTIONS.map((s) => (
                    <FilterChip
                      key={s.value}
                      active={filters.sort === s.value}
                      label={s.label}
                      onClick={() => update({ sort: s.value })}
                    />
                  ))}
                </div>
              </div>

              {/* VIEW SELECTOR */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] text-text-muted uppercase tracking-[0.18em] font-bold border-b border-white/8 pb-1 md:text-[8px] md:tracking-[0.2em]">
                  VIEW SELECTOR
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {VIEW_OPTIONS.map((v) => (
                    <FilterChip
                      key={v.value}
                      active={filters.viewMode === v.value}
                      label={v.label}
                      onClick={() => update({ viewMode: v.value })}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface FilterChipProps {
  key?: React.Key;
  active: boolean;
  label: string;
  accentColor?: string;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

function FilterChip({
  active,
  label,
  accentColor,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`
        min-h-[44px] md:min-h-0 font-mono text-[11px] md:text-[9px] uppercase tracking-[0.12em] px-3 md:px-2.5 py-1.5 border transition-all duration-150 shrink-0 cursor-pointer
        ${active
          ? 'border-white text-white bg-ui-bg'
          : 'border-ui-border text-text-muted-quiet hover:text-white hover:border-ui-border-hover'
        }
      `}
      style={active && accentColor ? {
        borderColor: accentColor,
        color: accentColor,
      } : undefined}
    >
      {label.toUpperCase()}
    </button>
  );
}
