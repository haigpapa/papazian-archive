import * as React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { LayoutGrid, Rows3, Globe, X, ArrowUpRight, Plus, Link, Search, Map, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Volume2, VolumeX, BookOpen, Loader2 } from 'lucide-react';
import { CANONICAL_PROJECT_SLUGS, CANONICAL_PROJECT_SET } from '../data/canonicalProjects';
import { getRelationDetail } from '../data/relations';
import { SITE_INFO_TABS, type SiteInfoTabId } from '../data/siteInfo';
import { getYouTubeEmbedUrl } from '../utils/youtube';
import { getProjectWorld } from '../data/worlds';
import IndexFilterBar, { type IndexFilters } from './IndexFilterBar';
import { ImageWithFallback } from './ImageWithFallback';
import FocusTrap from './FocusTrap';
import MobileIndexList from './MobileIndexList';
import AccessibleArchiveIndex from './AccessibleArchiveIndex';
import type { TraversalRoute } from './MapModeTools';
import { sortIndexAssets } from '../utils/indexAssets';
import {
  ARCHIVE_MODE_LABELS,
  getMapFilterContext,
  getModeTransitionDirection,
  type PublicArchiveMode,
} from '../core/archiveContext';
import { MOTION_DURATION, MOTION_EASE } from '../ui/motion';

const EssaysPanel = React.lazy(() => import('./EssaysPanel'));
const MapModeTools = React.lazy(() => import('./MapModeTools'));
const ProjectRailDetails = React.lazy(() => import('./ProjectRailDetails'));

const MODE_OPTIONS = [
  {
    id: 'cylinder',
    label: 'Home',
    sublabel: 'Enter',
    description: 'Orbit intro',
    icon: Globe,
  },
  {
    id: 'vertical',
    label: 'Works',
    sublabel: 'Curated',
    description: '20-project spine',
    icon: Rows3,
  },
  {
    id: 'grid',
    label: 'Index',
    sublabel: 'Browse',
    description: 'Unwrapped grid',
    icon: LayoutGrid,
  },
  {
    id: 'map',
    label: 'Maps',
    sublabel: 'Trace',
    description: 'Relations',
    icon: Map,
  },
  {
    id: 'essays',
    label: 'Essays',
    sublabel: 'Read',
    description: 'Writing panel',
    icon: BookOpen,
  },
];

const handleSpotlightMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  e.currentTarget.style.setProperty('--x', `${x}px`);
  e.currentTarget.style.setProperty('--y', `${y}px`);
};

// WORLDS and getProjectWorld are now imported from '../data/worlds'
// Re-exported here for backward compatibility with any external consumers
export { WORLDS, getProjectWorld } from '../data/worlds';

interface OverlayProps {
  inert?: boolean;
  hasLoadError?: boolean;
  nodes: any[];
  activeNode: any;
  contextNode?: any;
  centeredNode?: any;
  railState: any;
  currentMode: string;
  returnMode: string;
  progress: any; // MotionValue
  rawScroll: any;
  hoveredNode: any;
  mousePosition: { x: number, y: number } | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onModeChange: (mode: string) => void;
  onReplayGuide?: () => void;
  onBrowseNode?: (node: any) => void;
  onOpenHomeProject?: (node: any) => void;
  onRailStep: (direction: -1 | 1) => void;
  onSelectSlug: (slug: string) => void;
  onNodeClick: (node: any) => void;
  onCloseNode: () => void;
  onBackToWorks: () => void;
  onOpenMedia: (media: any) => void;
  onGoToRailSlide?: (index: number) => void;
  audioReady: boolean;
  audioStatus?: 'idle' | 'loading' | 'ready' | 'error';
  audioError?: string | null;
  isMuted: boolean;
  onToggleAudio: () => void;
  domainFilter?: string;
  onDomainFilterChange?: (domain: string) => void;
  typeFilter?: string;
  onTypeFilterChange?: (type: string) => void;
  focusedMapNode?: any;
  onOpenProjectRail?: (node: any) => void;
  onFocusNodeBySlug?: (slug: string) => void;
  onEssayChange?: (slug: string) => void;
  onInspectNode?: (node: any) => void;
  indexFilters?: IndexFilters;
  onIndexFiltersChange?: (filters: IndexFilters) => void;
  onHoverFilter?: (category: 'world' | 'medium' | 'assetType' | null, value: string | null) => void;
  projectedPositions?: Record<string, { x: number, y: number, w: number, h: number }>;
  onInspectRecord?: (record: any) => void;
}

export default function Overlay({ 
  inert,
  hasLoadError = false,
  nodes, 
  activeNode, 
  contextNode,
  centeredNode,
  railState,
  currentMode, 
  returnMode,
  progress, 
  rawScroll,
  hoveredNode,
  mousePosition,
  searchQuery,
  onSearchChange,
  onModeChange, 
  onReplayGuide,
  onBrowseNode,
  onOpenHomeProject,
  onRailStep,
  onSelectSlug,
  onNodeClick,
  onCloseNode,
  onBackToWorks,
  onOpenMedia,
  onGoToRailSlide,
  audioReady = false,
  audioStatus = 'idle',
  audioError,
  isMuted = true,
  onToggleAudio = () => {},
  domainFilter,
  onDomainFilterChange,
  typeFilter,
  onTypeFilterChange,
  focusedMapNode,
  onOpenProjectRail,
  onFocusNodeBySlug,
  onEssayChange,
  onInspectNode,
  indexFilters,
  onIndexFiltersChange,
  onHoverFilter,
  projectedPositions = {},
  onInspectRecord,
}: OverlayProps) {
  const [showAbout, setShowAbout] = React.useState(false);
  const [showTextArchive, setShowTextArchive] = React.useState(false);
  const [activeInfoTab, setActiveInfoTab] = React.useState<SiteInfoTabId>('about');
  const [copied, setCopied] = React.useState(false);
  const [isSearchActive, setIsSearchActive] = React.useState(false);
  const [mobileSheetState, setMobileSheetState] = React.useState<'peek' | 'full'>('peek');
  const [isMobileViewport, setIsMobileViewport] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [hoveredChapterIndex, setHoveredChapterIndex] = React.useState<number | null>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = React.useState(false);

  const filteredNodes = React.useMemo(() => nodes.filter((node) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return [
      node.title,
      node.year,
      node.tier,
      node.category,
      node.summary,
      node.thesis,
      node.fullDescription,
      ...(node.highlights || []),
      ...(node.tags || []),
      ...(node.domains || []),
      ...(node.stack || []),
      ...(node.connections || []),
      ...(node.relatedSlugs || []),
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  }), [nodes, searchQuery]);

  const flatAssets = React.useMemo(() => {
    const list: any[] = [];
    filteredNodes.forEach((node) => {
      const gallery = node.gallery?.length ? node.gallery : [
        { id: `${node.slug}-0`, projectId: node.slug, src: node.thumbnail, isPrimary: true, label: node.title }
      ];
      gallery.forEach((asset: any, assetIndex: number) => {
        list.push({
          ...asset,
          assetIndex,
          projectId: node.slug,
          projectTitle: node.title,
          accentColor: node.accentColor,
          year: node.year,
          domains: node.domains || [],
          category: node.category || '',
        });
      });
    });
    return list;
  }, [filteredNodes]);

  // Curated traversal routes states
  const [activeRoute, setActiveRoute] = React.useState<TraversalRoute | null>(null);
  const [activeRouteStep, setActiveRouteStep] = React.useState<number>(0);

  React.useEffect(() => {
    if (currentMode === 'horizontal') {
      setIsSidebarCollapsed(true);
    } else {
      setIsSidebarCollapsed(false);
    }
  }, [currentMode, activeNode?.slug]);

  React.useEffect(() => {
    if (currentMode !== 'map') {
      setActiveRoute(null);
    }
  }, [currentMode]);

  React.useEffect(() => {
    if (!activeRoute) return;
    if (!focusedMapNode) {
      // Focus dismissed (Escape / background click) — exit the tour so the
      // route launcher becomes available again.
      setActiveRoute(null);
      return;
    }
    const idx = activeRoute.nodes.indexOf(focusedMapNode.slug);
    if (idx !== -1) {
      setActiveRouteStep(idx);
    } else {
      // User clicked a node outside the tour, exit tour mode
      setActiveRoute(null);
    }
  }, [focusedMapNode, activeRoute]);


  
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const detailScrollRef = React.useRef<HTMLDivElement>(null);
  const infoConsoleRef = React.useRef<HTMLDivElement>(null);
  const infoButtonRef = React.useRef<HTMLButtonElement>(null);
  const focusNode = activeNode || hoveredNode;
  const workNodes = React.useMemo(() => {
    const canonical = nodes
      .filter((node) => CANONICAL_PROJECT_SET.has(node.slug))
      .sort((a, b) => CANONICAL_PROJECT_SLUGS.indexOf(a.slug) - CANONICAL_PROJECT_SLUGS.indexOf(b.slug));

    return canonical.length ? canonical : nodes;
  }, [nodes]);

  const focusIndex = focusNode ? workNodes.findIndex((node) => node.slug === focusNode.slug || node.id === focusNode.id) : -1;
  const publicMode = currentMode === 'horizontal' ? returnMode : currentMode;
  const activeMode = MODE_OPTIONS.find((mode) => mode.id === publicMode) || MODE_OPTIONS[0];
  const publicArchiveMode = publicMode as PublicArchiveMode;
  const returnViewLabel = returnMode === 'cylinder'
    ? 'Home'
    : ARCHIVE_MODE_LABELS[returnMode as PublicArchiveMode] || 'Previous View';
  const returnActionLabel = returnMode === 'cylinder' ? 'Back Home' : `Back to ${returnViewLabel}`;
  const reduceMotion = useReducedMotion();
  const previousModeRef = React.useRef<PublicArchiveMode>(publicArchiveMode);
  const transitionIdRef = React.useRef(0);
  const [modeTransition, setModeTransition] = React.useState<{
    id: number;
    label: string;
    direction: -1 | 0 | 1;
  } | null>(null);

  React.useEffect(() => {
    const previousMode = previousModeRef.current;
    if (previousMode === publicArchiveMode) return;

    transitionIdRef.current += 1;
    const transitionId = transitionIdRef.current;
    setModeTransition({
      id: transitionId,
      label: ARCHIVE_MODE_LABELS[publicArchiveMode],
      direction: getModeTransitionDirection(previousMode, publicArchiveMode),
    });
    previousModeRef.current = publicArchiveMode;

    const timer = window.setTimeout(() => {
      setModeTransition((current) => current?.id === transitionId ? null : current);
    }, reduceMotion ? 250 : 900);
    return () => window.clearTimeout(timer);
  }, [publicArchiveMode, reduceMotion]);
  const focusDomains = focusNode?.domains?.length ? focusNode.domains.join(' + ') : focusNode?.category || 'archive';
  let imageCount = nodes.reduce((count, node) => count + (node.gallery?.length || 1), 0);
  let workCount = workNodes.length;
  const projectRailCount = activeNode?.gallery?.length || 0;
  const chapters = React.useMemo(() => {
    if (!activeNode?.gallery) return [];
    const list: { name: string; startIndex: number; count: number; slides: any[] }[] = [];
    activeNode.gallery.forEach((slide: any, index: number) => {
      const chapterName = slide.chapter || 'Evidence';
      let currentChapter = list[list.length - 1];
      if (!currentChapter || currentChapter.name !== chapterName) {
        currentChapter = { name: chapterName, startIndex: index, count: 0, slides: [] };
        list.push(currentChapter);
      }
      currentChapter.count++;
      currentChapter.slides.push({ ...slide, globalIndex: index });
    });
    return list;
  }, [activeNode]);
  const railImage = currentMode === 'horizontal' ? railState?.image || activeNode?.gallery?.[0] : null;
  const railIndex = railState?.index ?? 0;
  const railTotal = railState?.total || projectRailCount || 0;
  // The settled rail state is authoritative. Hover can affect the 3D card,
  // but must not override title, chapter, counter, or active-slide semantics.
  const displayRailImage = railImage;
  const displayRailIndex = railIndex;
  const railRole = displayRailImage?.role || 'hero';
  const railType = displayRailImage?.type || 'image';
  const railChapter = displayRailImage?.chapter || 'Thesis';
  const railBeat = displayRailImage?.beat || displayRailImage?.caption;
  const railEmbedUrl = getYouTubeEmbedUrl(displayRailImage);
  const nodeBySlug = React.useMemo(() => new globalThis.Map(nodes.map((node) => [node.slug, node])), [nodes]);
  const relatedSlugs = (displayRailImage?.relatedSlugs?.length ? displayRailImage.relatedSlugs : activeNode?.relatedSlugs || activeNode?.connections || [])
    .filter(Boolean)
    .filter((slug: string) => nodeBySlug.has(slug))
    .slice(0, 5);
  const isMobilePeek = isMobileViewport && mobileSheetState === 'peek';
  const mobileSheetFrameClass = mobileSheetState === 'full'
    ? 'top-[64px]'
    : activeRoute
      ? 'h-[280px]'
      : currentMode === 'horizontal'
        ? 'h-[204px]'
        : 'h-[132px]';
  const mobileIntroClass = mobileSheetState === 'full' ? 'block' : 'hidden md:block';
  const mobileTagsClass = mobileSheetState === 'full' ? 'flex' : 'hidden md:flex';
  const mobilePeekTitle = displayRailImage?.label || activeNode?.title;
  const mobilePeekDescription = railBeat || displayRailImage?.caption || activeNode?.shortDescription;
  const activeDetailNode = activeNode || (currentMode === 'map' ? focusedMapNode : null);
  const activeFocusNode = activeDetailNode || hoveredNode || (currentMode === 'vertical' ? centeredNode : null) || contextNode;
  const bottomTitle = currentMode === 'horizontal' && activeNode
    ? displayRailImage?.label || activeNode.title
    : activeFocusNode
    ? activeFocusNode.title
    : 'Archive field';

  const projectCode = activeFocusNode?.slug ? activeFocusNode.slug.toUpperCase() : 'SYSTEM';
  const year = activeFocusNode?.year || '2026';
  const currentIndex = currentMode === 'horizontal' && activeNode
    ? String(displayRailIndex + 1).padStart(3, '0')
    : focusIndex >= 0
    ? String(focusIndex + 1).padStart(3, '0')
    : '000';
  const totalIndex = currentMode === 'horizontal' && activeNode
    ? String(railTotal).padStart(3, '0')
    : String(workCount).padStart(3, '0');
  const chapterName = (currentMode === 'horizontal' && activeNode
    ? railChapter || 'EVIDENCE'
    : activeFocusNode
    ? activeFocusNode.category || 'RECORD'
    : 'ARCHIVE').toUpperCase();

  let line1Text = `WORKS / ${projectCode.padEnd(12, ' ')} / ${year}`;
  let line3Text = `${currentIndex.padStart(5, ' ')} / ${totalIndex.padEnd(12, ' ')} / ${chapterName}`;

  // Assets currently visible in the Index grid — mirrors NodeManager's filters
  // so the HUD file count matches what is actually on screen.
  const filteredAssets = React.useMemo(() => {
    if (!indexFilters) return flatAssets;
    const matchingAssets = flatAssets.filter((asset) => {
      if (indexFilters.world !== 'all') {
        const world = getProjectWorld(asset.projectId);
        if (!world || world.id !== indexFilters.world) return false;
      }
      if (indexFilters.medium !== 'all') {
        const domains = asset.domains || [];
        if (!domains.includes(indexFilters.medium) && asset.category !== indexFilters.medium) return false;
      }
      if (indexFilters.assetType !== 'all') {
        const type = String(asset.type || 'image').toLowerCase();
        const role = String(asset.role || '').toLowerCase();
        if (indexFilters.assetType === 'video' || indexFilters.assetType === 'audio') {
          if (type !== indexFilters.assetType) return false;
        } else if (role !== indexFilters.assetType) {
          return false;
        }
      }
      // Apply search query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const matchesLabel = (asset.label || '').toLowerCase().includes(q);
        const matchesTitle = (asset.projectTitle || '').toLowerCase().includes(q);
        const matchesRole = (asset.role || '').toLowerCase().includes(q);
        const matchesType = (asset.type || '').toLowerCase().includes(q);
        if (!matchesLabel && !matchesTitle && !matchesRole && !matchesType) return false;
      }
      return true;
    });
    return sortIndexAssets(matchingAssets, indexFilters.sort);
  }, [flatAssets, indexFilters, searchQuery]);

  const indexAssetCount = filteredAssets.length;
  const mapFilterContext = indexFilters ? getMapFilterContext(indexFilters) : { world: 'all', domain: 'all', type: 'all' as const };
  const mapFilteredNodeCount = React.useMemo(() => nodes.filter((node) => {
    const worldId = node.world?.id || getProjectWorld(node.slug)?.id || '';
    if (mapFilterContext.world !== 'all' && worldId !== mapFilterContext.world) return false;
    const domains = node.domains?.length ? node.domains : [node.category];
    if (mapFilterContext.domain !== 'all' && !domains.includes(mapFilterContext.domain)) return false;
    if (mapFilterContext.type !== 'all') {
      const galleryTypes = (node.gallery || []).map((asset: any) => String(asset.type || 'image').toLowerCase());
      if (!galleryTypes.includes(mapFilterContext.type)) return false;
    }
    return true;
  }).length, [mapFilterContext.domain, mapFilterContext.type, mapFilterContext.world, nodes]);

  if (currentMode === 'grid') {
    imageCount = filteredAssets.length;
    workCount = new Set(filteredAssets.map((a) => a.projectId)).size;
  }

  if (currentMode === 'grid' && indexFilters) {
    const worldPart = indexFilters.world === 'all' ? 'ALL' : indexFilters.world.toUpperCase();
    const mediumPart = indexFilters.medium === 'all' ? 'ALL' : indexFilters.medium.toUpperCase();
    line1Text = `INDEX / W:${worldPart.padEnd(8, ' ')} / M:${mediumPart.padEnd(8, ' ')}`;

    const sortPart = indexFilters.sort.toUpperCase();
    const viewPart = indexFilters.viewMode.toUpperCase();
    line3Text = `SORT:${sortPart.padEnd(8, ' ')} / VIEW:${viewPart.padEnd(8, ' ')} / ${indexAssetCount} FILES`;
  } else if (activeFocusNode?.isNoDataZone) {
    const code = String(activeFocusNode.zoneId || 'ZONE_01').toUpperCase().padEnd(12, ' ');
    line1Text = `ZONE  / ${code} / ${activeFocusNode.year || '2026'}`;
    
    const lat = String(activeFocusNode.lat || '33.8938° N').padEnd(12, ' ');
    const lon = String(activeFocusNode.lon || '35.5018° E');
    line3Text = ` LAT  / ${lat} / LON: ${lon}`;
  } else if (currentMode === 'map' && activeFocusNode) {
    const related = activeFocusNode.connections || activeFocusNode.relatedSlugs || [];
    if (related.length > 0) {
      line3Text = `RELATIONS: ${related.map((s: string) => s.toUpperCase()).join(' + ')}`;
    }
  }

  React.useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px), (max-height: 520px) and (max-width: 960px)');
    const updateViewport = () => setIsMobileViewport(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);

    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  React.useEffect(() => {
    if (!activeDetailNode) return;
    setMobileSheetState((currentMode === 'horizontal' || currentMode === 'map') ? 'peek' : 'full');
  }, [activeDetailNode?.slug, currentMode, activeDetailNode]);

  React.useEffect(() => {
    detailScrollRef.current?.scrollTo({ top: 0 });
  }, [activeDetailNode?.slug, currentMode, railIndex]);

  React.useEffect(() => {
    if (!showAbout) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (infoConsoleRef.current?.contains(target) || infoButtonRef.current?.contains(target)) return;
      setShowAbout(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopImmediatePropagation();
      setShowAbout(false);
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [showAbout]);
  
  React.useEffect(() => {
    if (currentMode !== 'map' || !focusedMapNode) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopImmediatePropagation();
        onCloseNode();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [currentMode, focusedMapNode, onCloseNode]);
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDismissDetail = () => {
    if (isMobileViewport && currentMode === 'horizontal' && mobileSheetState === 'full') {
      setMobileSheetState('peek');
      return;
    }

    onCloseNode();
  };
  const bottomMeta = currentMode === 'horizontal' && activeNode
    ? `ACTIVE / ${String(displayRailIndex + 1).padStart(2, '0')} / ${String(Math.max(railTotal, 1)).padStart(2, '0')} / ${String(railChapter).toUpperCase()}`
    : searchQuery.trim()
    ? `${filteredNodes.length} matches / ${nodes.length} records`
    : activeFocusNode
    ? `${activeFocusNode.year} / ${activeFocusNode.stack?.join(' · ') || activeFocusNode.domains?.join(' · ') || 'ARCHIVE'} / ${activeFocusNode.evidenceStatus || 'COMPLETE'} — ${activeFocusNode.summary || activeFocusNode.shortDescription || ''}`
    : `${workCount} works / ${imageCount} images`;

  const selectedAnnouncementNode = activeNode || focusedMapNode || contextNode;
  const liveAnnouncement = [
    currentMode === 'horizontal'
      ? `Project case study mode. ${activeNode?.title || 'Project'} selected.`
      : `${ARCHIVE_MODE_LABELS[publicArchiveMode]} mode.`,
    currentMode !== 'horizontal' && selectedAnnouncementNode
      ? `Context: ${selectedAnnouncementNode.title}.`
      : '',
    currentMode === 'grid'
      ? `${filteredAssets.length} results. World ${indexFilters?.world || 'all'}. Medium ${indexFilters?.medium || 'all'}. Type ${indexFilters?.assetType || 'all'}.`
      : '',
    currentMode === 'map' && activeRoute
      ? `${activeRoute.name}. Step ${activeRouteStep + 1} of ${activeRoute.nodes.length}. ${focusedMapNode?.title || ''}`
      : '',
    currentMode === 'map'
      ? `${mapFilteredNodeCount} node${mapFilteredNodeCount === 1 ? '' : 's'} ${mapFilteredNodeCount === 1 ? 'matches' : 'match'} carried filters. World ${mapFilterContext.world}. Medium ${mapFilterContext.domain}. Type ${mapFilterContext.type}.`
      : '',
    currentMode === 'horizontal' && railTotal > 0
      ? `Slide ${displayRailIndex + 1} of ${railTotal}. ${displayRailImage?.label || railChapter}.`
      : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      data-ui-layer="true"
      data-compact-viewport={isMobileViewport ? 'true' : undefined}
      className="fixed inset-0 pointer-events-none z-10 flex flex-col p-5"
      inert={inert ? true : undefined}
    >
      <p className="sr-only">
        An interactive archive documenting architecture, sonic intelligence, software, and public culture.
      </p>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>
      
      {/* Top Header - Always visible, minimalist */}
      <header className="fixed top-5 left-5 right-5 flex justify-between items-start pointer-events-none z-[101]">
        <div className="flex pointer-events-auto">
          <h1 className="leading-none">
            <button
              type="button"
              onClick={() => {
                onCloseNode();
                onModeChange('cylinder');
              }}
              className="min-h-[44px] font-display text-2xl font-bold tracking-tighter text-white leading-tight cursor-pointer select-none"
              aria-label="Papazian Archive — return to Home"
            >
              PAPAZIAN
            </button>
          </h1>
        </div>

        {/* Filter Trigger button (grid/archive grid mode only) */}
        {currentMode === 'grid' && !activeNode && (
          <div className="desktop-index-filter-trigger hidden pointer-events-auto md:block">
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              aria-expanded={isFilterDrawerOpen}
              aria-controls="archive-index-filters"
              className="min-h-[44px] font-mono text-[11px] font-bold tracking-[0.14em] uppercase border border-ui-border hover:border-white px-3 py-1.5 transition-all text-white bg-black/60 backdrop-blur-sm cursor-pointer md:min-h-0 md:text-[9px] md:tracking-[0.16em]"
            >
              ARCHIVE FILTERS
            </button>
          </div>
        )}
      </header>

      <AnimatePresence>
        {modeTransition && (
          <motion.div
            key={modeTransition.id}
            initial={{
              opacity: 0,
              x: reduceMotion ? '-50%' : `calc(-50% + ${modeTransition.direction * 12}px)`,
              y: reduceMotion ? 0 : -4,
            }}
            animate={{ opacity: 1, x: '-50%', y: 0 }}
            exit={{
              opacity: 0,
              x: reduceMotion ? '-50%' : `calc(-50% - ${modeTransition.direction * 8}px)`,
            }}
            transition={{ duration: reduceMotion ? 0 : MOTION_DURATION.base, ease: MOTION_EASE }}
            className="fixed left-1/2 top-5 z-[102] border border-ui-border bg-black/82 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md pointer-events-none"
            aria-hidden="true"
          >
            {modeTransition.label}
          </motion.div>
        )}
      </AnimatePresence>

      {currentMode === 'grid' && !activeNode && indexFilters && (
        <MobileIndexList
          assets={filteredAssets}
          filters={indexFilters}
          contextProjectSlug={contextNode?.slug}
          contextProjectTitle={contextNode?.title}
          onOpenFilters={() => setIsFilterDrawerOpen(true)}
          onInspectRecord={onInspectRecord}
        />
      )}

      {/* 2D Fallback Safe Mode Grid (renders when WebGL fails) */}
      {hasLoadError && currentMode === 'grid' && !activeNode && (
        <div className="fixed inset-0 top-[70px] bottom-[110px] left-4 right-4 hidden overflow-y-auto pointer-events-auto z-[90] custom-scrollbar bg-black/90 p-4 md:block md:p-6 border border-ui-border">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredAssets.map((asset) => {
              const fallbackUrl = asset.src?.replace(/\.webp$/, '.jpg');
              const isTextCard = asset.type === 'text';
              return (
                <button
                  key={asset.id}
                  onClick={() => onInspectRecord?.(asset)}
                  className="aspect-[3/4] w-full border border-ui-border hover:border-white transition-all duration-200 bg-surface flex flex-col p-2 text-left shrink-0 cursor-pointer group"
                >
                  {isTextCard ? (
                    <div className="flex-1 flex flex-col justify-center items-center text-center p-3 border border-dashed border-ui-border">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-accent">Text Entry</span>
                      <p className="font-display text-[10px] text-white/90 mt-1 uppercase font-bold line-clamp-3 leading-snug">{asset.label}</p>
                    </div>
                  ) : (
                    <div className="flex-1 w-full bg-black/40 overflow-hidden relative border border-white/5">
                      <ImageWithFallback
                        src={asset.poster || asset.src || asset.thumbnail}
                        fallbackSrc={fallbackUrl}
                        alt={`${asset.label || asset.projectTitle} — ${asset.projectTitle}`}
                        containerClassName="w-full h-full"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="mt-2 shrink-0 font-mono text-[9px] flex flex-col gap-0.5">
                    <div className="flex justify-between text-[7px] text-text-muted-quiet font-bold">
                      <span>FILE_{String(asset.id).slice(-4).toUpperCase()}</span>
                      <span>{asset.year}</span>
                    </div>
                    <div className="text-[10px] font-bold text-white uppercase truncate mt-0.5">
                      {asset.label || asset.projectTitle}
                    </div>
                    <div className="text-[8px] text-text-muted uppercase truncate">
                      {asset.role || asset.type || 'Evidence'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}


      {/* Left-side dynamic Project World typographic overlay */}
      <AnimatePresence mode="wait">
        {currentMode === 'vertical' && !activeNode && centeredNode && (
          (() => {
            const world = getProjectWorld(centeredNode.slug);
            if (!world) return null;
            return (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: MOTION_DURATION.slow, ease: MOTION_EASE }}
                className="fixed top-[24%] left-[6%] pointer-events-none z-10 max-w-[280px] font-mono hidden md:block"
              >
                <div className="text-[10px] text-accent tracking-[0.3em] uppercase font-bold">
                  {world.roman} / {world.name}
                </div>
                <h2 className="mt-2 text-[11px] font-mono font-normal text-white/90 tracking-[0.2em] uppercase leading-tight text-balance">
                  {(world as any).systems}
                </h2>
                <p className="mt-3 text-[10px] leading-relaxed text-text-muted">
                  {world.definition}
                </p>
              </motion.div>
            );
          })()
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {currentMode === 'vertical' && !activeNode && centeredNode && (
          <motion.div
            key={`mobile-work-caption-${centeredNode.slug}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="mobile-works-caption pointer-events-none md:hidden"
            aria-live="polite"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
              Works / 20-project spine
            </p>
            <p className="mt-1 truncate font-display text-[14px] font-bold uppercase tracking-[0.04em] text-white">
              {centeredNode.title}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Display / Active Node Panel */}
      <AnimatePresence>
        {activeDetailNode && (() => {
          const activeNode = activeDetailNode;
          return (
            <>
          {isMobileViewport && mobileSheetState === 'full' && (
            <button
              type="button"
              className="fixed inset-0 z-[139] cursor-default bg-transparent pointer-events-auto md:hidden"
              onClick={() => setMobileSheetState('peek')}
              aria-label="Collapse project sheet"
            />
          )}
          <motion.div 
            initial={isMobileViewport ? { y: '100%', opacity: 0 } : { x: '100%', opacity: 0 }}
            animate={
              isMobileViewport
                ? { x: 0, y: 0, opacity: 1 }
                : { x: isSidebarCollapsed ? '100%' : 0, y: 0, opacity: isSidebarCollapsed ? 0 : 1 }
            }
            exit={isMobileViewport ? { y: '100%', opacity: 0 } : { x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`mobile-project-sheet fixed bottom-0 left-0 right-0 z-[140] ${mobileSheetFrameClass} rounded-none border-t border-border bg-[#050505]/96 p-4 shadow-2xl backdrop-blur-xl md:inset-y-0 md:left-auto md:right-0 md:h-auto md:w-[clamp(420px,30vw,480px)] md:border-t-0 md:border-y-0 md:border-r-0 md:border-l md:bg-surface/95 md:p-10 md:pt-20 md:pb-28 flex flex-col pointer-events-auto md:z-[102] ${(!isMobileViewport && isSidebarCollapsed) ? 'pointer-events-none' : ''}`}
            aria-hidden={!isMobileViewport && isSidebarCollapsed}
          >
            <div className="mb-3 flex items-center justify-between gap-2 md:hidden">
              {currentMode === 'horizontal' ? (
                <div className="grid grid-cols-3 border border-ui-border bg-ui-bg">
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => {
                      event.currentTarget.blur();
                      onCloseNode();
                    }}
                    className="flex h-11 min-w-[44px] cursor-pointer items-center justify-center px-2 text-text-muted transition-colors hover:text-white"
                    aria-label={returnActionLabel}
                  >
                    <ArrowLeft size={13} />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => {
                      event.currentTarget.blur();
                      onRailStep(-1);
                    }}
                    className="flex h-11 min-w-[44px] items-center justify-center px-2 text-text-muted transition-colors hover:text-white"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => {
                      event.currentTarget.blur();
                      onRailStep(1);
                    }}
                    className="flex h-11 min-w-[44px] items-center justify-center px-2 text-text-muted transition-colors hover:text-white"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              ) : (
                <span />
              )}

              <div className="ml-auto grid grid-cols-2 border border-ui-border bg-ui-bg">
                {(['peek', 'full'] as const).map((state) => (
                  <button
                    key={state}
                    type="button"
                    onClick={() => setMobileSheetState(state)}
                    className={`min-h-[44px] min-w-[44px] px-2 py-1.5 font-mono text-[8px] uppercase tracking-[0.16em] transition-colors border ${
                      mobileSheetState === state ? 'bg-ui-bg-hover text-white border-ui-border-hover' : 'text-text-muted hover:text-white border-transparent'
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex h-11 w-11 items-center justify-center border border-ui-border text-text-muted transition-colors hover:border-ui-border-hover hover:text-white"
                aria-label={copied ? 'Link copied' : 'Copy direct link'}
                title={copied ? 'Link copied' : 'Copy direct link'}
              >
                <Link size={14} className={copied ? 'text-accent' : ''} />
              </button>

              <button
                type="button"
                onClick={handleDismissDetail}
                className="flex h-11 w-11 items-center justify-center border border-ui-border text-text-muted transition-colors hover:border-ui-border-hover hover:text-white"
                aria-label="Collapse project sheet"
              >
                <X size={15} />
              </button>
            </div>




            {/* Right Controls */}
            <div className="absolute right-4 top-4 hidden items-center gap-2 md:flex">
              {currentMode === 'horizontal' && (
                <div className="flex border border-ui-border bg-white/[0.03]">
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => {
                      event.currentTarget.blur();
                      onCloseNode();
                    }}
                    className="flex h-10 cursor-pointer items-center justify-center gap-2 border-r border-ui-border px-3 font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted transition-colors hover:text-white"
                    aria-label={returnActionLabel}
                  >
                    <ArrowLeft size={13} />
                    {returnActionLabel}
                  </button>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => {
                      event.currentTarget.blur();
                      onRailStep(-1);
                    }}
                    className="flex h-10 items-center justify-center border-r border-ui-border px-3 text-text-muted transition-colors hover:text-white"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => {
                      event.currentTarget.blur();
                      onRailStep(1);
                    }}
                    className="flex h-10 items-center justify-center border-r border-ui-border px-3 text-text-muted transition-colors hover:text-white"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={15} />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => {
                      event.currentTarget.blur();
                      setIsSidebarCollapsed(true);
                    }}
                    className="flex h-10 items-center justify-center gap-2 px-3 font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted transition-colors hover:text-white"
                    title="Collapse sidebar panel"
                    aria-label="Collapse sidebar panel"
                  >
                    <ChevronsRight size={13} />
                    Hide Info
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex h-10 items-center justify-center gap-2 border border-ui-border px-3 font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted transition-colors hover:border-ui-border-hover hover:text-white"
                aria-label={copied ? 'Link copied' : 'Copy direct link'}
              >
                <Link size={13} className={copied ? 'text-accent' : ''} />
                {copied ? 'Copied' : 'Link'}
              </button>

              <button
                type="button"
                onClick={onCloseNode}
                className="flex h-10 w-10 items-center justify-center border border-ui-border text-text-muted transition-colors hover:border-ui-border-hover hover:text-white"
                aria-label="Close detail view"
              >
                <X size={18} />
              </button>
            </div>

            <button 
              onClick={onCloseNode}
              className="hidden"
              aria-label="Close detail view"
            >
            </button>

            <div
              ref={detailScrollRef}
              className={`flex-1 pr-2 custom-scrollbar md:overflow-y-auto md:pr-4 md:pt-12 ${
                mobileSheetState === 'peek' ? 'overflow-hidden pt-1' : 'overflow-y-auto pt-1'
              }`}
            >
              {activeRoute && (
                <div className="border border-ui-border bg-ui-bg p-4 mb-6 rounded-none pointer-events-auto shrink-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-[9px] tracking-[0.2em] uppercase font-bold" style={{ color: activeNode.accentColor || '#d7e7ef' }}>
                      {activeRoute.name}
                    </span>
                    <button
                      onClick={() => {
                        setActiveRoute(null);
                        onCloseNode();
                      }}
                      className="font-mono text-[9px] text-white/50 hover:text-white cursor-pointer uppercase"
                    >
                      EXIT TOUR
                    </button>
                  </div>
                  <p className="font-mono text-[10px] text-text-muted leading-relaxed mb-4">
                    {activeRoute.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <button
                      disabled={activeRouteStep === 0}
                      onClick={() => {
                        const nextStep = activeRouteStep - 1;
                        setActiveRouteStep(nextStep);
                        const nextNodeSlug = activeRoute.nodes[nextStep];
                        const nodeObj = nodes.find(n => n.slug === nextNodeSlug);
                        if (nodeObj) {
                          onNodeClick?.(nodeObj);
                        }
                      }}
                      className={`font-mono text-[9px] font-bold tracking-[0.16em] uppercase px-3 py-1.5 border border-ui-border transition-colors cursor-pointer rounded-none bg-ui-bg hover:bg-ui-bg-hover disabled:opacity-30 disabled:pointer-events-none`}
                    >
                      PREV STEP
                    </button>
                    <span className="font-mono text-[10px] text-white tracking-widest">
                      {activeRouteStep + 1} / {activeRoute.nodes.length}
                    </span>
                    <button
                      disabled={activeRouteStep === activeRoute.nodes.length - 1}
                      onClick={() => {
                        const nextStep = activeRouteStep + 1;
                        setActiveRouteStep(nextStep);
                        const nextNodeSlug = activeRoute.nodes[nextStep];
                        const nodeObj = nodes.find(n => n.slug === nextNodeSlug);
                        if (nodeObj) {
                          onNodeClick?.(nodeObj);
                        }
                      }}
                      className={`font-mono text-[9px] font-bold tracking-[0.16em] uppercase px-3 py-1.5 border border-ui-border transition-colors cursor-pointer rounded-none bg-ui-bg hover:bg-ui-bg-hover disabled:opacity-30 disabled:pointer-events-none`}
                    >
                      NEXT STEP
                    </button>
                  </div>
                </div>
              )}

              {isMobilePeek ? (
                <div className="mb-2 pr-1">
                  <p className="mb-1 font-mono text-[8px] uppercase tracking-[0.22em] text-accent">
                    {activeNode.title}
                  </p>
                  <p className="line-clamp-3 text-[12px] leading-snug text-text-muted">
                    <span className="font-display text-base font-bold uppercase leading-tight text-white">
                      {mobilePeekTitle}
                    </span>
                    {mobilePeekDescription && (
                      <>
                        <span className="text-white/54">: </span>
                        <span>{mobilePeekDescription}</span>
                      </>
                    )}
                  </p>
                </div>
              ) : (
                <h2 className="font-display pr-0 text-xl font-bold uppercase text-white md:pr-24 md:text-4xl mb-2 text-balance">
                  {activeNode.title}
                </h2>
              )}

              <div className={`${isMobilePeek ? 'mb-0' : 'mb-3 md:mb-8'} flex items-center gap-3`}>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase font-bold" style={{ color: activeNode.accentColor || '#d7e7ef' }}>
                  {isMobilePeek && currentMode === 'horizontal' ? `${String(displayRailIndex + 1).padStart(2, '0')} / ${String(Math.max(railTotal, 1)).padStart(2, '0')}` : activeNode.tier || activeNode.category || 'PROJECT'}
                </span>
                <span className="w-1 h-1 rounded-full bg-ui-bg-active" />
                <span className="font-mono text-[10px] text-text-muted tracking-widest">
                  {isMobilePeek && currentMode === 'horizontal' ? railChapter : activeNode.year}
                </span>
              </div>

              {!isMobilePeek && (() => {
                const world = getProjectWorld(activeNode.slug);
                if (!world) return null;
                return (
                  <div className="mb-5 md:mb-7 border-l-2 pl-3 py-0.5 pointer-events-auto" style={{ borderLeftColor: activeNode.accentColor || '#d7e7ef' }}>
                    <span className="font-mono text-[9px] tracking-[0.26em] uppercase block font-bold" style={{ color: activeNode.accentColor || '#d7e7ef' }}>
                      {world.roman} / {world.name}
                    </span>
                    <span className="font-mono text-[9px] text-text-muted mt-1 block leading-relaxed lowercase">
                      {world.definition}
                    </span>
                  </div>
                );
              })()}
              
              <div className={`${mobileTagsClass} flex-wrap gap-2 mb-8`}>
                {activeNode.tags?.map((tag: string) => (
                  <span key={tag} className="px-2 py-1 bg-border/50 border border-border text-[10px] uppercase font-bold tracking-wider text-text-muted">
                    {tag}
                  </span>
                ))}
              </div>

              <div className={`${mobileIntroClass} prose prose-invert max-w-none`}>
                {activeNode.thesis && (
                  <p className="font-display text-lg leading-snug text-white text-pretty">
                    {activeNode.thesis}
                  </p>
                )}
                {currentMode !== 'horizontal' && (
                  <p className="text-text leading-relaxed text-sm text-pretty">
                    {activeNode.shortDescription}
                  </p>
                )}
                {activeNode.fullDescription && currentMode !== 'horizontal' && (
                  <p className="text-text-muted mt-4 leading-relaxed text-sm text-pretty">
                    {activeNode.fullDescription}
                  </p>
                )}
              </div>

              {activeNode.highlights?.length > 0 && (
                <div className={`${mobileSheetState === 'full' ? 'block' : 'hidden'} mt-8 border-t border-ui-border pt-5 md:block`}>
                  <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.22em] text-accent">Signals</p>
                  <div className="space-y-3">
                    {activeNode.highlights.slice(0, currentMode === 'horizontal' ? 2 : 3).map((highlight: string) => (
                      <p key={highlight} className="border-l-2 pl-3 text-xs leading-relaxed text-text-muted text-pretty" style={{ borderLeftColor: activeNode.accentColor || '#d7e7ef' }}>
                        {highlight}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {currentMode !== 'horizontal' && relatedSlugs.length > 0 && (
                <div className="mt-8 border-t border-ui-border pt-5">
                  <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.22em] text-accent">Relations</p>
                  <div className="space-y-3">
                    {relatedSlugs.map((slug: string) => {
                      const targetNode = nodeBySlug.get(slug);
                      const isMutual = targetNode?.connections?.includes(activeNode.slug) && activeNode.connections?.includes(slug);
                      const relDetail = getRelationDetail(activeNode.slug, slug);
                      return (
                        <div
                          key={slug}
                          className={`p-3 border transition-all ${
                            isMutual
                              ? 'bg-accent/[0.02] border-accent/20 hover:border-accent/40'
                              : 'bg-transparent border-white/5 hover:border-ui-border'
                          }`}
                          style={{ borderLeft: `2px solid ${targetNode?.accentColor || '#666a6f'}` }}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <button
                              onClick={() => onSelectSlug(slug)}
                              className="min-h-[44px] md:min-h-0 font-display text-[10px] md:text-xs font-bold text-white tracking-wider uppercase hover:text-accent transition-colors cursor-pointer text-left"
                            >
                              {targetNode?.title || slug.replace(/-/g, ' ')}
                            </button>
                            <span className={`px-1.5 py-0.5 font-mono text-[7px] tracking-wider uppercase border shrink-0 ${
                              isMutual
                                ? 'bg-accent/15 border-accent/30 text-accent'
                                : 'bg-ui-bg border-ui-border text-text-muted'
                            }`}>
                              {relDetail.typeName} {isMutual ? '⚡' : ''}
                            </span>
                          </div>
                          <p className="font-mono text-[9px] leading-relaxed text-text-muted/70 text-pretty">
                            {relDetail.claim}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentMode === 'horizontal' && activeNode && (
                <React.Suspense fallback={null}>
                  <ProjectRailDetails
                    activeNode={activeNode}
                    displayRailImage={displayRailImage}
                    displayRailIndex={displayRailIndex}
                    railTotal={railTotal}
                    railChapter={railChapter}
                    railType={railType}
                    railRole={railRole}
                    railBeat={railBeat}
                    railEmbedUrl={railEmbedUrl}
                    relatedSlugs={relatedSlugs}
                    mobileSheetState={mobileSheetState}
                    isMobileViewport={isMobileViewport}
                    onOpenMedia={onOpenMedia}
                    onSelectSlug={onSelectSlug}
                  />
                </React.Suspense>
              )}

              <div className="mt-auto pt-6">
                {activeNode.hasProjectPage ? (
                  <button
                    onClick={() => onOpenProjectRail?.(activeNode)}
                    className="w-full bg-accent hover:bg-accent/80 text-black font-mono text-[10px] font-bold tracking-[0.2em] py-3.5 border border-accent/20 transition-all cursor-pointer rounded-none flex items-center justify-center gap-2"
                  >
                    OPEN DOSSIER →
                  </button>
                ) : (
                  <div className="w-full py-4 border border-ui-border text-text-muted font-mono text-[10px] tracking-widest flex items-center justify-center">
                    {activeNode.tier === 'archive' ? 'ARCHIVE NODE' : 'SPATIAL RECORD'}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Hidden container for screen readers (DOM Mirroring for a11y) */}
          {currentMode === 'horizontal' && activeNode && (
            <div className="sr-only" id="accessible-dossier-mirror">
              <h3>Active Slide: {displayRailImage?.label || activeNode.title}</h3>
              <p>Chapter: {railChapter}</p>
              <p>Category: {railType} / Role: {railRole}</p>
              <p>Narrative Caption: {railBeat}</p>
            </div>
          )}
          </>
          );
        })()}
      </AnimatePresence>

      {/* Persistent return control while the project information drawer is collapsed */}
      <AnimatePresence>
        {currentMode === 'horizontal' && activeNode && isSidebarCollapsed && !isMobileViewport && (
          <motion.button
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            type="button"
            onClick={onCloseNode}
            className="pointer-events-auto fixed right-5 top-5 z-[141] flex h-10 cursor-pointer items-center gap-2 border border-ui-border bg-surface/95 px-3 font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted shadow-xl backdrop-blur-xl transition-colors hover:border-ui-border-hover hover:bg-ui-bg hover:text-white"
            aria-label={returnActionLabel}
          >
            <ArrowLeft size={13} />
            {returnActionLabel}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Expand Sidebar Button when in horizontal mode and collapsed */}
      <AnimatePresence>
        {currentMode === 'horizontal' && activeNode && isSidebarCollapsed && !isMobileViewport && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            type="button"
            onClick={() => setIsSidebarCollapsed(false)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-[141] bg-surface/95 border-l border-y border-border px-3 py-4 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted hover:text-white hover:bg-ui-bg transition-all cursor-pointer flex flex-col items-center gap-2 pointer-events-auto shadow-xl"
            aria-label="Show project information"
          >
            <ChevronsLeft size={13} className="text-accent animate-pulse" />
            <span>I</span>
            <span>N</span>
            <span>F</span>
            <span>O</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Home Orbit Editorial Panel */}
      <AnimatePresence>
        {currentMode === 'cylinder' && !activeNode && (
          <HomeOrbitPanel
            onExploreWork={() => onModeChange('vertical')}
            onOpenProject={(slug) => {
              const node = nodeBySlug.get(slug);
              if (!node) return;
              if (onOpenHomeProject) {
                onOpenHomeProject(node);
              } else {
                onOpenProjectRail?.(node);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Essays / Writings Reading Panel */}
      <React.Suspense fallback={null}>
      <AnimatePresence>
        {currentMode === 'essays' && !activeNode && (
          <EssaysPanel isMobileViewport={isMobileViewport} onEssayChange={onEssayChange} />
        )}
      </AnimatePresence>
      </React.Suspense>


      {/* Index Filter Panel (grid mode drawer) */}
      {currentMode === 'grid' && !activeNode && indexFilters && onIndexFiltersChange && (
        <FocusTrap active={isFilterDrawerOpen} onEscape={() => setIsFilterDrawerOpen(false)}>
          <IndexFilterBar
            isOpen={isFilterDrawerOpen}
            onClose={() => setIsFilterDrawerOpen(false)}
            filters={indexFilters}
            onChange={onIndexFiltersChange}
            onHoverFilter={onHoverFilter}
          />
        </FocusTrap>
      )}

      <React.Suspense fallback={null}>
        <AnimatePresence>
          {currentMode === 'map' && !activeRoute && !activeDetailNode && (
            <MapModeTools
              nodes={nodes}
              activeRoute={activeRoute}
              onRouteChange={setActiveRoute}
              onRouteStepChange={setActiveRouteStep}
              onNodeClick={onNodeClick}
            />
          )}
        </AnimatePresence>
      </React.Suspense>

      {/* Floating Hover Tooltip (grid mode only, visual view mode) */}
      {currentMode === 'grid' && !isMobileViewport && indexFilters && indexFilters.viewMode === 'visual' && hoveredNode && mousePosition && (
        <div
          className="fixed pointer-events-none z-[250] font-mono text-[9px] text-text-muted flex flex-col gap-1 border-l border-ui-border-hover pl-2.5 bg-black/40 backdrop-blur-sm py-1.5"
          style={{
            left: mousePosition.x + 8,
            top: mousePosition.y - 12,
          }}
        >
          <span className="font-bold text-white uppercase tracking-wider text-[10px] mb-0.5">
            {String(hoveredNode.assetLabel || hoveredNode.title || 'Untitled')}
          </span>
          <div>ID: {String(hoveredNode.assetId || hoveredNode.id || hoveredNode.slug).slice(-6).toUpperCase()}</div>
          <div>W: {String(getProjectWorld(hoveredNode.slug)?.name || 'ARCHIVE').toUpperCase()}</div>
          <div>M: {String(hoveredNode.assetType || hoveredNode.category || 'MEDIA').toUpperCase()}</div>
          {typeof hoveredNode.gridX === 'number' && (
            <div className="text-accent/60 font-bold mt-0.5">
              X: {hoveredNode.gridX.toFixed(1)} / Y: {hoveredNode.gridY.toFixed(1)}
            </div>
          )}
          <span className="text-[7px] text-text-muted-quiet uppercase tracking-widest mt-1">
            CLICK TO INSPECT
          </span>
        </div>
      )}

      {/* 2D HTML Metadata Cards Overlay for Grid mode */}
      {currentMode === 'grid' && !isMobileViewport && indexFilters && (indexFilters.viewMode === 'text' || indexFilters.viewMode === 'hybrid') && (
        <div className="absolute inset-0 pointer-events-none z-[80] overflow-hidden">
          {flatAssets.map((asset) => {
            const key = asset.id || asset.projectId;
            const pos = projectedPositions[key];
            if (!pos) return null;

            if (pos.w < 60 || pos.h < 60) return null;

            return (
              <div
                key={key}
                className="absolute pointer-events-none font-mono text-[9px] text-text-muted flex flex-col justify-between p-2 select-none"
                style={{
                  left: pos.x,
                  top: pos.y,
                  width: pos.w,
                  height: pos.h,
                }}
              >
                {/* Top Row */}
                <div className="flex justify-between text-[7px] text-text-muted/50 font-bold">
                  <span>FILE_{String(asset.id || asset.projectId).slice(-4).toUpperCase()}</span>
                  <span>{asset.year}</span>
                </div>
                
                {/* Bottom Row — pointer-events stay off so clicks fall through
                    to the canvas raycast and open the Artifact Inspector */}
                <div className="flex flex-col gap-0.5">
                  <div className="text-[10px] font-bold text-white uppercase truncate">
                    {asset.label || asset.projectTitle}
                  </div>
                  <div className="text-[8px] text-text-muted uppercase truncate">
                    {asset.role || asset.type || 'Evidence'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <FocusTrap active={showAbout} onEscape={() => setShowAbout(false)}>
        <ArchiveInfoConsole
          open={showAbout}
          activeTab={activeInfoTab}
          onTabChange={setActiveInfoTab}
          onOpenTextArchive={() => {
            setShowAbout(false);
            setShowTextArchive(true);
          }}
          onReplayGuide={() => {
            setShowAbout(false);
            onReplayGuide?.();
          }}
          ref={infoConsoleRef}
        />
      </FocusTrap>

      <AccessibleArchiveIndex
        open={showTextArchive}
        nodes={nodes}
        contextNode={contextNode}
        onClose={() => setShowTextArchive(false)}
        onOpenNode={(node) => onBrowseNode?.(node)}
      />


      <footer className={`archive-hud fixed bottom-5 left-5 right-5 justify-center items-center pointer-events-none z-[130] ${(currentMode === 'horizontal' || activeDetailNode) ? 'hidden md:flex' : 'flex'}`}>
        <div className="w-full pointer-events-auto">
          <div className="relative bg-surface/82 backdrop-blur-xl border border-white/18 shadow-2xl rounded-none w-full">
            <motion.div
              className="absolute left-0 top-0 h-[1px] origin-left bg-accent"
              style={{ scaleX: progress }}
            />

            <div className="grid grid-cols-[auto_1fr] lg:grid-cols-[auto_minmax(0,1fr)_auto]">
              {/* Left Actions Group */}
              <div className="archive-hud__actions flex border-r border-ui-border shrink-0">
                <button 
                  ref={infoButtonRef}
                  onClick={() => setShowAbout(!showAbout)}
                  className={`min-h-[52px] w-[52px] border-r border-ui-border flex items-center justify-center transition-colors rounded-none shrink-0 md:min-h-[64px] md:w-[64px] ${showAbout ? 'bg-accent text-black' : 'text-text-muted hover:text-white hover:bg-ui-bg'}`}
                  title="INFORMATION"
                  aria-label={showAbout ? 'Close information' : 'Open information'}
                  aria-expanded={showAbout}
                  aria-controls="archive-info-console"
                >
                  {showAbout ? <X size={20} /> : <Plus size={20} />}
                </button>

                {/* Audio Toggle */}
                <button
                  onClick={onToggleAudio}
                  className={`min-h-[52px] w-[52px] flex items-center justify-center transition-colors rounded-none shrink-0 md:min-h-[64px] md:w-[64px] ${
                    audioStatus === 'error'
                      ? 'text-red-400 bg-red-500/10'
                      : audioStatus === 'ready' && !isMuted
                      ? 'text-accent'
                      : 'text-text-muted hover:text-white hover:bg-ui-bg ' + (audioStatus === 'loading' || !audioReady ? 'opacity-80' : '')
                  }`}
                  title={
                    audioStatus === 'error'
                      ? (audioError || 'Sound unavailable')
                      : audioStatus === 'loading'
                      ? 'Initializing audio...'
                      : isMuted
                      ? 'Unmute sound'
                      : 'Mute sound'
                  }
                  aria-label={
                    audioStatus === 'error'
                      ? 'Retry sound'
                      : audioStatus === 'loading'
                      ? 'Initializing audio'
                      : isMuted
                      ? 'Unmute sound'
                      : 'Mute sound'
                  }
                >
                  {audioStatus === 'error' ? (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-center leading-tight md:text-[9px]">Retry<br/>Audio</span>
                  ) : audioStatus === 'loading' ? (
                    <Loader2 size={16} className="animate-spin text-accent" />
                  ) : isMuted || !audioReady ? (
                    <VolumeX size={16} />
                  ) : (
                    <Volume2 size={16} />
                  )}
                </button>
              </div>

              <div className="archive-hud__context min-w-0">
                <AnimatePresence mode="wait">
                  {isSearchActive ? (
                    <motion.div 
                      key="search-input"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex min-h-[52px] items-center w-full px-4 md:min-h-[64px] md:px-8"
                    >
                      <Search size={14} className="text-accent shrink-0" />
                      <input 
                        ref={searchInputRef}
                        type="search"
                        placeholder="SEARCH BY TITLE, DOMAIN, TIER, CONNECTION..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onBlur={() => !searchQuery && setIsSearchActive(false)}
                        className="bg-transparent border-none outline-none font-mono text-[12px] text-white placeholder:text-text-muted w-full ml-3 md:text-[10px]"
                        aria-label="Search archive"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                      />
                      {searchQuery && (
                        <button onClick={() => onSearchChange('')} className="p-1 text-text-muted hover:text-white" aria-label="Clear search">
                          <X size={12} />
                        </button>
                      )}
                    </motion.div>
                  ) : currentMode === 'horizontal' && activeNode ? (
                    <motion.div
                      key="horizontal-meta-scrubber"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex flex-col md:flex-row md:items-center w-full min-h-[64px] py-2.5 md:py-0"
                    >
                      {/* Left: stable active-frame caption */}
                      <div
                        className="flex h-full min-h-[48px] w-full shrink-0 flex-col justify-center gap-0.5 overflow-hidden px-8 text-left md:min-h-[64px] md:w-[300px] lg:w-[360px]"
                      >
                        <span aria-hidden="true" className="block w-full truncate font-mono text-[9px] uppercase tracking-[0.16em] text-accent/55">
                          {line1Text}
                        </span>
                        <span className="font-display text-xs md:text-sm font-bold text-white tracking-wider uppercase truncate block w-full">
                          {bottomTitle}
                        </span>
                        <span aria-hidden="true" className="block w-full truncate font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted-quiet">
                          {line3Text}
                        </span>
                      </div>

                      {/* Vertical divider on desktop */}
                      <div className="hidden md:block w-[1px] h-[36px] bg-ui-bg-hover self-center shrink-0" />

                      {/* Right: Chapter Map Scrubber Progress Meter */}
                      <div className="flex h-full min-h-[48px] min-w-0 flex-1 items-center select-none md:min-h-[64px]">
                        <button
                          type="button"
                          onClick={() => onRailStep(-1)}
                          className="flex h-full min-h-[48px] w-11 shrink-0 cursor-pointer items-center justify-center text-text-muted transition-colors hover:bg-ui-bg hover:text-white md:min-h-[64px]"
                          aria-label="Previous slide"
                          title="Previous slide"
                        >
                          <ChevronLeft size={15} />
                        </button>

                        <div className="flex min-w-0 flex-1 gap-2 px-3">
                          {chapters.map((chapter, idx) => {
                            const isChapterActive = railIndex >= chapter.startIndex && railIndex < chapter.startIndex + chapter.count;
                            return (
                              <div 
                                key={`${chapter.name}-${chapter.startIndex}`}
                                style={{ flex: chapter.count }} 
                                className="flex flex-col gap-1 min-w-0"
                              >
                                <span className={`hidden sm:inline font-mono text-[7px] md:text-[8px] uppercase tracking-[0.2em] transition-all duration-300 ${
                                  isChapterActive 
                                    ? 'text-white font-bold opacity-100' 
                                    : 'text-white/10'
                                }`}>
                                  {String(idx + 1).padStart(2, '0')}
                                </span>
                                <div className="flex gap-1 w-full">
                                  {chapter.slides.map((slide) => {
                                    const isActive = railIndex === slide.globalIndex;
                                    return (
                                      <button
                                        key={slide.globalIndex}
                                        type="button"
                                        onClick={() => onGoToRailSlide?.(slide.globalIndex)}
                                        className={`h-1 flex-1 transition-all rounded-none cursor-pointer hover:h-1.5 ${
                                          isActive
                                            ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                                            : 'bg-ui-bg-hover'
                                        }`}
                                        title={`${chapter.name}: ${slide.label}`}
                                        aria-label={`Go to slide ${slide.globalIndex + 1}`}
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={() => onRailStep(1)}
                          className="flex h-full min-h-[48px] w-11 shrink-0 cursor-pointer items-center justify-center text-text-muted transition-colors hover:bg-ui-bg hover:text-white md:min-h-[64px]"
                          aria-label="Next slide"
                          title="Next slide"
                        >
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    </motion.div>
                  ) : (currentMode === 'map' || currentMode === 'grid') && activeDetailNode ? (
                    <motion.div
                      key="map-focused-hud"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex flex-col md:flex-row md:items-center w-full min-h-[64px] py-3 md:py-0 px-8"
                    >
                      <div className="flex-1 min-w-0 flex items-center gap-3 justify-center">
                        {activeDetailNode.accentColor && (
                          <span className="w-2 h-2 shrink-0 rounded-none" style={{ backgroundColor: activeDetailNode.accentColor }} />
                        )}
                        <div className="flex flex-col justify-center min-w-0">
                        <span aria-hidden="true" className="font-mono text-[9px] text-accent/80 tracking-[0.16em] uppercase truncate">
                          {line1Text}
                        </span>
                        <span className="font-display text-xs md:text-sm font-bold text-white tracking-wider uppercase truncate my-0.5">
                          {bottomTitle}
                        </span>
                        <span aria-hidden="true" className="font-mono text-[9px] text-text-muted tracking-[0.16em] uppercase truncate">
                          {line3Text}
                        </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 mt-3 md:mt-0 shrink-0 select-none">
                        {activeDetailNode.hasProjectPage && (
                          <button
                            onClick={() => onOpenProjectRail?.(activeDetailNode)}
                            className="bg-accent hover:bg-accent/80 text-black font-mono text-[9px] font-bold tracking-[0.16em] uppercase px-4 py-2 border border-accent/20 transition-all cursor-pointer rounded-none"
                          >
                            OPEN DETAILS
                          </button>
                        )}
                        <button
                          onClick={() => onCloseNode()}
                          className="bg-ui-bg hover:bg-ui-bg-hover text-white font-mono text-[9px] font-bold tracking-[0.16em] uppercase px-4 py-2 border border-ui-border transition-all cursor-pointer rounded-none"
                        >
                          CLOSE
                        </button>
                      </div>
                    </motion.div>
                  ) : currentMode === 'grid' && !activeDetailNode ? (
                    <motion.div
                      key="grid-meta-hud"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center justify-between w-full h-full min-h-[52px] pr-2 md:min-h-[64px] md:pr-8"
                    >
                      {/* Mobile version: Compact Chips */}
                      <button 
                        onClick={() => setIsFilterDrawerOpen(true)}
                        className="md:hidden flex min-h-[52px] items-center gap-2 px-3 overflow-hidden h-full flex-1 w-full"
                      >
                        <span className="shrink-0 bg-ui-bg-hover text-white font-mono text-[11px] uppercase tracking-wider px-2 py-1">INDEX</span>
                        <span className="min-w-0 truncate font-mono text-[11px] uppercase tracking-wider text-text-muted">
                          {indexAssetCount} files<span className="hidden min-[360px]:inline"> · {workCount} works</span>
                        </span>
                      </button>

                      {/* Desktop version: Strings */}
                      <button 
                        onClick={() => setIsSearchActive(true)}
                        className="hidden md:flex flex-col gap-0.5 px-8 group text-left overflow-hidden hover:bg-ui-bg transition-colors rounded-none justify-center h-full min-h-[64px] flex-1 cursor-pointer"
                      >
                        <span aria-hidden="true" className="font-mono text-[9px] text-accent/40 group-hover:text-accent transition-colors duration-300 tracking-[0.16em] uppercase truncate block w-full">
                          {line1Text}
                        </span>
                        <span className="font-display text-xs md:text-sm font-bold text-white tracking-wider uppercase truncate block w-full">
                          {bottomTitle}
                        </span>
                        <span aria-hidden="true" className="font-mono text-[9px] text-text-muted-quiet group-hover:text-text-muted transition-colors duration-300 tracking-[0.16em] uppercase truncate block w-full">
                          {line3Text}
                        </span>
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button 
                      key="display-meta"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      onClick={() => setIsSearchActive(true)}
                      className="flex flex-col gap-0.5 px-4 md:px-8 group text-left overflow-hidden hover:bg-ui-bg transition-colors rounded-none justify-center h-full min-h-[52px] md:min-h-[64px] w-full cursor-pointer"
                    >
                      <span aria-hidden="true" className="hidden font-mono text-[9px] text-accent/60 group-hover:text-accent transition-colors duration-300 tracking-[0.16em] uppercase truncate w-full md:block">
                        {line1Text}
                      </span>
                      <span className="font-display text-[13px] md:text-sm font-bold text-white tracking-wider uppercase truncate block w-full">
                        <span className="md:hidden">{activeMode.label}</span>
                        <span className="hidden md:inline">{bottomTitle}</span>
                      </span>
                      <span aria-hidden="true" className="hidden font-mono text-[9px] text-text-muted group-hover:text-white transition-colors duration-300 tracking-[0.16em] uppercase truncate w-full md:block">
                        {line3Text}
                      </span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <nav id="archive-view-controls" tabIndex={-1} aria-label="Archive views" className="archive-hud__modes col-span-2 grid grid-cols-5 border-t border-ui-border lg:col-span-1 lg:flex lg:border-l lg:border-t-0">
                {MODE_OPTIONS.map((mode) => (
                  <ModeButton
                    key={mode.id}
                    active={publicMode === mode.id}
                    icon={mode.icon}
                    label={mode.label}
                    sublabel={mode.sublabel}
                    description={mode.description}
                    onClick={() => onModeChange(mode.id)}
                  />
                ))}
              </nav>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HomeOrbitPanel({
  onExploreWork,
  onOpenProject,
}: {
  onExploreWork: () => void;
  onOpenProject: (slug: string) => void;
}) {
  const [showBio, setShowBio] = React.useState(false);
  const caseStudies = [
    {
      slug: 'mashrou-leila',
      label: "Mashrou' Leila",
      meta: 'Cultural architecture / performance system',
      body: 'A counter-public built through sound, image, language, identity, and collective risk.',
      accentColor: '#e85d75',
    },
    {
      slug: 'mekena-nyc',
      label: 'MEKENA NYC',
      meta: 'Space / residency / radical hospitality',
      body: 'A physical operating system for artists, gathering, adaptive reuse, and diasporic belonging.',
      accentColor: '#5ec4b6',
    },
    {
      slug: 'space-time-tuning-machine',
      label: 'Space Time Tuning Machine',
      meta: 'AI / sound / live instrument',
      body: 'A speculative performance engine for memory, displacement, and machine listening.',
      accentColor: '#a78bfa',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.99 }}
      transition={{ duration: MOTION_DURATION.slow, ease: MOTION_EASE }}
      className="pointer-events-auto fixed bottom-[160px] left-0 right-0 top-[84px] z-[140] flex overflow-hidden shadow-2xl md:left-1/2 md:right-auto md:top-[74px] md:bottom-[118px] md:w-[min(430px,calc(100vw-32px))] md:-translate-x-1/2 md:z-[88] central-panel"
    >
      <div className="flex min-h-0 w-full flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar py-4">
          <div className="border-b border-ui-border p-5 md:p-7">
            <h2 className="font-display text-5xl font-bold leading-[0.86] tracking-tight text-white md:text-7xl text-balance">
              Systems<br />of Meaning
            </h2>
            <p className="mt-5 max-w-[22rem] text-base leading-snug text-white/82 md:text-lg text-pretty">
              I build systems for memory, performance, and cultural translation.
            </p>
            <p className="mt-5 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
              Sound · Space · Code · Text · Image
            </p>
          </div>

          {showBio ? (
            <div className="space-y-5 border-b border-ui-border p-5 md:p-7">
              <div>
                <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.24em] text-accent">
                  About / Bio
                </p>
                <p className="text-sm leading-relaxed text-text text-pretty">
                  Born in Beirut and based in New York, Haig Papazian works across sound,
                  architecture, film, AI, narrative, and cultural infrastructure. The work
                  treats culture as an interface and technology as material, method, and critique.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBio(false)}
                className="w-full border border-ui-border p-3 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted hover:bg-ui-bg hover:text-white transition-colors"
              >
                ← Back to Index
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-5 border-b border-ui-border p-5 md:p-7">
                <div className="space-y-3">
                  {caseStudies.map((study, index) => (
                    <button
                      key={study.slug}
                      type="button"
                      onClick={() => onOpenProject(study.slug)}
                      aria-label={`Open ${study.label} project`}
                      className="group w-full cursor-pointer border border-ui-border border-l-2 bg-white/[0.025] p-3 text-left transition-colors hover:border-white/35 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      style={{ borderLeftColor: study.accentColor }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className="font-display text-lg font-bold uppercase leading-none text-white">
                          {study.label}
                        </p>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className="font-mono text-[8px] text-text-muted">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <ArrowUpRight
                            size={13}
                            className="text-text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                      <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.16em] text-accent/80">
                        {study.meta}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-text-muted">
                        {study.body}
                      </p>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowBio(true)}
                  className="w-full min-h-[44px] md:min-h-0 border border-ui-border p-3 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted hover:bg-ui-bg hover:text-white transition-colors"
                >
                  View Studio Profile →
                </button>
              </div>

              <div className="grid grid-cols-[1fr_auto] items-stretch border-b border-ui-border">
                <div className="flex items-stretch border-r border-ui-border">
                  <a
                    href="/cv.pdf"
                    className="flex w-fit min-h-[44px] items-center px-5 py-4 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted transition-colors hover:bg-ui-bg hover:text-white"
                  >
                    CV
                  </a>
                </div>
                <button
                  type="button"
                  onClick={onExploreWork}
                  className="cta-explore flex min-h-[44px] items-center gap-2 px-5 py-4 font-mono text-[9px] uppercase tracking-[0.2em]"
                >
                  Explore the Work
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </motion.section>
  );
}

function ModeButton({ active, disabled, onClick, icon: Icon, label, description }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={`${label}: ${description}`}
      aria-label={`${label}: ${description}`}
      aria-current={active ? 'page' : undefined}
      className={`
        group relative h-[48px] w-full md:h-[64px] lg:w-[64px] flex flex-col items-center justify-center rounded-none
        transition-all duration-0
        ${disabled 
          ? 'cursor-not-allowed text-white/18 border-r border-ui-border' 
          : active 
          ? 'bg-white/12 text-white border-r border-transparent' 
          : 'text-text-muted hover:bg-ui-bg hover:text-white border-r border-ui-border'}
        last:border-r-0
      `}
    >
      <Icon size={16} />
    </button>
  );
}

const ArchiveInfoConsole = React.forwardRef<
  HTMLDivElement,
  {
    open: boolean;
    activeTab: SiteInfoTabId;
    onTabChange: (tab: SiteInfoTabId) => void;
    onOpenTextArchive: () => void;
    onReplayGuide: () => void;
  }
>(function ArchiveInfoConsole({ open, activeTab, onTabChange, onOpenTextArchive, onReplayGuide }, ref) {
  const tab = SITE_INFO_TABS.find((item) => item.id === activeTab) || SITE_INFO_TABS[0];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          id="archive-info-console"
          initial={{ opacity: 0, y: 14, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.985 }}
          transition={{ duration: MOTION_DURATION.fast, ease: MOTION_EASE }}
          className="mobile-safe-panel fixed bottom-[112px] left-0 right-0 top-[64px] z-[140] flex overflow-hidden border-y border-white/16 bg-[#050505]/96 shadow-2xl backdrop-blur-xl pointer-events-auto md:top-auto md:bottom-[118px] md:left-5 md:right-auto md:h-[520px] md:w-[520px] md:bg-surface/92 md:border md:border-white/16 md:z-[125]"
          role="dialog"
          aria-label="Archive information console"
        >
          <div className="flex min-h-0 w-full flex-col">
          <div className="shrink-0 border-b border-ui-border px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-mono text-[8px] uppercase tracking-[0.26em] text-accent">
                  Archive Console
                </p>
                <p className="mt-1 truncate font-display text-sm font-bold uppercase tracking-[0.08em] text-white">
                  Site Information
                </p>
              </div>
              <p className="hidden font-mono text-[8px] uppercase tracking-[0.2em] text-white/28 sm:block">
                Text Layer
              </p>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-px border border-ui-border bg-ui-bg-hover">
              {SITE_INFO_TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`min-h-9 bg-surface/95 px-2 font-mono text-[8px] uppercase tracking-[0.16em] transition-colors ${
                    item.id === activeTab
                      ? 'bg-white/[0.04] text-white shadow-[inset_0_-2px_0_0_var(--color-accent)]'
                      : 'text-text-muted hover:bg-white/8 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar px-5 py-5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-accent">
                {tab.eyebrow}
              </span>
              <span className="h-px flex-1 bg-ui-bg-hover" />
            </div>

            <h2 className="mt-4 font-display text-xl font-bold uppercase leading-tight tracking-[0.02em] text-white">
              {tab.title}
            </h2>

            <div className="mt-5 space-y-4">
              {tab.body.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-relaxed text-text">
                  {paragraph}
                </p>
              ))}
            </div>

            {tab.entries && (
              <div className="mt-6 space-y-4 border-t border-ui-border pt-5">
                {tab.entries.map((entry) => (
                  <div key={`${entry.date}-${entry.title}`} className="grid grid-cols-[64px_1fr] gap-4">
                    <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-text-muted">
                      {entry.date}
                    </p>
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white">
                        {entry.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-text-muted">
                        {entry.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab.links && (
              <div className="mt-6 border-t border-ui-border pt-4">
                {tab.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                    className="group flex items-center justify-between gap-5 border-b border-ui-border py-3 transition-colors hover:border-accent/50"
                  >
                    <span className="min-w-0">
                      <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-white transition-colors group-hover:text-accent">
                        {link.label}
                      </span>
                      {link.note && (
                        <span className="mt-1 block truncate text-xs text-text-muted">
                          {link.note}
                        </span>
                      )}
                    </span>
                    <ArrowUpRight size={14} className="shrink-0 text-text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                  </a>
                ))}
              </div>
            )}

            <div className="mt-7 border-t border-ui-border pt-4">
              <button
                type="button"
                onClick={onOpenTextArchive}
                className="mb-2 flex min-h-[44px] w-full items-center justify-between border border-accent bg-accent px-3 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-black transition-colors hover:bg-white"
              >
                Browse text archive
                <ArrowRight size={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onReplayGuide}
                className="flex min-h-[44px] w-full items-center justify-between border border-ui-border px-3 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:border-white hover:bg-white hover:text-black"
              >
                Replay navigation guide
                <ArrowRight size={14} aria-hidden="true" />
              </button>
              <div className="mt-4 flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.18em] text-white/24">
                <span>Papazian Archive</span>
                <span>v1.0.5</span>
              </div>
            </div>
          </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
