import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, Rows3, Globe, X, ArrowUpRight, Plus, Link, Search, Map, ArrowLeft, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Play, Volume2, VolumeX, BookOpen } from 'lucide-react';
import { CANONICAL_PROJECT_SLUGS, CANONICAL_PROJECT_SET } from '../data/canonicalProjects';
import { getRelationDetail } from '../data/relations';
import { SITE_INFO_TABS, type SiteInfoTabId } from '../data/siteInfo';
import { getYouTubeEmbedUrl } from '../utils/youtube';
import { WORLDS, getProjectWorld } from '../data/worlds';
import IndexFilterBar, { type IndexFilters } from './IndexFilterBar';

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

const ESSAY_RECORDS = [
  {
    slug: 'systems-of-meaning',
    title: 'Systems of Meaning',
    eyebrow: 'Statement',
    date: '2026',
    readTime: '4 min',
    dek: 'A short operating statement for the archive: memory, performance, and cultural translation as systems rather than isolated works.',
    body: [
      'I build systems for memory, performance, and cultural translation. The work moves across sound, space, code, text, image, and systems because the subject keeps changing scale: a song becomes a public architecture, a building becomes a social protocol, a manuscript becomes a software engine, and a data set becomes a record of cultural pressure.',
      'Systems Choreography names the method behind that movement. It treats space, time, code, narrative, and performance as related structures that can be rehearsed, tuned, and reassembled. The archive is not a neutral container for finished objects. It is a way of showing how the objects think together.',
      'The point is not to make technology look magical. It is to make cultural structure visible: who gets translated, what gets flattened, where memory is stored, and how people build forms of belonging under pressure.',
    ],
  },
  {
    slug: 'localization-gap',
    title: 'The Localization Gap',
    eyebrow: 'AI / Music / Cultural Bias',
    date: '2024',
    readTime: '6 min',
    dek: 'A forensic argument about what generative music systems erase when they treat Arabic music as style instead of structure.',
    body: [
      'The Localization Gap begins from a simple failure: generative music systems can often imitate the surface of Arabic music while missing the systems that make the music culturally legible. Maqam, dialect, ornamentation, tuning behavior, phrasing, and regional memory are compressed into generic global signals.',
      'That failure is not only aesthetic. It is infrastructural. A model that cannot hear cultural specificity cannot preserve it, translate it, or build with it responsibly. The audit treats failed outputs as evidence rather than accidents.',
      'The work compares prompts, outputs, phonetic artifacts, tuning assumptions, and genre defaults to show how computational systems can reproduce colonial listening habits through technical convenience.',
    ],
  },
  {
    slug: 'cost-of-being-queer-and-arab',
    title: 'The Cost of Being Queer and Arab',
    eyebrow: 'Visibility / Risk / Public Culture',
    date: '2020',
    readTime: '5 min',
    dek: 'A public argument about the point where cultural visibility becomes personal, institutional, and physical risk.',
    body: [
      'Visibility is often framed as liberation, but visibility also creates coordinates. It tells institutions, publics, borders, and hostile systems where to look. For queer Arab artists, that contradiction is not theoretical. It is lived as pressure on bodies, families, venues, visas, stages, and futures.',
      'The argument is not against publicness. It is against a simple story of representation that ignores cost. Cultural work can create shelter and danger at the same time. A song can become a home for one person and evidence against another.',
      'This writing sits close to Mashrou’ Leila, but it also points toward later spatial work: if visibility produces risk, then cultural infrastructure has to design for protection, opacity, gathering, and repair.',
    ],
  },
  {
    slug: 'cartography-of-absence',
    title: 'The Cartography of Absence',
    eyebrow: 'Forms / Exile / Bureaucracy',
    date: '2024',
    readTime: '5 min',
    dek: 'Bureaucratic surrealism as a way to document what ordinary institutional language cannot admit.',
    body: [
      'The Cartography of Absence uses administrative language as literary material. Forms, intake sheets, redactions, stamps, and impossible applications become tools for mapping emotional and political conditions that official systems prefer to flatten.',
      'The project is not parody. It is a recognition that bureaucracy already writes fiction onto displaced bodies. It invents categories, imposes timelines, edits names, and asks people to make their pain legible in fields too small to hold it.',
      'By exaggerating those forms only slightly, the work shows the violence already present in the original structure. The page becomes a border, a clinic, an archive, and a stage.',
    ],
  },
  {
    slug: 'architecture-in-low-res',
    title: 'Architecture in Low Res',
    eyebrow: 'Architecture / Image / Breakdown',
    date: '2015',
    readTime: '5 min',
    dek: 'A foundational thesis on low resolution, ruin, and systemic breakdown as authentic spatial language.',
    body: [
      'Architecture in Low Res argues that the broken image can be more honest than the polished render. For diasporic and post-conflict space, resolution is not just a technical property. It is a political and emotional condition.',
      'The low-resolution image carries fragmentation, distance, partial memory, and infrastructural failure. It refuses the fantasy that architecture can always be represented as clean, complete, and available.',
      'Much of the later work inherits this logic: glitch, decay, degraded documents, unstable scans, and fractured interfaces are not decorative effects. They are structural evidence.',
    ],
  },
  {
    slug: 'why-were-like-this',
    title: "Why We're Like This",
    eyebrow: 'Video Essay / Cultural Mood',
    date: '2026',
    readTime: '4 min',
    dek: 'A scripted essay series about synthetic culture, contemporary psychological weather, and the systems that make people feel unreal.',
    body: [
      "Why We're Like This treats the video essay as a diagnostic instrument. Voice, image, pacing, and performance become a way to read cultural mood at a moment when attention, identity, intimacy, and belief are increasingly mediated by machines.",
      'The work sits between documentary, performance text, audiovisual therapy, and cultural criticism. Its subject is not individual dysfunction, but the systems that make dysfunction feel personal.',
      'In the archive, it becomes one of the clearest bridges between writing, image-making, and interface: an essay that behaves like a sensor.',
    ],
  },
];

// WORLDS and getProjectWorld are now imported from '../data/worlds'
// Re-exported here for backward compatibility with any external consumers
export { WORLDS, getProjectWorld } from '../data/worlds';

interface OverlayProps {
  inert?: boolean;
  nodes: any[];
  activeNode: any;
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
  onRailStep: (direction: -1 | 1) => void;
  onSelectSlug: (slug: string) => void;
  onNodeClick: (node: any) => void;
  onCloseNode: () => void;
  onBackToWorks: () => void;
  onOpenMedia: (media: any) => void;
  onGoToRailSlide?: (index: number) => void;
  audioReady?: boolean;
  isMuted?: boolean;
  onToggleAudio?: () => void;
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
}

interface TraversalRoute {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  nodes: string[];
}

const TRAVERSAL_ROUTES: TraversalRoute[] = [
  {
    id: 'route-01',
    name: 'ROUTE 01: VISIBILITY BECOMES INFRASTRUCTURE',
    subtitle: 'The Structural Arc',
    description: 'Traces the evolution of visibility, vulnerability, and spatial agency from the stadium stages of Mashrou’ Leila into physical blueprints of sanctuary in Queens.',
    nodes: ['mashrou-leila', 'cost-of-being-queer-and-arab', 'mekena-nyc', 'architectures-of-belonging']
  },
  {
    id: 'route-02',
    name: 'ROUTE 02: MEMORY DOES NOT RESOLVE',
    subtitle: 'The Literary Arc',
    description: 'Tracks the cartography of damaged space, exilic drift, and digital memory decay across Bartlett drawings, hypertext operating systems, and generative neural pipelines.',
    nodes: ['architecture-in-low-res', 'cartography-of-absence', 'sometimes-i-wake-up-elsewhere', 'sparrowos', 'derive']
  },
  {
    id: 'route-03',
    name: 'ROUTE 03: RED-TEAMING THE MACHINE',
    subtitle: 'The Forensic Arc',
    description: 'Examines the computational and acoustic resistance to Western bias in generative language models, microtonal tuning systems, and human-AI duos.',
    nodes: ['localization-gap', 'hah-was', 'maqamai', 'tebr']
  }
];

export default function Overlay({ 
  inert,
  nodes, 
  activeNode, 
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
  onRailStep,
  onSelectSlug,
  onNodeClick,
  onCloseNode,
  onBackToWorks,
  onOpenMedia,
  onGoToRailSlide,
  audioReady,
  isMuted,
  onToggleAudio,
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
}: OverlayProps) {
  const [showAbout, setShowAbout] = React.useState(false);
  const [activeInfoTab, setActiveInfoTab] = React.useState<SiteInfoTabId>('about');
  const [copied, setCopied] = React.useState(false);
  const [isSearchActive, setIsSearchActive] = React.useState(false);
  const [mobileSheetState, setMobileSheetState] = React.useState<'peek' | 'full'>('peek');
  const [isMobileViewport, setIsMobileViewport] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [hoveredChapterIndex, setHoveredChapterIndex] = React.useState<number | null>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = React.useState(false);

  const filteredNodes = nodes.filter((node) => {
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
  });

  const flatAssets = React.useMemo(() => {
    const list: any[] = [];
    filteredNodes.forEach((node) => {
      const gallery = node.gallery?.length ? node.gallery : [
        { id: `${node.slug}-0`, projectId: node.slug, src: node.thumbnail, isPrimary: true, label: node.title }
      ];
      gallery.forEach((asset: any) => {
        list.push({
          ...asset,
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
  const focusDomains = focusNode?.domains?.length ? focusNode.domains.join(' + ') : focusNode?.category || 'archive';
  const imageCount = nodes.reduce((count, node) => count + (node.gallery?.length || 1), 0);
  const workCount = workNodes.length;
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
  const railHoverImage = currentMode === 'horizontal' && activeNode && hoveredNode?.projectId === activeNode.slug && hoveredNode?.assetId
    ? {
        id: hoveredNode.assetId,
        type: hoveredNode.assetType || 'image',
        src: hoveredNode.assetSrc || '',
        poster: hoveredNode.assetPoster,
        youtubeId: hoveredNode.assetYoutubeId,
        embedUrl: hoveredNode.assetEmbedUrl,
        externalUrl: hoveredNode.assetExternalUrl,
        label: hoveredNode.assetLabel || hoveredNode.title,
        caption: hoveredNode.assetCaption || hoveredNode.summary,
        body: hoveredNode.assetBody,
        role: hoveredNode.assetRole || 'evidence',
        layout: hoveredNode.assetLayout || 'wide',
        emphasis: hoveredNode.assetEmphasis || 'secondary',
        chapter: hoveredNode.assetChapter || 'Evidence',
        beat: hoveredNode.assetBeat || hoveredNode.assetCaption || hoveredNode.summary,
        relatedSlugs: hoveredNode.assetRelatedSlugs || hoveredNode.relatedSlugs || hoveredNode.connections || [],
      }
    : null;
  const displayRailImage = railHoverImage || railImage;
  const displayRailIndex = railHoverImage ? hoveredNode?.assetIndex ?? railIndex : railIndex;
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
  const mobileSheetFrameClass = mobileSheetState === 'full' ? 'top-[64px]' : 'h-[132px]';
  const mobileIntroClass = mobileSheetState === 'full' ? 'block' : 'hidden md:block';
  const mobileTagsClass = mobileSheetState === 'full' ? 'flex' : 'hidden md:flex';
  const mobilePeekTitle = displayRailImage?.label || activeNode?.title;
  const mobilePeekDescription = railBeat || displayRailImage?.caption || activeNode?.shortDescription;
  const activeDetailNode = activeNode || (currentMode === 'map' ? focusedMapNode : null);
  const activeFocusNode = activeDetailNode || hoveredNode || (currentMode === 'vertical' ? centeredNode : null);
  const bottomTitle = currentMode === 'horizontal' && activeNode
    ? displayRailImage?.label || activeNode.title
    : activeFocusNode
    ? activeFocusNode.title
    : 'Archive field';

  const projectCode = activeFocusNode?.slug ? activeFocusNode.slug.toUpperCase() : 'SYSTEM';
  const year = activeFocusNode?.year || '2026';
  const currentIndex = currentMode === 'horizontal' && activeNode
    ? String(railIndex + 1).padStart(3, '0')
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
  const indexAssetCount = React.useMemo(() => {
    if (!indexFilters) return flatAssets.length;
    return flatAssets.filter((asset) => {
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
      return true;
    }).length;
  }, [flatAssets, indexFilters]);

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
    const mediaQuery = window.matchMedia('(max-width: 767px)');
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
    ? `${railHoverImage ? 'HOVER' : 'ACTIVE'} / ${String(displayRailIndex + 1).padStart(2, '0')} / ${String(Math.max(railTotal, 1)).padStart(2, '0')} / ${String(railChapter).toUpperCase()}`
    : searchQuery.trim()
    ? `${filteredNodes.length} matches / ${nodes.length} records`
    : activeFocusNode
    ? `${activeFocusNode.year} / ${activeFocusNode.stack?.join(' · ') || activeFocusNode.domains?.join(' · ') || 'ARCHIVE'} / ${activeFocusNode.evidenceStatus || 'COMPLETE'} — ${activeFocusNode.summary || activeFocusNode.shortDescription || ''}`
    : `${workCount} works / ${imageCount} images`;

  return (
    <div data-ui-layer="true" className="fixed inset-0 pointer-events-none z-10 flex flex-col p-5" inert={inert ? true : undefined}>
      
      {/* Top Header - Always visible, minimalist */}
      <header className="fixed top-5 left-5 right-5 flex justify-between items-start pointer-events-none z-[101]">
        <div className="flex pointer-events-auto">
          <h1 
            onClick={() => {
              onCloseNode();
              onModeChange('cylinder');
            }}
            className="font-display text-2xl font-bold tracking-tighter text-white leading-tight cursor-pointer select-none"
          >
            PAPAZIAN
          </h1>
        </div>

        {/* Filter Trigger button (grid/archive grid mode only) */}
        {currentMode === 'grid' && !activeNode && (
          <div className="pointer-events-auto">
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="font-mono text-[9px] font-bold tracking-[0.16em] uppercase border border-white/12 hover:border-white px-3 py-1.5 transition-all text-white bg-black/40 backdrop-blur-sm cursor-pointer"
            >
              ⚡ FILTERS
            </button>
          </div>
        )}
      </header>


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
                transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
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
                ? { y: 0, opacity: 1 }
                : { x: isSidebarCollapsed ? '100%' : 0, opacity: isSidebarCollapsed ? 0 : 1 }
            }
            exit={isMobileViewport ? { y: '100%', opacity: 0 } : { x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed bottom-0 left-0 right-0 z-[140] ${mobileSheetFrameClass} rounded-none border-t border-border bg-[#050505]/96 p-4 pb-4 shadow-2xl backdrop-blur-xl md:inset-y-0 md:left-auto md:right-0 md:h-auto md:w-[clamp(420px,30vw,480px)] md:border-t-0 md:border-y-0 md:border-r-0 md:border-l md:bg-surface/95 md:p-10 md:pt-20 md:pb-28 flex flex-col pointer-events-auto md:z-[102] ${(!isMobileViewport && isSidebarCollapsed) ? 'pointer-events-none' : ''}`}
            aria-hidden={!isMobileViewport && isSidebarCollapsed}
          >
            <div className="mb-3 flex items-center justify-between gap-2 md:hidden">
              {currentMode === 'horizontal' ? (
                <div className="grid grid-cols-3 border border-white/10 bg-white/5">
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => {
                      event.currentTarget.blur();
                      onCloseNode();
                    }}
                    className="flex h-8 items-center justify-center px-2 text-text-muted transition-colors hover:text-white"
                    aria-label="Return to previous view"
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
                    className="flex h-8 items-center justify-center px-2 text-text-muted transition-colors hover:text-white"
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
                    className="flex h-8 items-center justify-center px-2 text-text-muted transition-colors hover:text-white"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              ) : (
                <span />
              )}

              <div className="ml-auto grid grid-cols-2 border border-white/10 bg-white/5">
                {(['peek', 'full'] as const).map((state) => (
                  <button
                    key={state}
                    type="button"
                    onClick={() => setMobileSheetState(state)}
                    className={`px-2 py-1.5 font-mono text-[8px] uppercase tracking-[0.16em] transition-colors border ${
                      mobileSheetState === state ? 'bg-white/10 text-white border-white/20' : 'text-text-muted hover:text-white border-transparent'
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex h-8 w-8 items-center justify-center border border-white/10 text-text-muted transition-colors hover:border-white/25 hover:text-white"
                aria-label={copied ? 'Link copied' : 'Copy direct link'}
                title={copied ? 'Link copied' : 'Copy direct link'}
              >
                <Link size={14} className={copied ? 'text-accent' : ''} />
              </button>

              <button
                type="button"
                onClick={handleDismissDetail}
                className="flex h-8 w-8 items-center justify-center border border-white/10 text-text-muted transition-colors hover:border-white/25 hover:text-white"
                aria-label="Collapse project sheet"
              >
                <X size={15} />
              </button>
            </div>

            <div className="absolute right-4 top-4 hidden items-center gap-2 md:flex">
              {currentMode === 'horizontal' && (
                <div className="flex border border-white/10 bg-white/[0.03]">
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => {
                      event.currentTarget.blur();
                      onCloseNode();
                    }}
                    className="flex h-10 items-center justify-center gap-2 border-r border-white/10 px-3 font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted transition-colors hover:text-white"
                  >
                    <ArrowLeft size={13} />
                    Return
                  </button>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => {
                      event.currentTarget.blur();
                      onRailStep(-1);
                    }}
                    className="flex h-10 items-center justify-center border-r border-white/10 px-3 text-text-muted transition-colors hover:text-white"
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
                    className="flex h-10 items-center justify-center border-r border-white/10 px-3 text-text-muted transition-colors hover:text-white"
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
                className="flex h-10 items-center justify-center gap-2 border border-white/10 px-3 font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted transition-colors hover:border-white/25 hover:text-white"
                aria-label={copied ? 'Link copied' : 'Copy direct link'}
              >
                <Link size={13} className={copied ? 'text-accent' : ''} />
                {copied ? 'Copied' : 'Link'}
              </button>

              <button
                type="button"
                onClick={onCloseNode}
                className="flex h-10 w-10 items-center justify-center border border-white/10 text-text-muted transition-colors hover:border-white/25 hover:text-white"
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
                <div className="border border-white/10 bg-white/5 p-4 mb-6 rounded-none pointer-events-auto shrink-0">
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
                      className={`font-mono text-[9px] font-bold tracking-[0.16em] uppercase px-3 py-1.5 border border-white/10 transition-colors cursor-pointer rounded-none bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none`}
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
                      className={`font-mono text-[9px] font-bold tracking-[0.16em] uppercase px-3 py-1.5 border border-white/10 transition-colors cursor-pointer rounded-none bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none`}
                    >
                      NEXT STEP
                    </button>
                  </div>
                </div>
              )}

              {isMobilePeek ? (
                <div className="mb-2 pr-1">
                  <p className="mb-1 font-mono text-[8px] uppercase tracking-[0.22em] text-accent">
                    Project / Image Rail
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
                  {isMobilePeek && currentMode === 'horizontal' ? `${String(railIndex + 1).padStart(2, '0')} / ${String(Math.max(railTotal, 1)).padStart(2, '0')}` : activeNode.tier || activeNode.category || 'PROJECT'}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="font-mono text-[10px] text-text-muted tracking-widest">
                  {isMobilePeek && currentMode === 'horizontal' ? railChapter : activeNode.year}
                </span>
              </div>

              {(() => {
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
                <p className="text-text leading-relaxed text-sm text-pretty">
                  {activeNode.shortDescription}
                </p>
                {activeNode.fullDescription && currentMode !== 'horizontal' && (
                  <p className="text-text-muted mt-4 leading-relaxed text-sm text-pretty">
                    {activeNode.fullDescription}
                  </p>
                )}
              </div>

              {activeNode.highlights?.length > 0 && (
                <div className={`${mobileSheetState === 'full' ? 'block' : 'hidden'} mt-8 border-t border-white/10 pt-5 md:block`}>
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
                <div className="mt-8 border-t border-white/10 pt-5">
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
                              : 'bg-transparent border-white/5 hover:border-white/10'
                          }`}
                          style={{ borderLeft: `2px solid ${targetNode?.accentColor || '#666a6f'}` }}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <button
                              onClick={() => onSelectSlug(slug)}
                              className="font-display text-[10px] md:text-xs font-bold text-white tracking-wider uppercase hover:text-accent transition-colors cursor-pointer text-left"
                            >
                              {targetNode?.title || slug.replace(/-/g, ' ')}
                            </button>
                            <span className={`px-1.5 py-0.5 font-mono text-[7px] tracking-wider uppercase border shrink-0 ${
                              isMutual
                                ? 'bg-accent/15 border-accent/30 text-accent'
                                : 'bg-white/5 border-white/10 text-text-muted'
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

              {currentMode === 'horizontal' && activeNode && mobileSheetState === 'full' && (
                <div className="mt-4 border-y border-white/10 py-4 md:mt-10 md:py-5">
                  <div className="flex items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
                    <span>
                      {railHoverImage ? 'HOVER' : 'ACTIVE'} / {String(displayRailIndex + 1).padStart(2, '0')} / {String(Math.max(railTotal, 1)).padStart(2, '0')}
                    </span>
                    <span className="truncate text-accent">{railChapter} / {railType} / {railRole}</span>
                  </div>
                  <p className="mt-3 font-display text-lg uppercase leading-tight text-white md:text-xl">
                    {displayRailImage?.label || activeNode.title}
                  </p>
                  {String(railChapter).toUpperCase() === 'AUTHORSHIP' ? (
                    <div className="mt-4 space-y-4">
                      {railBeat && (
                        <p className="text-xs leading-relaxed text-text-muted">
                          {railBeat}
                        </p>
                      )}
                      {displayRailImage?.body && (
                        <div className="mt-4 border-t border-white/10 pt-4">
                          <p className="mb-2.5 font-mono text-[9px] uppercase tracking-[0.2em] text-accent">Role Deliverables</p>
                          <div className="grid grid-cols-2 gap-2">
                            {(Array.isArray(displayRailImage.body) ? displayRailImage.body : [displayRailImage.body]).map((item: string, idx: number) => (
                              <div key={item} className="flex items-start gap-2 border border-white/5 bg-white/3 p-2 font-mono text-[9px] uppercase tracking-wider">
                                <span className="text-accent font-bold">0{idx + 1}</span>
                                <span className="text-text-muted leading-tight">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {railBeat && (
                        <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-text-muted md:line-clamp-none">
                          {railBeat}
                        </p>
                      )}
                    </>
                  )}
                  {currentMode === 'horizontal' && (() => {
                    const titleStr = String(displayRailImage?.label || activeNode?.title || 'NODE').toUpperCase();
                    const codeStr = String(displayRailImage?.id || activeNode?.slug || '0000').toUpperCase().slice(-9);
                    const charSum = (str: string) => str.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
                    const latency = (charSum(codeStr) % 100) * 0.0004 + 0.012;
                    const entropy = (charSum(titleStr) % 100) * 0.005 + 0.085;
                    const faultRate = (charSum(titleStr) % 10 === 0) ? '0.04%' : '0.00%';
                    return (
                      <div className="mt-4 border-t border-white/10 pt-4 flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.16em] text-text-muted/64">
                        <span>LATENCY: {latency.toFixed(4)} MS</span>
                        <span>ENTROPY: {entropy.toFixed(3)} BITS</span>
                        <span>FAULT RATE: {faultRate}</span>
                      </div>
                    );
                  })()}
                  {(railType === 'video' || railType === 'audio') && (
                    <button
                      type="button"
                      disabled={!railEmbedUrl}
                      onClick={() => railEmbedUrl && onOpenMedia(displayRailImage)}
                      className="mt-4 flex w-full items-center justify-center gap-2 border border-accent/40 bg-accent/10 py-3 font-mono text-[9px] uppercase tracking-[0.18em] text-white transition-colors hover:border-accent hover:bg-accent/18 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/28"
                    >
                      {railType === 'audio' ? <Volume2 size={14} /> : <Play size={14} />}
                      {railEmbedUrl ? 'Play in Archive' : 'Video unavailable'}
                    </button>
                  )}
                  {relatedSlugs.length > 0 && (
                    <div className={`${mobileSheetState === 'full' ? 'block' : 'hidden'} mt-5 md:block`}>
                      <p className="mb-2 font-mono text-[8px] uppercase tracking-[0.2em] text-text-muted">Related</p>
                      <div className="flex flex-wrap gap-2">
                        {relatedSlugs.map((slug: string) => (
                          <button
                            key={slug}
                            onClick={() => onSelectSlug(slug)}
                            className="border border-white/10 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-text-muted transition-colors hover:border-accent/60 hover:text-white"
                          >
                            {slug.replace(/-/g, ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-auto pt-6">
                {activeNode.hasProjectPage ? (
                  null
                ) : (
                  <div className="w-full py-4 border border-white/10 text-text-muted font-mono text-[10px] tracking-widest flex items-center justify-center">
                    {activeNode.tier === 'archive' ? 'ARCHIVE NODE' : 'SPATIAL RECORD'}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Hidden container for screen readers (DOM Mirroring for a11y) */}
          {currentMode === 'horizontal' && activeNode && (
            <div className="sr-only" aria-live="polite" id="accessible-dossier-mirror">
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

      {/* Floating Expand Sidebar Button when in horizontal mode and collapsed */}
      <AnimatePresence>
        {currentMode === 'horizontal' && activeNode && isSidebarCollapsed && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            type="button"
            onClick={() => setIsSidebarCollapsed(false)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-[141] bg-surface/95 border-l border-y border-border px-3 py-4 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted hover:text-white hover:bg-white/5 transition-all cursor-pointer flex flex-col items-center gap-2 pointer-events-auto shadow-xl"
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
            workCount={workCount}
            onExploreWork={() => onModeChange('vertical')}
          />
        )}
      </AnimatePresence>

      {/* Essays / Writings Reading Panel */}
      <AnimatePresence>
        {currentMode === 'essays' && !activeNode && (
          <EssaysPanel isMobileViewport={isMobileViewport} onEssayChange={onEssayChange} />
        )}
      </AnimatePresence>


      {/* Index Filter Panel (grid mode drawer) */}
      {currentMode === 'grid' && !activeNode && indexFilters && onIndexFiltersChange && (
        <IndexFilterBar
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          filters={indexFilters}
          onChange={onIndexFiltersChange}
          onHoverFilter={onHoverFilter}
        />
      )}

      {/* Map Traversal Routes launcher — entry point for the curated tours */}
      <AnimatePresence>
        {currentMode === 'map' && !activeRoute && !activeNode && (
          <motion.nav
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed left-5 top-24 z-[100] hidden w-[290px] flex-col gap-1.5 pointer-events-auto md:flex"
            aria-label="Curated traversal routes"
          >
            <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.28em] text-accent">
              Traversal Routes
            </p>
            {TRAVERSAL_ROUTES.map((route) => (
              <button
                key={route.id}
                type="button"
                onClick={() => {
                  setActiveRoute(route);
                  setActiveRouteStep(0);
                  const firstNode = nodes.find((node) => node.slug === route.nodes[0]);
                  if (firstNode) onNodeClick(firstNode);
                }}
                className="border border-white/10 bg-black/40 p-3 text-left backdrop-blur-sm transition-colors hover:border-accent/50 hover:bg-white/5 group"
              >
                <span className="block font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-white group-hover:text-accent transition-colors">
                  {route.name}
                </span>
                <span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.14em] text-text-muted">
                  {route.subtitle} / {route.nodes.length} stops
                </span>
              </button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Map Legend — world color key */}
      <AnimatePresence>
        {currentMode === 'map' && !activeRoute && !activeNode && (
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: 0.08 }}
            className="fixed left-5 bottom-[108px] z-[100] hidden w-[200px] pointer-events-auto md:block"
            aria-label="Map legend"
          >
            <p className="mb-2 font-mono text-[8px] uppercase tracking-[0.28em] text-text-muted">
              World Legend
            </p>
            <div className="space-y-1.5">
              {WORLDS.map((world) => {
                const color = ({'foundation-world': '#d5a2a2', 'public-culture-world': '#d7e7ef', 'exile-machines-world': '#9fd6bf', 'memory-interfaces-world': '#c7b28a', 'sonic-intelligence-world': '#7aa6ff', 'spatial-futures-world': '#8fa8c2'} as Record<string, string>)[world.id] || '#d7e7ef';
                return (
                  <div key={world.id} className="flex items-center gap-2.5">
                    <span className="w-2 h-2 shrink-0" style={{ backgroundColor: color }} />
                    <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-text-muted">
                      {world.roman} {world.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Hover Tooltip (grid mode only, visual view mode) */}
      {currentMode === 'grid' && indexFilters && indexFilters.viewMode === 'visual' && hoveredNode && mousePosition && (
        <div
          className="fixed pointer-events-none z-[250] font-mono text-[9px] text-text-muted flex flex-col gap-1 border-l border-white/20 pl-2.5 bg-black/40 backdrop-blur-sm py-1.5"
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
          <span className="text-[7px] text-text-muted/40 uppercase tracking-widest mt-1">
            CLICK TO INSPECT
          </span>
        </div>
      )}

      {/* 2D HTML Metadata Cards Overlay for Grid mode */}
      {currentMode === 'grid' && indexFilters && (indexFilters.viewMode === 'text' || indexFilters.viewMode === 'hybrid') && (
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
                  <div className="text-[8px] text-text-muted/80 uppercase truncate">
                    {asset.role || asset.type || 'Evidence'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ArchiveInfoConsole
        open={showAbout}
        activeTab={activeInfoTab}
        onTabChange={setActiveInfoTab}
        ref={infoConsoleRef}
      />


      <footer className="fixed bottom-5 left-5 right-5 flex justify-center items-center pointer-events-none z-[130]">
        <div className="w-full pointer-events-auto">
          <div className="relative bg-surface/82 backdrop-blur-xl border border-white/18 shadow-2xl rounded-none w-full">
            <motion.div
              className="absolute left-0 top-0 h-[1px] origin-left bg-accent"
              style={{ scaleX: progress }}
            />

            <div className="grid grid-cols-[auto_1fr] lg:grid-cols-[auto_minmax(0,1fr)_auto]">
              {/* Left Actions Group */}
              <div className="flex border-r border-white/10 shrink-0">
                <button 
                  ref={infoButtonRef}
                  onClick={() => setShowAbout(!showAbout)}
                  className={`min-h-[64px] w-[64px] border-r border-white/10 flex items-center justify-center transition-colors rounded-none shrink-0 ${showAbout ? 'bg-accent text-black' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
                  title="INFORMATION"
                  aria-label="Open information"
                >
                  {showAbout ? <X size={20} /> : <Plus size={20} />}
                </button>

                {/* Audio Toggle */}
                <button
                  onClick={onToggleAudio}
                  className={`min-h-[64px] w-[64px] flex items-center justify-center transition-colors rounded-none shrink-0 ${
                    audioReady && !isMuted
                      ? 'text-accent'
                      : 'text-text-muted hover:text-white hover:bg-white/5'
                  }`}
                  title={isMuted ? 'Unmute sound' : 'Mute sound'}
                  aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
                >
                  {isMuted || !audioReady ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              </div>

              <div className="min-w-0">
                <AnimatePresence mode="wait">
                  {isSearchActive ? (
                    <motion.div 
                      key="search-input"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex min-h-[64px] items-center w-full px-8"
                    >
                      <Search size={14} className="text-accent shrink-0" />
                      <input 
                        ref={searchInputRef}
                        type="search"
                        placeholder="SEARCH BY TITLE, DOMAIN, TIER, CONNECTION..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onBlur={() => !searchQuery && setIsSearchActive(false)}
                        className="bg-transparent border-none outline-none font-mono text-[10px] text-white placeholder:text-text-muted w-full ml-3"
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
                      {/* Left: Clickable Metadata Block (triggers search) */}
                      <button 
                        onClick={() => setIsSearchActive(true)}
                        className="flex flex-col gap-0.5 px-8 group text-left overflow-hidden hover:bg-white/5 transition-colors rounded-none justify-center h-full min-h-[48px] md:min-h-[64px] shrink-0 w-full md:w-[240px] lg:w-[280px] cursor-pointer"
                      >
                        <span className="font-mono text-[9px] text-accent/40 group-hover:text-accent transition-colors duration-300 tracking-[0.16em] uppercase truncate block w-full">
                          {line1Text}
                        </span>
                        <span className="font-display text-xs md:text-sm font-bold text-white tracking-wider uppercase truncate block w-full">
                          {bottomTitle}
                        </span>
                        <span className="font-mono text-[9px] text-text-muted/40 group-hover:text-text-muted transition-colors duration-300 tracking-[0.16em] uppercase truncate block w-full">
                          {line3Text}
                        </span>
                      </button>

                      {/* Vertical divider on desktop */}
                      <div className="hidden md:block w-[1px] h-[36px] bg-white/10 self-center shrink-0" />

                      {/* Right: Chapter Map Scrubber Progress Meter */}
                      <div className="flex-1 min-w-0 px-8 flex flex-col justify-center gap-1 h-full min-h-[48px] md:min-h-[64px] py-1.5 md:py-0 select-none">
                        <div className="flex gap-2 w-full">
                          {chapters.map((chapter, idx) => {
                            const isChapterActive = railIndex >= chapter.startIndex && railIndex < chapter.startIndex + chapter.count;
                            return (
                              <div 
                                key={chapter.name} 
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
                                            : 'bg-white/10'
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
                        <span className="font-mono text-[9px] text-accent/80 tracking-[0.16em] uppercase truncate">
                          {line1Text}
                        </span>
                        <span className="font-display text-xs md:text-sm font-bold text-white tracking-wider uppercase truncate my-0.5">
                          {bottomTitle}
                        </span>
                        <span className="font-mono text-[9px] text-text-muted/80 tracking-[0.16em] uppercase truncate">
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
                          className="bg-white/5 hover:bg-white/10 text-white font-mono text-[9px] font-bold tracking-[0.16em] uppercase px-4 py-2 border border-white/10 transition-all cursor-pointer rounded-none"
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
                      className="flex items-center justify-between w-full h-full min-h-[64px] pr-8"
                    >
                      <button 
                        onClick={() => setIsSearchActive(true)}
                        className="flex flex-col gap-0.5 px-8 group text-left overflow-hidden hover:bg-white/5 transition-colors rounded-none justify-center h-full min-h-[64px] flex-1 cursor-pointer"
                      >
                        <span className="font-mono text-[9px] text-accent/40 group-hover:text-accent transition-colors duration-300 tracking-[0.16em] uppercase truncate block w-full">
                          {line1Text}
                        </span>
                        <span className="font-display text-xs md:text-sm font-bold text-white tracking-wider uppercase truncate block w-full">
                          {bottomTitle}
                        </span>
                        <span className="font-mono text-[9px] text-text-muted/40 group-hover:text-text-muted transition-colors duration-300 tracking-[0.16em] uppercase truncate block w-full">
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
                      className="flex flex-col gap-0.5 px-8 group text-left overflow-hidden hover:bg-white/5 transition-colors rounded-none justify-center h-full min-h-[64px] w-full cursor-pointer"
                    >
                      <span className="font-mono text-[9px] text-accent/40 group-hover:text-accent transition-colors duration-300 tracking-[0.16em] uppercase truncate block w-full">
                        {line1Text}
                      </span>
                      <span className="font-display text-xs md:text-sm font-bold text-white tracking-wider uppercase truncate block w-full">
                        {bottomTitle}
                      </span>
                      <span className="font-mono text-[9px] text-text-muted/40 group-hover:text-text-muted transition-colors duration-300 tracking-[0.16em] uppercase truncate block w-full">
                        {line3Text}
                      </span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <div className="col-span-2 grid grid-cols-5 border-t border-white/10 lg:col-span-1 lg:flex lg:border-l lg:border-t-0">
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
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HomeOrbitPanel({ workCount, onExploreWork }: { workCount: number; onExploreWork: () => void }) {
  const [showBio, setShowBio] = React.useState(false);
  const caseStudies = [
    {
      label: "Mashrou' Leila",
      meta: 'Cultural architecture / performance system',
      body: 'A counter-public built through sound, image, language, identity, and collective risk.',
      accentColor: '#e85d75',
    },
    {
      label: 'MEKENA NYC',
      meta: 'Space / residency / radical hospitality',
      body: 'A physical operating system for artists, gathering, adaptive reuse, and diasporic belonging.',
      accentColor: '#5ec4b6',
    },
    {
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
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto fixed bottom-0 left-0 right-0 top-[64px] z-[140] flex overflow-hidden shadow-2xl md:left-1/2 md:right-auto md:top-[74px] md:bottom-[108px] md:w-[min(430px,calc(100vw-32px))] md:-translate-x-1/2 md:z-[88] central-panel"
    >
      <div className="flex min-h-0 w-full flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar py-4">
          <div className="border-b border-white/12 p-5 md:p-7">
            <h2 className="font-display text-5xl font-bold leading-[0.86] tracking-tight text-white md:text-7xl text-balance">
              Systems<br />of Meaning
            </h2>
            <p className="mt-5 max-w-[22rem] text-base leading-snug text-white/82 md:text-lg text-pretty">
              I build systems for memory, performance, and cultural translation.
            </p>
            <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
              Sound / Space / Code / Text / Image / Systems
            </p>
          </div>

          <div className="grid grid-cols-2 border-b border-white/12">
            <div className="border-r border-white/12 p-4">
              <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-text-muted">Selected Works</p>
              <p className="mt-2 font-display text-3xl font-bold text-white">{workCount || 20}</p>
            </div>
            <div className="p-4">
              <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-text-muted">Modes</p>
              <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/78">
                Works / Index / Map / Essays
              </p>
            </div>
          </div>

          {showBio ? (
            <div className="space-y-5 border-b border-white/12 p-5 md:p-7">
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
                className="w-full border border-white/10 p-3 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted hover:bg-white/5 hover:text-white transition-colors"
              >
                ← Back to Index
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-5 border-b border-white/12 p-5 md:p-7">
                <div>
                  <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.24em] text-accent">
                    Editorial Case Studies
                  </p>
                  <div className="space-y-3">
                    {caseStudies.map((study, index) => (
                      <article key={study.label} className="border border-white/10 border-l-2 bg-white/[0.025] p-3" style={{ borderLeftColor: study.accentColor }}>
                        <div className="flex items-start justify-between gap-4">
                          <p className="font-display text-lg font-bold uppercase leading-none text-white">
                            {study.label}
                          </p>
                          <span className="font-mono text-[8px] text-text-muted">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.16em] text-accent/80">
                          {study.meta}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-text-muted">
                          {study.body}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBio(true)}
                  className="w-full border border-white/10 p-3 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted hover:bg-white/5 hover:text-white transition-colors"
                >
                  View Studio Profile →
                </button>
              </div>

              <div className="grid grid-cols-[1fr_auto] items-stretch border-b border-white/12">
                <a
                  href="/cv.pdf"
                  className="flex items-center border-r border-white/12 px-5 py-4 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted transition-colors hover:bg-white/5 hover:text-white"
                >
                  CV
                </a>
                <button
                  type="button"
                  onClick={onExploreWork}
                  className="cta-explore flex items-center gap-2 px-5 py-4 font-mono text-[9px] uppercase tracking-[0.2em]"
                >
                  Explore the Work
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </>
          )}

          <div className="p-5 md:p-7">
            <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-text-muted">
              Twenty works orbit a single spine: memory as architecture, performance as
              infrastructure, translation as a moving system.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

interface EssaysPanelProps {
  isMobileViewport: boolean;
  onEssayChange?: (slug: string) => void;
}

function EssaysPanel({ isMobileViewport, onEssayChange }: EssaysPanelProps) {
  const [activeEssaySlug, setActiveEssaySlug] = React.useState(ESSAY_RECORDS[0].slug);
  const [mobileEssayView, setMobileEssayView] = React.useState<'index' | 'reader'>('index');
  const readerScrollRef = React.useRef<HTMLElement>(null);
  const activeEssay = ESSAY_RECORDS.find((essay) => essay.slug === activeEssaySlug) || ESSAY_RECORDS[0];
  const activeIndex = ESSAY_RECORDS.findIndex((essay) => essay.slug === activeEssay.slug);
  
  React.useEffect(() => {
    onEssayChange?.(ESSAY_RECORDS[0].slug);
  }, []);

  const selectEssay = (slug: string) => {
    setActiveEssaySlug(slug);
    if (isMobileViewport) setMobileEssayView('reader');
    onEssayChange?.(slug);
  };
  const stepEssay = (direction: -1 | 1) => {
    const nextEssay = ESSAY_RECORDS[(activeIndex + direction + ESSAY_RECORDS.length) % ESSAY_RECORDS.length];
    setActiveEssaySlug(nextEssay.slug);
    setMobileEssayView('reader');
    onEssayChange?.(nextEssay.slug);
  };

  React.useEffect(() => {
    if (isMobileViewport) {
      setMobileEssayView('index');
    }
  }, [isMobileViewport]);

  React.useEffect(() => {
    readerScrollRef.current?.scrollTo({ top: 0 });
  }, [activeEssay.slug, mobileEssayView]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.99 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto fixed bottom-0 left-0 right-0 top-[64px] z-[140] flex overflow-hidden border-t border-white/16 bg-black/86 shadow-2xl backdrop-blur-xl md:left-1/2 md:right-auto md:top-[74px] md:bottom-[108px] md:w-[min(900px,calc(100vw-32px))] md:-translate-x-1/2 md:z-[88] md:border md:border-white/16"
    >
      <div className="grid h-full w-full grid-rows-1 md:grid-cols-[240px_1fr]">
        <aside className={`${isMobileViewport && mobileEssayView === 'reader' ? 'hidden' : 'flex'} min-h-0 flex-col border-white/12 md:flex md:border-r`}>
          <div className="border-b border-white/12 p-4 md:p-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-accent">
              Essays / Writings
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase leading-[0.9] text-white md:text-4xl">
              Reading<br />Panel
            </h2>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3 md:block md:p-0">
            {ESSAY_RECORDS.map((essay, index) => {
              const active = essay.slug === activeEssay.slug;
              return (
                <button
                  key={essay.slug}
                  type="button"
                  onClick={() => selectEssay(essay.slug)}
                  className={`mb-2 w-full border border-white/10 border-l-2 p-3 text-left transition-all last:mb-0 md:mb-0 md:border-t-0 md:border-r-0 md:border-b md:border-l-2 ${
                    active
                      ? 'bg-accent/15 border-accent text-white'
                      : 'bg-white/[0.025] border-transparent text-white hover:bg-white/8 hover:border-l-white/40'
                  }`}
                >
                  <span className={`font-mono text-[8px] uppercase tracking-[0.18em] ${active ? 'text-accent-2 font-semibold' : 'text-accent/80'}`}>
                    {String(index + 1).padStart(2, '0')} / {essay.date}
                  </span>
                  <span className="mt-2 block font-display text-base font-bold uppercase leading-none">
                    {essay.title}
                  </span>
                  <span className={`mt-2 block truncate font-mono text-[8px] uppercase tracking-[0.14em] ${active ? 'text-white/70' : 'text-text-muted'}`}>
                    {essay.eyebrow}
                  </span>
                  <span className={`mt-3 block text-xs leading-relaxed md:hidden ${active ? 'text-white/60' : 'text-text-muted'}`}>
                    {essay.dek}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <article
          ref={readerScrollRef}
          className={`${isMobileViewport && mobileEssayView === 'index' ? 'hidden' : 'block'} h-full overflow-y-auto custom-scrollbar md:block`}
        >
          <div className="sticky top-0 z-10 grid grid-cols-3 border-b border-white/12 bg-black/95 md:hidden">
            <button
              type="button"
              onClick={() => setMobileEssayView('index')}
              className="border-r border-white/10 px-3 py-3 text-left font-mono text-[8px] uppercase tracking-[0.18em] text-text-muted transition-colors hover:bg-white/5 hover:text-white"
            >
              Return
            </button>
            <button
              type="button"
              onClick={() => stepEssay(-1)}
              className="border-r border-white/10 px-3 py-3 text-center font-mono text-[8px] uppercase tracking-[0.18em] text-text-muted transition-colors hover:bg-white/5 hover:text-white"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => stepEssay(1)}
              className="px-3 py-3 text-right font-mono text-[8px] uppercase tracking-[0.18em] text-text-muted transition-colors hover:bg-white/5 hover:text-white"
            >
              Next
            </button>
          </div>

          <div className="p-5 md:p-8">
          <div className="mb-7 border-b border-white/12 pb-7">
            <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-accent">
              {activeEssay.eyebrow} / {activeEssay.date} / {activeEssay.readTime}
            </p>
            <h3 className="mt-4 font-display text-5xl font-bold uppercase leading-[0.86] tracking-tight text-white md:text-7xl">
              {activeEssay.title}
            </h3>
            <p className="mt-5 max-w-[680px] text-base leading-[1.6] text-white/78 md:text-lg md:leading-[1.6]">
              {activeEssay.dek}
            </p>
          </div>

          <div className="space-y-5">
            {activeEssay.body.map((paragraph) => (
              <p key={paragraph} className="max-w-[680px] text-[15px] leading-[1.7] text-[#dddddd] font-body">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-10 hidden grid-cols-2 border border-white/10 md:grid">
            <button
              type="button"
              onClick={() => stepEssay(-1)}
              className="border-r border-white/10 px-5 py-4 text-left transition-colors hover:bg-white/5 group"
            >
              <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-text-muted group-hover:text-white transition-colors">
                ← PREVIOUS
              </span>
              <span className="mt-1.5 block font-display text-xs font-bold uppercase tracking-wide text-white/50 group-hover:text-white transition-colors truncate">
                {ESSAY_RECORDS[(activeIndex - 1 + ESSAY_RECORDS.length) % ESSAY_RECORDS.length].title}
              </span>
            </button>
            <button
              type="button"
              onClick={() => stepEssay(1)}
              className="px-5 py-4 text-right transition-colors hover:bg-white/5 group"
            >
              <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-text-muted group-hover:text-white transition-colors">
                NEXT →
              </span>
              <span className="mt-1.5 block font-display text-xs font-bold uppercase tracking-wide text-white/50 group-hover:text-white transition-colors truncate">
                {ESSAY_RECORDS[(activeIndex + 1) % ESSAY_RECORDS.length].title}
              </span>
            </button>
          </div>
          </div>
        </article>
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
      className={`
        group relative h-[64px] w-[64px] flex flex-col items-center justify-center shrink-0 rounded-none
        transition-all duration-0
        ${disabled 
          ? 'cursor-not-allowed text-white/18 border-r border-white/10' 
          : active 
          ? 'bg-white/12 text-white border-r border-transparent' 
          : 'text-text-muted hover:bg-white/5 hover:text-white border-r border-white/10'}
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
  }
>(function ArchiveInfoConsole({ open, activeTab, onTabChange }, ref) {
  const tab = SITE_INFO_TABS.find((item) => item.id === activeTab) || SITE_INFO_TABS[0];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 14, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.985 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 top-[64px] z-[140] flex overflow-hidden border-t border-white/16 bg-[#050505]/96 shadow-2xl backdrop-blur-xl pointer-events-auto md:top-auto md:bottom-[118px] md:left-5 md:right-auto md:h-[520px] md:w-[520px] md:bg-surface/92 md:border md:border-white/16 md:z-[125]"
          role="dialog"
          aria-label="Archive information console"
        >
          <div className="flex min-h-0 w-full flex-col">
          <div className="shrink-0 border-b border-white/10 px-4 py-3">
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

            <div className="mt-4 grid grid-cols-4 gap-px border border-white/10 bg-white/10">
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
              <span className="h-px flex-1 bg-white/10" />
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
              <div className="mt-6 space-y-4 border-t border-white/10 pt-5">
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
              <div className="mt-6 border-t border-white/10 pt-4">
                {tab.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                    className="group flex items-center justify-between gap-5 border-b border-white/8 py-3 transition-colors hover:border-accent/50"
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

            <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-4 font-mono text-[8px] uppercase tracking-[0.18em] text-white/24">
              <span>Papazian Archive</span>
              <span>v1.0.5</span>
            </div>
          </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
