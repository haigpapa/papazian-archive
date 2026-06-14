import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, Rows3, Globe, X, ArrowUpRight, Plus, Link, Search, Map, ArrowLeft, ChevronLeft, ChevronRight, Play, Volume2, BookOpen } from 'lucide-react';
import { CANONICAL_PROJECT_SLUGS, CANONICAL_PROJECT_SET } from '../data/canonicalProjects';
import { SITE_INFO_TABS, type SiteInfoTabId } from '../data/siteInfo';
import { getYouTubeEmbedUrl } from '../utils/youtube';

const MODE_OPTIONS = [
  {
    id: 'cylinder',
    label: 'Home',
    description: 'Orbit intro',
    icon: Globe,
  },
  {
    id: 'vertical',
    label: 'Works',
    description: '20-project spine',
    icon: Rows3,
  },
  {
    id: 'grid',
    label: 'Index',
    description: 'Unwrapped grid',
    icon: LayoutGrid,
  },
  {
    id: 'atlas',
    label: 'Atlas',
    description: 'Relations',
    icon: Map,
  },
  {
    id: 'essays',
    label: 'Essays',
    description: 'Writing panel',
    icon: BookOpen,
  },
];

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

export const WORLDS = [
  {
    id: 'foundation-world',
    name: 'FOUNDATION',
    roman: '01',
    systems: 'Image · Space · Breakdown',
    definition: 'Early architectural and visual thinking.',
    slugs: ['architecture-in-low-res', 'cartography-of-absence']
  },
  {
    id: 'public-culture-world',
    name: 'PUBLIC CULTURE',
    roman: '02',
    systems: 'Stage · Audience · Risk',
    definition: 'The cultural infrastructure era.',
    slugs: ['mashrou-leila', 'why-were-like-this']
  },
  {
    id: 'exile-machines-world',
    name: 'EXILE MACHINES',
    roman: '03',
    systems: 'Sound · Memory · Performance',
    definition: 'The post-band performance and instrument-building era.',
    slugs: ['space-time-tuning-machine', 'tebr', 'chronocumulator', 'the-weather-rehearsal']
  },
  {
    id: 'memory-interfaces-world',
    name: 'MEMORY INTERFACES',
    roman: '04',
    systems: 'Text · Archive · Navigation',
    definition: 'The literary and hypertext systems era.',
    slugs: ['sometimes-i-wake-up-elsewhere', 'derive', 'storylines']
  },
  {
    id: 'sonic-intelligence-world',
    name: 'SONIC INTELLIGENCE',
    roman: '05',
    systems: 'AI · Listening · Cultural Bias',
    definition: 'The research and AI-audit era.',
    slugs: ['hah-was', 'maqamai']
  },
  {
    id: 'spatial-futures-world',
    name: 'SPATIAL FUTURES',
    roman: '06',
    systems: 'Shelter · Code · Infrastructure',
    definition: 'The outward-facing infrastructure era.',
    slugs: ['mekena-nyc', 'codeverse-explorer']
  }
];


export const getProjectWorld = (slug: string) => {
  return WORLDS.find(w => w.slugs.includes(slug)) || null;
};

interface OverlayProps {
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
}

export default function Overlay({ 
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
}: OverlayProps) {
  const [showAbout, setShowAbout] = React.useState(false);
  const [activeInfoTab, setActiveInfoTab] = React.useState<SiteInfoTabId>('about');
  const [copied, setCopied] = React.useState(false);
  const [isSearchActive, setIsSearchActive] = React.useState(false);
  const [mobileSheetState, setMobileSheetState] = React.useState<'peek' | 'full'>('peek');
  const [isMobileViewport, setIsMobileViewport] = React.useState(false);
  
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
  const activeFocusNode = activeNode || hoveredNode || (currentMode === 'vertical' ? centeredNode : null);
  const bottomTitle = currentMode === 'horizontal' && activeNode
    ? displayRailImage?.label || activeNode.title
    : activeFocusNode
    ? activeFocusNode.title
    : 'Archive field';

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
    if (!activeNode) return;
    setMobileSheetState(currentMode === 'horizontal' ? 'peek' : 'full');
  }, [activeNode?.slug, currentMode, activeNode]);

  React.useEffect(() => {
    detailScrollRef.current?.scrollTo({ top: 0 });
  }, [activeNode?.slug, currentMode, railIndex]);

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
  const bottomMeta = currentMode === 'horizontal' && activeNode
    ? `${railHoverImage ? 'HOVER' : 'ACTIVE'} / ${String(displayRailIndex + 1).padStart(2, '0')} / ${String(Math.max(railTotal, 1)).padStart(2, '0')} / ${String(railChapter).toUpperCase()}`
    : searchQuery.trim()
    ? `${filteredNodes.length} matches / ${nodes.length} records`
    : activeFocusNode
    ? `${activeFocusNode.year} / ${activeFocusNode.stack?.join(' · ') || activeFocusNode.domains?.join(' · ') || 'ARCHIVE'} / ${activeFocusNode.evidenceStatus || 'COMPLETE'} — ${activeFocusNode.summary || activeFocusNode.shortDescription || ''}`
    : `${workCount} works / ${imageCount} images`;

  return (
    <div data-ui-layer="true" className="fixed inset-0 pointer-events-none z-10 flex flex-col p-5">
      
      {/* Top Header - Always visible, minimalist */}
      <header className="fixed top-5 left-5 right-5 flex justify-center items-start pointer-events-none z-[101]">
        <div className="w-full flex justify-start pointer-events-auto">
          <h1 className="font-display text-2xl font-bold tracking-tighter text-white leading-tight">
            PAPAZIAN
          </h1>
        </div>
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
                <h2 className="mt-2 text-[11px] font-mono font-normal text-white/90 tracking-[0.2em] uppercase leading-tight">
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
        {activeNode && (
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
            animate={isMobileViewport ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
            exit={isMobileViewport ? { y: '100%', opacity: 0 } : { x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed bottom-0 left-0 right-0 z-[140] ${mobileSheetFrameClass} rounded-none border-t border-border bg-[#050505]/96 p-4 pb-4 shadow-2xl backdrop-blur-xl md:inset-y-0 md:left-auto md:right-0 md:h-auto md:w-[clamp(420px,30vw,480px)] md:border-t-0 md:border-y-0 md:border-r-0 md:border-l md:bg-surface/95 md:p-10 md:pt-20 md:pb-28 flex flex-col pointer-events-auto md:z-[102]`}
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
                    className="flex h-10 items-center justify-center px-3 text-text-muted transition-colors hover:text-white"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={15} />
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
                <h2 className="font-display pr-0 text-xl font-bold uppercase text-white md:pr-24 md:text-4xl mb-2">
                  {activeNode.title}
                </h2>
              )}

              <div className={`${isMobilePeek ? 'mb-0' : 'mb-3 md:mb-8'} flex items-center gap-3`}>
                <span className="font-mono text-[10px] text-accent tracking-[0.2em] uppercase">
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
                  <div className="mb-5 md:mb-7 border-l-2 border-accent pl-3 py-0.5 pointer-events-auto">
                    <span className="font-mono text-[9px] text-accent tracking-[0.26em] uppercase block font-bold">
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
                  <p className="font-display text-lg leading-snug text-white">
                    {activeNode.thesis}
                  </p>
                )}
                <p className="text-text leading-relaxed text-sm">
                  {activeNode.shortDescription}
                </p>
                {activeNode.fullDescription && currentMode !== 'horizontal' && (
                  <p className="text-text-muted mt-4 leading-relaxed text-sm">
                    {activeNode.fullDescription}
                  </p>
                )}
              </div>

              {activeNode.highlights?.length > 0 && (
                <div className={`${mobileSheetState === 'full' ? 'block' : 'hidden'} mt-8 border-t border-white/10 pt-5 md:block`}>
                  <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.22em] text-accent">Signals</p>
                  <div className="space-y-3">
                    {activeNode.highlights.slice(0, currentMode === 'horizontal' ? 2 : 3).map((highlight: string) => (
                      <p key={highlight} className="border-l border-white/12 pl-3 text-xs leading-relaxed text-text-muted">
                        {highlight}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {currentMode !== 'horizontal' && relatedSlugs.length > 0 && (
                <div className="mt-8 border-t border-white/10 pt-5">
                  <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.22em] text-accent">Relations</p>
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
                  {railBeat && (
                    <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-text-muted md:line-clamp-none">
                      {railBeat}
                    </p>
                  )}
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

              <div className={`${currentMode === 'horizontal' ? 'mt-6' : 'mt-12'} space-y-4`}>
                {currentMode === 'horizontal' ? (
                  null
                ) : activeNode.hasProjectPage ? (
                  null
                ) : (
                  <div className="w-full py-4 border border-white/10 text-text-muted font-mono text-[10px] tracking-widest flex items-center justify-center">
                    {activeNode.tier === 'archive' ? 'ARCHIVE NODE' : 'SPATIAL RECORD'}
                  </div>
                )}

              </div>
            </div>
          </motion.div>
          </>
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
          <EssaysPanel isMobileViewport={isMobileViewport} />
        )}
      </AnimatePresence>

      {/* List View Mode */}
      <AnimatePresence>
        {currentMode === 'list' && !activeNode && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none p-5 md:p-10 pb-24"
          >
            <div className="w-full max-w-6xl h-full flex flex-col pointer-events-auto bg-surface/40 backdrop-blur-md border border-white/5">
              <div className="p-8 border-b border-white/10">
                <h2 className="font-mono text-[10px] text-accent tracking-[0.4em] uppercase mb-2">ARCHIVE</h2>
                <p className="font-display text-3xl font-bold text-white tracking-tight uppercase">WORKS</p>
                <p className="mt-2 font-mono text-[10px] tracking-[0.2em] uppercase text-text-muted">
                  {filteredNodes.length} / {nodes.length} records
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4">
                <div className="flex flex-col gap-y-6">
                  {WORLDS.map((world) => {
                    const worldNodes = filteredNodes.filter((node) => world.slugs.includes(node.slug));
                    if (worldNodes.length === 0) return null;
                    return (
                      <div key={world.id} className="mb-2">
                        <div className="border-b border-white/10 pb-2 mb-3">
                          <span className="font-mono text-[9px] text-accent tracking-[0.3em] uppercase block font-bold">
                            {world.roman} / {world.name}
                          </span>
                          <p className="font-mono text-[9px] text-accent/80 tracking-widest uppercase mt-0.5">
                            {(world as any).systems}
                          </p>
                          <p className="font-mono text-[9px] text-text-muted/80 mt-1.5 tracking-wide leading-relaxed lowercase">
                            {world.definition}
                          </p>
                        </div>
                        <div className="flex flex-col gap-y-1">
                          {worldNodes.map((node) => (
                            <button 
                              key={node.id}
                              onClick={() => {
                                onNodeClick(node);
                                onModeChange('horizontal');
                              }}
                              className="flex items-center gap-4 group py-3 border-b border-white/5 hover:border-accent/30 transition-colors text-left"
                            >
                              <span className="flex min-w-0 flex-col">
                                <span className="font-display text-base md:text-md text-white group-hover:text-accent transition-colors tracking-tight uppercase truncate">
                                  {node.title}
                                </span>
                                <span className="font-mono text-[9px] text-text-muted uppercase tracking-[0.18em]">
                                  {node.tier} / {(node.domains || []).join(' + ')}
                                </span>
                              </span>
                              <span className="flex-1 border-b border-dotted border-white/10 group-hover:border-accent/20 mx-4 h-0 self-center" />
                              <span className="font-mono text-[10px] text-text-muted group-hover:text-white transition-colors">
                                {node.year}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {(() => {
                    const mappedSlugs = WORLDS.flatMap((w) => w.slugs);
                    const unmappedNodes = filteredNodes.filter((node) => !mappedSlugs.includes(node.slug));
                    if (unmappedNodes.length === 0) return null;
                    return (
                      <div className="mb-2">
                        <div className="border-b border-white/10 pb-2 mb-3">
                          <span className="font-mono text-[9px] text-accent tracking-[0.3em] uppercase block font-bold">
                            Archive Satellites
                          </span>
                          <h3 className="font-display text-lg font-bold text-white uppercase tracking-tight">
                            Additional Records
                          </h3>
                        </div>
                        <div className="flex flex-col gap-y-1">
                          {unmappedNodes.map((node) => (
                            <button 
                              key={node.id}
                              onClick={() => {
                                onNodeClick(node);
                                onModeChange('horizontal');
                              }}
                              className="flex items-center gap-4 group py-3 border-b border-white/5 hover:border-accent/30 transition-colors text-left"
                            >
                              <span className="flex min-w-0 flex-col">
                                <span className="font-display text-base md:text-md text-white group-hover:text-accent transition-colors tracking-tight uppercase truncate">
                                  {node.title}
                                </span>
                                <span className="font-mono text-[9px] text-text-muted uppercase tracking-[0.18em]">
                                  {node.tier} / {(node.domains || []).join(' + ')}
                                </span>
                              </span>
                              <span className="flex-1 border-b border-dotted border-white/10 group-hover:border-accent/20 mx-4 h-0 self-center" />
                              <span className="font-mono text-[10px] text-text-muted group-hover:text-white transition-colors">
                                {node.year}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <ArchiveInfoConsole
        open={showAbout}
        activeTab={activeInfoTab}
        onTabChange={setActiveInfoTab}
        ref={infoConsoleRef}
      />

      {/* Bottom Archive Instrument */}
      <footer className="fixed bottom-5 left-5 right-5 flex justify-center items-center pointer-events-none z-[130]">
        <div className="w-full pointer-events-auto">
          <div className="relative overflow-hidden bg-surface/82 backdrop-blur-xl border border-white/18 shadow-2xl rounded-none w-full">
            <motion.div
              className="absolute left-0 top-0 h-[1px] origin-left bg-accent"
              style={{ scaleX: progress }}
            />

            <div className="grid grid-cols-[auto_1fr] lg:grid-cols-[auto_minmax(0,1fr)_auto]">
              <button 
                ref={infoButtonRef}
                onClick={() => setShowAbout(!showAbout)}
                className={`min-h-[64px] w-[64px] border-r border-white/10 flex items-center justify-center transition-colors rounded-none shrink-0 ${showAbout ? 'bg-accent text-white' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
                title="INFORMATION"
                aria-label="Open information"
              >
                {showAbout ? <X size={20} /> : <Plus size={20} />}
              </button>

              <div className="min-w-0">
                <AnimatePresence mode="wait">
                  {isSearchActive ? (
                    <motion.div 
                      key="search-input"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex min-h-[64px] items-center w-full px-5"
                    >
                      <Search size={14} className="text-accent shrink-0" />
                      <input 
                        ref={searchInputRef}
                        type="text"
                        placeholder="SEARCH BY TITLE, DOMAIN, TIER, CONNECTION..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onBlur={() => !searchQuery && setIsSearchActive(false)}
                        className="bg-transparent border-none outline-none font-mono text-[10px] text-white placeholder:text-text-muted w-full ml-3"
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
                        className="flex flex-col gap-0.5 px-5 group text-left overflow-hidden hover:bg-white/5 transition-colors rounded-none justify-center h-full min-h-[48px] md:min-h-[64px] shrink-0 w-full md:w-[240px] lg:w-[280px] cursor-pointer"
                      >
                        <span className="font-mono text-[8px] text-accent tracking-[0.24em] uppercase truncate block w-full">
                          {activeMode.label} / {activeMode.description}
                        </span>
                        <span className="font-display text-xs md:text-sm font-bold text-white tracking-wider uppercase truncate block w-full">
                          {bottomTitle}
                        </span>
                        <span className="font-mono text-[9px] text-text-muted tracking-[0.16em] uppercase truncate block w-full">
                          {bottomMeta}
                        </span>
                      </button>

                      {/* Vertical divider on desktop */}
                      <div className="hidden md:block w-[1px] h-[36px] bg-white/10 self-center shrink-0" />

                      {/* Right: Chapter Map Scrubber */}
                      <div className="flex-1 min-w-0 px-5 flex flex-col justify-center gap-1.5 h-full min-h-[48px] md:min-h-[64px] py-1.5 md:py-0 select-none">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-text-muted">
                            Cinematic Rail / Chapter Map
                          </span>
                          <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-accent font-bold">
                            {String(railIndex + 1).padStart(2, '0')} / {String(railTotal).padStart(2, '0')}
                          </span>
                        </div>

                        <div className="flex gap-2 w-full">
                          {chapters.map((chapter) => (
                            <div key={chapter.name} style={{ flex: chapter.count }} className="flex flex-col gap-1 min-w-0">
                              <span className="hidden sm:inline font-mono text-[7px] md:text-[8px] uppercase tracking-[0.2em] text-white/50 truncate max-w-full">
                                {chapter.name}
                              </span>
                              <div className="flex gap-1 w-full">
                                {chapter.slides.map((slide) => {
                                  const isActive = railIndex === slide.globalIndex;
                                  const isVisited = railIndex > slide.globalIndex;
                                  return (
                                    <button
                                      key={slide.globalIndex}
                                      type="button"
                                      onClick={() => onGoToRailSlide?.(slide.globalIndex)}
                                      className={`h-1 flex-1 transition-all rounded-full cursor-pointer hover:h-1.5 ${
                                        isActive
                                          ? 'bg-accent shadow-[0_0_8px_rgba(74,127,168,0.7)]'
                                          : isVisited
                                          ? 'bg-white/40'
                                          : 'bg-white/10 hover:bg-white/20'
                                      }`}
                                      title={`${chapter.name}: ${slide.label}`}
                                      aria-label={`Go to slide ${slide.globalIndex + 1}`}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.button 
                      key="display-meta"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      onClick={() => setIsSearchActive(true)}
                      className="grid min-h-[64px] w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 group text-left overflow-hidden hover:bg-white/5 transition-colors rounded-none"
                    >
                      <div className="flex min-w-0 flex-col gap-1 overflow-hidden">
                        <span className="font-mono text-[8px] text-accent tracking-[0.24em] uppercase truncate">
                          {activeMode.label} / {activeMode.description}
                        </span>
                        <span className="font-display text-sm md:text-base font-bold text-white tracking-wider uppercase truncate">
                          {bottomTitle}
                        </span>
                        <span className="font-mono text-[9px] text-text-muted tracking-[0.16em] uppercase truncate">
                          {bottomMeta}
                        </span>
                      </div>

                      <div className="hidden sm:flex flex-col items-end gap-1 font-mono uppercase">
                        <span className="text-[9px] tracking-[0.18em] text-white">
                          {focusIndex >= 0 ? String(focusIndex + 1).padStart(3, '0') : 'FIELD'}
                        </span>
                        <span className="text-[8px] tracking-[0.18em] text-text-muted">
                          / {String(workCount).padStart(3, '0')}
                        </span>
                      </div>
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
  const caseStudies = [
    {
      label: "Mashrou' Leila",
      meta: 'Cultural architecture / performance system',
      body: 'A counter-public built through sound, image, language, identity, and collective risk.',
    },
    {
      label: 'MEKENA NYC',
      meta: 'Space / residency / radical hospitality',
      body: 'A physical operating system for artists, gathering, adaptive reuse, and diasporic belonging.',
    },
    {
      label: 'Space Time Tuning Machine',
      meta: 'AI / sound / live instrument',
      body: 'A speculative performance engine for memory, displacement, and machine listening.',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.99 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto fixed bottom-0 left-0 right-0 top-[64px] z-[140] flex overflow-hidden border-t border-white/16 bg-black/82 shadow-2xl backdrop-blur-xl md:left-1/2 md:right-auto md:top-[74px] md:bottom-[108px] md:w-[min(430px,calc(100vw-32px))] md:-translate-x-1/2 md:z-[88] md:border md:border-white/16"
    >
      <div className="flex min-h-0 w-full flex-col">
        <div className="shrink-0 border-b border-white/12 bg-black/78 px-5 py-4 backdrop-blur-xl md:px-7">
          <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.28em] text-accent">
            Systems Choreography
          </p>
          <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-white/32">
            Home / Orbit Intro
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">
        <div className="border-b border-white/12 p-5 md:p-7">
          <h2 className="font-display text-5xl font-bold leading-[0.86] tracking-tight text-white md:text-7xl">
            Systems<br />of Meaning
          </h2>
          <p className="mt-5 max-w-[22rem] text-base leading-snug text-white/82 md:text-lg">
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
              Works / Index / Atlas / Essays
            </p>
          </div>
        </div>

        <div className="space-y-5 border-b border-white/12 p-5 md:p-7">
          <div>
            <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.24em] text-accent">
              About / Bio
            </p>
            <p className="text-sm leading-relaxed text-text">
              Born in Beirut and based in New York, Haig Papazian works across sound,
              architecture, film, AI, narrative, and cultural infrastructure. The work
              treats culture as an interface and technology as material, method, and critique.
            </p>
          </div>

          <div>
            <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.24em] text-accent">
              Editorial Case Studies
            </p>
            <div className="space-y-3">
              {caseStudies.map((study, index) => (
                <article key={study.label} className="border border-white/10 bg-white/[0.025] p-3">
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
            className="flex items-center gap-2 bg-[#131518]/80 border border-white/10 text-white hover:bg-white/5 hover:border-white/20 px-5 py-4 font-mono text-[9px] uppercase tracking-[0.2em] transition-all"
          >
            Explore the Work
            <ArrowUpRight size={13} />
          </button>
        </div>

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

function EssaysPanel({ isMobileViewport }: { isMobileViewport: boolean }) {
  const [activeEssaySlug, setActiveEssaySlug] = React.useState(ESSAY_RECORDS[0].slug);
  const [mobileEssayView, setMobileEssayView] = React.useState<'index' | 'reader'>('index');
  const readerScrollRef = React.useRef<HTMLElement>(null);
  const activeEssay = ESSAY_RECORDS.find((essay) => essay.slug === activeEssaySlug) || ESSAY_RECORDS[0];
  const activeIndex = ESSAY_RECORDS.findIndex((essay) => essay.slug === activeEssay.slug);
  const selectEssay = (slug: string) => {
    setActiveEssaySlug(slug);
    if (isMobileViewport) setMobileEssayView('reader');
  };
  const stepEssay = (direction: -1 | 1) => {
    const nextEssay = ESSAY_RECORDS[(activeIndex + direction + ESSAY_RECORDS.length) % ESSAY_RECORDS.length];
    setActiveEssaySlug(nextEssay.slug);
    setMobileEssayView('reader');
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
      className="pointer-events-auto fixed bottom-0 left-0 right-0 top-[64px] z-[140] flex overflow-hidden border-t border-white/16 bg-black/86 shadow-2xl backdrop-blur-xl md:left-1/2 md:right-auto md:top-[74px] md:bottom-[108px] md:w-[min(720px,calc(100vw-32px))] md:-translate-x-1/2 md:z-[88] md:border md:border-white/16"
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
                  className={`mb-2 w-full border border-white/10 border-l-2 p-3 text-left transition-colors last:mb-0 md:mb-0 md:border-t-0 md:border-r-0 md:border-b md:border-l-2 ${
                    active
                      ? 'bg-accent/15 border-accent text-white'
                      : 'bg-white/[0.025] border-transparent text-white hover:bg-white/8'
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
            <p className="mt-5 max-w-xl text-base leading-snug text-white/78 md:text-lg">
              {activeEssay.dek}
            </p>
          </div>

          <div className="space-y-5">
            {activeEssay.body.map((paragraph) => (
              <p key={paragraph} className="max-w-[38rem] text-sm leading-relaxed text-text md:text-base">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-10 hidden grid-cols-2 border border-white/10 md:grid">
            <button
              type="button"
              onClick={() => stepEssay(-1)}
              className="border-r border-white/10 px-4 py-3 text-left font-mono text-[8px] uppercase tracking-[0.18em] text-text-muted transition-colors hover:bg-white/5 hover:text-white"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => stepEssay(1)}
              className="px-4 py-3 text-right font-mono text-[8px] uppercase tracking-[0.18em] text-text-muted transition-colors hover:bg-white/5 hover:text-white"
            >
              Next
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
        group min-h-[48px] min-w-0 border-r border-white/10 px-2 py-2 transition-colors last:border-r-0 lg:min-h-[64px] lg:w-[92px]
        ${disabled ? 'cursor-not-allowed text-white/18' : active ? 'bg-white/[0.04] text-white shadow-[inset_0_-2px_0_0_var(--color-accent)]' : 'text-text-muted hover:bg-white/5 hover:text-white'}
      `}
    >
      <span className="flex h-full flex-col items-center justify-center gap-1">
        <Icon size={15} />
        <span className="font-mono text-[8px] uppercase tracking-[0.16em] leading-none">
          {label}
        </span>
        <span className={`hidden max-w-full truncate font-mono text-[7px] uppercase tracking-[0.12em] leading-none lg:block ${active ? 'text-accent-2 font-medium' : 'text-white/32 group-hover:text-white/50'}`}>
          {description}
        </span>
      </span>
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
