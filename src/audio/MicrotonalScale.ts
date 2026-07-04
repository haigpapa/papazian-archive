/**
 * Microtonal Scale Utilities
 *
 * Converts maqam intervals and quarter-tones to raw Hz values.
 * Tone.js defaults to 12-TET western notation — this module provides
 * the non-western frequency layer required by the archive's cultural context.
 *
 * References:
 *   - Maqam World (maqamworld.com) for interval ratios
 *   - Amine Beyhom's systematics for quarter-tone notation
 */

// ─── Types ─────────────────────────────────────────────────────────

export type MaqamName = 'rast' | 'bayati' | 'saba' | 'hijaz' | 'nahawand' | 'kurd' | 'ajam';

// ─── Interval Definitions (in cents from tonic) ────────────────────

/**
 * Each maqam is defined by its ascending intervals in cents.
 * Quarter-tones (~150 cents) and three-quarter-tones (~350 cents)
 * are marked with their Arabic music theory names.
 *
 * Standard semitone = 100 cents
 * Quarter-tone flat = ~50 cents deviation from 12-TET
 */
const MAQAM_INTERVALS: Record<MaqamName, number[]> = {
  // Rast: C D E↓ F G A B↓ C  (E and B are ~quarter-tone flat)
  rast:     [0, 200, 350, 500, 700, 900, 1050, 1200],

  // Bayati: D E↓ F G A B♭ C D  (E is ~quarter-tone flat)
  bayati:   [0, 150, 300, 500, 700, 800, 1000, 1200],

  // Saba: D E↓ F G♭ A B♭ C D  (compressed tetrachord)
  saba:     [0, 150, 300, 450, 700, 800, 1000, 1200],

  // Hijaz: D E♭ F# G A B♭ C D  (augmented second: E♭→F#)
  hijaz:    [0, 100, 400, 500, 700, 800, 1000, 1200],

  // Nahawand: C D E♭ F G A♭ B♭ C  (natural minor / aeolian-ish)
  nahawand: [0, 200, 300, 500, 700, 800, 1000, 1200],

  // Kurd: D E♭ F G A B♭ C D  (phrygian-like)
  kurd:     [0, 100, 300, 500, 700, 800, 1000, 1200],

  // Ajam: C D E F G A B C  (major scale, included for contrast)
  ajam:     [0, 200, 400, 500, 700, 900, 1100, 1200],
};

// ─── Domain → Tonic Frequency Mapping ──────────────────────────────

/**
 * Each archive domain gets a base frequency (tonic).
 * These are spread across the mid-range to create harmonic separation
 * between domain sectors in atlas mode.
 */
export const DOMAIN_TONICS: Record<string, number> = {
  sound:   293.66,  // D4
  image:   369.99,  // F#4
  space:   220.00,  // A3
  code:    261.63,  // C4 (middle C)
  systems: 329.63,  // E4
  text:    392.00,  // G4
};

// ─── Core Functions ────────────────────────────────────────────────

/**
 * Convert cents offset from a reference frequency to Hz.
 * Formula: freq = refFreq × 2^(cents / 1200)
 */
function centsToFrequency(refFrequency: number, cents: number): number {
  return refFrequency * Math.pow(2, cents / 1200);
}

/**
 * Get the frequency for a specific degree of a maqam scale.
 *
 * @param degree - Scale degree (0 = tonic, 1 = second, ..., 7 = octave)
 * @param maqam - Name of the maqam
 * @param octave - Octave number (4 = middle octave). Default: 4
 * @param tonic - Tonic frequency in Hz. Default: D4 (293.66 Hz)
 * @returns Frequency in Hz
 *
 * @example
 * maqamFrequency(0, 'rast')       // 293.66 Hz (D4, tonic)
 * maqamFrequency(2, 'rast')       // ~330 Hz (E↓4, quarter-tone flat E)
 * maqamFrequency(4, 'bayati')     // ~440 Hz (A4)
 * maqamFrequency(0, 'hijaz', 5)   // ~587.33 Hz (D5, octave up)
 */
export function maqamFrequency(
  degree: number,
  maqam: MaqamName,
  octave: number = 4,
  tonic: number = 293.66
): number {
  const intervals = MAQAM_INTERVALS[maqam];
  if (!intervals) {
    throw new Error(`Unknown maqam: ${maqam}`);
  }

  // Handle degrees beyond one octave by wrapping
  const octavesFromDegree = Math.floor(degree / (intervals.length - 1));
  const degreeInOctave = degree % (intervals.length - 1);
  const centsOffset = intervals[degreeInOctave] + octavesFromDegree * 1200;

  // Shift tonic by octave (relative to octave 4)
  const octaveShift = octave - 4;
  const shiftedTonic = tonic * Math.pow(2, octaveShift);

  return centsToFrequency(shiftedTonic, centsOffset);
}

/**
 * Get all frequencies in a maqam scale for a given tonic.
 * Returns 8 frequencies (one octave, inclusive of the octave note).
 */
export function maqamScale(maqam: MaqamName, tonic: number = 293.66): number[] {
  const intervals = MAQAM_INTERVALS[maqam];
  return intervals.map((cents) => centsToFrequency(tonic, cents));
}

/**
 * Precomputed frequency arrays for all maqam scales at D4 tonic.
 * Useful for quick lookup without runtime computation.
 */
export const MAQAM_FREQUENCIES: Record<MaqamName, number[]> = {
  rast:     maqamScale('rast'),
  bayati:   maqamScale('bayati'),
  saba:     maqamScale('saba'),
  hijaz:    maqamScale('hijaz'),
  nahawand: maqamScale('nahawand'),
  kurd:     maqamScale('kurd'),
  ajam:     maqamScale('ajam'),
};

/**
 * Get a random frequency from a maqam scale, weighted toward
 * the tonic and fifth (degrees 0 and 4) for harmonic stability.
 */
export function weightedMaqamFrequency(maqam: MaqamName, tonic?: number): number {
  const weights = [4, 1, 2, 1, 3, 1, 1, 2]; // Favor tonic (0), third (2), fifth (4), octave (7)
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return maqamFrequency(i, maqam, 4, tonic);
    }
  }

  return maqamFrequency(0, maqam, 4, tonic);
}

/**
 * Get the domain-appropriate tonic frequency, with fallback to E4 (systems).
 */
export function domainTonic(domain: string): number {
  return DOMAIN_TONICS[domain] ?? DOMAIN_TONICS.systems;
}
