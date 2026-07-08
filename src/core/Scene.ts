import * as THREE from 'three';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import NodeManager from './NodeManager';
import ScrollEngine from './ScrollEngine';
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
  private startedAt = performance.now();
  private frameId: number | null = null;
  private lastFrameTime = performance.now() / 1000;

  constructor(container: HTMLElement, nodes: any[], options: SceneOptions) {
    this.container = container;
    this.nodes = nodes;
    this.options = options;

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
    this.scrollEngine = new ScrollEngine((scrollX, scrollY, zoom) => {
      this.nodeManager.update(scrollX, scrollY, zoom);
      
      const period = this.nodeManager.getLoopPeriod();
      const normalizedProgress = ((scrollY / period % 1) + 1) % 1;
      this.options.onProgress(normalizedProgress);
      this.options.onRawScroll?.(scrollY);
    });

    // 6. Resize handling
    window.addEventListener('resize', this.onResize);
    this.onResize(); // Initial call

    window.addEventListener('wheel', this.onWheelPreventDefault, { passive: false });

    // 7. Start Animation Loop
    this.animate();
  }

  private onWheelPreventDefault = (e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  };

  private onContextLost = (event: Event) => {
    event.preventDefault();
    console.warn('WebGL context lost — waiting for restore');
    this.options.onContextLost?.();
  };

  private onContextRestored = () => {
    console.info('WebGL context restored');
    this.options.onContextRestored?.();
  };

  private onResize = () => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };

  private animate = () => {
    try {
      const now = performance.now() / 1000;
      const dt = Math.min(0.1, now - this.lastFrameTime);
      this.lastFrameTime = now;

      const time = (performance.now() - this.startedAt) / 1000;
      
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

  public switchMode(mode: 'cylinder' | 'grid' | 'vertical' | 'horizontal' | 'map') {
    this.scrollEngine.reset();
    this.scrollEngine.mode = mode;
    this.nodeManager.setLayoutMode(mode);
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
        this.scrollEngine.targetScrollY = this.nodeManager.getScrollForNode(nodeIndex, 'horizontal');
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

  public setFilters(domain: string, type: string) {
    this.nodeManager.setFilters(domain, type);
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
    window.removeEventListener('wheel', this.onWheelPreventDefault);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLost);
    this.renderer.domElement.removeEventListener('webglcontextrestored', this.onContextRestored);
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.renderer.dispose();
    this.scrollEngine.dispose();
    this.nodeManager.dispose();
  }
}
