/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig, useMotionValue } from 'motion/react';
import type Scene from './core/Scene';
import { AtlasNode, fetchAtlasNodes, getEmbeddedArchiveNodes } from './data/atlas';
import { useAudioEngine } from './audio/useAudioEngine';
import { type IndexFilters, DEFAULT_INDEX_FILTERS } from './components/IndexFilterBar';
import { getAdjacentRailIndex } from './core/railState';
import { canCarryProjectToMode, getMapFilterContext } from './core/archiveContext';
import StaticArchiveFallback from './components/StaticArchiveFallback';
import { MOTION_DURATION, MOTION_EASE, MOTION_SPRING } from './ui/motion';

const Overlay = React.lazy(() => import('./components/Overlay'));
const VideoLightbox = React.lazy(() => import('./components/VideoLightbox'));
const ArtifactInspector = React.lazy(() => import('./components/ArtifactInspector'));
const FirstVisitHint = React.lazy(() => import('./components/FirstVisitHint').then((module) => ({
  default: module.FirstVisitHint,
})));

type SceneMode = 'cylinder' | 'grid' | 'vertical' | 'horizontal' | 'map';
type AppMode = SceneMode | 'essays';
type PublicMode = 'cylinder' | 'grid' | 'vertical' | 'map' | 'essays';
type ProjectEntryMode = 'grid' | 'vertical' | 'map';
type FatalLoadError = {
  source: 'archive-data' | 'spatial-engine';
  message: string;
};

const PUBLIC_MODES: PublicMode[] = ['cylinder', 'vertical', 'grid', 'map', 'essays'];
const PROJECT_ENTRY_MODES: ProjectEntryMode[] = ['vertical', 'grid', 'map'];
const INTERACTIVE_TARGET_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  '[contenteditable="true"]',
  '[role="dialog"]',
  '[data-ui-layer="true"]',
].join(',');

const isInteractiveTarget = (target: EventTarget | null) => (
  target instanceof Element && Boolean(target.closest(INTERACTIVE_TARGET_SELECTOR))
);

const supportsWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!context) return false;

    const debugInfo = context.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = String(context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
      // Software WebGL makes this scene effectively unusable and can lock the
      // main thread for seconds. Use the complete semantic archive instead.
      if (/swiftshader|llvmpipe|software renderer/i.test(renderer)) return false;
    }

    return true;
  } catch {
    return false;
  }
};

const getModeFromPath = (path: string): AppMode => {
  if (path.startsWith('/works')) return 'vertical';
  if (path.startsWith('/index')) return 'grid';
  if (path.startsWith('/map')) return 'map';
  if (path.startsWith('/essays')) return 'essays';
  if (path.startsWith('/case-studies')) return 'horizontal';
  return 'cylinder';
};

const getPathFromMode = (mode: AppMode, node?: any): string => {
  if (mode === 'vertical') return '/works';
  if (mode === 'grid') return '/index';
  if (mode === 'map') return '/map';
  if (mode === 'essays') return '/essays';
  if (mode === 'horizontal' && node) return `/case-studies/${node.slug}`;
  return '/orbit';
};

export default function App() {
  const textOnlyRequested = new URLSearchParams(window.location.search).get('view') === 'text';
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const currentModeRef = useRef<AppMode>('cylinder');
  const returnModeRef = useRef<PublicMode>('cylinder');
  const activeNodeRef = useRef<any>(null);
  const { engine: audioEngine, isInitialized: audioReady, isMuted, toggleAudio, status: audioStatus, error: audioError } = useAudioEngine();
  const [activeNode, setActiveNode] = useState<any>(null);

  React.useEffect(() => {
    activeNodeRef.current = activeNode;
  }, [activeNode]);
  const [currentMode, setCurrentMode] = useState<AppMode>('cylinder');
  const [nodes, setNodes] = useState<AtlasNode[]>([]);
  const [centeredNode, setCenteredNode] = useState<any>(null);
  
  const progressValue = useMotionValue(0);
  const rawScrollValue = useMotionValue(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadError, setLoadError] = useState('');
  const [fatalLoadError, setFatalLoadError] = useState<FatalLoadError | null>(null);
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [railState, setRailState] = useState<any>(null);
  const [activeMedia, setActiveMedia] = useState<any>(null);
  const [returnMode, setReturnMode] = useState<PublicMode>('cylinder');
  const [domainFilter, setDomainFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [focusedMapNode, setFocusedMapNode] = useState<any>(null);
  const [inspectedRecord, setInspectedRecord] = useState<any>(null);
  const [indexFilters, setIndexFilters] = useState<IndexFilters>(DEFAULT_INDEX_FILTERS);
  const [contextNodeSlug, setContextNodeSlug] = useState<string | null>(null);
  const [guideReplayToken, setGuideReplayToken] = useState(0);
  const [projectedPositions, setProjectedPositions] = useState<Record<string, { x: number, y: number, w: number, h: number }>>({});
  const projectedPosRef = React.useRef<Record<string, { x: number, y: number, w: number, h: number }> | null>(null);
  const projPosRafRef = React.useRef<number>(0);
  const railTimeoutRef = React.useRef<any>(null);
  const restoreModePositionRef = React.useRef(false);

  const contextNode = React.useMemo(
    () => nodes.find((node) => node.slug === contextNodeSlug) || null,
    [contextNodeSlug, nodes],
  );

  React.useEffect(() => {
    return () => {
      if (railTimeoutRef.current) {
        clearTimeout(railTimeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (activeMedia) {
      const slug = activeMedia.projectId || activeMedia.slug;
      if (slug && sceneRef.current) {
        (sceneRef.current as any).nodeManager?.loadProjectTextures(slug);
      }
    }
  }, [activeMedia]);

  React.useEffect(() => {
    let title = 'Haig Papazian Archive';
    if (activeNode) {
      title = `${activeNode.title} — Haig Papazian Archive`;
    } else if (currentMode === 'map') {
      title = 'Constellation Map — Haig Papazian Archive';
    } else if (currentMode === 'grid') {
      title = 'Asset Index — Haig Papazian Archive';
    } else if (currentMode === 'cylinder') {
      title = 'Orbit — Haig Papazian Archive';
    } else if (currentMode === 'vertical') {
      title = 'Works — Haig Papazian Archive';
    } else if (currentMode === 'essays') {
      title = 'Essays — Haig Papazian Archive';
    }
    document.title = title;
  }, [activeNode, currentMode]);

  const getFlatAssets = () => {
    const flat: any[] = [];
    nodes.forEach((node) => {
      const gallery = node.gallery || [];
      if (gallery.length === 0) {
        flat.push({
          type: 'image',
          src: node.thumbnail || node.image,
          label: node.title,
          caption: node.summary || node.shortDescription || '',
          role: 'hero',
          layout: 'hero',
          projectId: node.slug,
          projectTitle: node.title,
          assetIndex: 0,
        });
      } else {
        gallery.forEach((slide, idx) => {
          flat.push({
            ...slide,
            assetIndex: idx,
            projectId: node.slug,
            projectTitle: node.title,
          });
        });
      }
    });
    return flat;
  };

  // Assets the Artifact Inspector may cycle through: in Index mode, respect
  // the active filters so prev/next never lands on a hidden record.
  const getInspectorAssets = () => {
    const flat = getFlatAssets();
    if (currentModeRef.current !== 'grid') return flat;

    const nodeBySlug = new Map<string, AtlasNode>(nodes.map((node) => [node.slug, node]));
    return flat.filter((asset) => {
      const node = nodeBySlug.get(asset.projectId);

      if (indexFilters.world !== 'all') {
        if (!node?.world || node.world.id !== indexFilters.world) return false;
      }

      if (indexFilters.medium !== 'all') {
        const domains = node?.domains || [];
        if (!domains.includes(indexFilters.medium) && node?.category !== indexFilters.medium) return false;
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
    });
  };

  const handlePrevMedia = () => {
    if (!activeMedia) return;
    const flat = getFlatAssets();
    if (flat.length === 0) return;
    
    const activeProjSlug = activeMedia.projectId || activeMedia.slug;
    const activeAssetIndex = activeMedia.assetIndex ?? 0;
    
    const currentIdx = flat.findIndex(
      (item) => (item.projectId === activeProjSlug && item.assetIndex === activeAssetIndex) ||
                (item.src === activeMedia.src)
    );
    
    const prevIdx = currentIdx === -1 ? 0 : (currentIdx - 1 + flat.length) % flat.length;
    const prevAsset = flat[prevIdx];
    
    setActiveMedia({
      ...activeMedia,
      assetIndex: prevAsset.assetIndex,
      type: prevAsset.type || 'image',
      label: prevAsset.label || prevAsset.projectTitle,
      caption: prevAsset.caption || '',
      chapter: prevAsset.chapter || 'Archive',
      role: prevAsset.role || 'evidence',
      src: prevAsset.src || prevAsset.poster || '',
      poster: prevAsset.poster,
      youtubeId: prevAsset.youtubeId,
      embedUrl: prevAsset.embedUrl,
      externalUrl: prevAsset.externalUrl,
      body: prevAsset.body,
      projectId: prevAsset.projectId,
    });
  };

  const handleNextMedia = () => {
    if (!activeMedia) return;
    const flat = getFlatAssets();
    if (flat.length === 0) return;
    
    const activeProjSlug = activeMedia.projectId || activeMedia.slug;
    const activeAssetIndex = activeMedia.assetIndex ?? 0;
    
    const currentIdx = flat.findIndex(
      (item) => (item.projectId === activeProjSlug && item.assetIndex === activeAssetIndex) ||
                (item.src === activeMedia.src)
    );
    
    const nextIdx = currentIdx === -1 ? 0 : (currentIdx + 1) % flat.length;
    const nextAsset = flat[nextIdx];
    
    setActiveMedia({
      ...activeMedia,
      assetIndex: nextAsset.assetIndex,
      type: nextAsset.type || 'image',
      label: nextAsset.label || nextAsset.projectTitle,
      caption: nextAsset.caption || '',
      chapter: nextAsset.chapter || 'Archive',
      role: nextAsset.role || 'evidence',
      src: nextAsset.src || nextAsset.poster || '',
      poster: nextAsset.poster,
      youtubeId: nextAsset.youtubeId,
      embedUrl: nextAsset.embedUrl,
      externalUrl: nextAsset.externalUrl,
      body: nextAsset.body,
      projectId: nextAsset.projectId,
    });
  };

  const canOpenProjectFromMode = (mode: AppMode): mode is ProjectEntryMode => {
    return PROJECT_ENTRY_MODES.includes(mode as ProjectEntryMode);
  };

  const getPublicMode = (mode: AppMode): PublicMode => {
    return mode === 'horizontal' ? returnModeRef.current : (mode as PublicMode);
  };

  const openProjectRail = (node: any, sourceMode = currentModeRef.current) => {
    setContextNodeSlug(node.slug || node.projectId || null);
    if (sourceMode === 'map') {
      setFocusedMapNode(node);
      sceneRef.current?.focusNode(node);
      audioEngine.onNodeClick(node);
      return;
    }
    const modeBeforeProject = sourceMode === 'horizontal' ? returnModeRef.current : sourceMode;
    if (modeBeforeProject !== 'cylinder' && !canOpenProjectFromMode(modeBeforeProject)) return;

    returnModeRef.current = modeBeforeProject;
    setReturnMode(modeBeforeProject);
    setActiveNode(node);
    setActiveMedia(null);
    setRailState(null);
    handleModeChange('horizontal', node);
    sceneRef.current?.focusNode(node);
    audioEngine.setMode('horizontal');
    audioEngine.onNodeClick(node);
    audioEngine.onProjectEnter(node.slug);
  };

  const retargetProjectRail = (node: any) => {
    setContextNodeSlug(node.slug || node.projectId || null);
    setActiveNode(node);
    setActiveMedia(null);
    setRailState(null);
    handleModeChange('horizontal', node);
    sceneRef.current?.focusNode(node);
  };


  // Client-Side Routing: initial load & popstate
  useEffect(() => {
    if (!isReady || nodes.length === 0) return;

    const handlePopState = () => {
      const path = window.location.pathname;
      const targetMode = getModeFromPath(path);
      
      if (targetMode === 'horizontal') {
        const slug = path.replace('/case-studies/', '');
        const node = nodes.find(n => n.slug === slug);
        if (node) {
          retargetProjectRail(node);
        } else {
          handleModeChange('cylinder');
        }
      } else {
        if (currentModeRef.current !== targetMode) {
          handleModeChange(targetMode);
        }
      }
    };

    // Only run on first ready or popstate
    window.addEventListener('popstate', handlePopState);
    
    // Initial sync
    const initialPath = window.location.pathname;
    if (initialPath !== '/' && initialPath !== '/orbit') {
      handlePopState();
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [isReady, nodes]);

  useEffect(() => {
    currentModeRef.current = currentMode;
  }, [currentMode]);

  useEffect(() => {
    returnModeRef.current = returnMode;
  }, [returnMode]);

  useEffect(() => {
    const slug = activeNode?.slug || activeNode?.projectId;
    if (slug) setContextNodeSlug(slug);
  }, [activeNode]);

  useEffect(() => {
    const slug = focusedMapNode?.slug || focusedMapNode?.projectId;
    if (slug) setContextNodeSlug(slug);
  }, [focusedMapNode]);

  useEffect(() => {
    const slug = inspectedRecord?.projectId || inspectedRecord?.slug;
    if (slug) setContextNodeSlug(slug);
  }, [inspectedRecord]);

  useEffect(() => {
    let isMounted = true;
    let preloadTimer: ReturnType<typeof globalThis.setTimeout> | null = null;
    let preloadIdleCallback: number | null = null;

    // Register project audio stems
    audioEngine.registerProjectStem('tebr', '/audio/stems/tebr.mp3');
    audioEngine.registerProjectStem('space-time-tuning-machine', '/audio/stems/space-time-tuning-machine.mp3');
    audioEngine.registerProjectStem('sometimes-i-wake-up-elsewhere', '/audio/stems/sometimes-i-wake-up-elsewhere.mp3');
    audioEngine.registerProjectStem('fictive-environments', '/audio/stems/fictive-environments.mp3');

    if ('requestIdleCallback' in window) {
      preloadIdleCallback = window.requestIdleCallback(() => audioEngine.preload(), { timeout: 2_500 });
    } else {
      preloadTimer = globalThis.setTimeout(() => audioEngine.preload(), 1_200);
    }

    fetchAtlasNodes()
      .then((atlasNodes) => {
        if (!isMounted) return;
        setFatalLoadError(null);
        setNodes(atlasNodes);
        setLoadProgress(0.12);
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error(error);
        setNodes(getEmbeddedArchiveNodes());
        setFatalLoadError({
          source: 'archive-data',
          message: 'Archive data could not be loaded. Showing the embedded project archive instead.',
        });
        setIsLoading(false);
        setIsReady(true);
      });

    return () => {
      isMounted = false;
      if (preloadIdleCallback !== null) window.cancelIdleCallback(preloadIdleCallback);
      if (preloadTimer !== null) globalThis.clearTimeout(preloadTimer);
    };
  }, [audioEngine]);

  useEffect(() => {
    if (audioStatus === 'idle') return;

    const alertDiv = document.getElementById('audio-announce-alert');
    if (!alertDiv) return;

    if (audioStatus === 'loading') {
      alertDiv.textContent = 'Initializing audio.';
    } else if (audioStatus === 'error') {
      alertDiv.textContent = audioError || 'Sound unavailable. Retry available.';
    } else {
      alertDiv.textContent = isMuted ? 'Audio playback muted.' : 'Audio playback unmuted.';
    }
  }, [audioError, audioStatus, isMuted]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.defaultPrevented
        || e.altKey
        || e.ctrlKey
        || e.metaKey
        || isInteractiveTarget(e.target)
        || isInteractiveTarget(document.activeElement)
      ) {
        return;
      }

      const activeElement = document.activeElement;
      const sceneOwnsKeyboard = activeElement === document.body
        || activeElement === containerRef.current
        || Boolean(activeElement && containerRef.current?.contains(activeElement));

      if (!sceneOwnsKeyboard) return;

      if (e.key.toLowerCase() === 'm') {
        void toggleAudio();
        return;
      }

      if (nodes.length === 0) return;

      if (activeMedia) {
        if (e.key === 'Escape') {
          setActiveMedia(null);
          sceneRef.current?.resetScroll();
        }
        return;
      }

      // ArtifactInspector handles its own Escape/arrow keys
      if (inspectedRecord) return;

      if (currentMode === 'horizontal' && railState) {
        const isForward = e.key === 'ArrowRight' || e.key === 'ArrowDown';
        const isBackward = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
        if (isForward || isBackward) {
          e.preventDefault();
          const direction: -1 | 1 = isForward ? 1 : -1;
          const nextIndex = getAdjacentRailIndex(railState.index, railState.total, direction);
          sceneRef.current?.goToRailSlide(nextIndex);
          audioEngine.onRailStep(direction);
        }
        if (e.key === 'Escape') {
          handleCloseNode();
          sceneRef.current?.resetScroll();
        }
        return;
      }

      if (currentMode === 'map' && focusedMapNode) {
        // Arrow keys walk the relation graph: forward enters the first
        // connection, backward enters the last one.
        const connections = focusedMapNode.connections || [];
        const isForward = e.key === 'ArrowRight' || e.key === 'ArrowDown';
        const isBackward = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
        if (connections.length > 0 && (isForward || isBackward)) {
          const targetSlug = isForward ? connections[0] : connections[connections.length - 1];
          const targetNode = nodes.find(n => n.slug === targetSlug);
          if (targetNode) {
            setFocusedMapNode(targetNode);
            sceneRef.current?.focusNode(targetNode);
          }
        }
        if (e.key === 'Escape') {
          handleCloseNode();
          sceneRef.current?.resetScroll();
        }
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setFocusedIndex(prev => {
          const next = (prev + 1) % nodes.length;
          sceneRef.current?.setFocusedNode(next);
          return next;
        });
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setFocusedIndex(prev => {
          const next = (prev - 1 + nodes.length) % nodes.length;
          sceneRef.current?.setFocusedNode(next);
          return next;
        });
      } else if (e.key === 'Enter') {
        if (focusedIndex >= 0) {
          const node = nodes[focusedIndex];
          openProjectRail(node, currentModeRef.current);
        }
      } else if (e.key === 'Escape') {
        handleCloseNode();
        sceneRef.current?.resetScroll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMedia, inspectedRecord, focusedIndex, nodes, currentMode, focusedMapNode, railState, audioEngine, toggleAudio]);

  // Initial deep link handling
  useEffect(() => {
    const handleHash = () => {
      const rawHash = window.location.hash;
      const hash = rawHash.includes('#') ? rawHash.split('#').filter(Boolean).pop() || '' : '';
      const caseStudySlug = window.location.pathname.match(/\/case-studies\/([^/]+)/)?.[1];
      if (!hash && !caseStudySlug) return;

      const params = new URLSearchParams(hash);
      const nodeId = params.get('node');
      const contextSlug = params.get('context');
      const requestedMode = params.get('mode') as PublicMode | null;
      const mode = requestedMode && PUBLIC_MODES.includes(requestedMode) ? requestedMode : null;
      const targetNodeId = nodeId || caseStudySlug;

      // Handle Index filters
      const world = params.get('world') || 'all';
      const medium = params.get('medium') || 'all';
      const type = params.get('type') || 'all';
      const sort = (params.get('sort') || 'project') as any;
      const view = (params.get('view') || 'hybrid') as any;
      setIndexFilters({ world, medium, assetType: type, sort, viewMode: view });

      if (contextSlug && nodes.some((node) => node.slug === contextSlug)) {
        setContextNodeSlug(contextSlug);
      }

      // Handle record inspection
      const recordSlug = params.get('record');
      const assetIndex = Number(params.get('asset') || '0');
      if (recordSlug) {
        const node = nodes.find(n => n.slug === recordSlug);
        if (node) {
          const gallery = node.gallery || [];
          const asset = gallery[assetIndex] || gallery.find((img: any) => img.isPrimary) || gallery[0];
          const record = asset ? {
            ...asset,
            projectId: node.slug,
            projectTitle: node.title,
            assetIndex: assetIndex,
          } : {
            type: 'image',
            src: node.thumbnail || node.image,
            label: node.title,
            caption: node.summary || node.shortDescription || '',
            role: 'hero',
            projectId: node.slug,
            projectTitle: node.title,
            assetIndex: 0,
          };
          setInspectedRecord(record);
        }
      } else {
        setInspectedRecord(null);
      }

      if (targetNodeId) {
        const node = nodes.find(n => String(n.id) === targetNodeId || n.slug === targetNodeId);
        if (node) {
          const sourceMode: ProjectEntryMode = mode && canOpenProjectFromMode(mode) ? mode : 'vertical';
          returnModeRef.current = sourceMode;
          setReturnMode(sourceMode);
          setActiveNode(node);
          setContextNodeSlug(node.slug);
          currentModeRef.current = 'horizontal';
          setCurrentMode('horizontal');
          audioEngine.setMode('horizontal');
          audioEngine.onProjectEnter(node.slug);
        }
        return;
      }

      if (mode) {
        currentModeRef.current = mode;
        setCurrentMode(mode);
        audioEngine.setMode(mode);
      }
    };

    window.addEventListener('hashchange', handleHash);
    
    // We wait for the scene to be ready before firing the initial hash
    if (isReady) {
      handleHash();
    }

    return () => window.removeEventListener('hashchange', handleHash);
  }, [isReady, nodes]);

  // Sync state to hash
  useEffect(() => {
    if (!isReady) return;
    
    const params = new URLSearchParams();
    const isCaseStudyPath = window.location.pathname.includes('/case-studies/');
    
    if (activeNode && !isCaseStudyPath) {
      params.set('node', String(activeNode.id));
    }

    if (contextNodeSlug && !activeNode) {
      params.set('context', contextNodeSlug);
    }
    
    // Mode is now authoritative in the pathname — no longer written to hash.
    // Hash mode param is still read for backward-compatible deep links.

    if (indexFilters) {
      if (indexFilters.world !== 'all') params.set('world', indexFilters.world);
      if (indexFilters.medium !== 'all') params.set('medium', indexFilters.medium);
      if (indexFilters.assetType !== 'all') params.set('type', indexFilters.assetType);
      if (indexFilters.sort !== 'project') params.set('sort', indexFilters.sort);
      if (indexFilters.viewMode !== 'hybrid') params.set('view', indexFilters.viewMode);
    }

    if (inspectedRecord) {
      params.set('record', inspectedRecord.projectId || inspectedRecord.slug);
      if (inspectedRecord.assetIndex) {
        params.set('asset', String(inspectedRecord.assetIndex));
      }
    }
    
    const newHash = params.toString();
    const baseUrl = `${window.location.pathname}${window.location.search}`;
    if (newHash) {
      window.history.replaceState(null, '', `${baseUrl}#${newHash}`);
    } else {
      window.history.replaceState(null, '', baseUrl);
    }
  }, [activeNode, contextNodeSlug, currentMode, isReady, indexFilters, inspectedRecord, returnMode]);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0 || fatalLoadError) return;
    if (textOnlyRequested) {
      setIsLoading(false);
      setIsReady(true);
      return;
    }
    if (!supportsWebGL()) {
      setFatalLoadError({
        source: 'spatial-engine',
        message: 'Unable to initialize the spatial engine. WebGL is unavailable in this browser.',
      });
      setIsLoading(false);
      setIsReady(true);
      currentModeRef.current = 'grid';
      setCurrentMode('grid');
      return;
    }

    // Fail-safe: if things are taking too long, force start after 10s
    const timer = setTimeout(() => {
      setIsLoading(current => {
        if (current) {
          console.warn('App: Loading timed out, forcing ready state');
          setIsReady(true);
          return false;
        }
        return current;
      });
    }, 10000);

    let scene: Scene | null = null;
    let cancelled = false;

    const initializeScene = async () => {
    try {
      // Give the semantic interface two paint opportunities before parsing and
      // constructing the spatial engine. This keeps the primary controls
      // responsive on slower devices without delaying the actual archive data.
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (cancelled) return;
      const { default: SceneClass } = await import('./core/Scene');
      if (cancelled) return;
      // Initialize the spatial archive field
      scene = new SceneClass(containerRef.current!, nodes, {
        onNodeClick: (node) => {
          openProjectRail(node, currentModeRef.current);
        },
        onCloseNode: () => {
          // Clicking empty space in Map mode dismisses the focused node
          setFocusedMapNode(null);
          sceneRef.current?.resetFocus();
        },
        onNodeHover: (node, pos) => {
          setHoveredNode(node);
          setMousePosition(pos);
          audioEngine.onNodeHover(node ? { slug: node.slug, domains: node.domains || [], tier: node.tier, isNoDataZone: node.isNoDataZone } : null);
          if (node) {
            const idx = nodes.findIndex(n => n.id === node.id);
            if (idx !== -1) setFocusedIndex(idx);
          }
        },
        onProgress: (p) => progressValue.set(p),
        onRawScroll: (s) => rawScrollValue.set(s),
        onRailChange: (state) => {
          setRailState(state);
          if (state) {
            setHoveredNode((current: any) => {
              const isStaleRailHover = current?.projectId === state.projectId
                && typeof current?.assetIndex === 'number'
                && current.assetIndex !== state.index;
              return isStaleRailHover ? null : current;
            });
          }
        },
        onMediaOpen: (media: any) => {
          // In grid mode, open Artifact Inspector instead of VideoLightbox
          if (currentModeRef.current === 'grid') {
            setInspectedRecord(media);
          } else {
            setActiveMedia(media);
          }
        },
        canUseSceneClicks: () => currentModeRef.current !== 'cylinder' && currentModeRef.current !== 'essays',
        onLoadProgress: (p) => setLoadProgress(0.12 + p * 0.88),
        onLoadComplete: () => {
          console.log('App: onLoadComplete triggered');
          setIsLoading(false);
          setIsReady(true);
          if (sceneRef.current) {
            const spatialInfo = sceneRef.current.getAtlasNodesSpatialInfo();
            audioEngine.setAtlasNodes(spatialInfo);
            if (activeNodeRef.current) {
              audioEngine.onProjectEnter(activeNodeRef.current.slug);
            }
          }
        },
        onCenteredNodeChange: (node) => setCenteredNode(node),
        onAudioUpdate: (velocity, cameraPos) => {
          audioEngine.setScrollVelocity(velocity);
          audioEngine.setCameraPosition(cameraPos.x, cameraPos.y, cameraPos.z);
        },
        onUpdateProjectedPositions: (positions: any) => {
          // Debounce: batch position updates to at most one React render per frame
          projectedPosRef.current = positions;
          if (!projPosRafRef.current) {
            projPosRafRef.current = requestAnimationFrame(() => {
              if (projectedPosRef.current) {
                setProjectedPositions(projectedPosRef.current);
              }
              projPosRafRef.current = 0;
            });
          }
        },
        onContextLost: () => {
          setLoadError('WebGL Error: Connection lost. Attempting to restore...');
        },
        onContextRestored: () => {
          setLoadError('');
        },
      });
      sceneRef.current = scene;
    } catch (e) {
      console.error('Failed to initialize Scene:', e);
      setFatalLoadError({
        source: 'spatial-engine',
        message: 'Unable to initialize the spatial engine. Your browser may not support WebGL.',
      });
      setIsLoading(false);
      setIsReady(true);
      
      // Force safe fallback mode
      currentModeRef.current = 'grid';
      setCurrentMode('grid');
    }
    };

    void initializeScene();

    return () => {
      cancelled = true;
      if (scene) scene.dispose();
      clearTimeout(timer);
    };
  }, [fatalLoadError, nodes, textOnlyRequested]);

  const handleModeChange = (mode: AppMode, targetNode?: any) => {
    if (railTimeoutRef.current) {
      clearTimeout(railTimeoutRef.current);
      railTimeoutRef.current = null;
    }
    if (mode === 'horizontal' && !activeNode && !targetNode) return;

    const sourceMode = currentModeRef.current;
    const carriedSlug = targetNode?.slug
      || activeNodeRef.current?.slug
      || focusedMapNode?.slug
      || inspectedRecord?.projectId
      || (sourceMode === 'vertical' ? centeredNode?.slug : null)
      || contextNodeSlug;
    if (carriedSlug) setContextNodeSlug(carriedSlug);

    restoreModePositionRef.current = sourceMode === 'horizontal' && mode !== 'horizontal';
    
    const nodeToUse = targetNode || activeNode;
    const newPath = getPathFromMode(mode, nodeToUse);
    if (window.location.pathname !== newPath) {
      // Use pushState only for deep-link destinations (case studies);
      // use replaceState for mode navigation to prevent Back-button spam.
      if (mode === 'horizontal') {
        window.history.pushState(null, '', newPath);
      } else {
        window.history.replaceState(null, '', newPath);
      }
    }

    if (mode === 'horizontal') {
      const publicSourceMode = getPublicMode(sourceMode);
      if (canOpenProjectFromMode(publicSourceMode)) {
        returnModeRef.current = publicSourceMode;
        setReturnMode(publicSourceMode);
      }
    }
    if (mode !== 'horizontal') {
      setRailState(null);
      setActiveMedia(null);
      setFocusedMapNode(null);
      returnModeRef.current = mode;
      setReturnMode(mode);
      setCenteredNode(null);

      if (sourceMode === 'horizontal') {
        setActiveNode(null);
        sceneRef.current?.resetFocus();
      }
    }
    currentModeRef.current = mode;
    setCurrentMode(mode);
    audioEngine.setMode(mode);
    if (mode === 'map' && sceneRef.current) {
      audioEngine.setAtlasNodes(sceneRef.current.getAtlasNodesSpatialInfo());
    }
  };

  const handleCloseNode = () => {
    setActiveMedia(null);
    setActiveNode(null);
    setRailState(null);
    setFocusedMapNode(null);
    if (currentMode === 'horizontal') {
      handleModeChange(returnMode);
    }
    sceneRef.current?.resetFocus();
    audioEngine.onProjectExit();
  };

  const handleBackToWorks = () => {
    setActiveMedia(null);
    setActiveNode(null);
    setRailState(null);
    setFocusedMapNode(null);
    returnModeRef.current = 'vertical';
    setReturnMode('vertical');
    handleModeChange('vertical');
    sceneRef.current?.resetFocus();
    audioEngine.onProjectExit();
  };

  const handleRailStep = (direction: -1 | 1) => {
    if (!railState) return;
    const nextIndex = getAdjacentRailIndex(railState.index, railState.total, direction);
    sceneRef.current?.goToRailSlide(nextIndex);
    audioEngine.onRailStep(direction);
  };

  const handleSelectSlug = (slug: string) => {
    const node = nodes.find((entry) => entry.slug === slug);
    if (!node) return;

    if (currentModeRef.current === 'horizontal') {
      retargetProjectRail(node);
      return;
    }

    openProjectRail(node, currentModeRef.current);
  };

  useEffect(() => {
    if (!isReady || !sceneRef.current) return;
    const publicMode = currentMode === 'horizontal' ? returnMode : currentMode;
    const sceneMode = currentMode === 'essays' ? 'cylinder' : currentMode;
    const restored = sceneRef.current.switchMode(sceneMode, {
      restorePosition: restoreModePositionRef.current,
    });
    restoreModePositionRef.current = false;

    if (
      !restored
      && currentMode !== 'horizontal'
      && contextNode
      && canCarryProjectToMode(contextNode.slug, publicMode as PublicMode)
    ) {
      sceneRef.current.focusNode(contextNode);
      const contextIndex = nodes.findIndex((node) => node.slug === contextNode.slug);
      if (contextIndex >= 0 && currentMode !== 'map') {
        sceneRef.current.setFocusedNode(contextIndex);
      }
    }
  }, [contextNode, currentMode, isReady, nodes, returnMode]);

  useEffect(() => {
    if (!isReady || currentMode !== 'horizontal' || !activeNode) return;
    sceneRef.current?.focusNode(activeNode);
  }, [activeNode, currentMode, isReady]);

  useEffect(() => {
    sceneRef.current?.setSearchQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (currentMode === 'map') {
      const mapFilters = getMapFilterContext(indexFilters);
      sceneRef.current?.setFilters(mapFilters.domain, mapFilters.type, mapFilters.world);
      return;
    }
    sceneRef.current?.setFilters(domainFilter, typeFilter, 'all');
  }, [currentMode, domainFilter, indexFilters, typeFilter]);

  useEffect(() => {
    sceneRef.current?.setIndexFilters(indexFilters);
  }, [indexFilters]);

  const hasFatalLoadError = fatalLoadError !== null;
  const showStaticArchive = hasFatalLoadError || textOnlyRequested;

  return (
    <MotionConfig reducedMotion="user">
    <main id="archive-main" className="archive-readable relative w-full h-full overflow-hidden bg-black selection:bg-accent selection:text-white font-body text-text">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION_DURATION.slow, ease: MOTION_EASE }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center pointer-events-none"
            role="progressbar"
            aria-valuenow={Math.round(loadProgress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Loading archive"
          >
            <div className="w-64 h-[1px] bg-ui-bg-hover relative overflow-hidden mb-4">
              <motion.div
                className="absolute inset-y-0 left-0 bg-accent"
                animate={{ width: `${loadProgress * 100}%` }}
                transition={MOTION_SPRING.settle}
              />
            </div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-accent uppercase">
              {`Drawing Archive Field ${Math.round(loadProgress * 100)}%`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {loadError && !hasFatalLoadError && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] pointer-events-none">
          <div className="bg-red-500/10 backdrop-blur-md border border-red-500/30 px-4 py-2 rounded shadow-2xl flex items-center gap-3">
            <span className="font-mono text-[9px] text-red-400 tracking-wider uppercase">{loadError}</span>
          </div>
        </div>
      )}

      {showStaticArchive && (
        <StaticArchiveFallback
          error={fatalLoadError?.message || 'Text-only archive view requested.'}
          nodes={nodes}
          onRetry={() => {
            if (!textOnlyRequested) {
              window.location.reload();
              return;
            }
            const url = new URL(window.location.href);
            url.searchParams.delete('view');
            window.location.assign(url.toString());
          }}
        />
      )}

      {!showStaticArchive && (
        <a
          className="skip-link pointer-events-auto"
          href="#archive-view-controls"
          onClick={(event) => {
            event.preventDefault();
            const target = document.getElementById('archive-view-controls');
            target?.querySelector<HTMLElement>('button:not([disabled])')?.focus({ preventScroll: true });
            target?.scrollIntoView({ block: 'nearest' });
          }}
        >
          Skip to archive navigation
        </a>
      )}

      {/* 3D Canvas Container */}
      <div 
        ref={containerRef} 
        id="canvas-container" 
        className={`fixed inset-0 w-full h-full touch-none transition-[background] duration-500 focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent ${
          currentMode === 'map' ? 'map-backdrop-active' : ''
        }`}
        tabIndex={0}
        data-scene-surface="true"
        onPointerDown={(event) => {
          const target = event.target as HTMLElement;
          if (target === event.currentTarget || target.tagName === 'CANVAS') {
            event.currentTarget.focus({ preventScroll: true });
          }
        }}
        role="application"
        aria-label="3D spatial archive"
        inert={activeMedia || inspectedRecord || showStaticArchive ? true : undefined}
      />

      {/* UI Overlay Layer */}
      {!showStaticArchive && (
      <React.Suspense fallback={null}>
      <Overlay 
        inert={activeMedia || inspectedRecord || showStaticArchive ? true : undefined}
        hasLoadError={!!loadError}
        nodes={nodes}
        activeNode={activeNode}
        contextNode={contextNode}
        centeredNode={centeredNode}
        railState={railState}
        currentMode={currentMode}
        returnMode={returnMode}
        progress={progressValue}
        rawScroll={rawScrollValue}
        onInspectRecord={setInspectedRecord}
        hoveredNode={hoveredNode}
        mousePosition={mousePosition}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onModeChange={handleModeChange}
        onReplayGuide={() => setGuideReplayToken((token) => token + 1)}
        onBrowseNode={(node) => {
          handleModeChange('vertical');
          setContextNodeSlug(node.slug);
        }}
        onOpenHomeProject={(node) => openProjectRail(node, 'cylinder')}
        onRailStep={handleRailStep}
        onSelectSlug={handleSelectSlug}
        onNodeClick={(node) => openProjectRail(node, currentModeRef.current)}
        onCloseNode={handleCloseNode}
        onBackToWorks={handleBackToWorks}
        onOpenMedia={setActiveMedia}
        onGoToRailSlide={(idx) => sceneRef.current?.goToRailSlide(idx)}
        audioReady={audioReady}
        audioStatus={audioStatus}
        audioError={audioError}
        isMuted={isMuted}
        onToggleAudio={toggleAudio}
        domainFilter={domainFilter}
        onDomainFilterChange={setDomainFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        focusedMapNode={focusedMapNode}
        onOpenProjectRail={(node) => {
          if (currentModeRef.current === 'map') {
            currentModeRef.current = 'vertical';
            setCurrentMode('vertical');
            sceneRef.current?.switchMode('vertical');
            sceneRef.current?.focusNode(node);
            audioEngine.setMode('vertical');
            setFocusedMapNode(null);
            if (railTimeoutRef.current) clearTimeout(railTimeoutRef.current);
            railTimeoutRef.current = setTimeout(() => {
              openProjectRail(node, 'vertical');
              railTimeoutRef.current = null;
            }, 1500);
          } else {
            openProjectRail(node, 'vertical');
          }
        }}
        onFocusNodeBySlug={(slug) => sceneRef.current?.focusNodeBySlug(slug)}
        onEssayChange={(slug) => {
          const getEssayRelatedSlug = (essaySlug: string): string => {
            if (essaySlug === 'systems-of-meaning') return 'systems-choreography';
            if (essaySlug === 'cost-of-being-queer-and-arab') return 'mashrou-leila';
            return essaySlug;
          };
          const relatedSlug = getEssayRelatedSlug(slug);
          const nodeIndex = nodes.findIndex(n => n.slug === relatedSlug);
          if (nodeIndex >= 0) {
            setContextNodeSlug(relatedSlug);
            sceneRef.current?.setFocusedNode(nodeIndex);
          }
        }}
        onInspectNode={(node) => {
          // Create a record from the node's primary image for the inspector
          const gallery = node.gallery || [];
          const heroImage = gallery.find((img: any) => img.isPrimary) || gallery[0];
          const record = heroImage ? {
            ...heroImage,
            projectId: node.slug,
            projectTitle: node.title,
            assetIndex: 0,
          } : {
            type: 'image',
            src: node.thumbnail || node.image,
            label: node.title,
            caption: node.summary || node.shortDescription || '',
            role: 'hero',
            projectId: node.slug,
            projectTitle: node.title,
            assetIndex: 0,
          };
          setInspectedRecord(record);
        }}
        indexFilters={indexFilters}
        onIndexFiltersChange={setIndexFilters}
        onHoverFilter={(category, value) => {
          sceneRef.current?.setHoveredFilter(category, value);
        }}
        projectedPositions={projectedPositions}
      />
      </React.Suspense>
      )}

      {activeMedia && (
      <React.Suspense fallback={null}>
      <VideoLightbox
        media={activeMedia} 
        onClose={() => setActiveMedia(null)} 
        onPrev={handlePrevMedia}
        onNext={handleNextMedia}
        onEnterProject={(slug) => {
          const node = nodes.find(n => n.slug === slug);
          if (node) {
            openProjectRail(node, returnMode);
          }
        }}
      />
      </React.Suspense>
      )}

      {inspectedRecord && (
      <React.Suspense fallback={null}>
      <ArtifactInspector
        record={inspectedRecord}
        parentNode={inspectedRecord ? nodes.find(n => n.slug === (inspectedRecord.projectId || inspectedRecord.slug)) : null}
        onClose={() => setInspectedRecord(null)}
        onOpenRail={(slug) => {
          setInspectedRecord(null);
          const node = nodes.find(n => n.slug === slug);
          if (node) openProjectRail(node, 'grid');
        }}
        onShowInMaps={(slug) => {
          setInspectedRecord(null);
          const node = nodes.find(n => n.slug === slug);
          if (node) {
            setContextNodeSlug(node.slug);
            handleModeChange('map' as AppMode);
            setFocusedMapNode(node);
            sceneRef.current?.focusNode(node);
          }
        }}
        onPlayMedia={(media) => {
          setInspectedRecord(null);
          setActiveMedia(media);
        }}
        onPrev={() => {
          if (!inspectedRecord) return;
          const flat = getInspectorAssets();
          if (flat.length === 0) return;
          const activeProjSlug = inspectedRecord.projectId || inspectedRecord.slug;
          const activeAssetIndex = inspectedRecord.assetIndex ?? 0;
          const currentIdx = flat.findIndex(
            (item: any) => (item.projectId === activeProjSlug && item.assetIndex === activeAssetIndex) ||
                      (item.src === inspectedRecord.src)
          );
          const prevIdx = currentIdx === -1 ? 0 : (currentIdx - 1 + flat.length) % flat.length;
          setInspectedRecord(flat[prevIdx]);
        }}
        onNext={() => {
          if (!inspectedRecord) return;
          const flat = getInspectorAssets();
          if (flat.length === 0) return;
          const activeProjSlug = inspectedRecord.projectId || inspectedRecord.slug;
          const activeAssetIndex = inspectedRecord.assetIndex ?? 0;
          const currentIdx = flat.findIndex(
            (item: any) => (item.projectId === activeProjSlug && item.assetIndex === activeAssetIndex) ||
                      (item.src === inspectedRecord.src)
          );
          const nextIdx = currentIdx === -1 ? 0 : (currentIdx + 1) % flat.length;
          setInspectedRecord(flat[nextIdx]);
        }}
      />
      </React.Suspense>
      )}

      <div id="audio-announce-alert" className="sr-only" aria-live="assertive" />
      {isReady && !showStaticArchive && (
      <React.Suspense fallback={null}>
      <FirstVisitHint
        isReady={isReady}
        currentMode={currentMode}
        autoOpen={window.location.pathname === '/' || window.location.pathname === '/orbit'}
        replayToken={guideReplayToken}
        onExploreWorks={() => handleModeChange('vertical')}
      />
      </React.Suspense>
      )}
    </main>
    </MotionConfig>
  );
}
