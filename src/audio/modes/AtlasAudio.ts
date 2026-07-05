/**
 * Atlas Mode Audio — Spatial Panning Layer
 *
 * Uses Tone.Panner3D to spatialize audio sources across the atlas field.
 * The Tone.Listener coordinates are synced to the Three.js camera position.
 * A pool of spatial sources is allocated and assigned to the nearest primary
 * nodes, creating a frequency landscape where domain sectors have distinct tonics.
 */

import * as Tone from 'tone';
import {
  SPATIAL_SOURCE_POOL_SIZE,
  SPATIAL_SOURCE_VOLUME_DB,
  SPATIAL_REF_DISTANCE,
  SPATIAL_MAX_DISTANCE,
  SPATIAL_ROLLOFF,
  DRONE_FADE_IN_SECONDS,
  DRONE_FADE_OUT_SECONDS,
} from '../audioConstants';
import { domainTonic } from '../MicrotonalScale';

interface SpatialSource {
  oscillator: Tone.Oscillator;
  panner: Tone.Panner3D;
  gain: Tone.Gain;
  assignedSlug: string | null;
}

interface NodeSpatialInfo {
  slug: string;
  x: number;
  y: number;
  z: number;
  domain: string;
}

export class AtlasAudio {
  private sources: SpatialSource[] = [];
  private masterGain: Tone.Gain;
  private filter: Tone.Filter;
  private currentFilterHz = 800;
  private isActive = false;
  private disposed = false;
  private knownNodes: NodeSpatialInfo[] = [];
  private cameraX = 0;
  private cameraY = 0;
  private cameraZ = 25;

  constructor(destination: Tone.InputNode) {
    this.masterGain = new Tone.Gain(0).connect(destination);

    // Lowpass filter before master gain to modulate the ambient filter frequency based on scroll velocity
    this.filter = new Tone.Filter({
      type: 'lowpass',
      frequency: 800,
      Q: 1,
    }).connect(this.masterGain);

    // Pre-allocate the spatial source pool
    for (let i = 0; i < SPATIAL_SOURCE_POOL_SIZE; i++) {
      const gain = new Tone.Gain(0).connect(this.filter);

      const panner = new Tone.Panner3D({
        refDistance: SPATIAL_REF_DISTANCE,
        maxDistance: SPATIAL_MAX_DISTANCE,
        rolloffFactor: SPATIAL_ROLLOFF,
        distanceModel: 'inverse',
        panningModel: 'HRTF',
      }).connect(gain);

      const oscillator = new Tone.Oscillator({
        type: 'sine',
        frequency: 220,
        volume: SPATIAL_SOURCE_VOLUME_DB,
      }).connect(panner);

      this.sources.push({ oscillator, panner, gain, assignedSlug: null });
    }
  }

  /**
   * Activate the spatial layer. Called when entering atlas mode.
   */
  activate(): void {
    if (this.disposed || this.isActive) return;
    this.isActive = true;

    this.sources.forEach((source) => {
      source.oscillator.start();
    });

    this.masterGain.gain.cancelScheduledValues(Tone.now());
    this.masterGain.gain.rampTo(1, DRONE_FADE_IN_SECONDS);
  }

  /**
   * Deactivate the spatial layer. Called when leaving atlas mode.
   */
  deactivate(): void {
    if (this.disposed || !this.isActive) return;
    this.isActive = false;

    this.masterGain.gain.cancelScheduledValues(Tone.now());
    this.masterGain.gain.rampTo(0, DRONE_FADE_OUT_SECONDS);

    const stopDelay = DRONE_FADE_OUT_SECONDS + 0.1;
    setTimeout(() => {
      if (!this.isActive && !this.disposed) {
        this.sources.forEach((source) => {
          source.oscillator.stop();
          source.assignedSlug = null;
        });
      }
    }, stopDelay * 1000);
  }

  /**
   * Update the Tone.Listener to match the Three.js camera position.
   * Called from the animation loop.
   */
  setCameraPosition(x: number, y: number, z: number): void {
    if (this.disposed || !this.isActive) return;

    this.cameraX = x;
    this.cameraY = y;
    this.cameraZ = z;

    // Sync Tone.js listener to camera
    const listener = Tone.getContext().listener;
    listener.positionX.value = x;
    listener.positionY.value = y;
    listener.positionZ.value = z;

    // Re-assign sources to nearest nodes
    this.assignSourcesToNearestNodes();
  }

  /**
   * Register known node positions for spatial assignment.
   * Called once when nodes are loaded, or when atlas positions are computed.
   */
  setNodes(nodes: NodeSpatialInfo[]): void {
    this.knownNodes = nodes;
  }

  /**
   * Assign the spatial source pool to the N nearest nodes.
   * Sources smoothly transition frequency when reassigned.
   */
  private assignSourcesToNearestNodes(): void {
    if (this.knownNodes.length === 0) return;

    // Calculate distance from camera to each node
    const withDistance = this.knownNodes.map((node) => ({
      ...node,
      distance: Math.sqrt(
        (node.x - this.cameraX) ** 2 +
        (node.y - this.cameraY) ** 2 +
        (node.z - this.cameraZ) ** 2
      ),
    }));

    // Sort by distance, take the nearest N
    withDistance.sort((a, b) => a.distance - b.distance);
    const nearest = withDistance.slice(0, SPATIAL_SOURCE_POOL_SIZE);

    // Assign sources to nearest nodes
    nearest.forEach((node, i) => {
      const source = this.sources[i];
      if (!source) return;

      // Update panner position to node's 3D coordinates
      source.panner.positionX.value = node.x;
      source.panner.positionY.value = node.y;
      source.panner.positionZ.value = node.z;

      // Set frequency to domain tonic (smooth ramp if reassigned)
      const targetFreq = domainTonic(node.domain);
      if (source.assignedSlug !== node.slug) {
        source.assignedSlug = node.slug;
        source.oscillator.frequency.rampTo(targetFreq, 0.5);
      }

      // Volume based on distance (already handled by Panner3D,
      // but we add a secondary gain for in-view vs out-of-view)
      const inRange = node.distance < SPATIAL_MAX_DISTANCE;
      source.gain.gain.rampTo(inRange ? 1 : 0, 0.3);
    });

    // Mute any unassigned sources
    for (let i = nearest.length; i < this.sources.length; i++) {
      this.sources[i].gain.gain.rampTo(0, 0.3);
      this.sources[i].assignedSlug = null;
    }
  }

  /**
   * Update velocity-dependent filter cutoff.
   */
  setVelocity(velocity: number): void {
    if (this.disposed || !this.isActive) return;

    // Map velocity to filter range: 400Hz (idle) to 4000Hz (scrolling)
    const normalizedVelocity = Math.min(1, velocity * 10);
    const targetHz = 400 * Math.pow(4000 / 400, normalizedVelocity);

    // Smooth filter value to prevent click/glitch artifacts
    this.currentFilterHz += (targetHz - this.currentFilterHz) * 0.08;
    this.filter.frequency.value = this.currentFilterHz;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    this.sources.forEach((source) => {
      source.oscillator.stop();
      source.oscillator.dispose();
      source.panner.dispose();
      source.gain.dispose();
    });
    this.sources = [];
    this.filter.dispose();
    this.masterGain.dispose();
  }
}
