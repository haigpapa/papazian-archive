import * as THREE from 'three';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import NodeManager from './NodeManager';
import ScrollEngine from './ScrollEngine';

gsap.registerPlugin(Observer);

export interface SceneOptions {
  onNodeClick: (node: any) => void;
  onNodeHover?: (node: any, pos: { x: number, y: number } | null) => void;
  onProgress: (progress: number) => void;
  onRawScroll?: (scroll: number) => void;
  onRailChange?: (state: any | null) => void;
  onMediaOpen?: (media: any) => void;
  canUseSceneClicks?: () => boolean;
  onLoadProgress?: (progress: number) => void;
  onLoadComplete?: () => void;
  onCenteredNodeChange?: (node: any | null) => void;
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

  constructor(container: HTMLElement, nodes: any[], options: SceneOptions) {
    this.container = container;
    this.nodes = nodes;
    this.options = options;

    // 1. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    
    // Clear container to prevent duplicate canvases during hot-reload simulation
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    container.appendChild(this.renderer.domElement);

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
    this.scrollEngine = new ScrollEngine((scrollX, scrollY) => {
      this.nodeManager.update(scrollX, scrollY);
      
      const period = this.nodeManager.getLoopPeriod();
      const normalizedProgress = ((scrollY / period % 1) + 1) % 1;
      this.options.onProgress(normalizedProgress);
      this.options.onRawScroll?.(scrollY);
    });

    // 6. Resize handling
    window.addEventListener('resize', this.onResize);
    this.onResize(); // Initial call

    // 7. Start Animation Loop
    this.animate();
  }

  private onResize = () => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };

  private hasLoggedStart = false;
  private animate = () => {
    if (!this.hasLoggedStart) {
      console.log('Scene: Animation loop started');
      this.hasLoggedStart = true;
    }
    try {
      const time = (performance.now() - this.startedAt) / 1000;
      
      // Update Engines
      this.scrollEngine.update(time);
      this.nodeManager.renderUpdate(time, this.scrollEngine.velocity);

      // Render Scene
      this.renderer.render(this.scene, this.camera);
    } catch (e) {
      console.error('Animation Loop Error:', e);
    }

    this.frameId = requestAnimationFrame(this.animate);
  };

  public switchMode(mode: 'cylinder' | 'grid' | 'vertical' | 'horizontal' | 'atlas') {
    this.scrollEngine.reset();
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

  public resetFocus() {
    this.nodeManager.resetFocus();
  }

  public dispose() {
    window.removeEventListener('resize', this.onResize);
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.renderer.dispose();
    this.scrollEngine.dispose();
    this.nodeManager.dispose();
  }
}
