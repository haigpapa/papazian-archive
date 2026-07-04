/**
 * Audio Engine Constants
 *
 * Shared configuration values for the Papazian Archive audio system.
 * All volume values are in decibels (dB). All durations are in seconds.
 */

// ─── Master Bus ────────────────────────────────────────────────────

/** Default master output volume after initialization */
export const MASTER_VOLUME_DB = -12;

/** Reverb impulse response duration */
export const REVERB_DECAY_SECONDS = 2.5;

/** Reverb wet/dry mix (0 = dry, 1 = fully wet) */
export const REVERB_WET = 0.3;

/** Master compressor threshold */
export const COMPRESSOR_THRESHOLD_DB = -18;

/** Master compressor ratio */
export const COMPRESSOR_RATIO = 4;

// ─── Drone Layer ───────────────────────────────────────────────────

/** Duration of initial drone fade-in after audio is enabled */
export const DRONE_FADE_IN_SECONDS = 3;

/** Duration of drone fade-out when switching away from cylinder mode */
export const DRONE_FADE_OUT_SECONDS = 1.5;

/** Drone oscillator spread in cents (FatOscillator detuning) */
export const DRONE_SPREAD_CENTS = 20;

/** AutoFilter LFO frequency for organic drift */
export const DRONE_LFO_FREQUENCY_HZ = 0.08;

/** AutoFilter LFO depth */
export const DRONE_LFO_DEPTH = 0.6;

/** Drone volume relative to master */
export const DRONE_VOLUME_DB = -26;

// ─── Velocity → Filter Mapping ────────────────────────────────────

/** Minimum filter cutoff frequency (when scroll is idle) */
export const VELOCITY_FILTER_MIN_HZ = 200;

/** Maximum filter cutoff frequency (when scroll is fast) */
export const VELOCITY_FILTER_MAX_HZ = 4000;

/** Smoothing factor for velocity-to-filter interpolation (0–1, lower = smoother) */
export const VELOCITY_FILTER_SMOOTHING = 0.08;

// ─── Interaction Layer ─────────────────────────────────────────────

/** Volume for hover ping sounds */
export const HOVER_VOLUME_DB = -36;

/** Volume for click/dive confirmation sounds */
export const CLICK_VOLUME_DB = -24;

/** Minimum interval between hover pings (prevents machine-gun on fast mouse) */
export const HOVER_DEBOUNCE_MS = 120;

/** Volume for rail slide navigation pings */
export const RAIL_PING_VOLUME_DB = -26;

// ─── Spatial Layer (Atlas Mode) ────────────────────────────────────

/** Maximum number of simultaneously active spatial audio sources */
export const SPATIAL_SOURCE_POOL_SIZE = 6;

/** Volume for spatial source oscillators */
export const SPATIAL_SOURCE_VOLUME_DB = -28;

/** Distance at which spatial sources begin to attenuate (Three.js units) */
export const SPATIAL_REF_DISTANCE = 8;

/** Maximum distance for spatial source audibility (Three.js units) */
export const SPATIAL_MAX_DISTANCE = 50;

/** Rolloff factor for spatial distance attenuation */
export const SPATIAL_ROLLOFF = 1.5;

// ─── Stem / Project Signature Layer ────────────────────────────────

/** Crossfade duration when switching between project stems */
export const STEM_CROSSFADE_SECONDS = 2;

/** Volume for project-specific ambient stems */
export const STEM_VOLUME_DB = 0;

/** How much to duck the global drone when a stem is active (effectively silent) */
export const STEM_DRONE_DUCK_DB = -80;

// ─── Polyphony & Performance ───────────────────────────────────────

/** Maximum simultaneous voices for PolySynth instances */
export const MAX_POLYPHONY = 6;

// ─── Page Visibility / Background Throttle ─────────────────────────

/** Fade duration when tab becomes hidden/visible */
export const VISIBILITY_FADE_SECONDS = 1.5;
