import * as THREE from 'three';
import gsap from 'gsap';
import { CANONICAL_PROJECT_SLUGS, CANONICAL_PROJECT_SET } from '../data/canonicalProjects';

const VERTEX_SHADER = `
  uniform float uTime;
  uniform float uVelocity;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
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
  varying vec2 vUv;

  void main() {
    float shift = uVelocity * 0.002;
    vec2 sampleUv = gl_FrontFacing ? vUv : vec2(1.0 - vUv.x, vUv.y);
    vec4 texR = texture2D(uMap, sampleUv + vec2(shift, 0.0));
    vec4 texG = texture2D(uMap, sampleUv);
    vec4 texB = texture2D(uMap, sampleUv - vec2(shift, 0.0));
    
    vec3 color = vec3(texR.r, texG.g, texB.b);
    float alpha = texG.a;

    float pulse = 1.0 + 0.04 * sin(uTime * 3.0);
    color += uHover * 0.04 * vec3(1.0) * pulse; 

    // Search fade
    color *= (0.3 + uSearchHighlight * 0.7);
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
  private relationLines: THREE.Line[] = [];
  private cylinderGuideLines: THREE.LineLoop[] = [];
  private lastRailStateKey = '';
  private lastCenteredNodeId: any = null;

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
    };
    this.loadingManager.onError = (url) => {
      console.warn('Texture failed to load:', url);
    };

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.createNodes();
    
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('click', this.onClick);
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
        const texture = isGeneratedCard
          ? this.createCardTexture(asset, data, slideType)
          : loader.load(asset.poster || asset.src || data.thumbnail, (loadedTexture) => {
              const image = loadedTexture.image;
              mesh.userData.imageAspect = image?.width && image?.height ? image.width / image.height : planeAspect;
              (mesh.material as THREE.ShaderMaterial).uniforms.uAspect.value = mesh.userData.imageAspect || planeAspect;
              this.scheduleRelayout();
            });
        texture.colorSpace = THREE.SRGBColorSpace;
        
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
            uColor: { value: new THREE.Color(data.accentColor || '#4a7fa8') }
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
          imageAspect: isGeneratedCard ? planeAspect : planeAspect,
          showInWorks: CANONICAL_PROJECT_SET.has(data.slug),
          canonicalOrder: CANONICAL_PROJECT_SLUGS.indexOf(data.slug),
        };
        material.uniforms.uAspect.value = mesh.userData.imageAspect || planeAspect;
        mesh.frustumCulled = false; 
        this.meshes.push(mesh);
        this.group.add(mesh);
      });
    });

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

  private createCardTexture(asset: any, data: any, slideType: string) {
    const canvas = document.createElement('canvas');
    canvas.width = 1800;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');

    if (!ctx) return new THREE.CanvasTexture(canvas);

    const accent = data.accentColor || '#d7e7ef';
    const body = Array.isArray(asset.body) ? asset.body : [asset.body || asset.caption || data.shortDescription || data.summary].filter(Boolean);
    const cardStyle = this.getCardStyle(asset, body);
    const title = String(asset.label || data.title || 'Archive Card').toUpperCase();
    const caption = String(asset.caption || data.shortDescription || '');
    const chapter = String(asset.chapter || 'Case Study').toUpperCase();
    const projectTitle = String(data.title || asset.projectTitle || 'Archive').toUpperCase();
    const nodeCode = String(asset.id || `${data.slug || 'node'}-${asset.assetIndex || 0}`).toUpperCase().slice(-9);
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
        ctx.beginPath();
        ctx.moveTo(x, inset);
        ctx.lineTo(x, canvas.height - inset);
        ctx.stroke();
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
      ctx.moveTo(1318, inset);
      ctx.lineTo(1318, 900);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath();
      ctx.arc(1468, 330, 118, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(1468, 330, 84, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(242,242,237,0.18)';
      ctx.font = '700 24px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAPAZIAN', 1468, 322);
      ctx.fillText('ARCHIVE', 1468, 358);
      ctx.textAlign = 'left';
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.moveTo(1390, 54);
      ctx.lineTo(1390, canvas.height - 54);
      ctx.stroke();
    }

    ctx.fillStyle = cardStyle === 'system' ? accent : 'rgba(228,232,226,0.84)';
    ctx.font = '700 25px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.letterSpacing = '4px';
    ctx.fillText(`${chapter} / ${String(slideType).toUpperCase()}`, 110, 132);

    ctx.strokeStyle = cardStyle === 'intertitle' ? 'rgba(255,255,255,0.72)' : accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(110, 190);
    ctx.lineTo(cardStyle === 'system' ? 470 : 250, 190);
    ctx.stroke();

    ctx.fillStyle = cardStyle === 'system' ? '#f3a821' : '#f4f1e8';
    ctx.font = `${cardStyle === 'system' ? '800' : '780'} ${this.getCardTitleSize(title)}px Inter, Helvetica, Arial, sans-serif`;
    this.drawWrappedText(ctx, title, 110, 328, cardStyle === 'dossier' ? 950 : 1120, 124, 3);

    ctx.fillStyle = cardStyle === 'system' ? 'rgba(246,188,66,0.82)' : 'rgba(242,242,237,0.74)';
    ctx.font = '500 38px ui-monospace, SFMono-Regular, Menlo, monospace';
    this.drawWrappedText(ctx, caption, 110, 622, cardStyle === 'dossier' ? 900 : 1040, 54, 3);

    if (cardStyle === 'dossier') {
      ctx.font = '700 34px ui-monospace, SFMono-Regular, Menlo, monospace';
      body.slice(0, 6).forEach((item: string, index: number) => {
        const x = 110 + (index % 3) * 535;
        const y = 978 + Math.floor(index / 3) * 92;
        ctx.fillStyle = accent;
        ctx.fillText(`0${index + 1}`.slice(-2), x, y);
        ctx.fillStyle = 'rgba(242,242,237,0.84)';
        this.drawWrappedText(ctx, item, x + 68, y - 2, 390, 42, 2);
      });
    } else {
      ctx.font = '400 42px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.fillStyle = cardStyle === 'system' ? 'rgba(246,188,66,0.78)' : 'rgba(242,242,237,0.82)';
      let y = 780;
      body.slice(0, 3).forEach((paragraph: string) => {
        y = this.drawWrappedText(ctx, paragraph, 110, y, cardStyle === 'system' ? 1040 : 1080, 56, 3) + 30;
      });
    }

    ctx.font = '700 22px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = cardStyle === 'system' ? accent : 'rgba(242,242,237,0.56)';
    ctx.fillText(`PAPAZIAN ARCHIVE / ${projectTitle}`, 110, 1090);
    ctx.fillStyle = cardStyle === 'system' ? 'rgba(246,188,66,0.78)' : 'rgba(242,242,237,0.46)';
    ctx.textAlign = 'right';
    ctx.fillText(`${nodeCode} / ${dateRange}`, canvas.width - 110, 1090);
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
    const hasMetricBody = body.length >= 3 || body.some((item) => /[$%+]|\d/.test(String(item)));
    if (role === 'system' || role === 'process') return 'system';
    if (role === 'evidence' && hasMetricBody) return 'dossier';
    return 'intertitle';
  }

  private getCardTitleSize(title: string) {
    if (title.length > 28) return 102;
    if (title.length > 18) return 114;
    return 126;
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
    const primaryBySlug = new Map<string, THREE.Mesh>();
    this.getPrimaryMeshes().forEach((mesh) => primaryBySlug.set(mesh.userData.slug, mesh));

    this.nodesData.forEach((node) => {
      (node.connections || []).forEach((targetSlug: string) => {
        if (!primaryBySlug.has(targetSlug)) return;
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(),
          new THREE.Vector3(),
        ]);
        const material = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0,
          toneMapped: false,
        });
        const line = new THREE.Line(geometry, material);
        line.userData = { sourceId: node.slug, targetId: targetSlug };
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

  private getVisibleMeshes(mode = this.activeMode) {
    if (mode === 'grid') return [...this.meshes].sort((a, b) => {
      const domains = ['sound', 'image', 'space', 'code', 'systems', 'text'];
      const tierWeight: Record<string, number> = { lead: 0, secondary: 1, archive: 2 };
      const aDomain = domains.indexOf(a.userData.domains?.[0] || a.userData.category || '');
      const bDomain = domains.indexOf(b.userData.domains?.[0] || b.userData.category || '');
      const domainDelta = (aDomain === -1 ? 99 : aDomain) - (bDomain === -1 ? 99 : bDomain);
      if (domainDelta !== 0) return domainDelta;
      const tierDelta = (tierWeight[a.userData.tier] ?? 9) - (tierWeight[b.userData.tier] ?? 9);
      if (tierDelta !== 0) return tierDelta;
      return (a.userData.projectOrder - b.userData.projectOrder) || (a.userData.assetIndex - b.userData.assetIndex);
    });
    if (mode === 'horizontal') return this.getProjectRailMeshes();
    if (mode === 'vertical') return this.getCanonicalPrimaryMeshes();
    if (mode === 'cylinder') return this.meshes;
    return this.getPrimaryMeshes();
  }

  private getModeIndex(mesh: THREE.Mesh, mode = this.activeMode) {
    const visible = this.getVisibleMeshes(mode);
    return Math.max(0, visible.indexOf(mesh));
  }

  private isMeshVisibleInMode(mesh: THREE.Mesh, mode = this.activeMode) {
    return this.getVisibleMeshes(mode).includes(mesh);
  }

  private setNodePosition(mesh: THREE.Mesh, i: number, mode: string, animate: boolean = true) {
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
    } else if (mode === 'atlas') {
      const position = this.getAtlasPosition(mesh);
      targetX = position.x;
      targetY = position.y;
      targetZ = position.z;
      targetRotY = 0;
    }

    const targetScale = isVisible ? this.getNodeScale(mesh, 1, mode) : { x: 0.001, y: 0.001, z: 0.001 };
    const material = mesh.material as THREE.ShaderMaterial;
    const opacity = isVisible ? 1 : 0;

    if (animate) {
      gsap.to(mesh.position, { x: targetX, y: targetY, z: targetZ, duration: 1.2, ease: 'expo.inOut', delay: i * 0.008 });
      gsap.to(mesh.rotation, { y: targetRotY, z: targetRotZ, duration: 1.2, ease: 'expo.inOut', delay: i * 0.008 });
      gsap.to(mesh.scale, { ...targetScale, duration: 1.2, ease: 'expo.inOut', delay: i * 0.008 });
      gsap.to(material.uniforms.uModeVisibility, { value: opacity, duration: 0.65, ease: 'power2.inOut' });
      if (opacity === 1 && material.uniforms.uSearchHighlight.value === 0) {
        gsap.to(material.uniforms.uSearchHighlight, { value: 1, duration: 0.45, ease: 'power2.inOut' });
      }
    } else {
      mesh.position.set(targetX, targetY, targetZ);
      mesh.rotation.y = targetRotY;
      mesh.rotation.z = targetRotZ;
      mesh.scale.set(targetScale.x, targetScale.y, targetScale.z);
      material.uniforms.uModeVisibility.value = opacity;
      if (opacity === 1 && material.uniforms.uSearchHighlight.value === 0) {
        material.uniforms.uSearchHighlight.value = 1;
      }
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
      const heightScale = 1.48 * multiplier;
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
      grid: { lead: 0.62, secondary: 0.52, archive: 0.44 },
      vertical: { lead: 1.02, secondary: 0.74, archive: 0.56 },
      horizontal: { lead: 1.06, secondary: 0.78, archive: 0.58 },
      atlas: { lead: 0.5, secondary: 0.38, archive: 0.28 },
    };

    return modeScale[mode]?.[tier || 'archive'] || 0.58;
  }

  private getMaxImageWidth(mode = this.activeMode): number {
    if (mode === 'cylinder') return 18;
    if (mode === 'grid') return 5.8;
    if (mode === 'horizontal') return 11.2;
    if (mode === 'vertical') return 8.5;
    if (mode === 'atlas') return 3.8;
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
    if (mode === 'horizontal') return 0.46;
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
    let slot = index;
    let remaining = index;

    while (remaining >= 0) {
      if (!this.isGridGapSlot(slot)) remaining -= 1;
      if (remaining >= 0) slot += 1;
    }

    return slot;
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
    this.activeMode = mode;
    this.meshes.forEach((mesh) => {
      this.setNodePosition(mesh, this.getModeIndex(mesh, mode), mode);
    });
    this.updateRelationLines(true);
    this.updateCylinderGuideLines(true);
    if (mode === 'horizontal') {
      this.emitRailState();
    } else {
      this.emitRailState(null);
    }
    if (mode !== 'horizontal') {
      this.resetCamera();
    }
  }

  public getActiveMode() {
    return this.activeMode;
  }

  public getLoopPeriod(): number {
    const TOTAL = this.getVisibleMeshes(this.activeMode).length;
    if (this.activeMode === 'horizontal') {
      return this.getLinearSpan('horizontal') / 8;
    } else if (this.activeMode === 'vertical') {
      return this.getLinearSpan('vertical') / 8;
    } else if (this.activeMode === 'grid') {
      const rows = this.getGridRows();
      return (rows * 7) / 6;
    } else if (this.activeMode === 'atlas') {
      return 1;
    }
    return 1; // Default
  }

  public update(scrollX: number, scrollY: number) {
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
      const totalSpan = this.getLinearSpan('horizontal');

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

      // Wrap columns/rows for infinite scroll in all directions
      const cols = 9;
      const rows = this.getGridRows();
      const totalWidth = cols * 7.4;
      const totalHeight = rows * 5.9;
      
      this.getVisibleMeshes('grid').forEach((mesh) => {
        // Wrap Y
        const worldY = mesh.position.y + this.group.position.y;
        const wrappedY = ((worldY + totalHeight / 2) % totalHeight + totalHeight) % totalHeight - totalHeight / 2;
        mesh.position.y = wrappedY - this.group.position.y;

        // Wrap X
        const worldX = mesh.position.x + this.group.position.x;
        const wrappedX = ((worldX + totalWidth / 2) % totalWidth + totalWidth) % totalWidth - totalWidth / 2;
        mesh.position.x = wrappedX - this.group.position.x;
      });
      this.updateRelationLines();
      this.updateCylinderGuideLines();
      this.emitRailState(null);
    } else if (this.activeMode === 'atlas') {
      this.group.rotation.y = 0;
      this.group.position.y = scrollY * 5.5;
      this.group.position.x = scrollX * -7;
      this.updateRelationLines();
      this.updateCylinderGuideLines();
      this.emitRailState(null);
    }
  }

  public renderUpdate(time: number, velocity: number) {
    this.meshes.forEach((mesh) => {
      const mat = mesh.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = time;
      mat.uniforms.uVelocity.value = Math.abs(velocity);
    });
    this.updateRelationLines();
    this.updateCylinderGuideLines();
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
    const primaryBySlug = new Map<string, THREE.Mesh>();
    this.getPrimaryMeshes().forEach((mesh) => primaryBySlug.set(mesh.userData.slug, mesh));

    const activeSlug = this.hoveredMesh ? this.hoveredMesh.userData.slug : this.focusedNodeId;

    this.relationLines.forEach((line) => {
      const source = primaryBySlug.get(line.userData.sourceId);
      const target = primaryBySlug.get(line.userData.targetId);
      const material = line.material as THREE.LineBasicMaterial;

      if (!source || !target) return;

      line.geometry.setFromPoints([
        source.position.clone(),
        target.position.clone(),
      ]);

      let targetOpacity = 0;
      if (this.activeMode === 'atlas') {
        if (activeSlug) {
          const isConnected = line.userData.sourceId === activeSlug || line.userData.targetId === activeSlug;
          targetOpacity = isConnected ? 0.45 : 0.05;
        } else {
          targetOpacity = 0.12;
        }
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

    let activeIndex = 0;
    let activeDistance = Infinity;

    railMeshes.forEach((mesh, index) => {
      const worldX = mesh.position.x + this.group.position.x;
      const perspective = this.getHorizontalPerspective(mesh, index, worldX);
      const distance = Math.abs(worldX - this.getHorizontalFocusX()) - perspective.progress * 0.9;

      if (distance < activeDistance) {
        activeDistance = distance;
        activeIndex = index;
      }
    });

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

    // Exit previous
    if (this.hoveredMesh) {
      gsap.to((this.hoveredMesh.material as THREE.ShaderMaterial).uniforms.uHover, {
        value: 0,
        duration: 0.5,
        ease: 'power2.out'
      });
    }

    // Enter new
    this.hoveredMesh = mesh;
    if (mesh) {
      this.options.onNodeHover?.(mesh.userData, pos);
      gsap.to((mesh.material as THREE.ShaderMaterial).uniforms.uHover, {
        value: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
      document.body.style.cursor = this.options.canUseSceneClicks?.() === false ? 'default' : 'pointer';
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

    // Hover detection
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.getVisibleMeshes());

    if (intersects.length > 0) {
      const intersected = intersects[0].object as THREE.Mesh;
      this.applyHover(intersected, { x: e.clientX, y: e.clientY });
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
    const TOTAL = this.meshes.length;
    if (mode === 'cylinder') {
      const nodesPerRing = 8;
      const REVOLUTIONS = Math.max(1, Math.ceil(TOTAL / nodesPerRing));
      const y_node = (index / TOTAL) * REVOLUTIONS * -9 + (REVOLUTIONS * 9) / 2;
      return -y_node / ((9 / (2 * Math.PI)) * 0.6);
    } else if (mode === 'vertical') {
      return -this.getLinearPosition(index, 'vertical') / 8;
    } else if (mode === 'horizontal') {
      const node = this.nodesData[index];
      const railIndex = this.getProjectRailMeshes().findIndex((mesh) => mesh.userData.projectId === node?.slug);
      return (this.getLinearPosition(Math.max(0, railIndex), 'horizontal') - this.getHorizontalFocusX()) / 8;
    } else if (mode === 'grid') {
      const cols = 9;
      const row = Math.floor(this.getGridSlot(index) / cols);
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

    const period = this.getLinearSpan('horizontal') / 8;
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

    const railMeshes = this.getProjectRailMeshes();
    if (!railMeshes.length) return 0;

    let activeIndex = 0;
    let activeDistance = Infinity;

    railMeshes.forEach((mesh, index) => {
      const worldX = mesh.position.x + this.group.position.x;
      const perspective = this.getHorizontalPerspective(mesh, index, worldX);
      const distance = Math.abs(worldX - this.getHorizontalFocusX()) - perspective.progress * 0.9;

      if (distance < activeDistance) {
        activeDistance = distance;
        activeIndex = index;
      }
    });

    return activeIndex;
  }

  public focusNode(node: any) {
    const mesh = this.meshes.find(m => m.userData.id === node.id);
    if (!mesh) return;
    this.focusedNodeId = node.slug || node.projectId || null;
    this.meshes.forEach((entry) => {
      this.setNodePosition(entry, this.getModeIndex(entry, this.activeMode), this.activeMode);
    });
    this.emitRailState();

    if (this.activeMode === 'grid' || this.activeMode === 'atlas' || this.activeMode === 'cylinder') {
      this.resetCamera();
      return;
    }

    const focusScale = this.getNodeScale(mesh, 1.04, this.activeMode);
    gsap.to(mesh.scale, {
      x: focusScale.x,
      y: focusScale.y,
      z: focusScale.z,
      duration: 0.6,
      ease: 'power2.out',
    });

    gsap.to(this.camera.position, {
      x: 0,
      y: 0,
      z: this.activeMode === 'horizontal' ? 18 : 25,
      duration: 1.2,
      ease: 'expo.inOut',
      onUpdate: () => {
        this.camera.lookAt(0, 0, 0);
      }
    });
  }

  private onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-ui-layer="true"]')) return;
    if (this.options.canUseSceneClicks?.() === false) return;

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.getVisibleMeshes());

    if (intersects.length > 0) {
      const mesh = intersects[0].object as THREE.Mesh;
      const node = mesh.userData;
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
    }
  };

  public setSearchQuery(query: string) {
    const q = query.toLowerCase().trim();
    this.meshes.forEach((mesh) => {
      const data = mesh.userData;
      const match = !q || 
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
      
      gsap.to((mesh.material as THREE.ShaderMaterial).uniforms.uSearchHighlight, {
        value: match ? 1.0 : 0.0,
        duration: 0.4,
        ease: 'power2.inOut'
      });
    });
  }

  public resetFocus() {
    this.focusedNodeId = null;
    this.emitRailState(null);
    this.meshes.forEach((mesh) => {
      this.setNodePosition(mesh, this.getModeIndex(mesh, this.activeMode), this.activeMode);
    });
    this.resetCamera();
  }

  private resetCamera() {
    const isCylinder = this.activeMode === 'cylinder';
    gsap.to(this.camera.position, {
      x: 0,
      y: 0,
      z: isCylinder ? 0 : 25,
      duration: 1.5,
      ease: 'expo.inOut',
      onUpdate: () => {
        if (isCylinder) {
          this.camera.lookAt(0, 0, -1);
        } else {
          this.camera.lookAt(0, 0, 0);
        }
      }
    });
  }

  public dispose() {
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('click', this.onClick);
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
