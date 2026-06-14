/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'motion/react';
import Scene from './core/Scene';
import Overlay from './components/Overlay';
import VideoLightbox from './components/VideoLightbox';
import { AtlasNode, fetchAtlasNodes } from './data/atlas';

type SceneMode = 'cylinder' | 'grid' | 'vertical' | 'horizontal' | 'atlas';
type AppMode = SceneMode | 'essays';
type PublicMode = 'cylinder' | 'grid' | 'vertical' | 'atlas' | 'essays';
type ProjectEntryMode = 'grid' | 'vertical' | 'atlas';

const PUBLIC_MODES: PublicMode[] = ['cylinder', 'vertical', 'grid', 'atlas', 'essays'];
const PROJECT_ENTRY_MODES: ProjectEntryMode[] = ['vertical', 'grid', 'atlas'];

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const currentModeRef = useRef<AppMode>('cylinder');
  const returnModeRef = useRef<PublicMode>('cylinder');
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

  const canOpenProjectFromMode = (mode: AppMode): mode is ProjectEntryMode => {
    return PROJECT_ENTRY_MODES.includes(mode as ProjectEntryMode);
  };

  const getPublicMode = (mode: AppMode): PublicMode => {
    return mode === 'horizontal' ? returnModeRef.current : (mode as PublicMode);
  };

  const openProjectRail = (node: any, sourceMode = currentModeRef.current) => {
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
        if (e.key === 'Escape') setActiveMedia(null);
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMedia, focusedIndex, nodes]);

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
        }
        return;
      }

      if (mode) {
        currentModeRef.current = mode;
        setCurrentMode(mode);
        sceneRef.current?.switchMode(mode === 'essays' ? 'cylinder' : mode);
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
    if (activeNode && !isCaseStudyPath) params.set('node', activeNode.id);
    const publicModeForHash = currentMode === 'horizontal' ? returnMode : getPublicMode(currentMode);
    if (publicModeForHash !== 'cylinder') params.set('mode', publicModeForHash);
    
    const newHash = params.toString();
    if (newHash) {
      window.history.replaceState(null, '', `#${newHash}`);
    } else if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [activeNode, currentMode, isReady]);

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
        onNodeHover: (node, pos) => {
          setHoveredNode(node);
          setMousePosition(pos);
          if (node) {
            const idx = nodes.findIndex(n => n.id === node.id);
            if (idx !== -1) setFocusedIndex(idx);
          }
        },
        onProgress: (p) => progressValue.set(p),
        onRawScroll: (s) => rawScrollValue.set(s),
        onRailChange: (state) => setRailState(state),
        onMediaOpen: (media) => setActiveMedia(media),
        canUseSceneClicks: () => currentModeRef.current !== 'cylinder' && currentModeRef.current !== 'essays',
        onLoadProgress: (p) => setLoadProgress(0.12 + p * 0.88),
        onLoadComplete: () => {
          console.log('App: onLoadComplete triggered');
          setIsLoading(false);
          setIsReady(true);
        },
        onCenteredNodeChange: (node) => setCenteredNode(node),
      });
      sceneRef.current = scene;
    } catch (e) {
      console.error('Failed to initialize Scene:', e);
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
  };

  const handleCloseNode = () => {
    setActiveMedia(null);
    setActiveNode(null);
    setRailState(null);
    if (currentMode === 'horizontal') {
      currentModeRef.current = returnMode;
      setCurrentMode(returnMode);
      sceneRef.current?.switchMode(returnMode);
    }
    sceneRef.current?.resetFocus();
  };

  const handleBackToWorks = () => {
    setActiveMedia(null);
    setActiveNode(null);
    setRailState(null);
    returnModeRef.current = 'vertical';
    setReturnMode('vertical');
    currentModeRef.current = 'vertical';
    setCurrentMode('vertical');
    sceneRef.current?.switchMode('vertical');
    sceneRef.current?.resetFocus();
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

  return (
    <main className="relative w-full h-full overflow-hidden bg-black selection:bg-accent selection:text-white font-body text-text">
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="w-64 h-[1px] bg-white/10 relative overflow-hidden mb-4">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-accent"
                animate={{ width: `${loadProgress * 100}%` }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              />
            </div>
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
        className="fixed inset-0 w-full h-full touch-none"
      />

      {/* UI Overlay Layer */}
      <Overlay 
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
      />
      <VideoLightbox media={activeMedia} onClose={() => setActiveMedia(null)} />
    </main>
  );
}
