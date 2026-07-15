import * as THREE from 'three';
import { SPATIAL_DURATION, SPATIAL_EASE } from '../ui/motion';
import gsap from 'gsap';
import { CANONICAL_PROJECT_SLUGS, CANONICAL_PROJECT_SET } from '../data/canonicalProjects';
import { getProjectWorld } from '../data/worlds';
import { getRelationDetail, RELATION_LINE_STYLES } from '../data/relations';
import { type IndexFilters, DEFAULT_INDEX_FILTERS } from '../components/IndexFilterBar';
import { findClosestRailIndex, getClosedRailSpan, resolveVisibleIndex } from './railState';

const VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D uMap;
  uniform float uVelocity;
  uniform float uHover;
  uniform float uSearchHighlight;
  uniform float uModeVisibility;
  uniform float uTime;
  uniform float uSlideKind;
  uniform float uAspect;
  uniform vec3 uColor;
  uniform float uIsHorizontalMode;
  varying vec2 vUv;

  void main() {
    float shift = uVelocity * 0.002;
    vec2 sampleUv = gl_FrontFacing ? vUv : vec2(1.0 - vUv.x, vUv.y);

    vec4 texR = texture2D(uMap, sampleUv + vec2(shift, 0.0));
    vec4 texG = texture2D(uMap, sampleUv);
    vec4 texB = texture2D(uMap, sampleUv - vec2(shift, 0.0));
    
    vec3 color = vec3(texR.r, texG.g, texB.b);
    float alpha = texG.a;

    // Apply grayscale Xerox filter ONLY in horizontal cinematic rail mode
    if (uIsHorizontalMode > 0.5) {
      float luma = dot(color, vec3(0.299, 0.587, 0.114));
      // Softer contrast luma to preserve details in dark/shadow regions
      float softContrastLuma = clamp((luma - 0.5) * 0.8 + 0.5, 0.0, 1.0);
      vec3 baseGrayscale = vec3(softContrastLuma);
      // Mix 20% of original color and apply a 1.25x brightness boost to keep it visible
      vec3 preHoverColor = clamp((mix(baseGrayscale, color, 0.20) * 1.25), 0.0, 1.0);
      color = mix(preHoverColor, color, uHover);
    }

    float pulse = 1.0 + 0.04 * sin(uTime * 3.0);
    color += uHover * 0.04 * vec3(1.0) * pulse; 

    // Search fade: dimming is lighter so cards remain visible
    color *= (0.55 + uSearchHighlight * 0.45);
    alpha *= uModeVisibility;
    if (uModeVisibility < 0.01 || alpha < 0.01) discard;

    // If texture alpha is low (loading or failed), use the accent color as placeholder
    if (alpha < 0.1) {
      gl_FragColor = vec4(uColor * (0.8 + 0.2 * pulse), uModeVisibility);
    } else {
      vec2 center = sampleUv - vec2(0.5);
      vec2 iconSpace = vec2(center.x * uAspect, center.y);
      float centerDistance = length(iconSpace);

      if (uSlideKind > 1.5 && uSlideKind < 2.5) {
        float disc = smoothstep(0.245, 0.23, centerDistance);
        float ring = smoothstep(0.27, 0.26, centerDistance) - smoothstep(0.205, 0.195, centerDistance);
        float playBody = step(-0.085, iconSpace.x) * step(iconSpace.x, 0.15);
        float playShape = step(abs(iconSpace.y), max(0.0, (0.15 - iconSpace.x) * 0.58));
        float play = playBody * playShape;
        color = mix(color, vec3(0.0), disc * 0.28);
        color = mix(color, vec3(1.0), max(ring * 0.82, play));
      } else if (uSlideKind > 2.5) {
        float disc = smoothstep(0.245, 0.23, centerDistance);
        float body = step(abs(iconSpace.x + 0.055), 0.045) * step(abs(iconSpace.y), 0.07);
        float horn = step(0.0, iconSpace.x + 0.045) * step(iconSpace.x, 0.07) * step(abs(iconSpace.y), 0.11 - iconSpace.x * 0.55);
        float wave1 = 1.0 - smoothstep(0.008, 0.018, abs(length(iconSpace - vec2(0.01, 0.0)) - 0.12));
        float wave2 = 1.0 - smoothstep(0.008, 0.018, abs(length(iconSpace - vec2(0.01, 0.0)) - 0.18));
        float wave = (wave1 + wave2) * step(0.02, iconSpace.x);
        color = mix(color, vec3(0.0), disc * 0.28);
        color = mix(color, vec3(1.0), max(max(body, horn), wave));
      }

      gl_FragColor = vec4(color, alpha);
    }
  }
`;

export default class NodeManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private nodesData: any[];
  private meshes: THREE.Mesh[] = [];
  private group: THREE.Group;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private options: any;
  private activeMode: string = 'vertical';
  private loadingManager: THREE.LoadingManager;
  private hoveredMesh: THREE.Mesh | null = null;
  private relayoutTimer: number | null = null;
  private focusedNodeId: string | null = null;
  // Per-mode cache for getVisibleMeshes(); cleared whenever mode, focus, or filters change.
  private visibleMeshCache = new Map<string, THREE.Mesh[]>();
  // Primary mesh per project slug; meshes are static after construction.
  private primaryMeshBySlug = new Map<string, THREE.Mesh>();
  private relationLines: THREE.Line[] = [];
  private cylinderGuideLines: THREE.LineLoop[] = [];
  private lastRailStateKey = '';
  private lastCenteredNodeId: any = null;
  private zoneMeshes: THREE.Mesh[] = [];
  private searchQueryString = '';
  private indexFilters: IndexFilters = DEFAULT_INDEX_FILTERS;
  private constellationPositions = new Map<string, { x: number; y: number; z: number }>();
  private placeholderTexture: THREE.Texture | null = null;
  private unhydratedMeshes: { mesh: THREE.Mesh, asset: any, data: any, primarySrc: string, customAspect: number }[] = [];
  // Grid slot per visible-mesh index; recomputed once per filter/mode change
  // instead of the previous O(n) walk per mesh per frame.
  private gridSlotCache: number[] | null = null;
  private lastRenderTime: number = performance.now() / 1000;
  private failedUrls = new Set<string>();
  private hasProjectedPositions = false;
  private lastProjWidth = 0;
  private lastProjHeight = 0;
  private lastProjScrollX = 0;
  private lastProjScrollY = 0;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, nodesData: any[], options: any) {
    this.scene = scene;
    this.camera = camera;
    this.nodesData = nodesData;
    this.options = options;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.loadingManager = new THREE.LoadingManager();
    this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const progress = itemsLoaded / itemsTotal;
      this.options.onLoadProgress?.(progress);
    };
    this.loadingManager.onLoad = () => {
      console.log('Textures loaded successfully');
      this.options.onLoadComplete?.();
      // uloadUnhydratedBackground is disabled to prevent background mobile OOM crashes.
      // Secondary project textures are hydrated on-demand when the user views the project rail.
    };
    this.loadingManager.onError = (url) => {
      console.warn('Texture failed to load:', url);
    };

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.createNodes();
    this.createNoDataZones();
    
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('click', this.onClick);
  }

  private createNoDataZones() {
    const zones = [
      {
        id: 'ZONE_01',
        slug: 'ZONE-01',
        zoneId: 'ZONE_01',
        title: 'EMPTY SECTOR // BEIRUT PORT',
        year: '2026',
        lat: '33.8938° N',
        lon: '35.5018° E',
        isNoDataZone: true,
        domains: [],
        x: -12,
        y: 11,
        sides: 3,
        radius: 3,
      },
      {
        id: 'ZONE_02',
        slug: 'ZONE-02',
        zoneId: 'ZONE_02',
        title: 'ABSENT SECTOR // NILE DELTA',
        year: '2026',
        lat: '30.0444° N',
        lon: '31.2357° E',
        isNoDataZone: true,
        domains: [],
        x: 14,
        y: -9,
        sides: 4,
        radius: 4,
      },
      {
        id: 'ZONE_03',
        slug: 'ZONE-03',
        zoneId: 'ZONE_03',
        title: 'EXILE VECTOR // SEINE VALLEY',
        year: '2026',
        lat: '48.8566° N',
        lon: '2.3522° E',
        isNoDataZone: true,
        domains: [],
        x: -8,
        y: -13,
        sides: 6,
        radius: 3.5,
      }
    ];

    zones.forEach((zone) => {
      const geometry = new THREE.CircleGeometry(zone.radius, zone.sides);
      geometry.rotateZ(Math.PI / (zone.sides * 2));
      const material = new THREE.MeshBasicMaterial({
        color: 0xab4e30,
        transparent: true,
        opacity: 0.06,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(zone.x, zone.y, 0.1);
      mesh.visible = false;

      const edgeGeom = new THREE.EdgesGeometry(geometry);
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0xab4e30,
        transparent: true,
        opacity: 0.32,
      });
      const edges = new THREE.LineSegments(edgeGeom, edgeMat);
      mesh.add(edges);

      mesh.userData = { ...zone };
      this.zoneMeshes.push(mesh);
      this.group.add(mesh);
    });
  }

  private createNodes() {
    const loader = new THREE.TextureLoader(this.loadingManager);
    loader.setCrossOrigin('anonymous');
    const planeWidth = 6;
    const planeHeight = 4;
    const planeAspect = planeWidth / planeHeight;
    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 32, 32);

    this.nodesData.forEach((data, i) => {
      const gallery = data.gallery?.length
        ? data.gallery
        : [{ id: `${data.slug}-0`, projectId: data.slug, src: data.thumbnail, isPrimary: true, label: data.title }];

      gallery.forEach((asset: any, assetIndex: number) => {
        const slideType = asset.type || 'image';
        const isGeneratedCard = slideType === 'text' || ((!asset.src && !asset.poster) && (slideType === 'video' || slideType === 'audio'));
        
        let customAspect = planeAspect;
        const role = asset.role || '';
        const chapter = asset.chapter || '';
        const layout = asset.layout || '';
        
        if (layout === 'hero' || role === 'hero' || assetIndex === 0) {
          customAspect = 1.333; // Widescreen cover
        } else if (String(chapter).toLowerCase() === 'authorship' || role === 'role') {
          customAspect = 1.35; // Dossier
        } else if (role === 'thesis' || role === 'coda' || role === 'context') {
          customAspect = 0.78; // Intertitle with enough measure for balanced display type
        } else if (role === 'system' || role === 'process') {
          customAspect = 1.75; // Diagram (Wide)
        } else {
          customAspect = 0.75; // Standard portrait (3:4)
        }

        // Initialize placeholder texture once if not already created
        if (!this.placeholderTexture) {
          const canvas = document.createElement('canvas');
          canvas.width = 2;
          canvas.height = 2;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(0, 0, 2, 2);
          }
          this.placeholderTexture = new THREE.CanvasTexture(canvas);
        }

        let texture;
        let textureLoaded = false;
        
        if (isGeneratedCard) {
          texture = this.createCardTexture(asset, data, slideType, customAspect);
          textureLoaded = true;
        } else if (true) {
          const primarySrc = asset.poster || asset.src || data.thumbnail;
          const isCore = asset.isPrimary || assetIndex === 0; // Load only the primary cover eagerly
          
          if (isCore) {
            const isMobile = window.innerWidth <= 768;
            const hasSmall = primarySrc && !primarySrc.includes('-small.webp') && !primarySrc.includes('youtube') && !primarySrc.includes('ytimg') && !primarySrc.includes('img.youtube.com');
            const initialSrc = (isMobile && hasSmall)
              ? primarySrc.slice(0, primarySrc.lastIndexOf('.')) + '-small.webp'
              : primarySrc;

            const loadTextureWithFallbacks = (currentSrc: string, stage: 'small' | 'original' | 'jpg' | 'youtube' | 'card') => {
              loader.load(
                currentSrc,
                (loadedTexture) => {
                  loadedTexture.colorSpace = THREE.SRGBColorSpace;
                  const image = loadedTexture.image;
                  if (image?.width && image?.height && mesh) {
                    mesh.userData.imageAspect = image.width / image.height;
                    const mat = mesh.material as THREE.ShaderMaterial;
                    if (mat && mat.uniforms) {
                      mat.uniforms.uMap.value = loadedTexture;
                      mat.uniforms.uAspect.value = mesh.userData.imageAspect;
                      this.scheduleRelayout();
                    }
                  }
                },
                undefined,
                (err) => {
                  if (stage === 'small') {
                    loadTextureWithFallbacks(primarySrc, 'original');
                  } else if (stage === 'original') {
                    const fallbackSrc = primarySrc.replace(/\.webp$/, '.jpg');
                    if (fallbackSrc !== primarySrc) {
                      loadTextureWithFallbacks(fallbackSrc, 'jpg');
                    } else {
                      const ytId = asset.youtubeId || data.youtubeId;
                      if (ytId) {
                        loadTextureWithFallbacks(`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`, 'youtube');
                      } else {
                        const errTex = this.createCardTexture({ ...asset, label: 'MEDIA UNAVAILABLE', title: 'MEDIA UNAVAILABLE', cardStyle: 'system' }, data, 'text', customAspect);
                        if (mesh && mesh.material && (mesh.material as THREE.ShaderMaterial).uniforms) {
                          (mesh.material as THREE.ShaderMaterial).uniforms.uMap.value = errTex;
                          this.scheduleRelayout();
                        }
                      }
                    }
                  } else if (stage === 'jpg') {
                    const ytId = asset.youtubeId || data.youtubeId;
                    if (ytId) {
                      loadTextureWithFallbacks(`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`, 'youtube');
                    } else {
                      const errTex = this.createCardTexture({ ...asset, label: 'MEDIA UNAVAILABLE', title: 'MEDIA UNAVAILABLE', cardStyle: 'system' }, data, 'text', customAspect);
                      if (mesh && mesh.material && (mesh.material as THREE.ShaderMaterial).uniforms) {
                        (mesh.material as THREE.ShaderMaterial).uniforms.uMap.value = errTex;
                        this.scheduleRelayout();
                      }
                    }
                  } else {
                    const errTex = this.createCardTexture({ ...asset, label: 'MEDIA UNAVAILABLE', title: 'MEDIA UNAVAILABLE', cardStyle: 'system' }, data, 'text', customAspect);
                    if (mesh && mesh.material && (mesh.material as THREE.ShaderMaterial).uniforms) {
                      (mesh.material as THREE.ShaderMaterial).uniforms.uMap.value = errTex;
                      this.scheduleRelayout();
                    }
                  }
                }
              );
            };

            texture = this.placeholderTexture;
            setTimeout(() => {
              loadTextureWithFallbacks(initialSrc, (initialSrc !== primarySrc) ? 'small' : 'original');
            }, 0);
            textureLoaded = true;
          } else {
            texture = this.placeholderTexture;
            // We will hydrate this later, after the mesh is created
            setTimeout(() => {
                if (mesh) {
                    this.unhydratedMeshes.push({ mesh, asset, data, primarySrc, customAspect });
                }
            }, 0);
          }
        } else {
          texture = this.placeholderTexture;
        }
        
        const material = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uVelocity: { value: 0 },
            uHover: { value: 0 },
            uSearchHighlight: { value: 1.0 },
            uModeVisibility: { value: 1.0 },
            uSlideKind: { value: this.getSlideKindValue(slideType) },
            uAspect: { value: planeAspect },
            uMap: { value: texture },
            uColor: { value: new THREE.Color(data.accentColor || '#4a7fa8') },
            uGlitchIntensity: {
              value: (
                String(asset.chapter || '').toLowerCase().includes('conflict') ||
                String(asset.chapter || '').toLowerCase().includes('proof') ||
                String(asset.chapter || '').toLowerCase().includes('dossier') ||
                String(asset.title || '').toLowerCase().includes('shatter')
              ) ? 1.0 : 0.0
            },
            uIsHorizontalMode: { value: (this.activeMode === 'horizontal') ? 1.0 : 0.0 }
          },
          vertexShader: VERTEX_SHADER,
          fragmentShader: FRAGMENT_SHADER,
          side: THREE.DoubleSide,
          transparent: true,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = {
          ...data,
          assetId: asset.id,
          assetType: slideType,
          assetLabel: asset.label,
          assetSrc: asset.src || asset.poster || '',
          assetPoster: asset.poster,
          assetYoutubeId: asset.youtubeId,
          assetEmbedUrl: asset.embedUrl,
          assetExternalUrl: asset.externalUrl,
          assetCaption: asset.caption,
          assetBody: asset.body,
          assetRole: asset.role,
          assetLayout: asset.layout,
          assetEmphasis: asset.emphasis,
          assetChapter: asset.chapter,
          assetBeat: asset.beat,
          assetRelatedSlugs: asset.relatedSlugs,
          assetIndex,
          isPrimary: assetIndex === 0 || asset.isPrimary,
          projectId: data.slug,
          projectOrder: i,
          imageAspect: customAspect,
          showInWorks: CANONICAL_PROJECT_SET.has(data.slug),
          canonicalOrder: CANONICAL_PROJECT_SLUGS.indexOf(data.slug),
          textureLoaded,
          textureUrl: asset.poster || asset.src || data.thumbnail,
        };
        material.uniforms.uAspect.value = customAspect;
        this.meshes.push(mesh);
        this.group.add(mesh);
      });
    });

    this.computeSpatialConstellation();
    this.invalidateVisibleMeshCache();
    this.createRelationLines();
    this.createCylinderGuideLines();

    this.meshes.forEach((mesh) => {
      this.setNodePosition(mesh, this.getModeIndex(mesh, this.activeMode), this.activeMode, false);
    });
  }

  private getSlideKindValue(slideType: string) {
    if (slideType === 'video') return 2;
    if (slideType === 'audio') return 3;
    return 1;
  }

  private computeSpatialConstellation() {
    const nodes = this.nodesData.map((node, i) => {
      const slug = node.slug;
      
      // 1. Geography Axis (X) target mapping
      // Beirut (0.0), Europe/MENA (0.5), LA/Transit (0.8), New York (1.0)
      let geoX = 0.5; // Default Europe/MENA/Transit
      const slugLower = slug.toLowerCase();
      const titleLower = (node.title || '').toLowerCase();
      const summaryLower = (node.summary || '').toLowerCase();
      
      if (
        slugLower.includes('nyc') || 
        slugLower.includes('new-york') || 
        titleLower.includes('nyc') || 
        titleLower.includes('new york') ||
        summaryLower.includes('queens') ||
        summaryLower.includes('brooklyn') ||
        summaryLower.includes('manhattan') ||
        slugLower === 'fictive-environments' ||
        slugLower === 'lede-nyc' ||
        slugLower === 'lede.nyc' ||
        slugLower === 'localization-gap' ||
        slugLower === 'hah-was' ||
        slugLower === 'frank' ||
        slugLower === 'meaning-stack' ||
        slugLower === 'telescode' ||
        slugLower === 'codex' ||
        slugLower === 'autopsy' ||
        slugLower === 'erasure' ||
        slugLower === 'turn' ||
        slugLower === 'tuning-fork' ||
        slugLower === 'local' ||
        slugLower === 'nyu' ||
        slugLower === 'columbia' ||
        slugLower === 'public-theater' ||
        slugLower === 'joe-s-pub'
      ) {
        geoX = 1.0;
      } else if (
        slugLower.includes('transit') || 
        slugLower.includes('elsewhere') || 
        slugLower.includes('crane') || 
        slugLower.includes('mirage') || 
        titleLower.includes('crane') || 
        titleLower.includes('transit') || 
        titleLower.includes('elsewhere') ||
        slugLower === 'nowhere-elsewhere'
      ) {
        geoX = 0.8;
      } else if (
        slugLower.includes('bartlett') || 
        slugLower.includes('london') || 
        slugLower.includes('sophie') || 
        slugLower.includes('exit') || 
        slugLower.includes('serbia') ||
        titleLower.includes('bartlett') || 
        titleLower.includes('london') || 
        titleLower.includes('sophie')
      ) {
        geoX = 0.6;
      } else if (
        slugLower.includes('beirut') || 
        slugLower.includes('aub') || 
        slugLower.includes('b018') || 
        slugLower.includes('byblos') || 
        slugLower.includes('lebanon') || 
        slugLower.includes('port') || 
        slugLower.includes('plot') || 
        slugLower.includes('dw5') ||
        titleLower.includes('beirut') || 
        titleLower.includes('aub') || 
        titleLower.includes('byblos') ||
        summaryLower.includes('beirut') ||
        summaryLower.includes('lebanon')
      ) {
        geoX = 0.0;
      } else {
        // Year-based heuristic fallback if text indicators are not matched
        const yearMatch = (node.year || '').match(/\d{4}/);
        if (yearMatch) {
          const yearVal = parseInt(yearMatch[0], 10);
          if (yearVal < 2013) geoX = 0.0;
          else if (yearVal < 2020) geoX = 0.5;
          else geoX = 1.0;
        }
      }

      // 2. Chronological Axis (Y) target mapping
      // Maps year continuously between 2004 (bottom, -13) and 2026 (top, +13)
      const yearMatch = (node.year || '').match(/\d{4}/);
      const yearVal = yearMatch ? parseInt(yearMatch[0], 10) : 2020;
      const clampedYear = Math.max(2004, Math.min(2026, yearVal));
      const timePct = (clampedYear - 2004) / (2026 - 2004);

      // 3. Impact & Gravity Axis (Z) target mapping
      // Tier 1 (lead) is Z=4 (close foreground), Tier 2 (secondary) is Z=-2, Tier 3 (archive) is Z=-8
      let baseDepth = -8.0;
      if (node.tier === 'lead') baseDepth = 4.0;
      else if (node.tier === 'secondary') baseDepth = -2.0;

      const seed = Math.sin(i * 12.9898) * 43758.5453;
      const rSeed = seed - Math.floor(seed);
      const zJitter = (rSeed - 0.5) * 1.5;

      const targetX = (geoX - 0.5) * 28;
      const targetY = (timePct - 0.5) * 26;
      const targetZ = baseDepth + zJitter;

      return {
        slug,
        x: targetX + (rSeed - 0.5) * 4, // Initial layout dispersion
        y: targetY + (rSeed - 0.5) * 4,
        z: targetZ,
        targetX,
        targetY,
        targetZ,
        vx: 0,
        vy: 0,
        vz: 0,
        tier: node.tier || 'archive',
        connections: node.relatedSlugs || node.connections || []
      };
    });

    const nodeBySlug = new Map(nodes.map(n => [n.slug, n]));

    for (let iter = 0; iter < 120; iter++) {
      // 1. Repulsion (charge) between all nodes
      for (let i = 0; i < nodes.length; i++) {
        const na = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const nb = nodes[j];
          const dx = nb.x - na.x;
          const dy = nb.y - na.y;
          const dz = nb.z - na.z;
          const distSq = dx * dx + dy * dy + dz * dz + 0.1;
          const dist = Math.sqrt(distSq);
          
          const force = 0.85 / distSq;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          const fz = (dz / dist) * force;
          
          na.vx -= fx;
          na.vy -= fy;
          na.vz -= fz;
          nb.vx += fx;
          nb.vy += fy;
          nb.vz += fz;
        }
      }

      // 2. Attraction (connections)
      nodes.forEach((na) => {
        na.connections.forEach((targetSlug) => {
          const nb = nodeBySlug.get(targetSlug);
          if (!nb) return;
          const dx = nb.x - na.x;
          const dy = nb.y - na.y;
          const dz = nb.z - na.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
          
          const k = 0.055;
          const restLength = na.tier === 'lead' || nb.tier === 'lead' ? 6 : 4;
          const force = (dist - restLength) * k;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          const fz = (dz / dist) * force;
          
          na.vx += fx;
          na.vy += fy;
          na.vz += fz;
          nb.vx -= fx;
          nb.vy -= fy;
          nb.vz -= fz;
        });
      });

      // 3. Restoring force to Cartesian grid axes
      nodes.forEach((n) => {
        const kRestore = 0.095;
        n.vx += (n.targetX - n.x) * kRestore;
        n.vy += (n.targetY - n.y) * kRestore;
        n.vz += (n.targetZ - n.z) * kRestore;

        n.vx -= n.x * 0.005;
        n.vy -= n.y * 0.005;
        n.vz -= n.z * 0.005;

        n.x += n.vx * 0.85;
        n.y += n.vy * 0.85;
        n.z += n.vz * 0.85;

        n.vx = 0;
        n.vy = 0;
        n.vz = 0;
      });
    }

    nodes.forEach((n) => {
      this.constellationPositions.set(n.slug, { x: n.x, y: n.y, z: n.z });
    });
  }

  private createCardTexture(asset: any, data: any, slideType: string, aspectRatio: number) {
    const canvas = document.createElement('canvas');
    canvas.height = 1200;
    canvas.width = Math.round(canvas.height * aspectRatio);
    const ctx = canvas.getContext('2d');

    if (!ctx) return new THREE.CanvasTexture(canvas);

    const accent = data.accentColor || '#d7e7ef';
    // Captions already occupy the card's primary explanatory field. Only render
    // an additional body when the content source explicitly provides one, so
    // deterministic text cards do not repeat the same sentence twice.
    const body = Array.isArray(asset.body) ? asset.body : [asset.body].filter(Boolean);
    const cardStyle = this.getCardStyle(asset, body);
    const title = String(asset.label || data.title || 'Archive Card').toUpperCase();
    const caption = String(asset.caption || data.shortDescription || '');
    const chapter = String(asset.chapter || 'Case Study').toUpperCase();
    const projectTitle = String(data.title || asset.projectTitle || 'Archive').toUpperCase();
    const dateRange = String(data.year || 'ARCHIVE');

    this.paintCardBase(ctx, canvas, cardStyle, accent);

    const inset = 58;
    ctx.lineWidth = 2;
    ctx.strokeStyle = cardStyle === 'system' ? `${accent}66` : 'rgba(255,255,255,0.18)';
    ctx.strokeRect(inset, inset, canvas.width - inset * 2, canvas.height - inset * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.055)';
    ctx.strokeRect(inset + 9, inset + 9, canvas.width - (inset + 9) * 2, canvas.height - (inset + 9) * 2);

    if (cardStyle === 'system') {
      ctx.strokeStyle = `${accent}2d`;
      [362, 790, 1228, 1504].forEach((x) => {
        if (x < canvas.width - inset) {
          ctx.beginPath();
          ctx.moveTo(x, inset);
          ctx.lineTo(x, canvas.height - inset);
          ctx.stroke();
        }
      });
      [190, 900].forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(inset, y);
        ctx.lineTo(canvas.width - inset, y);
        ctx.stroke();
      });
    } else if (cardStyle === 'dossier') {
      ctx.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx.beginPath();
      ctx.moveTo(54, 900);
      ctx.lineTo(canvas.width - 54, 900);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(canvas.width - 482, inset);
      ctx.lineTo(canvas.width - 482, 900);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath();
      ctx.arc(canvas.width - 332, 330, 118, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(canvas.width - 332, 330, 84, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(242,242,237,0.18)';
      ctx.font = '700 24px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAPAZIAN', canvas.width - 332, 322);
      ctx.fillText('ARCHIVE', canvas.width - 332, 358);
      ctx.textAlign = 'left';
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.moveTo(canvas.width - 410, 54);
      ctx.lineTo(canvas.width - 410, canvas.height - 54);
      ctx.stroke();
    }

    ctx.fillStyle = cardStyle === 'system' ? accent : 'rgba(228,232,226,0.84)';
    ctx.font = '700 22px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.letterSpacing = '2px';
    ctx.fillText(chapter, 110, 132);

    ctx.strokeStyle = cardStyle === 'intertitle' ? 'rgba(255,255,255,0.72)' : accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(110, 190);
    ctx.lineTo(cardStyle === 'system' ? 470 : 250, 190);
    ctx.stroke();

    ctx.letterSpacing = '0px';
    ctx.fillStyle = cardStyle === 'system' ? '#f3a821' : '#f4f1e8';
    const titleSize = this.getCardTitleSize(title);
    const titleLineHeight = Math.round(titleSize * 1.08);
    ctx.font = `${cardStyle === 'system' ? '800' : '760'} ${titleSize}px Inter, Helvetica, Arial, sans-serif`;
    const titleBottom = this.drawWrappedText(
      ctx,
      title,
      110,
      314,
      cardStyle === 'dossier' ? canvas.width - 520 : canvas.width - 220,
      titleLineHeight,
      3
    );

    ctx.fillStyle = cardStyle === 'system' ? 'rgba(246,188,66,0.82)' : 'rgba(242,242,237,0.74)';
    ctx.font = '450 32px Inter, Helvetica, Arial, sans-serif';
    const captionBottom = this.drawWrappedText(
      ctx,
      caption,
      110,
      Math.max(cardStyle === 'dossier' ? 610 : 590, titleBottom + 56),
      cardStyle === 'dossier' ? canvas.width - 550 : canvas.width - 220,
      46,
      cardStyle === 'dossier' ? 3 : 5
    );

    if (cardStyle === 'dossier') {
      ctx.font = '700 34px ui-monospace, SFMono-Regular, Menlo, monospace';
      body.slice(0, 6).forEach((item: string, index: number) => {
        const x = 110 + (index % 3) * 515;
        const y = 978 + Math.floor(index / 3) * 92;
        ctx.fillStyle = accent;
        ctx.fillText(`0${index + 1}`.slice(-2), x, y);
        ctx.fillStyle = 'rgba(242,242,237,0.84)';
        this.drawWrappedText(ctx, item, x + 68, y - 2, 380, 42, 2);
      });
    } else {
      ctx.font = '400 30px Inter, Helvetica, Arial, sans-serif';
      ctx.fillStyle = cardStyle === 'system' ? 'rgba(246,188,66,0.78)' : 'rgba(242,242,237,0.82)';
      let y = Math.max(800, captionBottom + 48);
      body.slice(0, 3).forEach((paragraph: string) => {
        y = this.drawWrappedText(ctx, paragraph, 110, y, cardStyle === 'system' ? canvas.width - 260 : canvas.width - 220, 44, 3) + 26;
      });
    }

    // Keep provenance quiet and factual so it supports the composition instead
    // of competing with the project statement.
    const footerY = 1052;
    ctx.strokeStyle = cardStyle === 'system' ? `${accent}28` : 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(110, footerY);
    ctx.lineTo(canvas.width - 110, footerY);
    ctx.stroke();

    ctx.font = '650 18px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = cardStyle === 'system' ? accent : 'rgba(242,242,237,0.56)';
    ctx.letterSpacing = '1px';
    ctx.save();
    ctx.beginPath();
    ctx.rect(110, footerY + 22, Math.max(0, canvas.width - 390), 54);
    ctx.clip();
    ctx.fillText(projectTitle, 110, footerY + 50);
    ctx.restore();
    ctx.fillStyle = cardStyle === 'system' ? 'rgba(246,188,66,0.78)' : 'rgba(242,242,237,0.46)';
    ctx.textAlign = 'right';
    ctx.fillText(dateRange, canvas.width - 110, footerY + 50);
    ctx.textAlign = 'left';

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  private getCardStyle(asset: any, body: string[]): 'intertitle' | 'dossier' | 'system' {
    if (asset.cardStyle === 'intertitle' || asset.cardStyle === 'dossier' || asset.cardStyle === 'system') {
      return asset.cardStyle;
    }

    const role = asset.role || asset.assetRole;
    const chapter = asset.chapter || asset.assetChapter;
    if (String(chapter || '').toLowerCase() === 'authorship' || role === 'role') {
      return 'dossier';
    }

    const hasMetricBody = body.length >= 3 || body.some((item) => /[$%+]|\d/.test(String(item)));
    if (role === 'system' || role === 'process') return 'system';
    if (role === 'evidence' && hasMetricBody) return 'dossier';
    return 'intertitle';
  }

  private getCardTitleSize(title: string) {
    if (title.length > 28) return 84;
    if (title.length > 18) return 94;
    return 104;
  }

  private paintCardBase(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    style: 'intertitle' | 'dossier' | 'system',
    accent: string
  ) {
    const base = style === 'system' ? '#080604' : style === 'dossier' ? '#0d0f0f' : '#080808';
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createRadialGradient(1340, 120, 0, 840, 600, 1240);
    gradient.addColorStop(0, style === 'system' ? 'rgba(246,168,33,0.16)' : 'rgba(255,255,255,0.06)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.014)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.62)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = style === 'system' ? 'rgba(246,188,66,0.035)' : 'rgba(255,255,255,0.028)';
    for (let i = 0; i < 1250; i += 1) {
      const x = (i * 97) % canvas.width;
      const y = (i * 193) % canvas.height;
      const size = 1 + ((i * 17) % 2);
      ctx.globalAlpha = 0.08 + ((i * 13) % 9) * 0.012;
      ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1;

    if (style === 'intertitle') {
      ctx.fillStyle = 'rgba(255,255,255,0.018)';
      for (let y = 0; y < canvas.height; y += 6) ctx.fillRect(0, y, canvas.width, 1);
    }
  }

  private drawWrappedText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines = 6
  ) {
    const words = String(text).split(/\s+/).filter(Boolean);
    let line = '';
    let cursorY = y;
    let lines = 0;

    words.forEach((word) => {
      if (lines >= maxLines) return;

      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > maxWidth && line) {
        ctx.fillText(line, x, cursorY);
        cursorY += lineHeight;
        lines += 1;
        line = word;
      } else {
        line = next;
      }
    });

    if (line && lines < maxLines) {
      ctx.fillText(line, x, cursorY);
      cursorY += lineHeight;
    }

    return cursorY;
  }

  private createRelationLines() {
    this.primaryMeshBySlug.clear();
    this.getPrimaryMeshes().forEach((mesh) => this.primaryMeshBySlug.set(mesh.userData.slug, mesh));

    const createdLines = new Set<string>();

    this.nodesData.forEach((node) => {
      const connectionsList = node.relatedSlugs || node.connections || [];
      const uniqueTargets = Array.from(new Set(connectionsList));

      uniqueTargets.forEach((targetSlug: string) => {
        if (!this.primaryMeshBySlug.has(targetSlug)) return;

        const first = node.slug < targetSlug ? node.slug : targetSlug;
        const second = node.slug < targetSlug ? targetSlug : node.slug;
        const lineKey = `${first}_${second}`;
        if (createdLines.has(lineKey)) return;
        createdLines.add(lineKey);

        const targetNode = this.nodesData.find(n => n.slug === targetSlug);
        if (!targetNode) return;

        const sourceRelated = node.relatedSlugs || node.connections || [];
        const targetRelated = targetNode.relatedSlugs || targetNode.connections || [];
        const isMutual = sourceRelated.includes(targetSlug) && targetRelated.includes(node.slug);

        // Prefer the curated relation model (type, weight, visual style); fall back
        // to the mutuality/tier heuristic for uncurated connections.
        const detail = getRelationDetail(node.slug, targetSlug);
        const lineStyle = RELATION_LINE_STYLES[detail.type];

        let weight = detail.isCurated ? (detail.weight || 1) : 1;
        if (!detail.isCurated) {
          if (isMutual) {
            weight = 3;
          } else if (node.tier === 'lead' || targetNode.tier === 'lead') {
            weight = 2;
          }
        }

        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(),
          new THREE.Vector3(),
        ]);

        const accentHex = node.accentColor || '#ffffff';
        const isDashed = lineStyle.style !== 'solid';
        const material = isDashed
          ? new THREE.LineDashedMaterial({
              color: new THREE.Color(accentHex),
              transparent: true,
              opacity: 0,
              toneMapped: false,
              dashSize: lineStyle.style === 'dashed' ? 0.42 : 0.1,
              gapSize: lineStyle.style === 'dashed' ? 0.24 : 0.16,
            })
          : new THREE.LineBasicMaterial({
              color: new THREE.Color(accentHex),
              transparent: true,
              opacity: 0,
              toneMapped: false,
            });

        const line = new THREE.Line(geometry, material);
        line.userData = {
          sourceId: node.slug,
          targetId: targetSlug,
          weight,
          relationType: detail.type,
          opacityMultiplier: lineStyle.opacityMultiplier,
          isDashed,
        };
        this.relationLines.push(line);
        this.group.add(line);
      });
    });
  }

  private createCylinderGuideLines() {
    const radius = 18.25;
    const segments = 160;
    const ringCount = 34;
    const spacing = 3.15;
    const yStart = -((ringCount - 1) * spacing) / 2;

    for (let ringIndex = 0; ringIndex < ringCount; ringIndex += 1) {
      const points: THREE.Vector3[] = [];
      const y = yStart + ringIndex * spacing;

      for (let segment = 0; segment < segments; segment += 1) {
        const angle = (segment / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.sin(angle) * radius, y, Math.cos(angle) * radius));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0xd7e7ff,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
      });
      const line = new THREE.LineLoop(geometry, material);
      line.userData = { ringIndex };
      this.cylinderGuideLines.push(line);
      this.group.add(line);
    }
  }

  private getPrimaryMeshes() {
    return this.meshes.filter((mesh) => mesh.userData.isPrimary);
  }

  /**
   * Union of curated connections and relatedSlugs — must match the pairs
   * used by createRelationLines so node fading agrees with drawn lines.
   */
  private getRelatedSlugs(data: any): string[] {
    return [...new Set([...(data.connections || []), ...(data.relatedSlugs || [])])];
  }

  private getCanonicalPrimaryMeshes() {
    const canonical = this.getPrimaryMeshes()
      .filter((mesh) => mesh.userData.canonicalOrder >= 0)
      .sort((a, b) => a.userData.canonicalOrder - b.userData.canonicalOrder);

    return canonical.length ? canonical : this.getPrimaryMeshes();
  }

  private getProjectRailMeshes() {
    if (!this.focusedNodeId) return this.getCanonicalPrimaryMeshes();
    return this.meshes.filter((mesh) => mesh.userData.projectId === this.focusedNodeId);
  }

  private invalidateVisibleMeshCache() {
    this.visibleMeshCache.clear();
    this.gridSlotCache = null;
  }

  private getVisibleMeshes(mode = this.activeMode) {
    const cached = this.visibleMeshCache.get(mode);
    if (cached) return cached;

    let result: THREE.Mesh[];
    if (mode === 'grid') {
      let filtered = [...this.meshes];

      // 1. Filter by World
      if (this.indexFilters.world !== 'all') {
        filtered = filtered.filter((m) => {
          const world = getProjectWorld(m.userData.slug);
          return world && world.id === this.indexFilters.world;
        });
      }

      // 2. Filter by Medium/Domain
      if (this.indexFilters.medium !== 'all') {
        filtered = filtered.filter((m) => {
          const domains = m.userData.domains || [];
          const category = m.userData.category || '';
          return domains.includes(this.indexFilters.medium) || category === this.indexFilters.medium;
        });
      }

      // 3. Filter by Asset Type / Role
      if (this.indexFilters.assetType !== 'all') {
        filtered = filtered.filter((m) => {
          const type = (m.userData.assetType || '').toLowerCase();
          const role = (m.userData.assetRole || '').toLowerCase();
          if (this.indexFilters.assetType === 'video' || this.indexFilters.assetType === 'audio') {
            return type === this.indexFilters.assetType;
          }
          return role === this.indexFilters.assetType;
        });
      }

      // 4. Sort
      const domains = ['sound', 'image', 'space', 'code', 'systems', 'text'];
      const tierWeight: Record<string, number> = { lead: 0, secondary: 1, archive: 2 };

      filtered.sort((a, b) => {
        if (this.indexFilters.sort === 'year') {
          const aYear = a.userData.year || '';
          const bYear = b.userData.year || '';
          if (aYear !== bYear) return bYear.localeCompare(aYear); // Descending year
        } else if (this.indexFilters.sort === 'world') {
          const aWorld = getProjectWorld(a.userData.slug)?.id || 'zz';
          const bWorld = getProjectWorld(b.userData.slug)?.id || 'zz';
          if (aWorld !== bWorld) return aWorld.localeCompare(bWorld);
        } else if (this.indexFilters.sort === 'medium') {
          const aDomain = domains.indexOf(a.userData.domains?.[0] || a.userData.category || '');
          const bDomain = domains.indexOf(b.userData.domains?.[0] || b.userData.category || '');
          const domainDelta = (aDomain === -1 ? 99 : aDomain) - (bDomain === -1 ? 99 : bDomain);
          if (domainDelta !== 0) return domainDelta;
        }

        // Fallback: sort by domains, tier, projectOrder, assetIndex
        const aDomain = domains.indexOf(a.userData.domains?.[0] || a.userData.category || '');
        const bDomain = domains.indexOf(b.userData.domains?.[0] || b.userData.category || '');
        const domainDelta = (aDomain === -1 ? 99 : aDomain) - (bDomain === -1 ? 99 : bDomain);
        if (domainDelta !== 0) return domainDelta;

        const tierDelta = (tierWeight[a.userData.tier] ?? 9) - (tierWeight[b.userData.tier] ?? 9);
        if (tierDelta !== 0) return tierDelta;

        const orderDelta = (a.userData.projectOrder || 0) - (b.userData.projectOrder || 0);
        if (orderDelta !== 0) return orderDelta;

        return (a.userData.assetIndex || 0) - (b.userData.assetIndex || 0);
      });

      result = filtered;
    } else if (mode === 'horizontal') {
      result = this.getProjectRailMeshes();
    } else if (mode === 'vertical') {
      result = this.getCanonicalPrimaryMeshes();
    } else if (mode === 'cylinder') {
      result = this.getPrimaryMeshes();
    } else {
      result = this.getPrimaryMeshes();
    }

    this.visibleMeshCache.set(mode, result);
    return result;
  }

  private getModeIndex(mesh: THREE.Mesh, mode = this.activeMode) {
    const visible = this.getVisibleMeshes(mode);
    return Math.max(0, visible.indexOf(mesh));
  }

  private isMeshVisibleInMode(mesh: THREE.Mesh, mode = this.activeMode) {
    return this.getVisibleMeshes(mode).includes(mesh);
  }

  private setNodePosition(mesh: THREE.Mesh, i: number, mode: string, animate: boolean = true) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const shouldAnimate = animate && !prefersReducedMotion;
    const isVisible = this.isMeshVisibleInMode(mesh, mode);
    const RADIUS = 18;
    const visibleMeshes = this.getVisibleMeshes(mode);
    const TOTAL = visibleMeshes.length || 1;
    let targetX = 0, targetY = 0, targetZ = 0, targetRotY = 0, targetRotZ = 0;

    if (!isVisible) {
      targetX = 0;
      targetY = 0;
      targetZ = -70;
      targetRotY = 0;
    } else if (mode === 'cylinder') {
      const nodesPerRing = 8;
      const REVOLUTIONS = Math.max(1, Math.ceil(TOTAL / nodesPerRing));
      const angle = (i / TOTAL) * Math.PI * 2 * REVOLUTIONS;
      targetX = Math.sin(angle) * RADIUS;
      targetZ = Math.cos(angle) * RADIUS;
      targetY = (i / TOTAL) * REVOLUTIONS * -9 + (REVOLUTIONS * 9) / 2;
      targetRotY = angle;
    } else if (mode === 'grid') {
      const cols = 9;
      const slot = this.getGridSlot(i);
      const row = Math.floor(slot / cols);
      const col = slot % cols;
      targetX = (col - (cols - 1) / 2) * 7.4 + this.getGridOffset(slot, 'x');
      targetY = (row - Math.floor(this.getGridRows() / 2)) * -5.9 + this.getGridOffset(slot, 'y');
      targetZ = this.getGridOffset(slot, 'z');
      targetRotY = 0;
    } else if (mode === 'vertical') {
      targetX = 0;
      targetY = this.getLinearPosition(i, mode);
      targetZ = 0;
      targetRotY = 0;
    } else if (mode === 'horizontal') {
      targetX = this.getLinearPosition(i, mode);
      targetY = 0;
      targetZ = 0;
      targetRotY = 0;
    } else if (mode === 'map') {
      const slug = mesh.userData.slug;
      const pos = this.constellationPositions.get(slug) || { x: 0, y: 0, z: 0 };
      targetX = pos.x;
      targetY = pos.y;
      targetZ = pos.z;
      targetRotY = 0;
    }

    const targetScale = isVisible ? this.getNodeScale(mesh, 1, mode) : { x: 0.001, y: 0.001, z: 0.001 };
    const material = mesh.material as THREE.ShaderMaterial;
    mesh.userData.targetMode = mode;
    mesh.userData.targetPosition = new THREE.Vector3(targetX, targetY, targetZ);
    mesh.userData.targetRotationY = targetRotY;
    mesh.userData.targetRotationZ = targetRotZ;
    mesh.userData.targetScale = new THREE.Vector3(targetScale.x, targetScale.y, targetScale.z);

    if (shouldAnimate) {
      let delayVal = i * 0.006;
      let durationVal: number = SPATIAL_DURATION.layout;
      let easeCurve: string = SPATIAL_EASE.layout;

      if (mode === 'grid') {
        delayVal = 0;
        durationVal = SPATIAL_DURATION.filter;
        easeCurve = SPATIAL_EASE.response;
      } else if (mode === 'map') {
        const dist = Math.sqrt(targetX * targetX + targetY * targetY);
        delayVal = dist * 0.015;
        durationVal = SPATIAL_DURATION.mapLayout;
        easeCurve = SPATIAL_EASE.map;
      }

      gsap.killTweensOf(mesh.position);
      gsap.killTweensOf(mesh.rotation);
      gsap.killTweensOf(mesh.scale);
      gsap.killTweensOf(material.uniforms.uModeVisibility);
      gsap.killTweensOf(material.uniforms.uSearchHighlight);

      gsap.to(mesh.position, { x: targetX, y: targetY, z: targetZ, duration: durationVal, ease: easeCurve, delay: delayVal });
      gsap.to(mesh.rotation, { y: targetRotY, z: targetRotZ, duration: durationVal, ease: easeCurve, delay: delayVal });
      
      if (mode === 'grid') {
        mesh.scale.set(targetScale.x, targetScale.y, targetScale.z);
      } else {
        gsap.to(mesh.scale, { ...targetScale, duration: durationVal, ease: easeCurve, delay: delayVal });
      }
      let targetOpacity = isVisible ? 1.0 : 0.0;
      let targetHighlight = 1.0;
      if (mode === 'grid' && isVisible) {
        if (this.indexFilters.viewMode === 'text') {
          targetOpacity = 0.0;
        } else if (this.indexFilters.viewMode === 'hybrid') {
          targetOpacity = 1.0;
          targetHighlight = 0.35;
        }
      }

      gsap.to(material.uniforms.uModeVisibility, { value: targetOpacity, duration: SPATIAL_DURATION.visibility, ease: SPATIAL_EASE.settle, delay: delayVal * 0.5 });
      gsap.to(material.uniforms.uSearchHighlight, { value: targetHighlight, duration: SPATIAL_DURATION.filter, ease: SPATIAL_EASE.settle, delay: delayVal });
    } else {
      mesh.position.set(targetX, targetY, targetZ);
      mesh.rotation.y = targetRotY;
      mesh.rotation.z = targetRotZ;
      mesh.scale.set(targetScale.x, targetScale.y, targetScale.z);
      
      let targetOpacity = isVisible ? 1.0 : 0.0;
      let targetHighlight = 1.0;
      if (mode === 'grid' && isVisible) {
        if (this.indexFilters.viewMode === 'text') {
          targetOpacity = 0.0;
        } else if (this.indexFilters.viewMode === 'hybrid') {
          targetOpacity = 1.0;
          targetHighlight = 0.35;
        }
      }
      material.uniforms.uModeVisibility.value = targetOpacity;
      material.uniforms.uSearchHighlight.value = targetHighlight;
    }
  }

  private scheduleRelayout() {
    if (this.relayoutTimer !== null) window.clearTimeout(this.relayoutTimer);

    this.relayoutTimer = window.setTimeout(() => {
      this.relayoutTimer = null;
      this.meshes.forEach((mesh) => this.setNodePosition(mesh, this.getModeIndex(mesh, this.activeMode), this.activeMode, true));
    }, 80);
  }

  private getNodeScale(mesh: THREE.Mesh, multiplier = 1, mode = this.activeMode): { x: number; y: number; z: number } {
    const planeAspect = 6 / 4;
    const imageAspect = mesh.userData?.imageAspect || planeAspect;

    if (mode === 'horizontal') {
      const heightScale = 2.8 * multiplier;
      const widthScale = Math.min(heightScale * (imageAspect / planeAspect), this.getMaxImageWidth(mode) / 6);

      return {
        x: widthScale,
        y: heightScale,
        z: heightScale,
      };
    }

    if (mode === 'vertical') {
      const fixedWidthScale = 1.08 * multiplier;
      const heightScale = fixedWidthScale * (planeAspect / imageAspect);

      return {
        x: fixedWidthScale,
        y: heightScale,
        z: fixedWidthScale,
      };
    }

    let tierScale = this.getTierScale(mesh.userData?.tier, mode) * multiplier;
    const maxWidth = this.getMaxImageWidth(mode);
    const projectedWidth = 6 * tierScale * (imageAspect / planeAspect);

    if (projectedWidth > maxWidth) {
      tierScale *= maxWidth / projectedWidth;
    }

    return {
      x: tierScale * (imageAspect / planeAspect),
      y: tierScale,
      z: tierScale,
    };
  }

  private getRailHeightScale(mesh: THREE.Mesh): number {
    const layout = mesh.userData?.assetLayout;
    const role = mesh.userData?.assetRole;
    const emphasis = mesh.userData?.assetEmphasis;
    const slideType = mesh.userData?.assetType;

    if (slideType === 'text') return emphasis === 'primary' ? 1.18 : 1.08;
    if (slideType === 'video' || slideType === 'audio') return 1.12;
    if (layout === 'hero' || role === 'hero') return 1.24;
    if (layout === 'portrait') return 1.14;
    if (layout === 'diagram') return emphasis === 'primary' ? 1.1 : 1.02;
    if (layout === 'compact') return 0.92;
    if (emphasis === 'quiet') return 0.96;
    return 1.06;
  }

  private applyNodeScale(mesh: THREE.Mesh, multiplier = 1) {
    const scale = this.getNodeScale(mesh, multiplier, this.activeMode);
    gsap.to(mesh.scale, {
      x: scale.x,
      y: scale.y,
      z: scale.z,
      duration: 0.5,
      ease: 'power2.out',
    });
  }

  private getTierScale(tier?: string, mode = this.activeMode): number {
    const modeScale: Record<string, Record<string, number>> = {
      cylinder: { lead: 2.05, secondary: 1.54, archive: 1.16 },
      grid: { lead: 0.90, secondary: 0.72, archive: 0.55 },
      vertical: { lead: 1.02, secondary: 0.74, archive: 0.56 },
      horizontal: { lead: 1.06, secondary: 0.78, archive: 0.58 },
      map: { lead: 0.5, secondary: 0.38, archive: 0.28 },
    };

    return modeScale[mode]?.[tier || 'archive'] || 0.58;
  }

  private getMaxImageWidth(mode = this.activeMode): number {
    if (mode === 'cylinder') return 18;
    if (mode === 'grid') return 15.0;
    if (mode === 'horizontal') return 22.0;
    if (mode === 'vertical') return 8.5;
    if (mode === 'map') return 3.8;
    return 9.5;
  }

  private getNodeSize(mesh: THREE.Mesh, mode = this.activeMode): { width: number; height: number } {
    const scale = this.getNodeScale(mesh, 1, mode);

    return {
      width: 6 * scale.x,
      height: 4 * scale.y,
    };
  }

  private getLinearGap(mode: string): number {
    if (mode === 'horizontal') return 0.92;
    if (mode === 'vertical') return 0.48;
    return 0;
  }

  private getHorizontalBaseZ(mesh: THREE.Mesh, index: number): number {
    const slideType = mesh.userData?.assetType;
    const typeLift = slideType === 'text' ? 0.08 : slideType === 'video' || slideType === 'audio' ? 0.04 : 0;
    return typeLift;
  }

  private getHorizontalFocusX(): number {
    return 0;
  }

  private getHorizontalPerspective(mesh: THREE.Mesh, index: number, worldX: number) {
    const scale = 1;
    const targetY = 0;
    const targetZ = this.getHorizontalBaseZ(mesh, index);
    const targetRotY = 0;
    const targetRotZ = 0;
    const progress = 1 - THREE.MathUtils.clamp(Math.abs(worldX) / 18, 0, 1);

    return { scale, targetY, targetZ, targetRotY, targetRotZ, progress };
  }

  private wrapHorizontalWorldX(baseX: number, scrollOffset: number, totalSpan: number) {
    if (totalSpan <= 0) return baseX + scrollOffset;

    const entryX = 0;
    const worldX = baseX + scrollOffset;
    const wrapped = ((worldX - entryX) % totalSpan + totalSpan) % totalSpan + entryX;
    return wrapped > totalSpan / 2 ? wrapped - totalSpan : wrapped;
  }

  private getLinearSpan(mode: string): number {
    const gap = this.getLinearGap(mode);
    const visibleMeshes = this.getVisibleMeshes(mode);

    return visibleMeshes.reduce((span, mesh, index) => {
      const size = this.getNodeSize(mesh, mode);
      const length = mode === 'horizontal' ? size.width : size.height;
      return span + length + (index > 0 ? gap : 0);
    }, 0);
  }

  private getHorizontalLoopSpan(): number {
    return getClosedRailSpan(
      this.getLinearSpan('horizontal'),
      this.getLinearGap('horizontal'),
    );
  }

  private getAtlasPosition(mesh: THREE.Mesh) {
    const domains = mesh.userData.domains || [];
    const primaryDomain = domains[0] || 'systems';
    const domainOrder = ['sound', 'image', 'space', 'code', 'systems', 'text'];
    const domainIndex = Math.max(0, domainOrder.indexOf(primaryDomain));
    const order = mesh.userData.projectOrder || 0;
    const tierRadius = mesh.userData.tier === 'lead' ? 10 : mesh.userData.tier === 'secondary' ? 16 : 22;
    const angle = (domainIndex / domainOrder.length) * Math.PI * 2 + (order % 9) * 0.075;
    const jitter = ((order * 17) % 11 - 5) * 0.34;

    return {
      x: Math.cos(angle) * (tierRadius + jitter),
      y: Math.sin(angle) * (tierRadius + jitter) * 0.72 + ((order % 5) - 2) * 0.55,
      z: -Math.min(8, order * 0.018),
    };
  }

  private getLinearPosition(index: number, mode: string): number {
    const gap = this.getLinearGap(mode);
    const totalSpan = this.getLinearSpan(mode);
    let cursor = -totalSpan / 2;
    const visibleMeshes = this.getVisibleMeshes(mode);

    if (!Number.isInteger(index) || index < 0 || index >= visibleMeshes.length) {
      return 0;
    }

    for (let i = 0; i < index; i += 1) {
      const size = this.getNodeSize(visibleMeshes[i], mode);
      cursor += (mode === 'horizontal' ? size.width : size.height) + gap;
    }

    const currentSize = this.getNodeSize(visibleMeshes[index], mode);
    const currentLength = mode === 'horizontal' ? currentSize.width : currentSize.height;
    const position = cursor + currentLength / 2;

    return mode === 'horizontal' ? position : -position;
  }

  private getGridRows(): number {
    return Math.ceil(this.getGridSlot(this.getVisibleMeshes('grid').length - 1) / 9) + 1;
  }

  private getGridSlot(index: number): number {
    const slots = this.getGridSlots();
    if (!slots.length || index <= 0) return 0;
    return slots[Math.min(index, slots.length - 1)];
  }

  private getGridSlots(): number[] {
    if (this.gridSlotCache) return this.gridSlotCache;

    const visible = this.getVisibleMeshes('grid');
    const slots: number[] = [];
    let slot = 0;
    let lastWorld = visible.length ? getProjectWorld(visible[0].userData.slug)?.id || '' : '';

    // Apply gap for the first slot if needed
    while (this.isGridGapSlot(slot)) {
      slot += 1;
    }

    visible.forEach((mesh, i) => {
      if (i > 0) {
        const world = getProjectWorld(mesh.userData.slug)?.id || '';

        slot += 1;

        // Grouping behavior: if sorted by world and world changes, force new row (multiple of 9 columns)
        if (this.indexFilters.sort === 'world' && world !== lastWorld) {
          const currentCol = slot % 9;
          if (currentCol !== 0) {
            slot += (9 - currentCol);
          }
          lastWorld = world;
        }

        // Apply organic gaps
        while (this.isGridGapSlot(slot)) {
          slot += 1;
        }
      }

      slots.push(slot);
    });

    this.gridSlotCache = slots;
    return slots;
  }

  private isGridGapSlot(slot: number): boolean {
    const col = slot % 9;
    const row = Math.floor(slot / 9);
    return (row % 4 === 1 && col === 2) ||
      (row % 5 === 2 && col === 6) ||
      (row % 6 === 4 && col === 0) ||
      (row % 7 === 3 && col === 4);
  }

  private getGridOffset(slot: number, axis: 'x' | 'y' | 'z'): number {
    const row = Math.floor(slot / 9);
    const col = slot % 9;
    const seed = (row * 13 + col * 7) % 9;

    if (axis === 'x') return (seed - 4) * 0.18;
    if (axis === 'y') return ((seed * 2) % 7 - 3) * 0.14;
    return -((seed % 3) * 0.35);
  }

  public setLayoutMode(mode: string) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.activeMode = mode;
    this.hasProjectedPositions = false;
    this.invalidateVisibleMeshCache();
    this.meshes.forEach((mesh) => {
      this.setNodePosition(mesh, this.getModeIndex(mesh, mode), mode);
      const mat = mesh.material as THREE.ShaderMaterial;
      if (mat.uniforms.uIsHorizontalMode) {
        mat.uniforms.uIsHorizontalMode.value = (mode === 'horizontal') ? 1.0 : 0.0;
      }
    });
    this.updateNodeHighlights();
    this.updateRelationLines(true);
    this.updateCylinderGuideLines(true);

    const isMapMode = mode === 'map';
    this.zoneMeshes.forEach((mesh) => {
      mesh.visible = isMapMode;
      if (isMapMode) {
        const mat = mesh.material as THREE.MeshBasicMaterial;
        const edgeLine = mesh.children[0] as THREE.LineSegments;
        const edgeMat = edgeLine.material as THREE.LineBasicMaterial;
        if (prefersReducedMotion) {
          mat.opacity = 0.06;
          edgeMat.opacity = 0.32;
        } else {
          mat.opacity = 0;
          edgeMat.opacity = 0;
          gsap.to(mat, { opacity: 0.06, duration: 1.0, ease: 'power2.inOut' });
          gsap.to(edgeMat, { opacity: 0.32, duration: 1.0, ease: 'power2.inOut' });
        }
      }
    });

    if (mode === 'horizontal') {
      this.emitRailState();
    } else {
      this.emitRailState(null);
    }
    if (mode !== 'horizontal') {
      this.resetCamera();
    }
    if (mode !== 'map') {
      if (prefersReducedMotion) {
        this.group.rotation.set(0, 0, this.group.rotation.z);
      } else {
        gsap.to(this.group.rotation, { x: 0, y: 0, duration: 1.2, ease: 'expo.inOut' });
      }
    }
  }

  public getActiveMode() {
    return this.activeMode;
  }

  public getLoopPeriod(): number {
    const TOTAL = this.getVisibleMeshes(this.activeMode).length;
    if (this.activeMode === 'horizontal') {
      return this.getHorizontalLoopSpan() / 8;
    } else if (this.activeMode === 'vertical') {
      return this.getLinearSpan('vertical') / 8;
    } else if (this.activeMode === 'grid') {
      const rows = this.getGridRows();
      return (rows * 7) / 6;
    } else if (this.activeMode === 'map') {
      return 1;
    }
    return 1; // Default
  }

  public update(scrollX: number, scrollY: number, zoom = 1.0) {
    // Determine the extent of layout to create scroll bounds if desired
    // For now we just endlessly scroll. We'll use a modulo or clamp if needed.
    
    if (this.activeMode === 'cylinder') {
      this.group.rotation.y = scrollY * 0.6;
      // Camera tracks the spiral's larger vertical pitch.
      this.group.position.y = (9 / (2 * Math.PI)) * this.group.rotation.y;
      this.group.position.x = 0;
      this.updateRelationLines();
      this.updateCylinderGuideLines();
      this.emitRailState(null);
    } else if (this.activeMode === 'vertical') {
      this.group.rotation.y = 0;
      this.group.position.y = scrollY * 8;
      this.group.position.x = 0;
      
      // Wrap children for infinite scroll
      const totalHeight = this.getLinearSpan('vertical');
      const visible = this.getVisibleMeshes('vertical');
      let closestNode: any = null;
      let minDistance = Infinity;

      visible.forEach((mesh) => {
        // Calculate world Y. If it's too far from camera, offset it.
        const worldY = mesh.position.y + this.group.position.y;
        const wrappedY = ((worldY + totalHeight / 2) % totalHeight + totalHeight) % totalHeight - totalHeight / 2;
        mesh.position.y = wrappedY - this.group.position.y;

        const distance = Math.abs(wrappedY);
        if (distance < minDistance) {
          minDistance = distance;
          closestNode = mesh.userData;
        }
      });

      if (closestNode && this.lastCenteredNodeId !== closestNode.id) {
        this.lastCenteredNodeId = closestNode.id;
        this.options.onCenteredNodeChange?.(closestNode);
      }

      this.updateRelationLines();
      this.updateCylinderGuideLines();
      this.emitRailState(null);
    } else if (this.activeMode === 'horizontal') {
      this.group.rotation.y = 0;
      this.group.position.y = 0;
      this.group.position.x = scrollY * -8; // Keep Y scroll mapping for horizontal as primary navigation
      const railMeshes = this.getVisibleMeshes('horizontal');
      const totalSpan = this.getHorizontalLoopSpan();

      railMeshes.forEach((mesh, index) => {
        const baseX = this.getLinearPosition(index, 'horizontal');
        const worldX = this.wrapHorizontalWorldX(baseX, this.group.position.x, totalSpan);
        const perspective = this.getHorizontalPerspective(mesh, index, worldX);
        const baseScale = this.getNodeScale(mesh, 1, 'horizontal');
        mesh.position.x = worldX - this.group.position.x;
        mesh.rotation.y += (perspective.targetRotY - mesh.rotation.y) * 0.08;
        mesh.rotation.z += (perspective.targetRotZ - mesh.rotation.z) * 0.08;
        mesh.position.y += (perspective.targetY - mesh.position.y) * 0.08;
        mesh.position.z += (perspective.targetZ - mesh.position.z) * 0.08;
        mesh.scale.x += (baseScale.x * perspective.scale - mesh.scale.x) * 0.08;
        mesh.scale.y += (baseScale.y * perspective.scale - mesh.scale.y) * 0.08;
        mesh.scale.z += (baseScale.z * perspective.scale - mesh.scale.z) * 0.08;
      });
      this.updateRelationLines();
      this.updateCylinderGuideLines();
      this.emitRailState();
    } else if (this.activeMode === 'grid') {
      this.group.rotation.y = 0;
      this.group.position.y = scrollY * 6;
      this.group.position.x = scrollX * -8;

      const cols = 9;
      const rows = this.getGridRows();
      const spanX = cols * 7.4;
      const spanY = rows * 5.9;

      const visible = this.getVisibleMeshes('grid');
      visible.forEach((mesh, index) => {
        const slot = this.getGridSlot(index);
        const col = slot % cols;
        const row = Math.floor(slot / cols);
        
        const baseX = (col - (cols - 1) / 2) * 7.4 + this.getGridOffset(slot, 'x');
        const baseY = (row - Math.floor(rows / 2)) * -5.9 + this.getGridOffset(slot, 'y');

        const worldX = baseX + this.group.position.x;
        const worldY = baseY + this.group.position.y;

        const wrappedX = ((worldX + spanX / 2) % spanX + spanX) % spanX - spanX / 2;
        const wrappedY = ((worldY + spanY / 2) % spanY + spanY) % spanY - spanY / 2;

        mesh.position.x = wrappedX - this.group.position.x;
        mesh.position.y = wrappedY - this.group.position.y;
        mesh.position.z = this.getGridOffset(slot, 'z');
      });

      // Smoothly update camera Z based on fixed close-up zoom
      const targetZ = 17.5;
      this.camera.position.z += (targetZ - this.camera.position.z) * 0.08;

      // Calculate projected 2D screen positions for all visible cards in grid mode
      const hasMoved = Math.abs(scrollX - this.lastProjScrollX) > 0.0005 || Math.abs(scrollY - this.lastProjScrollY) > 0.0005;
      const needsProject = !this.hasProjectedPositions || hasMoved || this.lastProjWidth !== window.innerWidth || this.lastProjHeight !== window.innerHeight;

      if (this.options.onUpdateProjectedPositions && needsProject) {
        this.hasProjectedPositions = true;
        this.lastProjWidth = window.innerWidth;
        this.lastProjHeight = window.innerHeight;
        this.lastProjScrollX = scrollX;
        this.lastProjScrollY = scrollY;
        const positions: Record<string, { x: number, y: number, w: number, h: number }> = {};
        const tl = new THREE.Vector3();
        const br = new THREE.Vector3();
        
        visible.forEach((mesh) => {
          const key = mesh.userData.assetId || mesh.userData.id || mesh.userData.slug;
          if (!key) return;

          tl.set(-3, 2, 0);
          mesh.localToWorld(tl);
          tl.project(this.camera);

          br.set(3, -2, 0);
          mesh.localToWorld(br);
          br.project(this.camera);

          positions[key] = {
            x: (tl.x * 0.5 + 0.5) * window.innerWidth,
            y: (-tl.y * 0.5 + 0.5) * window.innerHeight,
            w: Math.abs((br.x - tl.x) * 0.5 * window.innerWidth),
            h: Math.abs((br.y - tl.y) * 0.5 * window.innerHeight)
          };
        });
        this.options.onUpdateProjectedPositions(positions);
      }

      this.updateRelationLines();
      this.updateCylinderGuideLines();
      this.emitRailState(null);
    } else if (this.activeMode === 'map') {
      const time = performance.now() / 1000;
      let driftX = 0;
      let driftY = 0;

      // Map connection detour drift near NO_DATA_ZONES
      this.zoneMeshes.forEach((zoneMesh) => {
        const zone = zoneMesh.userData;
        const zoneAngleY = Math.atan2(zone.x, 25);
        const zoneAngleX = Math.atan2(zone.y, 25);
        const diffY = Math.sin(scrollX * 0.8 - zoneAngleY);
        const diffX = Math.sin(scrollY * 0.8 - zoneAngleX);
        if (Math.abs(diffY) < 0.35 && Math.abs(diffX) < 0.35) {
          const intensity = (0.35 - Math.abs(diffY)) * (0.35 - Math.abs(diffX)) * 8.0;
          driftX += Math.sin(time * 5.0) * 0.025 * intensity;
          driftY += Math.cos(time * 4.5) * 0.025 * intensity;
        }
      });

      this.group.rotation.y = scrollX * 0.8 + driftX;
      this.group.rotation.x = scrollY * 0.8 + driftY;
      this.group.position.x = 0;
      this.group.position.y = 0;
      this.group.position.z = 0;

      if (this.focusedNodeId) {
        const mesh = this.meshes.find(m => m.userData.slug === this.focusedNodeId);
        if (mesh) {
          const worldPos = new THREE.Vector3();
          mesh.getWorldPosition(worldPos);
          const targetCamPos = worldPos.clone().add(new THREE.Vector3(0, 0, 5.5));
          this.camera.position.lerp(targetCamPos, 0.08);
          this.camera.lookAt(worldPos);
        }
      } else {
        const targetZ = Math.max(10, Math.min(80, 25 * zoom));
        this.camera.position.z += (targetZ - this.camera.position.z) * 0.08;
        this.camera.position.x += (0 - this.camera.position.x) * 0.08;
        this.camera.position.y += (0 - this.camera.position.y) * 0.08;
        this.camera.lookAt(0, 0, 0);
      }

      this.updateRelationLines();
      this.updateCylinderGuideLines();
      this.emitRailState(null);
    }
  }

  public renderUpdate(time: number, velocity: number) {
    const now = performance.now() / 1000;
    const dt = Math.min(0.1, now - this.lastRenderTime);
    this.lastRenderTime = now;

    // Enforce idempotency: if active mode is map/cylinder, but meshes are off-target and not currently tweening
    if (this.activeMode === 'map' || this.activeMode === 'cylinder') {
      const snapLerp = 1 - Math.exp(-5.0 * dt); // ~0.08 at 60Hz
      this.meshes.forEach((mesh) => {
        if (mesh.userData.targetMode === this.activeMode && mesh.userData.targetPosition) {
          const targetPos = mesh.userData.targetPosition as THREE.Vector3;
          if (mesh.position.distanceTo(targetPos) > 0.01) {
            if (!gsap.isTweening(mesh.position)) {
              mesh.position.lerp(targetPos, snapLerp);
              mesh.rotation.y += (mesh.userData.targetRotationY - mesh.rotation.y) * snapLerp;
              mesh.rotation.z += (mesh.userData.targetRotationZ - mesh.rotation.z) * snapLerp;
              if (mesh.userData.targetScale) {
                mesh.scale.lerp(mesh.userData.targetScale, snapLerp);
              }
            }
          }
        }
      });
    }

    let activeRailIndex = -1;
    const railMeshes = this.activeMode === 'horizontal' ? this.getProjectRailMeshes() : [];
    if (this.activeMode === 'horizontal') {
      let activeDistance = Infinity;
      railMeshes.forEach((mesh, index) => {
        const worldX = mesh.position.x + this.group.position.x;
        const perspective = this.getHorizontalPerspective(mesh, index, worldX);
        const distance = Math.abs(worldX - this.getHorizontalFocusX()) - perspective.progress * 0.9;
        if (distance < activeDistance) {
          activeDistance = distance;
          activeRailIndex = index;
        }
      });
    }

    const activeSlug = this.hoveredMesh ? this.hoveredMesh.userData.slug : null;
    const focusSlug = this.focusedNodeId;

    const firstDegree = new Set<string>();
    const secondDegree = new Set<string>();

    if (focusSlug) {
      const focusMesh = this.primaryMeshBySlug.get(focusSlug);
      if (focusMesh) {
        this.getRelatedSlugs(focusMesh.userData).forEach((s: string) => firstDegree.add(s));
      }

      this.meshes.forEach((m) => {
        if (this.getRelatedSlugs(m.userData).includes(focusSlug)) {
          firstDegree.add(m.userData.slug);
        }
      });

      firstDegree.forEach((neighborSlug) => {
        const neighborMesh = this.primaryMeshBySlug.get(neighborSlug);
        if (neighborMesh) {
          this.getRelatedSlugs(neighborMesh.userData).forEach((s: string) => {
            if (s !== focusSlug && !firstDegree.has(s)) {
              secondDegree.add(s);
            }
          });
        }
        this.meshes.forEach((m) => {
          if (m.userData.slug !== focusSlug && !firstDegree.has(m.userData.slug)) {
            if (this.getRelatedSlugs(m.userData).includes(neighborSlug)) {
              secondDegree.add(m.userData.slug);
            }
          }
        });
      });
    }

    const hoverNeighbors = new Set<string>();
    if (!focusSlug && activeSlug) {
      const hoverMesh = this.primaryMeshBySlug.get(activeSlug);
      if (hoverMesh) {
        this.getRelatedSlugs(hoverMesh.userData).forEach((s: string) => hoverNeighbors.add(s));
      }
      this.meshes.forEach((m) => {
        if (this.getRelatedSlugs(m.userData).includes(activeSlug)) {
          hoverNeighbors.add(m.userData.slug);
        }
      });
    }
    
    const lerpFactorHover = 1 - Math.exp(-7.6 * dt);

    this.meshes.forEach((mesh) => {
      const mat = mesh.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = time;
      mat.uniforms.uVelocity.value = Math.abs(velocity);

      let targetHover = 0.0;
      if (this.activeMode === 'horizontal') {
        const meshIndexInRail = railMeshes.indexOf(mesh);
        const isActive = meshIndexInRail !== -1 && meshIndexInRail === activeRailIndex;
        const isHovered = this.hoveredMesh === mesh;
        targetHover = (isActive || isHovered) ? 1.0 : 0.0;
      } else {
        targetHover = this.hoveredMesh === mesh ? 1.0 : 0.0;
      }

      if (mat.uniforms.uHover) {
        mat.uniforms.uHover.value += (targetHover - mat.uniforms.uHover.value) * lerpFactorHover;
      }

      if (this.activeMode === 'map') {
        mesh.quaternion.copy(this.group.quaternion).invert().multiply(this.camera.quaternion);

        const slug = mesh.userData.slug;

        let targetOpacity = 1.0;
        if (focusSlug) {
          if (slug === focusSlug) {
            targetOpacity = 1.0;
          } else if (firstDegree.has(slug)) {
            targetOpacity = 0.8;
          } else if (secondDegree.has(slug)) {
            targetOpacity = 0.35;
          } else {
            targetOpacity = 0.08;
          }
        } else if (activeSlug) {
          if (slug === activeSlug) {
            targetOpacity = 1.0;
          } else if (hoverNeighbors.has(slug)) {
            targetOpacity = 0.85;
          } else {
            targetOpacity = 0.45;
          }
        } else {
          targetOpacity = 1.0;
        }

        // Apply distance-based decay relative to NO_DATA_ZONES
        let decayFactor = 1.0;
        this.zoneMeshes.forEach((zoneMesh) => {
          const zone = zoneMesh.userData;
          const dx = mesh.position.x - zone.x;
          const dy = mesh.position.y - zone.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const activeRadius = zone.radius + 3.0; // Decay boundary extends 3 units beyond radius
          if (dist < activeRadius) {
            const pct = Math.max(0, dist - zone.radius) / 3.0; // 0 inside, 1 outside
            decayFactor = Math.min(decayFactor, pct);
          }
        });
        targetOpacity *= (0.05 + 0.95 * decayFactor); // Decay down to 5% opacity
        
        mat.uniforms.uModeVisibility.value += (targetOpacity - mat.uniforms.uModeVisibility.value) * 0.1;
      }
    });
    // ScrollEngine.update() already refreshes relation geometry and guide lines.
    // Repeating both here doubled the per-frame geometry and bounds work.
  }

  private updateCylinderGuideLines(animate = false) {
    const shouldShow = this.activeMode === 'cylinder';

    this.cylinderGuideLines.forEach((line) => {
      const material = line.material as THREE.LineBasicMaterial;
      const ringIndex = line.userData.ringIndex || 0;
      const center = (this.cylinderGuideLines.length - 1) / 2;
      const distanceFromCenter = Math.abs(ringIndex - center) / Math.max(1, center);
      const nextOpacity = shouldShow ? 0.032 + (1 - distanceFromCenter) * 0.026 : 0;

      if (animate) {
        gsap.to(material, { opacity: nextOpacity, duration: 0.85, ease: 'power2.inOut' });
      } else {
        material.opacity = nextOpacity;
      }
    });
  }

  private updateRelationLines(animate = false) {
    const activeSlug = this.hoveredMesh ? this.hoveredMesh.userData.slug : null;
    const focusSlug = this.focusedNodeId;

    this.relationLines.forEach((line) => {
      const source = this.primaryMeshBySlug.get(line.userData.sourceId);
      const target = this.primaryMeshBySlug.get(line.userData.targetId);
      const material = line.material as THREE.LineBasicMaterial;

      if (!source || !target) return;

      const posAttr = line.geometry.attributes.position;
      if (posAttr) {
        const arr = posAttr.array as Float32Array;
        arr[0] = source.position.x;
        arr[1] = source.position.y;
        arr[2] = source.position.z;
        arr[3] = target.position.x;
        arr[4] = target.position.y;
        arr[5] = target.position.z;
        posAttr.needsUpdate = true;
        line.geometry.computeBoundingBox();
        line.geometry.computeBoundingSphere();
        if (line.userData.isDashed) {
          line.computeLineDistances();
        }
      }

      let targetOpacity = 0;
      if (this.activeMode === 'map') {
        const weight = line.userData.weight || 1;
        if (focusSlug) {
          const isConnectedToFocus = line.userData.sourceId === focusSlug || line.userData.targetId === focusSlug;
          if (isConnectedToFocus) {
            targetOpacity = weight === 3 ? 0.9 : (weight === 2 ? 0.6 : 0.3);
          } else {
            targetOpacity = 0.01;
          }
        } else if (activeSlug) {
          const isConnectedToHover = line.userData.sourceId === activeSlug || line.userData.targetId === activeSlug;
          if (isConnectedToHover) {
            targetOpacity = weight === 3 ? 0.75 : (weight === 2 ? 0.45 : 0.2);
          } else {
            targetOpacity = weight === 3 ? 0.08 : (weight === 2 ? 0.04 : 0.02);
          }
        } else {
          targetOpacity = weight === 3 ? 0.25 : (weight === 2 ? 0.12 : 0.04);
        }

        targetOpacity *= line.userData.opacityMultiplier ?? 1;
      }

      if (animate) {
        gsap.killTweensOf(material);
        gsap.to(material, { opacity: targetOpacity, duration: 0.65, ease: 'power2.inOut' });
      } else {
        const diff = targetOpacity - material.opacity;
        if (Math.abs(diff) > 0.001) {
          material.opacity += diff * 0.1;
        } else {
          material.opacity = targetOpacity;
        }
      }
    });
  }

  public getClosestRailSlideIndex(): number {
    const railMeshes = this.getProjectRailMeshes();
    if (!railMeshes.length) return 0;

    return findClosestRailIndex(railMeshes, (mesh, index) => {
      const worldX = mesh.position.x + this.group.position.x;
      const perspective = this.getHorizontalPerspective(mesh, index, worldX);
      return Math.abs(worldX - this.getHorizontalFocusX()) - perspective.progress * 0.9;
    });
  }

  private emitRailState(forcedState?: any) {
    if (forcedState === null) {
      if (this.lastRailStateKey) {
        this.lastRailStateKey = '';
        this.options.onRailChange?.(null);
      }
      return;
    }

    if (this.activeMode !== 'horizontal') return;

    const railMeshes = this.getProjectRailMeshes();
    if (!railMeshes.length) {
      this.emitRailState(null);
      return;
    }

    const activeIndex = this.getClosestRailSlideIndex();

    const mesh = railMeshes[activeIndex];
    const state = {
      index: activeIndex,
      total: railMeshes.length,
      projectId: mesh.userData.projectId,
      image: {
        id: mesh.userData.assetId,
        type: mesh.userData.assetType || 'image',
        src: mesh.userData.assetSrc,
        poster: mesh.userData.assetPoster,
        youtubeId: mesh.userData.assetYoutubeId,
        embedUrl: mesh.userData.assetEmbedUrl,
        externalUrl: mesh.userData.assetExternalUrl,
        label: mesh.userData.assetLabel || mesh.userData.title,
        caption: mesh.userData.assetCaption || mesh.userData.summary,
        body: mesh.userData.assetBody,
        role: mesh.userData.assetRole || (activeIndex === 0 ? 'hero' : 'evidence'),
        layout: mesh.userData.assetLayout || (activeIndex === 0 ? 'hero' : 'wide'),
        emphasis: mesh.userData.assetEmphasis || (activeIndex === 0 ? 'primary' : 'secondary'),
        chapter: mesh.userData.assetChapter || (activeIndex === 0 ? 'Thesis' : 'Evidence'),
        beat: mesh.userData.assetBeat || mesh.userData.assetCaption || mesh.userData.summary,
        relatedSlugs: mesh.userData.assetRelatedSlugs || mesh.userData.relatedSlugs || mesh.userData.connections || [],
      },
    };
    const key = `${state.projectId}:${state.index}:${state.total}:${state.image.id}`;

    if (key !== this.lastRailStateKey) {
      this.lastRailStateKey = key;
      this.options.onRailChange?.(state);
    }
  }

  private applyHover(mesh: THREE.Mesh | null, pos: { x: number, y: number } | null = null) {
    if (this.hoveredMesh === mesh) return;

    const prevMesh = this.hoveredMesh;

    if (this.activeMode === 'grid' || this.activeMode === 'map') {
      const mode = this.activeMode;
      if (prevMesh && !prevMesh.userData.isNoDataZone) {
        const normalScale = this.getNodeScale(prevMesh, 1, mode);
        gsap.to(prevMesh.scale, {
          x: normalScale.x,
          y: normalScale.y,
          z: normalScale.z,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
      if (mesh && !mesh.userData.isNoDataZone) {
        const hoverScale = this.getNodeScale(mesh, 1.22, mode);
        gsap.to(mesh.scale, {
          x: hoverScale.x,
          y: hoverScale.y,
          z: hoverScale.z,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    }

    if (this.hoveredMesh && this.hoveredMesh.userData.isNoDataZone) {
      const prevZoneMesh = this.hoveredMesh;
      const mat = prevZoneMesh.material as THREE.MeshBasicMaterial;
      const edgeLine = prevZoneMesh.children[0] as THREE.LineSegments;
      const edgeMat = edgeLine.material as THREE.LineBasicMaterial;
      gsap.to(mat, { opacity: 0.06, duration: 0.25 });
      gsap.to(edgeMat, { opacity: 0.32, duration: 0.25 });
    }

    this.hoveredMesh = mesh;

    if (mesh && mesh.userData.isNoDataZone) {
      const mat = mesh.material as THREE.MeshBasicMaterial;
      const edgeLine = mesh.children[0] as THREE.LineSegments;
      const edgeMat = edgeLine.material as THREE.LineBasicMaterial;
      gsap.to(mat, { opacity: 0.22, duration: 0.25 });
      gsap.to(edgeMat, { opacity: 0.85, duration: 0.25 });
    }

    if (mesh) {
      mesh.userData.gridX = mesh.position.x;
      mesh.userData.gridY = mesh.position.y;

      let hoverPos = pos;
      if (this.activeMode === 'grid') {
        const vec = new THREE.Vector3(3, 2, 0);
        mesh.localToWorld(vec);
        vec.project(this.camera);
        hoverPos = {
          x: (vec.x * 0.5 + 0.5) * window.innerWidth,
          y: (-vec.y * 0.5 + 0.5) * window.innerHeight
        };
      }
      this.options.onNodeHover?.(mesh.userData, hoverPos);
      if (mesh.userData.isNoDataZone) {
        document.body.style.cursor = 'crosshair';
      } else {
        document.body.style.cursor = this.options.canUseSceneClicks?.() === false ? 'default' : 'pointer';
        if (mesh.userData.projectId) {
          this.loadProjectTextures(mesh.userData.projectId);
        }
      }
    } else {
      this.options.onNodeHover?.(null, null);
      document.body.style.cursor = 'default';
    }
  }

  private onMouseMove = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('[data-ui-layer="true"]')) {
      this.applyHover(null);
      return;
    }

    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    let targetMeshes = [...this.getVisibleMeshes()];
    if (this.activeMode === 'map') {
      targetMeshes = [...targetMeshes, ...this.zoneMeshes];
    }
    const intersects = this.raycaster.intersectObjects(targetMeshes);

    if (intersects.length > 0) {
      let intersected: THREE.Object3D | null = intersects[0].object;
      while (intersected && !intersected.userData.id && !intersected.userData.zoneId && intersected.parent) {
        intersected = intersected.parent;
      }
      if (intersected && (intersected.userData.id || intersected.userData.zoneId)) {
        this.applyHover(intersected as THREE.Mesh, { x: e.clientX, y: e.clientY });
      } else {
        this.applyHover(null);
      }
    } else {
      this.applyHover(null);
    }
  };

  public setFocusedNode(index: number | null) {
    const primaryMeshes = this.getPrimaryMeshes();
    if (index === null || index < 0 || index >= primaryMeshes.length) {
      this.applyHover(null);
      return;
    }

    const mesh = primaryMeshes[index];
    
    // For keyboard navigation, we don't have a mouse position for the tooltip,
    // so we might want to project the mesh position to screen space or just 
    // center it. Let's send a null position and App.tsx can handle a "default" tooltip spot.
    this.applyHover(mesh, null);
  }

  public getScrollForNode(index: number, mode: string): number {
    const primaryMeshes = this.getPrimaryMeshes();
    const visibleMeshes = this.getVisibleMeshes(mode);
    const visibleIndex = resolveVisibleIndex(primaryMeshes, visibleMeshes, index);

    if (mode === 'cylinder') {
      if (visibleIndex < 0) return 0;
      const TOTAL = visibleMeshes.length || 1;
      const nodesPerRing = 8;
      const REVOLUTIONS = Math.max(1, Math.ceil(TOTAL / nodesPerRing));
      const y_node = (visibleIndex / TOTAL) * REVOLUTIONS * -9 + (REVOLUTIONS * 9) / 2;
      return -y_node / ((9 / (2 * Math.PI)) * 0.6);
    } else if (mode === 'vertical') {
      if (visibleIndex < 0) return 0;
      return -this.getLinearPosition(visibleIndex, 'vertical') / 8;
    } else if (mode === 'horizontal') {
      const targetMesh = primaryMeshes[index];
      if (!targetMesh) return 0;
      const railIndex = visibleMeshes.findIndex((mesh) => mesh.userData.projectId === targetMesh.userData.slug);
      if (railIndex < 0) return 0;
      return (this.getLinearPosition(railIndex, 'horizontal') - this.getHorizontalFocusX()) / 8;
    } else if (mode === 'grid') {
      if (visibleIndex < 0) return 0;
      const cols = 9;
      const row = Math.floor(this.getGridSlot(visibleIndex) / cols);
      const rowOffset = Math.floor(this.getGridRows() / 2);
      return ((row - rowOffset) * 5.9) / 6;
    }
    return 0;
  }

  public getScrollForRailSlide(index: number, nearScrollY?: number): number {
    const railMeshes = this.getProjectRailMeshes();
    if (!railMeshes.length) return 0;
    const clampedIndex = Math.max(0, Math.min(index, railMeshes.length - 1));
    const baseScroll = (this.getLinearPosition(clampedIndex, 'horizontal') - this.getHorizontalFocusX()) / 8;

    if (typeof nearScrollY !== 'number') return baseScroll;

    const period = this.getHorizontalLoopSpan() / 8;
    if (!Number.isFinite(period) || period <= 0) return baseScroll;

    const loop = Math.round((nearScrollY - baseScroll) / period);
    return baseScroll + loop * period;
  }

  public getRailScrollBounds(): { min: number; max: number } {
    const railMeshes = this.getProjectRailMeshes();
    if (railMeshes.length <= 1) return { min: 0, max: 0 };

    return {
      min: this.getScrollForRailSlide(0),
      max: this.getScrollForRailSlide(railMeshes.length - 1),
    };
  }

  public getActiveRailIndex(): number {
    if (this.activeMode !== 'horizontal') return 0;
    return this.getClosestRailSlideIndex();
  }

  public focusNode(node: any) {
    const mesh = this.meshes.find(m => m.userData.id === node.id);
    if (!mesh) return;
    this.focusedNodeId = node.slug || node.projectId || null;
    if (this.focusedNodeId) {
      this.loadProjectTextures(this.focusedNodeId);
    }
    this.invalidateVisibleMeshCache();
    this.meshes.forEach((entry) => {
      this.setNodePosition(entry, this.getModeIndex(entry, this.activeMode), this.activeMode);
    });
    this.emitRailState();

    if (this.activeMode === 'grid' || this.activeMode === 'cylinder') {
      this.resetCamera();
      return;
    }

    if (this.activeMode === 'map') {
      this.updateNodeHighlights();
      this.updateRelationLines(true);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const focusScale = this.getNodeScale(mesh, 1.04, this.activeMode);

    if (prefersReducedMotion) {
      mesh.scale.set(focusScale.x, focusScale.y, focusScale.z);
      this.camera.position.set(0, 0, this.activeMode === 'horizontal' ? 18 : 25);
      this.camera.lookAt(0, 0, 0);
    } else {
      gsap.killTweensOf(this.camera.position);
      gsap.to(mesh.scale, {
        x: focusScale.x,
        y: focusScale.y,
        z: focusScale.z,
        duration: SPATIAL_DURATION.visibility,
        ease: SPATIAL_EASE.response,
      });

      gsap.to(this.camera.position, {
        x: 0,
        y: 0,
        z: this.activeMode === 'horizontal' ? 18 : 25,
        duration: SPATIAL_DURATION.camera,
        ease: SPATIAL_EASE.layout,
        onUpdate: () => {
          this.camera.lookAt(0, 0, 0);
        }
      });
    }
  }

  public focusNodeBySlug(slug: string) {
    const mesh = this.meshes.find(m => m.userData.slug === slug);
    if (mesh) {
      this.focusNode(mesh.userData);
    }
  }

  // Map nodes project to only a few pixels at mobile zoom, so when a direct
  // raycast misses, pick the nearest node within a screen-space radius.
  private findNearestMapNode(clientX: number, clientY: number, radius: number): THREE.Mesh | null {
    let best: THREE.Mesh | null = null;
    let bestDist = radius;
    const vec = new THREE.Vector3();
    this.getVisibleMeshes().forEach((mesh) => {
      if (!mesh.userData.id) return;
      vec.setFromMatrixPosition(mesh.matrixWorld).project(this.camera);
      if (vec.z > 1) return;
      const sx = (vec.x * 0.5 + 0.5) * window.innerWidth;
      const sy = (-vec.y * 0.5 + 0.5) * window.innerHeight;
      const dist = Math.hypot(sx - clientX, sy - clientY);
      if (dist < bestDist) {
        bestDist = dist;
        best = mesh;
      }
    });
    return best;
  }

  private pointerStart = { x: 0, y: 0 };

  private onPointerDown = (event: PointerEvent) => {
    this.pointerStart.x = event.clientX;
    this.pointerStart.y = event.clientY;
  };

  private onClick = (event: MouseEvent) => {
    const dx = event.clientX - this.pointerStart.x;
    const dy = event.clientY - this.pointerStart.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 6) return;

    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-ui-layer="true"]')) return;
    if (this.options.canUseSceneClicks?.() === false) return;

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.getVisibleMeshes());

    if (intersects.length > 0) {
      let intersected: THREE.Object3D | null = intersects[0].object;
      while (intersected && !intersected.userData.id && intersected.parent) {
        intersected = intersected.parent;
      }
      if (!intersected || !intersected.userData.id) {
        if (this.activeMode === 'map') {
          this.handleMapMiss(event);
        }
        return;
      }
      const mesh = intersected as THREE.Mesh;
      const node = mesh.userData;

      if (this.activeMode === 'grid') {
        this.options.onMediaOpen?.({
          ...node,
          type: node.assetType || 'image',
          label: node.assetLabel || node.title,
          caption: node.assetCaption || node.summary,
          chapter: node.assetChapter || 'Archive',
          role: node.assetRole || 'evidence',
          src: node.assetSrc || node.thumbnail || '',
          poster: node.assetPoster,
          youtubeId: node.assetYoutubeId,
          embedUrl: node.assetEmbedUrl,
          externalUrl: node.assetExternalUrl,
          body: node.assetBody,
          projectId: node.projectId || node.slug,
        });
        return;
      }

      if (node.assetType === 'video' || node.assetType === 'audio') {
        this.options.onMediaOpen?.({
          ...node,
          type: node.assetType,
          label: node.assetLabel || node.title,
          caption: node.assetCaption || node.summary,
          chapter: node.assetChapter,
          role: node.assetRole,
          src: node.assetSrc,
          poster: node.assetPoster,
          youtubeId: node.assetYoutubeId,
          embedUrl: node.assetEmbedUrl,
          externalUrl: node.assetExternalUrl,
        });
        return;
      }
      this.options.onNodeClick(node);
    } else {
      if (this.activeMode === 'map') {
        this.handleMapMiss(event);
      }
    }
  };

  private handleMapMiss(event: MouseEvent) {
    const radius = window.matchMedia('(pointer: coarse)').matches ? 44 : 8;
    const nearest = this.findNearestMapNode(event.clientX, event.clientY, radius);
    if (nearest) {
      this.options.onNodeClick(nearest.userData);
      return;
    }
    this.options.onCloseNode?.();
  }

  public setSearchQuery(query: string) {
    this.searchQueryString = query;
    this.updateNodeHighlights();
  }

  public setFilters(domain: string, type: string, world = 'all') {
    this.invalidateVisibleMeshCache();
    const activeDomain = domain.toLowerCase().trim();
    const activeType = type.toLowerCase().trim();
    const activeWorld = world.toLowerCase().trim();

    this.meshes.forEach((mesh) => {
      const data = mesh.userData;
      
      const nodeDomains = (data.domains?.length ? data.domains : [data.category])
        .filter(Boolean)
        .map((value: string) => value.toLowerCase());
      const domainMatch = activeDomain === 'all' || nodeDomains.includes(activeDomain);

      const nodeWorld = (data.world?.id || getProjectWorld(data.slug)?.id || '').toLowerCase();
      const worldMatch = activeWorld === 'all' || nodeWorld === activeWorld;

      const nodeType = (data.assetType || 'image').toLowerCase();
      const galleryTypes = (data.gallery || []).map((asset: any) => String(asset.type || 'image').toLowerCase());
      let typeMatch = false;
      if (activeType === 'all') {
        typeMatch = true;
      } else if (activeType === 'photo') {
        typeMatch = nodeType === 'image';
      } else if (activeType === 'video') {
        typeMatch = nodeType === 'video' || galleryTypes.includes('video');
      } else if (activeType === 'audio') {
        typeMatch = nodeType === 'audio' || galleryTypes.includes('audio');
      }

      const match = domainMatch && typeMatch && worldMatch;

      gsap.to((mesh.material as THREE.ShaderMaterial).uniforms.uSearchHighlight, {
        value: match ? 1.0 : 0.0,
        duration: 0.4,
        ease: 'power2.inOut'
      });
    });
  }

  public setIndexFilters(filters: IndexFilters) {
    this.indexFilters = filters;
    this.invalidateVisibleMeshCache();
    
    if (this.activeMode === 'grid') {
      this.meshes.forEach((mesh) => {
        const isVisible = this.isMeshVisibleInMode(mesh, 'grid');
        const mat = mesh.material as THREE.ShaderMaterial;
        
        if (!isVisible) {
          gsap.killTweensOf(mesh.position);
          gsap.killTweensOf(mesh.scale);
          gsap.killTweensOf(mat.uniforms.uModeVisibility);
          mesh.position.set(mesh.position.x, mesh.position.y, -70);
          mesh.scale.set(0.001, 0.001, 0.001);
          mat.uniforms.uModeVisibility.value = 0;
        } else {
          gsap.killTweensOf(mat.uniforms.uModeVisibility);
          gsap.killTweensOf(mat.uniforms.uSearchHighlight);
          
          if (filters.viewMode === 'text') {
            gsap.to(mat.uniforms.uModeVisibility, { value: 0.0, duration: 0.35, ease: 'power2.out' });
          } else if (filters.viewMode === 'hybrid') {
            gsap.to(mat.uniforms.uModeVisibility, { value: 1.0, duration: 0.35, ease: 'power2.out' });
            gsap.to(mat.uniforms.uSearchHighlight, { value: 0.35, duration: 0.35, ease: 'power2.out' });
          } else {
            gsap.to(mat.uniforms.uModeVisibility, { value: 1.0, duration: 0.35, ease: 'power2.out' });
            gsap.to(mat.uniforms.uSearchHighlight, { value: 1.0, duration: 0.35, ease: 'power2.out' });
          }
        }
      });
      this.scheduleRelayout();
    }
  }

  public setHoveredFilter(category: 'world' | 'medium' | 'assetType' | null, value: string | null) {
    this.meshes.forEach((mesh) => {
      const mat = mesh.material as THREE.ShaderMaterial;
      if (!category || !value) {
        gsap.to(mat.uniforms.uSearchHighlight, {
          value: 1.0,
          duration: 0.25,
          ease: 'power2.out'
        });
        return;
      }

      let match = false;
      if (category === 'world') {
        const world = getProjectWorld(mesh.userData.slug);
        match = value === 'all' || (world && world.id === value);
      } else if (category === 'medium') {
        const domains = mesh.userData.domains || [];
        const categoryVal = mesh.userData.category || '';
        match = value === 'all' || domains.includes(value) || categoryVal === value;
      } else if (category === 'assetType') {
        const type = (mesh.userData.assetType || '').toLowerCase();
        const role = (mesh.userData.assetRole || '').toLowerCase();
        if (value === 'video' || value === 'audio') {
          match = type === value;
        } else {
          match = value === 'all' || role === value;
        }
      }

      gsap.to(mat.uniforms.uSearchHighlight, {
        value: match ? 1.0 : 0.15,
        duration: 0.25,
        ease: 'power2.out'
      });
    });
  }

  public updateNodeHighlights() {
    const activeSlug = this.focusedNodeId;
    const q = this.searchQueryString ? this.searchQueryString.toLowerCase().trim() : '';

    this.meshes.forEach((mesh) => {
      const data = mesh.userData;
      let targetHighlight = 1.0;

      if (this.activeMode === 'map' && activeSlug) {
        // Relational map mode focused highlights: focused node + connected neighbors
        const isSelf = data.slug === activeSlug;
        const focusData = this.nodesData.find(n => n.slug === activeSlug);
        const isConnected =
          this.getRelatedSlugs(data).includes(activeSlug) ||
          (focusData ? this.getRelatedSlugs(focusData).includes(data.slug) : false);
        targetHighlight = (isSelf || isConnected) ? 1.0 : 0.15;
      } else if (q) {
        // Search query matching
        const match = 
          (data.title && data.title.toLowerCase().includes(q)) || 
          (data.tags && data.tags.some((t: string) => t.toLowerCase().includes(q))) ||
          (data.domains && data.domains.some((t: string) => t.toLowerCase().includes(q))) ||
          (data.stack && data.stack.some((t: string) => t.toLowerCase().includes(q))) ||
          (data.connections && data.connections.some((t: string) => t.toLowerCase().includes(q))) ||
          (data.relatedSlugs && data.relatedSlugs.some((t: string) => t.toLowerCase().includes(q))) ||
          (data.highlights && data.highlights.some((t: string) => t.toLowerCase().includes(q))) ||
          (data.summary && data.summary.toLowerCase().includes(q)) ||
          (data.thesis && data.thesis.toLowerCase().includes(q)) ||
          (data.assetLabel && data.assetLabel.toLowerCase().includes(q)) ||
          (data.assetCaption && data.assetCaption.toLowerCase().includes(q)) ||
          (data.assetChapter && data.assetChapter.toLowerCase().includes(q)) ||
          (data.category && data.category.toLowerCase().includes(q));
        
        targetHighlight = match ? 1.0 : 0.05;
      }

      if (mesh.material && (mesh.material as THREE.ShaderMaterial).uniforms?.uSearchHighlight) {
        gsap.to((mesh.material as THREE.ShaderMaterial).uniforms.uSearchHighlight, {
          value: targetHighlight,
          duration: 0.4,
          ease: 'power2.inOut'
        });
      }
    });
  }

  public resetFocus() {
    this.focusedNodeId = null;
    this.invalidateVisibleMeshCache();
    this.emitRailState(null);
    this.meshes.forEach((mesh) => {
      this.setNodePosition(mesh, this.getModeIndex(mesh, this.activeMode), this.activeMode);
    });
    this.updateNodeHighlights();
    this.updateRelationLines(true);
    if (this.activeMode !== 'map') {
      this.resetCamera();
    }
  }

  private resetCamera() {
    const isCylinder = this.activeMode === 'cylinder';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      this.camera.position.set(0, 0, isCylinder ? 0 : (this.activeMode === 'horizontal' ? 18 : 25));
      if (isCylinder) {
        this.camera.lookAt(0, 0, -1);
      } else {
        this.camera.lookAt(0, 0, 0);
      }
    } else {
      gsap.killTweensOf(this.camera.position);
      gsap.to(this.camera.position, {
        x: 0,
        y: 0,
        z: isCylinder ? 0 : (this.activeMode === 'horizontal' ? 18 : 25),
        duration: SPATIAL_DURATION.cameraReset,
        ease: SPATIAL_EASE.layout,
        onUpdate: () => {
          if (isCylinder) {
            this.camera.lookAt(0, 0, -1);
          } else {
            this.camera.lookAt(0, 0, 0);
          }
        }
      });
    }
  }

  public getAtlasNodesSpatialInfo() {
    return this.meshes
      .filter((mesh) => mesh.userData.isPrimary)
      .map((mesh) => {
        const pos = this.getAtlasPosition(mesh);
        const domains = mesh.userData.domains || [];
        return {
          slug: mesh.userData.slug || '',
          x: pos.x,
          y: pos.y,
          z: pos.z,
          domain: domains[0] || 'systems',
        };
      });
  }

  public loadProjectTextures(projectId: string) {
    const meshesToLoad = this.meshes.filter(
      (m) => m.userData.projectId === projectId && !m.userData.textureLoaded
    );
    
    if (meshesToLoad.length === 0) return;
    
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    
    meshesToLoad.forEach((mesh) => {
      const url = mesh.userData.textureUrl;
      if (!url || this.failedUrls.has(url)) return;
      
      mesh.userData.textureLoaded = true; // Mark as loading / loaded
      
      const isMobile = window.innerWidth <= 768;
      const hasSmall = url && !url.includes('-small.webp') && !url.includes('youtube') && !url.includes('ytimg') && !url.includes('img.youtube.com');
      const initialSrc = (isMobile && hasSmall)
        ? url.slice(0, url.lastIndexOf('.')) + '-small.webp'
        : url;

      const loadWithFallbacks = (src: string, stage: 'small' | 'original' | 'jpg' | 'youtube' | 'card') => {
        loader.load(
          src,
          (loadedTexture) => {
            loadedTexture.colorSpace = THREE.SRGBColorSpace;
            const image = loadedTexture.image;
            
            if (mesh.material && (mesh.material as THREE.ShaderMaterial).uniforms.uMap) {
              (mesh.material as THREE.ShaderMaterial).uniforms.uMap.value = loadedTexture;
              (mesh.material as THREE.ShaderMaterial).uniforms.uMap.value.needsUpdate = true;
            }
            
            if (image?.width && image?.height) {
              mesh.userData.imageAspect = image.width / image.height;
              if (mesh.material && (mesh.material as THREE.ShaderMaterial).uniforms.uAspect) {
                (mesh.material as THREE.ShaderMaterial).uniforms.uAspect.value = mesh.userData.imageAspect;
              }
              this.scheduleRelayout();
            }
          },
          undefined,
          (error) => {
            if (stage === 'small') {
              loadWithFallbacks(url, 'original');
            } else if (stage === 'original') {
              const fallbackSrc = url.replace(/\.webp$/, '.jpg');
              if (fallbackSrc !== url && !this.failedUrls.has(fallbackSrc)) {
                loadWithFallbacks(fallbackSrc, 'jpg');
              } else {
                const ytId = mesh.userData.assetYoutubeId || mesh.userData.youtubeId;
                if (ytId) {
                  loadWithFallbacks(`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`, 'youtube');
                } else {
                  this.failedUrls.add(url);
                  this.handleFallbackErrorTexture(mesh, mesh.userData, mesh.userData, mesh.userData.imageAspect || 1.0);
                }
              }
            } else if (stage === 'jpg') {
              const ytId = mesh.userData.assetYoutubeId || mesh.userData.youtubeId;
              if (ytId) {
                loadWithFallbacks(`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`, 'youtube');
              } else {
                this.failedUrls.add(url);
                this.handleFallbackErrorTexture(mesh, mesh.userData, mesh.userData, mesh.userData.imageAspect || 1.0);
              }
            } else {
              this.failedUrls.add(url);
              this.handleFallbackErrorTexture(mesh, mesh.userData, mesh.userData, mesh.userData.imageAspect || 1.0);
            }
          }
        );
      };
      
      loadWithFallbacks(initialSrc, (initialSrc !== url) ? 'small' : 'original');
    });
  }

  private handleFallbackErrorTexture(mesh: THREE.Mesh, asset: any, data: any, customAspect: number) {
    if (mesh && mesh.material && (mesh.material as THREE.ShaderMaterial).uniforms) {
      const errTex = this.createCardTexture(
        { ...asset, label: 'MEDIA UNAVAILABLE', title: 'MEDIA UNAVAILABLE', cardStyle: 'system' },
        data,
        'text',
        customAspect
      );
      (mesh.material as THREE.ShaderMaterial).uniforms.uMap.value = errTex;
      mesh.userData.textureLoaded = true;
      this.scheduleRelayout();
    }
  }

  private loadUnhydratedBackground() {
    if (this.unhydratedMeshes.length === 0) return;

    const queue = [...this.unhydratedMeshes];
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    const processQueue = () => {
      const item = queue.shift();
      if (!item) return;

      const { mesh, asset, data, primarySrc, customAspect } = item;
      if (mesh.userData.textureLoaded) {
        processQueue();
        return;
      }

      if (this.failedUrls.has(primarySrc)) {
        this.handleFallbackErrorTexture(mesh, asset, data, customAspect);
        processQueue();
        return;
      }

      loader.load(
        primarySrc,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          const image = texture.image;

          if (mesh.material && (mesh.material as THREE.ShaderMaterial).uniforms.uMap) {
            (mesh.material as THREE.ShaderMaterial).uniforms.uMap.value = texture;
            (mesh.material as THREE.ShaderMaterial).uniforms.uMap.value.needsUpdate = true;
          }

          if (image?.width && image?.height) {
            mesh.userData.imageAspect = image.width / image.height;
            if (mesh.material && (mesh.material as THREE.ShaderMaterial).uniforms.uAspect) {
              (mesh.material as THREE.ShaderMaterial).uniforms.uAspect.value = mesh.userData.imageAspect;
            }
          }
          mesh.userData.textureLoaded = true;
          this.scheduleRelayout();
          setTimeout(processQueue, 40);
        },
        undefined,
        (error) => {
          const fallbackSrc = primarySrc.replace(/\.webp$/, '.jpg');
          if (fallbackSrc !== primarySrc && !this.failedUrls.has(fallbackSrc)) {
            loader.load(
              fallbackSrc,
              (fallbackTex) => {
                fallbackTex.colorSpace = THREE.SRGBColorSpace;
                const image = fallbackTex.image;
                if (mesh.material && (mesh.material as THREE.ShaderMaterial).uniforms.uMap) {
                  (mesh.material as THREE.ShaderMaterial).uniforms.uMap.value = fallbackTex;
                  (mesh.material as THREE.ShaderMaterial).uniforms.uMap.value.needsUpdate = true;
                }
                if (image?.width && image?.height) {
                  mesh.userData.imageAspect = image.width / image.height;
                  if (mesh.material && (mesh.material as THREE.ShaderMaterial).uniforms.uAspect) {
                    (mesh.material as THREE.ShaderMaterial).uniforms.uAspect.value = mesh.userData.imageAspect;
                  }
                }
                mesh.userData.textureLoaded = true;
                this.scheduleRelayout();
                setTimeout(processQueue, 40);
              },
              undefined,
              () => {
                this.failedUrls.add(primarySrc);
                this.failedUrls.add(fallbackSrc);
                this.handleFallbackErrorTexture(mesh, asset, data, customAspect);
                setTimeout(processQueue, 40);
              }
            );
          } else {
            this.failedUrls.add(primarySrc);
            this.handleFallbackErrorTexture(mesh, asset, data, customAspect);
            setTimeout(processQueue, 40);
          }
        }
      );
    };

    // Stagger starting the background queues after 1 second so layout finishes cleanly
    setTimeout(() => {
      processQueue();
      processQueue();
      processQueue();
    }, 1000);
  }

  public dispose() {
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('click', this.onClick);
    document.body.style.cursor = '';
    if (this.relayoutTimer !== null) window.clearTimeout(this.relayoutTimer);
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();

    this.meshes.forEach((mesh) => {
      geometries.add(mesh.geometry);
      const material = mesh.material;
      const materialList = Array.isArray(material) ? material : [material];

      materialList.forEach((mat) => {
        materials.add(mat);
        const shaderMaterial = mat as THREE.ShaderMaterial;
        const texture = shaderMaterial.uniforms?.uMap?.value;
        if (texture?.isTexture) textures.add(texture);
      });
    });

    this.zoneMeshes.forEach((mesh) => {
      geometries.add(mesh.geometry);
      const materialList = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materialList.forEach((material) => materials.add(material));
      mesh.children.forEach((child) => {
        if (child instanceof THREE.LineSegments) {
          geometries.add(child.geometry);
          const childMatList = Array.isArray(child.material) ? child.material : [child.material];
          childMatList.forEach((material) => materials.add(material));
        }
      });
    });

    this.relationLines.forEach((line) => {
      geometries.add(line.geometry);
      const materialList = Array.isArray(line.material) ? line.material : [line.material];
      materialList.forEach((material) => materials.add(material));
    });

    this.cylinderGuideLines.forEach((line) => {
      geometries.add(line.geometry);
      const materialList = Array.isArray(line.material) ? line.material : [line.material];
      materialList.forEach((material) => materials.add(material));
    });

    textures.forEach((texture) => texture.dispose());
    materials.forEach((material) => material.dispose());
    geometries.forEach((geometry) => geometry.dispose());
    this.group.clear();
  }
}
