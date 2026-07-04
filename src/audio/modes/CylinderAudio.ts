/**
 * Cylinder Mode Audio — Generative Drone
 *
 * Creates an evolving drone that responds to scroll velocity.
 * The drone uses a FatOscillator through an AutoFilter and a velocity-mapped
 * lowpass filter. Faster scrolling opens the filter (brighter sound);
 * idle scrolling muffles it.
 */

import * as Tone from 'tone';
import {
  DRONE_VOLUME_DB,
  DRONE_FADE_IN_SECONDS,
  DRONE_FADE_OUT_SECONDS,
  DRONE_SPREAD_CENTS,
  DRONE_LFO_FREQUENCY_HZ,
  DRONE_LFO_DEPTH,
  VELOCITY_FILTER_MIN_HZ,
  VELOCITY_FILTER_MAX_HZ,
  VELOCITY_FILTER_SMOOTHING,
} from '../audioConstants';
import { domainTonic } from '../MicrotonalScale';

export class CylinderAudio {
  private oscillator: Tone.FatOscillator;
  private autoFilter: Tone.AutoFilter;
  private velocityFilter: Tone.Filter;
  private gain: Tone.Gain;
  private isActive = false;
  private currentFilterHz = VELOCITY_FILTER_MIN_HZ;
  private disposed = false;

  constructor(destination: Tone.InputNode) {
    // Signal chain: Oscillator → AutoFilter → VelocityFilter → Gain → destination
    this.gain = new Tone.Gain(0).connect(destination);

    this.velocityFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: VELOCITY_FILTER_MIN_HZ,
      rolloff: -24,
      Q: 1.5,
    }).connect(this.gain);

    this.autoFilter = new Tone.AutoFilter({
      frequency: DRONE_LFO_FREQUENCY_HZ,
      depth: DRONE_LFO_DEPTH,
      type: 'sine',
      wet: 1,
    }).connect(this.velocityFilter);

    // FatOscillator: multiple detuned triangles for a warm, evolving timbre (removes harsh sawtooth buzz)
    this.oscillator = new Tone.FatOscillator({
      type: 'triangle4',
      frequency: domainTonic('systems'), // E4 = 329.63 Hz
      spread: DRONE_SPREAD_CENTS,
      count: 3,
      volume: DRONE_VOLUME_DB,
    }).connect(this.autoFilter);
  }

  /**
   * Activate the drone (fade in). Called when entering cylinder mode.
   */
  activate(): void {
    if (this.disposed || this.isActive) return;
    this.isActive = true;

    this.autoFilter.start();
    this.oscillator.start();
    this.gain.gain.cancelScheduledValues(Tone.now());
    this.gain.gain.rampTo(1, DRONE_FADE_IN_SECONDS);
  }

  /**
   * Deactivate the drone (fade out). Called when leaving cylinder mode.
   */
  deactivate(): void {
    if (this.disposed || !this.isActive) return;
    this.isActive = false;

    this.gain.gain.cancelScheduledValues(Tone.now());
    this.gain.gain.rampTo(0, DRONE_FADE_OUT_SECONDS);

    // Stop oscillator after fade completes to free CPU
    const stopDelay = DRONE_FADE_OUT_SECONDS + 0.1;
    setTimeout(() => {
      if (!this.isActive && !this.disposed) {
        this.oscillator.stop();
        this.autoFilter.stop();
      }
    }, stopDelay * 1000);
  }

  /**
   * Smoothly ramp the drone oscillator to a new fundamental frequency.
   *
   * @param freq - Target frequency in Hz
   * @param rampTime - Transition duration in seconds. Default: 2.0
   */
  setFrequency(freq: number, rampTime: number = 2.0): void {
    if (this.disposed || !this.oscillator) return;
    this.oscillator.frequency.rampTo(freq, rampTime);
  }

  /**
   * Update the velocity-mapped filter. Called from the animation loop.
   * Uses exponential interpolation for natural-sounding frequency response.
   *
   * @param velocity - Scroll velocity magnitude (from ScrollEngine)
   */
  setVelocity(velocity: number): void {
    if (this.disposed || !this.isActive) return;

    // Map velocity to filter range using exponential curve
    // velocity is typically 0–0.1, with spikes to ~0.3 on fast scroll
    const normalizedVelocity = Math.min(1, velocity * 10);
    const targetHz = VELOCITY_FILTER_MIN_HZ * Math.pow(
      VELOCITY_FILTER_MAX_HZ / VELOCITY_FILTER_MIN_HZ,
      normalizedVelocity
    );

    // Smooth the filter value to prevent crackling
    this.currentFilterHz += (targetHz - this.currentFilterHz) * VELOCITY_FILTER_SMOOTHING;
    this.velocityFilter.frequency.value = this.currentFilterHz;
  }

  /**
   * Duck the drone volume to complete silence (when a project stem is active).
   */
  duck(duration: number = 0.5): void {
    if (this.disposed) return;
    this.gain.gain.cancelScheduledValues(Tone.now());
    this.gain.gain.rampTo(0, duration);
  }

  /**
   * Restore drone to full volume after ducking.
   */
  unduck(duration: number = 1): void {
    if (this.disposed || !this.isActive) return;
    this.gain.gain.cancelScheduledValues(Tone.now());
    this.gain.gain.rampTo(1, duration);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.oscillator.stop();
    this.autoFilter.stop();
    this.oscillator.dispose();
    this.autoFilter.dispose();
    this.velocityFilter.dispose();
    this.gain.dispose();
  }
}
