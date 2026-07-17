import * as THREE from 'three';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import NodeManager from './NodeManager';
import ScrollEngine, { type ScrollSnapshot } from './ScrollEngine';
import { type IndexFilters } from '../components/IndexFilterBar';

gsap.registerPlugin(Observer);

export interface SceneOptions {
  onNodeClick: (node: any) => void;
  onNodeHover?: (node: any, pos: { x: number, y: number } | null) => void;
  onCloseNode?: () => void;
  onProgress: (progress: number) => void;
  onRawScroll?: (scroll: number) => void;
  onRailChange?: (state: any | null) => void;
  onMediaOpen?: (media: any) => void;
  canUseSceneClicks?: () => boolean;
  onLoadProgress?: (progress: number) => void;
  onLoadComplete?: () => void;
  onCenteredNodeChange?: (node: any | null) => void;
  onAudioUpdate?: (velocity: number, cameraPos: { x: number; y: number; z: number }) => void;
  onUpdateProjectedPositions?: (positions: Record<string, { x: number, y: number, w: number, h: number }>) => void;
  onContextLost?: () => void;
  onContextRestored?: () => void;
}

export default class Scene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private nodes: any[];
  private options: SceneOptions;
  
  private nodeManager: NodeManager;
  private scrollEngine: ScrollEngine;
  private activeMode: 'cylinder' | 'grid' | 'vertical' | 'horizontal' | 'map' = 'vertical';
  private modeScrollPositions: Partial<Record<'cylinder' | 'grid' | 'vertical' | 'horizontal' | 'map', ScrollSnapshot>> = {};
  private startedAt = performance.now();
  private frameId: number | null = null;
  private lastFrameTime = performance.now() / 1000;
  private lastRenderedAt = 0;
  private readonly minimumFrameInterval: number;
  private contextLost = false;

  constructor(container: HTMLElement, nodes: any[], options: SceneOptions) {
    this.container = container;
    this.nodes = nodes;
    this.options = options;
    const device = navigator as Navigator & { deviceMemory?: number };
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const isConstrainedDevice = (device.hardwareConcurrency || 8) <= 4 || (device.deviceMemory || 8) <= 4;
    this.minimumFrameInterval = prefersReducedMotion
      ? 1000 / 24
      : (isCoarsePointer || isConstrainedDevice ? 1000 / 30 : 0);

    // 1. Renderer Setup
    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
    } catch {
      throw new Error('WebGL is not supported by this browser.');
    }
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    
    // Clear container to prevent duplicate canvases during hot-reload simulation
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    container.appendChild(this.renderer.domElement);

    // Low-end devices (iOS Safari especially) reclaim WebGL contexts under
    // memory pressure; preventDefault on loss lets the browser restore it,
    // and three.js re-uploads GPU state on webglcontextrestored.
    this.renderer.domElement.addEventListener('webglcontextlost', this.onContextLost);
    this.renderer.domElement.addEventListener('webglcontextrestored', this.onContextRestored);

    // 2. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.camera.position.z = 25;
    this.camera.lookAt(0, 0, -1);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    this.scene.add(pointLight);

    // 4. Node Manager
    this.nodeManager = new NodeManager(this.scene, this.camera, this.nodes, this.options);

    // 5. Scroll Engine
    this.scrollEngine = new ScrollEngine(this.container, (scrollX, scrollY, zoom) => {
      this.nodeManager.update(scrollX, scrollY, zoom);
      
      const period = this.nodeManager.getLoopPeriod();
      const normalizedProgress = ((scrollY / period % 1) + 1) % 1;
      this.options.onProgress(normalizedProgress);
      this.options.onRawScroll?.(scrollY);
    });

    // 6. Resize handling
    window.addEventListener('resize', this.onResize);
    this.onResize(); // Initial call

    this.container.addEventListener('wheel', this.onWheelPreventDefault, { passive: false });

    // 7. Start Animation Loop
    this.frameId = requestAnimationFrame(this.animate);
  }

  private onWheelPreventDefault = (e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  };

  private onContextLost = (event: Event) => {
    event.preventDefault();
    this.contextLost = true;
    console.warn('WebGL context lost — pausing render loop');
    this.options.onContextLost?.();
  };

  private onContextRestored = () => {
    this.contextLost = false;
    this.lastFrameTime = performance.now() / 1000;
    console.info('WebGL context restored — resuming render loop');
    this.options.onContextRestored?.();
  };

  private onResize = () => {
    const activeRailIndex = this.nodeManager.getActiveMode() === 'horizontal'
      ? this.nodeManager.getActiveRailIndex()
      : null;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Horizontal cards use viewport-aware sizing. Re-anchor the same narrative
    // frame after an orientation/viewport change so responsive geometry cannot
    // advance the story underneath the reader.
    if (activeRailIndex !== null) {
      const anchorScroll = this.nodeManager.getScrollForRailSlide(activeRailIndex);
      this.scrollEngine.scrollY = anchorScroll;
      this.scrollEngine.targetScrollY = anchorScroll;
      this.scrollEngine.scrollX = 0;
      this.scrollEngine.targetScrollX = 0;
    }
  };

  private animate = (timestamp: number) => {
    if (this.contextLost || document.hidden || (this.minimumFrameInterval > 0 && timestamp - this.lastRenderedAt < this.minimumFrameInterval)) {
      this.frameId = requestAnimationFrame(this.animate);
      return;
    }

    this.lastRenderedAt = timestamp;
    try {
      const now = timestamp / 1000;
      const dt = Math.min(0.1, now - this.lastFrameTime);
      this.lastFrameTime = now;

      const time = (timestamp - this.startedAt) / 1000;
      
      // Idle Magnetic Snap scroll in horizontal mode
      if (
        this.nodeManager.getActiveMode() === 'horizontal' &&
        this.scrollEngine.idleFor(600) &&
        this.scrollEngine.velocity < 0.002
      ) {
        const closestSlide = this.nodeManager.getClosestRailSlideIndex();
        const currentTarget = this.scrollEngine.targetScrollY;
        const snapTarget = this.nodeManager.getScrollForRailSlide(closestSlide, currentTarget);
        
        if (Math.abs(currentTarget - snapTarget) > 0.005) {
          const snapLerp = 1 - Math.exp(-5.0 * dt); // ~0.08 at 60Hz
          this.scrollEngine.targetScrollY += (snapTarget - currentTarget) * snapLerp;
        }
      }

      // Update Engines
      this.scrollEngine.update(time);
      this.nodeManager.renderUpdate(time, this.scrollEngine.velocity);

      // Feed audio engine with scroll velocity and camera position
      this.options.onAudioUpdate?.(this.scrollEngine.velocity, this.camera.position);

      // Render Scene
      this.renderer.render(this.scene, this.camera);
    } catch (e) {
      console.error('Animation Loop Error:', e);
    }

    this.frameId = requestAnimationFrame(this.animate);
  };

  public switchMode(
    mode: 'cylinder' | 'grid' | 'vertical' | 'horizontal' | 'map',
    options: { restorePosition?: boolean } = {},
  ) {
    if (mode === this.activeMode && this.nodeManager.getActiveMode() === mode) return false;

    this.modeScrollPositions[this.activeMode] = this.scrollEngine.snapshot();
    this.scrollEngine.reset();
    this.scrollEngine.mode = mode;
    this.nodeManager.setLayoutMode(mode);
    this.activeMode = mode;

    const savedPosition = this.modeScrollPositions[mode];
    if (options.restorePosition && savedPosition) {
      this.scrollEngine.restore(savedPosition);
      return true;
    }

    return false;
  }

  public setFocusedNode(index: number | null) {
    this.nodeManager.setFocusedNode(index);
    if (index !== null) {
      const target = this.nodeManager.getScrollForNode(index, this.nodeManager.getActiveMode());
      this.scrollEngine.targetScrollY = target;
      this.scrollEngine.targetScrollX = 0; // Center X when focusing
    }
  }

  public focusNode(node: any) {
    this.nodeManager.focusNode(node);

    if (this.nodeManager.getActiveMode() === 'horizontal') {
      const nodeIndex = this.nodes.findIndex((entry) => entry.id === node.id || entry.slug === node.slug || entry.slug === node.projectId);

      if (nodeIndex >= 0) {
        const entryScroll = this.nodeManager.getScrollForNode(nodeIndex, 'horizontal');
        // Enter a project on its establishing frame. Letting the previous
        // project's momentum ease across a differently-sized rail allows the
        // idle snap to capture an arbitrary mid-sequence slide.
        this.scrollEngine.scrollY = entryScroll;
        this.scrollEngine.targetScrollY = entryScroll;
        this.scrollEngine.scrollX = 0;
        this.scrollEngine.targetScrollX = 0;
      }
    }
  }

  public goToRailSlide(index: number) {
    if (this.nodeManager.getActiveMode() !== 'horizontal') return;
    this.scrollEngine.targetScrollY = this.nodeManager.getScrollForRailSlide(index, this.scrollEngine.targetScrollY);
    this.scrollEngine.targetScrollX = 0;
  }

  public setSearchQuery(query: string) {
    this.nodeManager.setSearchQuery(query);
  }

  public setFilters(domain: string, type: string, world = 'all') {
    this.nodeManager.setFilters(domain, type, world);
  }

  public setIndexFilters(filters: IndexFilters) {
    this.nodeManager.setIndexFilters(filters);
  }

  public setHoveredFilter(category: 'world' | 'medium' | 'assetType' | null, value: string | null) {
    this.nodeManager.setHoveredFilter(category, value);
  }

  public resetFocus() {
    this.nodeManager.resetFocus();
  }

  public resetScroll() {
    this.scrollEngine.reset();
  }

  public focusNodeBySlug(slug: string) {
    this.nodeManager.focusNodeBySlug(slug);
  }

  public getAtlasNodesSpatialInfo() {
    return this.nodeManager.getAtlasNodesSpatialInfo();
  }

  public dispose() {
    window.removeEventListener('resize', this.onResize);
    this.container.removeEventListener('wheel', this.onWheelPreventDefault);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLost);
    this.renderer.domElement.removeEventListener('webglcontextrestored', this.onContextRestored);
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.renderer.dispose();
    this.scrollEngine.dispose();
    this.nodeManager.dispose();
  }
}
