/**
 * AudioEngine — Singleton Web Audio Orchestrator
 *
 * Owns the entire Tone.js lifecycle. Not coupled to React renders
 * or the Three.js animation loop. App.tsx holds a ref to it and
 * calls its methods imperatively — the same pattern used for Scene.ts.
 *
 * Architecture:
 *   AudioEngine (singleton)
 *   ├── Master Bus (Gain → Reverb → Compressor → Destination)
 *   ├── CylinderAudio (generative drone, velocity-mapped filter)
 *   ├── AtlasAudio (Panner3D spatial sources)
 *   ├── InteractionAudio (hover/click/rail sounds)
 *   └── Stem Layer (Tone.Player, lazy-loaded per project)
 */

import type * as Tone from 'tone';
import type { CylinderAudio } from './modes/CylinderAudio';
import type { AtlasAudio } from './modes/AtlasAudio';
import type { InteractionAudio } from './modes/InteractionAudio';
import { domainTonic } from './MicrotonalScale';
import {
  MASTER_VOLUME_DB,
  REVERB_DECAY_SECONDS,
  REVERB_WET,
  COMPRESSOR_THRESHOLD_DB,
  COMPRESSOR_RATIO,
  VISIBILITY_FADE_SECONDS,
  STEM_CROSSFADE_SECONDS,
  STEM_VOLUME_DB,
  STEM_DRONE_DUCK_DB,
} from './audioConstants';
import { AudioInitializationTimeoutError, withAudioTimeout } from './audioInitialization';

// Leave enough headroom for React to render the retry state before the
// ten-second UX deadline measured from the user's click.
const AUDIO_INITIALIZATION_TIMEOUT_MS = 9_000;
const REVERB_READY_TIMEOUT_MS = 4_000;

// ─── Types ─────────────────────────────────────────────────────────

interface AudioNodeInfo {
  slug: string;
  domains: string[];
  tier?: string;
  isNoDataZone?: boolean;
}

type AudioStatus = 'idle' | 'loading' | 'ready' | 'error';
type AudioStateListener = () => void;

// ─── Singleton ─────────────────────────────────────────────────────

let instance: AudioEngine | null = null;

export class AudioEngine {
  // ─── State ─────────────────────────────────────────────────────
  private _isInitialized = false;
  private _isMuted = true;
  private _status: AudioStatus = 'idle';
  private _error: string | null = null;
  private _currentMode = 'cylinder';
  private _disposed = false;

  // Tone.js is loaded on first initialize() so the audio stack stays
  // out of the critical loading path.
  private tone: typeof Tone | null = null;

  // ─── Master Bus ────────────────────────────────────────────────
  private masterGain: Tone.Gain | null = null;
  private reverb: Tone.Reverb | null = null;
  private compressor: Tone.Compressor | null = null;

  // ─── Mode Layers ──────────────────────────────────────────────
  private cylinderAudio: CylinderAudio | null = null;
  private atlasAudio: AtlasAudio | null = null;
  private interactionAudio: InteractionAudio | null = null;

  // ─── Stem Layer ───────────────────────────────────────────────
  private stemPlayer: Tone.Player | null = null;
  private stemGain: Tone.Gain | null = null;
  private stemRegistry = new Map<string, string>(); // slug → URL
  private activeStemSlug: string | null = null;
  // Last project the user entered, tracked even while muted/uninitialized
  // so enabling audio inside a project still starts its stem.
  private pendingProjectSlug: string | null = null;
  private projectDomains = new Map<string, string>(); // slug → domain

  // ─── Visibility ───────────────────────────────────────────────
  private visibilityHandler: (() => void) | null = null;

  // ─── External subscribers (for useSyncExternalStore) ──────────
  private listeners = new Set<AudioStateListener>();

  // ─── Singleton Access ─────────────────────────────────────────

  static getInstance(): AudioEngine {
    if (!instance) {
      instance = new AudioEngine();
    }
    return instance;
  }

  private constructor() {
    // Private — enforce singleton via getInstance()
  }

  // ─── State Accessors ──────────────────────────────────────────

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  get isMuted(): boolean {
    return this._isMuted;
  }

  get status(): AudioStatus {
    return this._status;
  }

  get error(): string | null {
    return this._error;
  }

  // ─── External State Subscription (for React) ─────────────────

  subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((fn) => fn());
  }

  // ─── Lifecycle ────────────────────────────────────────────────

  /**
   * Initialize the audio context and all synthesis nodes.
   * MUST be called from a user gesture (click/tap) to satisfy
   * browser autoplay policy.
   */
  async initialize(): Promise<void> {
    if (this._status === 'loading' || this._status === 'ready' || this._disposed) return;

    this._status = 'loading';
    this._error = null;
    this.notifyListeners();

    const deadline = performance.now() + AUDIO_INITIALIZATION_TIMEOUT_MS;
    const runStage = <T>(promise: PromiseLike<T>, stage: string, capMs = AUDIO_INITIALIZATION_TIMEOUT_MS) => {
      const remainingMs = Math.max(1, deadline - performance.now());
      return withAudioTimeout(promise, Math.min(remainingMs, capMs), stage);
    };

    try {
      const [tone, cylinderModule, atlasModule, interactionModule] = await runStage(
        Promise.all([
          import('tone'),
          import('./modes/CylinderAudio'),
          import('./modes/AtlasAudio'),
          import('./modes/InteractionAudio'),
        ]),
        'module loading',
      );
      if (this._disposed) return;
      this.tone = tone;

      // Start Tone.js context (requires user gesture)
      await runStage(tone.start(), 'audio context start');

      // ── Master Bus ──────────────────────────────────────────
      this.compressor = new tone.Compressor({
        threshold: COMPRESSOR_THRESHOLD_DB,
        ratio: COMPRESSOR_RATIO,
        attack: 0.003,
        release: 0.25,
      }).toDestination();

      this.reverb = new tone.Reverb({
        decay: REVERB_DECAY_SECONDS,
        wet: REVERB_WET,
        preDelay: 0.01,
      }).connect(this.compressor);

      // Reverb is ambience, not a requirement for usable sound. If impulse
      // generation fails or stalls, continue through a dry master bus.
      try {
        await runStage(this.reverb.ready, 'reverb generation', REVERB_READY_TIMEOUT_MS);
      } catch (reverbError) {
        console.warn('Audio reverb unavailable; continuing with a dry signal.', reverbError);
        this.reverb.dispose();
        this.reverb = null;
      }

      this.masterGain = new tone.Gain(0).connect(this.reverb ?? this.compressor);

      // ── Stem Layer ──────────────────────────────────────────
      this.stemGain = new tone.Gain(0).connect(this.masterGain);

      // ── Mode Layers ─────────────────────────────────────────
      this.cylinderAudio = new cylinderModule.CylinderAudio(this.masterGain);
      this.atlasAudio = new atlasModule.AtlasAudio(this.masterGain);
      this.interactionAudio = new interactionModule.InteractionAudio(this.masterGain);

      // ── Page Visibility ─────────────────────────────────────
      this.visibilityHandler = this.handleVisibilityChange.bind(this);
      document.addEventListener('visibilitychange', this.visibilityHandler);

      // ── Finalize ────────────────────────────────────────────
      this._isInitialized = true;
      this._status = 'ready';

      // Fade in master volume only if the user hasn't requested mute during load
      if (this._isMuted) {
        this.masterGain.gain.setValueAtTime(0, tone.now());
      } else {
        this.masterGain.gain.rampTo(
          tone.dbToGain(MASTER_VOLUME_DB),
          3 // 3-second fade from silence
        );
      }

      // Activate the appropriate mode layer
      const layer = this.getLayerForMode(this._currentMode);
      this.activateLayer(layer);

      // If audio was enabled while inside a project, start its stem now
      if (this.pendingProjectSlug) {
        this.startProjectStem(this.pendingProjectSlug);
      }
    } catch (err) {
      console.error('Audio initialization failed:', err);
      this.resetAudioGraph();
      this._status = 'error';
      this._error = err instanceof AudioInitializationTimeoutError
        ? 'Sound timed out - retry'
        : 'Sound unavailable - retry';
      this._isInitialized = false;
      this._isMuted = true;
    } finally {
      this.notifyListeners();
    }
  }

  private resetAudioGraph(): void {
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }

    this.cylinderAudio?.dispose();
    this.atlasAudio?.dispose();
    this.interactionAudio?.dispose();
    this.cylinderAudio = null;
    this.atlasAudio = null;
    this.interactionAudio = null;

    if (this.stemPlayer) {
      this.stemPlayer.stop();
      this.stemPlayer.dispose();
      this.stemPlayer = null;
    }
    this.activeStemSlug = null;

    this.stemGain?.dispose();
    this.masterGain?.dispose();
    this.reverb?.dispose();
    this.compressor?.dispose();
    this.stemGain = null;
    this.masterGain = null;
    this.reverb = null;
    this.compressor = null;
  }

  /**
   * Toggle mute state. If not yet initialized, initializes first.
   */
  async toggleMute(): Promise<void> {
    if (this._status === 'loading') {
      this._isMuted = !this._isMuted;
      this.notifyListeners();
      return;
    }

    if (!this._isInitialized) {
      this._isMuted = false;
      await this.initialize();
      return;
    }

    this._isMuted = !this._isMuted;

    if (this.masterGain && this.tone) {
      if (this._isMuted) {
        this.masterGain.gain.rampTo(0, 0.3);
      } else {
        this.masterGain.gain.rampTo(this.tone.dbToGain(MASTER_VOLUME_DB), 0.5);
        // Catch up on a project entered while muted
        if (this.pendingProjectSlug && this.pendingProjectSlug !== this.activeStemSlug) {
          this.startProjectStem(this.pendingProjectSlug);
        }
      }
    }

    this.notifyListeners();
  }

  /**
   * Clean up all audio resources.
   */
  dispose(): void {
    if (this._disposed) return;
    this._disposed = true;

    // Remove visibility listener
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }

    // Dispose mode layers
    this.cylinderAudio?.dispose();
    this.atlasAudio?.dispose();
    this.interactionAudio?.dispose();

    // Dispose stem player
    if (this.stemPlayer) {
      this.stemPlayer.stop();
      this.stemPlayer.dispose();
    }
    this.stemGain?.dispose();

    // Dispose master bus (reverse creation order)
    this.masterGain?.dispose();
    this.reverb?.dispose();
    this.compressor?.dispose();

    // Close the underlying Web Audio context
    if (this.tone) {
      const rawContext = this.tone.getContext().rawContext;
      if (rawContext && 'close' in rawContext) {
        (rawContext as AudioContext).close();
      }
    }

    this.listeners.clear();
    instance = null;
  }

  // ─── Mode Hooks ───────────────────────────────────────────────
  
  private getLayerForMode(mode: string): 'drone' | 'spatial' | 'none' {
    switch (mode) {
      case 'cylinder':
      case 'essays':
      case 'vertical':
      case 'grid':
      case 'horizontal':
        return 'drone';
      case 'map':
        return 'spatial';
      default:
        return 'none';
    }
  }

  /**
   * Called from App.tsx on mode change. Activates the appropriate
   * audio layer and deactivates others.
   */
  setMode(mode: string): void {
    // Track the mode even before the audio context exists so that
    // initialize() activates the layer for where the user actually is.
    const previousMode = this._currentMode;
    this._currentMode = mode;

    if (!this._isInitialized || this._disposed) return;
    if (previousMode === mode) return;

    const prevLayer = this.getLayerForMode(previousMode);
    const newLayer = this.getLayerForMode(mode);

    if (prevLayer !== newLayer) {
      this.deactivateLayer(prevLayer);
      this.activateLayer(newLayer);
    }

    // Dynamic Drone Tuning per Mode!
    if (newLayer === 'drone') {
      let targetFreq = 329.63; // Default E4 (systems)
      if (mode === 'vertical') {
        targetFreq = 261.63; // C4 (code)
      } else if (mode === 'grid') {
        targetFreq = 220.00; // A3 (space)
      } else if (mode === 'essays') {
        targetFreq = 392.00; // G4 (text)
      } else if (mode === 'horizontal') {
        targetFreq = 293.66; // D4 (sound)
      }
      this.cylinderAudio?.setFrequency(targetFreq, 2.5); // Smooth 2.5s pitch slide
    }
  }

  private activateLayer(layer: 'drone' | 'spatial' | 'none'): void {
    if (layer === 'drone') {
      this.cylinderAudio?.activate();
    } else if (layer === 'spatial') {
      this.atlasAudio?.activate();
    }
  }

  private deactivateLayer(layer: 'drone' | 'spatial' | 'none'): void {
    if (layer === 'drone') {
      this.cylinderAudio?.deactivate();
    } else if (layer === 'spatial') {
      this.atlasAudio?.deactivate();
    }
  }

  // ─── Animation Loop Hooks ─────────────────────────────────────

  /**
   * Called from Scene.ts animation loop (60fps).
   * Updates velocity-dependent audio parameters.
   */
  setScrollVelocity(velocity: number): void {
    if (!this._isInitialized || this._disposed || this._isMuted) return;
    this.cylinderAudio?.setVelocity(velocity);
    this.atlasAudio?.setVelocity(velocity);
  }

  /**
   * Called from Scene.ts animation loop.
   * Updates the spatial audio listener to match the Three.js camera.
   */
  setCameraPosition(x: number, y: number, z: number): void {
    if (!this._isInitialized || this._disposed || this._isMuted) return;
    this.atlasAudio?.setCameraPosition(x, y, z);
  }

  // ─── Interaction Hooks ────────────────────────────────────────

  /**
   * Called when the user hovers over a node.
   */
  onNodeHover(node: AudioNodeInfo | null): void {
    if (!this._isInitialized || this._disposed || this._isMuted) return;
    this.interactionAudio?.onHover(node);
  }

  /**
   * Called when the user clicks a node.
   */
  onNodeClick(node: AudioNodeInfo): void {
    if (!this._isInitialized || this._disposed || this._isMuted) return;
    this.interactionAudio?.onClick(node);
  }

  /**
   * Called when the user navigates to a rail slide.
   */
  onRailStep(direction: -1 | 1): void {
    if (!this._isInitialized || this._disposed || this._isMuted) return;
    this.interactionAudio?.onRailStep(direction);
  }

  // ─── Project Stem Hooks ───────────────────────────────────────

  /**
   * Register a pre-rendered audio stem for a project.
   * Call this once per project, before the user navigates to it.
   *
   * @param slug - Project slug (e.g., 'mashrou-leila')
   * @param url - URL to the audio file (e.g., '/audio/stems/mashrou-leila.ogg')
   */
  registerProjectStem(slug: string, url: string): void {
    this.stemRegistry.set(slug, url);
  }

  /**
   * Called when the user enters a project detail/rail view.
   * If a stem is registered for this project, crossfade to it.
   */
  onProjectEnter(slug: string): void {
    this.pendingProjectSlug = slug;
    if (!this._isInitialized || this._disposed || this._isMuted) return;
    this.startProjectStem(slug);
  }

  private startProjectStem(slug: string): void {
    // Dynamic Drone Tuning for this project!
    const domain = this.projectDomains.get(slug);
    if (domain) {
      const freq = domainTonic(domain);
      this.cylinderAudio?.setFrequency(freq, 2.0); // Smooth 2.0s slide to project tonic
    }

    const stemUrl = this.stemRegistry.get(slug);
    if (!stemUrl || !this.stemGain || !this.masterGain || !this.tone) return;

    // Duck the drone
    this.cylinderAudio?.duck(STEM_CROSSFADE_SECONDS);

    // Stop any existing stem
    if (this.stemPlayer) {
      this.stemPlayer.stop();
      this.stemPlayer.dispose();
    }

    // Create and play the new stem
    this.stemPlayer = new this.tone.Player({
      url: stemUrl,
      loop: true,
      fadeIn: STEM_CROSSFADE_SECONDS,
      fadeOut: STEM_CROSSFADE_SECONDS,
      volume: STEM_VOLUME_DB,
      autostart: true,
    }).connect(this.stemGain);

    this.stemGain.gain.rampTo(1, STEM_CROSSFADE_SECONDS);
    this.activeStemSlug = slug;
  }

  /**
   * Called when the user exits a project detail/rail view.
   * Crossfade back to the global drone.
   */
  onProjectExit(): void {
    this.pendingProjectSlug = null;
    if (!this._isInitialized || this._disposed) return;

    // Fade out stem
    if (this.stemGain) {
      this.stemGain.gain.rampTo(0, STEM_CROSSFADE_SECONDS);
    }

    // Unduck the drone
    this.cylinderAudio?.unduck(STEM_CROSSFADE_SECONDS);

    // Clean up stem player after crossfade
    const player = this.stemPlayer;
    if (player) {
      setTimeout(() => {
        player.stop();
        player.dispose();
      }, STEM_CROSSFADE_SECONDS * 1000 + 100);
      this.stemPlayer = null;
    }
    this.activeStemSlug = null;
  }

  // ─── Atlas Node Registration ──────────────────────────────────

  /**
   * Register node positions for spatial audio assignment.
   * Called once when atlas data is loaded.
   */
  setAtlasNodes(nodes: Array<{ slug: string; x: number; y: number; z: number; domain: string }>): void {
    this.atlasAudio?.setNodes(nodes);
    nodes.forEach((n) => {
      this.projectDomains.set(n.slug, n.domain);
    });
  }

  // ─── Page Visibility ──────────────────────────────────────────

  private handleVisibilityChange(): void {
    if (!this._isInitialized || this._disposed || !this.masterGain || !this.tone) return;

    if (document.hidden) {
      this.masterGain.gain.rampTo(0, VISIBILITY_FADE_SECONDS);
      this.tone.getTransport().pause();
    } else if (!this._isMuted) {
      this.tone.getTransport().start();
      this.masterGain.gain.rampTo(
        this.tone.dbToGain(MASTER_VOLUME_DB),
        VISIBILITY_FADE_SECONDS
      );
    }
  }
}
