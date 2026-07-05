/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'motion/react';
import Scene from './core/Scene';
import Overlay from './components/Overlay';
import VideoLightbox from './components/VideoLightbox';
import ArtifactInspector from './components/ArtifactInspector';
import { AtlasNode, fetchAtlasNodes } from './data/atlas';
import { useAudioEngine } from './audio/useAudioEngine';
import { PROJECT_GALLERIES } from './data/projectGalleries';
import { type IndexFilters, DEFAULT_INDEX_FILTERS } from './components/IndexFilterBar';

type SceneMode = 'cylinder' | 'grid' | 'vertical' | 'horizontal' | 'map';
type AppMode = SceneMode | 'essays';
type PublicMode = 'cylinder' | 'grid' | 'vertical' | 'map' | 'essays';
type ProjectEntryMode = 'grid' | 'vertical' | 'map';

const PUBLIC_MODES: PublicMode[] = ['cylinder', 'vertical', 'grid', 'map', 'essays'];
const PROJECT_ENTRY_MODES: ProjectEntryMode[] = ['vertical', 'grid', 'map'];

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const currentModeRef = useRef<AppMode>('cylinder');
  const returnModeRef = useRef<PublicMode>('cylinder');
  const { engine: audioEngine, isInitialized: audioReady, isMuted, toggleAudio } = useAudioEngine();
  const [activeNode, setActiveNode] = useState<any>(null);
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
  const [projectedPositions, setProjectedPositions] = useState<Record<string, { x: number, y: number, w: number, h: number }>>({});

  React.useEffect(() => {
    if (activeMedia) {
      const slug = activeMedia.projectId || activeMedia.slug;
      if (slug && sceneRef.current) {
        (sceneRef.current as any).nodeManager?.loadProjectTextures(slug);
      }
    }
  }, [activeMedia]);

  const getFlatAssets = () => {
    const flat: any[] = [];
    nodes.forEach((node) => {
      const gallery = PROJECT_GALLERIES[node.slug] || [];
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
    if (sourceMode === 'map') {
      setFocusedMapNode(node);
      sceneRef.current?.focusNode(node);
      audioEngine.onNodeClick(node);
      return;
    }
    const modeBeforeProject = sourceMode === 'horizontal' ? returnModeRef.current : sourceMode;
    if (!canOpenProjectFromMode(modeBeforeProject)) return;

    returnModeRef.current = modeBeforeProject;
    setReturnMode(modeBeforeProject);
    setActiveNode(node);
    setActiveMedia(null);
    setRailState(null);
    currentModeRef.current = 'horizontal';
    setCurrentMode('horizontal');
    sceneRef.current?.switchMode('horizontal');
    sceneRef.current?.focusNode(node);
    audioEngine.setMode('horizontal');
    audioEngine.onNodeClick(node);
    audioEngine.onProjectEnter(node.slug);
  };

  const retargetProjectRail = (node: any) => {
    setActiveNode(node);
    setActiveMedia(null);
    setRailState(null);
    currentModeRef.current = 'horizontal';
    setCurrentMode('horizontal');
    sceneRef.current?.switchMode('horizontal');
    sceneRef.current?.focusNode(node);
  };

  useEffect(() => {
    currentModeRef.current = currentMode;
  }, [currentMode]);

  useEffect(() => {
    returnModeRef.current = returnMode;
  }, [returnMode]);

  useEffect(() => {
    let isMounted = true;

    // Register project audio stems
    audioEngine.registerProjectStem('tebr', '/audio/stems/tebr.mp3');
    audioEngine.registerProjectStem('space-time-tuning-machine', '/audio/stems/space-time-tuning-machine.mp3');
    audioEngine.registerProjectStem('sometimes-i-wake-up-elsewhere', '/audio/stems/sometimes-i-wake-up-elsewhere.mp3');
    audioEngine.registerProjectStem('fictive-environments', '/audio/stems/fictive-environments.mp3');

    fetchAtlasNodes()
      .then((atlasNodes) => {
        if (!isMounted) return;
        setNodes(atlasNodes);
        setLoadProgress(0.12);
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error(error);
        setLoadError('Archive data could not be loaded.');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't navigate if user is typing in search
      if (document.activeElement?.tagName === 'INPUT') {
        if (e.key === 'Escape') {
          (document.activeElement as HTMLElement).blur();
        }
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
  }, [activeMedia, inspectedRecord, focusedIndex, nodes, currentMode, focusedMapNode]);

  // Initial deep link handling
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      const caseStudySlug = window.location.pathname.match(/\/case-studies\/([^/]+)/)?.[1];
      if (!hash && !caseStudySlug) return;

      const params = new URLSearchParams(hash);
      const nodeId = params.get('node');
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
          currentModeRef.current = 'horizontal';
          setCurrentMode('horizontal');
          sceneRef.current?.switchMode('horizontal');
          sceneRef.current?.focusNode(node);
          audioEngine.setMode('horizontal');
          audioEngine.onProjectEnter(node.slug);
        }
        return;
      }

      if (mode) {
        currentModeRef.current = mode;
        setCurrentMode(mode);
        sceneRef.current?.switchMode(mode === 'essays' ? 'cylinder' : mode);
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
    
    const publicModeForHash = currentMode === 'horizontal' ? returnMode : getPublicMode(currentMode);
    if (publicModeForHash !== 'cylinder') {
      params.set('mode', publicModeForHash);
    }

    if (currentMode === 'grid' && indexFilters) {
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
    if (newHash) {
      window.history.replaceState(null, '', `#${newHash}`);
    } else if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [activeNode, currentMode, isReady, indexFilters, inspectedRecord, returnMode]);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

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
    
    try {
      // Initialize the spatial archive field
      scene = new Scene(containerRef.current, nodes, {
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
        onRailChange: (state) => setRailState(state),
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
          }
        },
        onCenteredNodeChange: (node) => setCenteredNode(node),
        onAudioUpdate: (velocity, cameraPos) => {
          audioEngine.setScrollVelocity(velocity);
          audioEngine.setCameraPosition(cameraPos.x, cameraPos.y, cameraPos.z);
        },
        onUpdateProjectedPositions: (positions: any) => {
          setProjectedPositions(positions);
        },
      });
      sceneRef.current = scene;
    } catch (e) {
      console.error('Failed to initialize Scene:', e);
      setLoadError('Unable to initialize the spatial engine. Your browser may not support WebGL.');
      setIsLoading(false);
      setIsReady(false);
    }

    return () => {
      if (scene) scene.dispose();
      clearTimeout(timer);
    };
  }, [nodes]);

  const handleModeChange = (mode: AppMode) => {
    if (mode === 'horizontal' && !activeNode) return;
    if (mode === 'horizontal') {
      const sourceMode = getPublicMode(currentMode);
      if (canOpenProjectFromMode(sourceMode)) {
        returnModeRef.current = sourceMode;
        setReturnMode(sourceMode);
      }
    }
    if (mode !== 'horizontal') {
      setRailState(null);
      setActiveMedia(null);
      setFocusedMapNode(null);
      returnModeRef.current = mode;
      setReturnMode(mode);
      setCenteredNode(null);

      if (currentMode === 'horizontal') {
        setActiveNode(null);
        sceneRef.current?.resetFocus();
      }
    }
    currentModeRef.current = mode;
    setCurrentMode(mode);
    sceneRef.current?.switchMode(mode === 'essays' ? 'cylinder' : mode);
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
      currentModeRef.current = returnMode;
      setCurrentMode(returnMode);
      sceneRef.current?.switchMode(returnMode);
      audioEngine.setMode(returnMode);
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
    currentModeRef.current = 'vertical';
    setCurrentMode('vertical');
    sceneRef.current?.switchMode('vertical');
    sceneRef.current?.resetFocus();
    audioEngine.setMode('vertical');
    audioEngine.onProjectExit();
  };

  const handleRailStep = (direction: -1 | 1) => {
    if (!railState) return;
    const nextIndex = (railState.index + direction + railState.total) % railState.total;
    sceneRef.current?.goToRailSlide(nextIndex);
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
    sceneRef.current.switchMode(currentMode === 'essays' ? 'cylinder' : currentMode);
    if (activeNode) {
      sceneRef.current.focusNode(activeNode);
    }
  }, [currentMode, activeNode, isReady]);

  useEffect(() => {
    sceneRef.current?.setSearchQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    sceneRef.current?.setFilters(domainFilter, typeFilter);
  }, [domainFilter, typeFilter]);

  useEffect(() => {
    sceneRef.current?.setIndexFilters(indexFilters);
  }, [indexFilters]);

  return (
    <main className="relative w-full h-full overflow-hidden bg-black selection:bg-accent selection:text-white font-body text-text">
      <AnimatePresence>
        {(isLoading || loadError) && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center pointer-events-none"
            role={loadError ? 'alert' : 'progressbar'}
            aria-valuenow={loadError ? undefined : Math.round(loadProgress * 100)}
            aria-valuemin={loadError ? undefined : 0}
            aria-valuemax={loadError ? undefined : 100}
            aria-label={loadError ? 'Archive failed to load' : 'Loading archive'}
          >
            {!loadError && (
              <div className="w-64 h-[1px] bg-white/10 relative overflow-hidden mb-4">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-accent"
                  animate={{ width: `${loadProgress * 100}%` }}
                  transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                />
              </div>
            )}
            <p className="font-mono text-[10px] tracking-[0.3em] text-accent uppercase">
              {loadError || `Drawing Archive Field ${Math.round(loadProgress * 100)}%`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Canvas Container */}
      <div 
        ref={containerRef} 
        id="canvas-container" 
        className={`fixed inset-0 w-full h-full touch-none transition-[background] duration-500 ${
          currentMode === 'map' ? 'map-backdrop-active' : ''
        }`}
        role="application"
        aria-label="3D spatial archive"
        inert={activeMedia || inspectedRecord ? true : undefined}
      />

      {/* UI Overlay Layer */}
      <Overlay 
        inert={activeMedia || inspectedRecord ? true : undefined}
        nodes={nodes}
        activeNode={activeNode}
        centeredNode={centeredNode}
        railState={railState}
        currentMode={currentMode}
        returnMode={returnMode}
        progress={progressValue}
        rawScroll={rawScrollValue}
        hoveredNode={hoveredNode}
        mousePosition={mousePosition}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onModeChange={handleModeChange}
        onRailStep={handleRailStep}
        onSelectSlug={handleSelectSlug}
        onNodeClick={(node) => openProjectRail(node, currentModeRef.current)}
        onCloseNode={handleCloseNode}
        onBackToWorks={handleBackToWorks}
        onOpenMedia={setActiveMedia}
        onGoToRailSlide={(idx) => sceneRef.current?.goToRailSlide(idx)}
        audioReady={audioReady}
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
            setTimeout(() => {
              openProjectRail(node, 'vertical');
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
    </main>
  );
}
