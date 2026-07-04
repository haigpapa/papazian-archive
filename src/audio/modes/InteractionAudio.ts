/**
 * Interaction Audio — Hover, Click, and Navigation Sounds
 *
 * Lightweight UI interaction sounds for all modes.
 * Uses PluckSynth for hover pings and MembraneSynth for click/dive.
 * Frequencies are domain-aware; intervals are tier-aware.
 */

import * as Tone from 'tone';
import {
  HOVER_VOLUME_DB,
  CLICK_VOLUME_DB,
  HOVER_DEBOUNCE_MS,
  RAIL_PING_VOLUME_DB,
  MAX_POLYPHONY,
} from '../audioConstants';
import { domainTonic } from '../MicrotonalScale';

interface NodeInfo {
  slug: string;
  domains: string[];
  tier?: string;
  isNoDataZone?: boolean;
}

export class InteractionAudio {
  private pluck: Tone.PluckSynth;
  private membrane: Tone.Synth;
  private railPluck: Tone.PluckSynth;
  private gain: Tone.Gain;
  private disposed = false;
  private lastHoverSlug: string | null = null;
  private lastHoverTime = 0;

  constructor(destination: Tone.InputNode) {
    this.gain = new Tone.Gain(1).connect(destination);

    // Hover ping — soft plucked string sound
    this.pluck = new Tone.PluckSynth({
      attackNoise: 1,
      dampening: 3000,
      resonance: 0.92,
      volume: HOVER_VOLUME_DB,
    }).connect(this.gain);

    // Click/dive — extremely soft, low-frequency pure sine pulse (tactile bump)
    this.membrane = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.015,
        decay: 0.08,
        sustain: 0,
        release: 0.08,
      },
      volume: CLICK_VOLUME_DB,
    }).connect(this.gain);

    // Rail navigation ping — quieter pluck for slide changes
    this.railPluck = new Tone.PluckSynth({
      attackNoise: 0.5,
      dampening: 4000,
      resonance: 0.85,
      volume: RAIL_PING_VOLUME_DB,
    }).connect(this.gain);
  }

  /**
   * Trigger a hover ping. Debounced to prevent machine-gun on fast mouse.
   * Frequency is set to the node's primary domain tonic.
   */
  onHover(node: NodeInfo | null): void {
    if (this.disposed || !node) {
      this.lastHoverSlug = null;
      return;
    }

    // Debounce: don't re-trigger for same node or too quickly
    const now = performance.now();
    if (
      node.slug === this.lastHoverSlug ||
      now - this.lastHoverTime < HOVER_DEBOUNCE_MS
    ) {
      return;
    }

    this.lastHoverSlug = node.slug;
    this.lastHoverTime = now;

    if (node.isNoDataZone) {
      // Play a low-frequency warning tone (A2 / 110Hz) for data exclusion zones
      this.pluck.triggerAttack(110, Tone.now());
    } else {
      const frequency = domainTonic(node.domains[0] || 'systems');
      // Shift up an octave for lighter hover feel
      this.pluck.triggerAttack(frequency * 2, Tone.now());
    }
  }

  onClick(node: NodeInfo): void {
    if (this.disposed) return;
    const baseFreq = domainTonic(node.domains[0] || 'systems');
    // Play a single, low-frequency, soft pulse (two octaves down for a deep tactile thump)
    this.membrane.triggerAttackRelease(baseFreq / 4, '16n', Tone.now());
  }

  /**
   * Trigger a rail navigation ping when the user scrubs through gallery slides.
   */
  onRailStep(direction: -1 | 1): void {
    if (this.disposed) return;

    // Pitch up for forward, down for backward
    const baseFreq = 440;
    const freq = direction > 0 ? baseFreq * 1.2 : baseFreq * 0.8;
    this.railPluck.triggerAttack(freq, Tone.now());
  }

  /**
   * Reset hover state (e.g., when mouse leaves the canvas).
   */
  clearHover(): void {
    this.lastHoverSlug = null;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.pluck.dispose();
    this.membrane.dispose();
    this.railPluck.dispose();
    this.gain.dispose();
  }
}
