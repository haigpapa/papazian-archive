/**
 * useAudioEngine — React Hook Bridge
 *
 * Thin hook that bridges the AudioEngine singleton to React component lifecycle.
 * Uses useSyncExternalStore for tear-free reads of audio state.
 *
 * This hook does NOT own the Tone.js lifecycle — it only subscribes to it.
 * The AudioEngine singleton persists across React renders and hot reloads.
 */

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { AudioEngine } from './AudioEngine';

interface UseAudioEngineReturn {
  /** The AudioEngine singleton instance */
  engine: AudioEngine;
  /** Whether Tone.Context has been initialized (user clicked the toggle) */
  isInitialized: boolean;
  /** Whether audio output is currently muted */
  isMuted: boolean;
  /** Toggle audio on/off. Initializes on first call. */
  toggleAudio: () => Promise<void>;
  /** The current status of the audio engine */
  status: 'idle' | 'loading' | 'ready' | 'error';
  /** Any error message from initialization */
  error: string | null;
}

/**
 * Hook to access the AudioEngine singleton from React components.
 *
 * @example
 * ```tsx
 * function SoundToggle() {
 *   const { isInitialized, isMuted, toggleAudio } = useAudioEngine();
 *   return (
 *     <button onClick={toggleAudio}>
 *       {isMuted ? 'Enable Sound' : 'Mute'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useAudioEngine(): UseAudioEngineReturn {
  const engine = AudioEngine.getInstance();

  // Subscribe to state changes using useSyncExternalStore
  // This gives us tear-free reads without useState/useEffect cycles
  const subscribe = useCallback(
    (callback: () => void) => engine.subscribe(callback),
    [engine]
  );

  const getIsInitialized = useCallback(() => engine.isInitialized, [engine]);
  const getIsMuted = useCallback(() => engine.isMuted, [engine]);

  const getStatus = useCallback(() => engine.status, [engine]);
  const getError = useCallback(() => engine.error, [engine]);

  const isInitialized = useSyncExternalStore(subscribe, getIsInitialized, getIsInitialized);
  const isMuted = useSyncExternalStore(subscribe, getIsMuted, getIsMuted);
  const status = useSyncExternalStore(subscribe, getStatus, getStatus);
  const error = useSyncExternalStore(subscribe, getError, getError);

  const toggleAudio = useCallback(async () => {
    await engine.toggleMute();
  }, [engine]);

  // Dispose on unmount (only if the component tree is fully destroyed)
  useEffect(() => {
    return () => {
      // Note: We intentionally do NOT dispose here.
      // The singleton persists across React re-renders and HMR.
      // Disposal only happens via AudioEngine.dispose() called explicitly
      // from App.tsx cleanup, matching the Scene.ts pattern.
    };
  }, []);

  return { engine, isInitialized, isMuted, toggleAudio, status, error };
}
