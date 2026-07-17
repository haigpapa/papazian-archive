import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X, Globe, Rows3, LayoutGrid, Map, BookOpen, ArrowRight } from 'lucide-react';
import { MOTION_DURATION, MOTION_EASE } from '../ui/motion';

const GUIDE_STORAGE_KEY = 'papazian-archive-guide-v2';
const CUE_STORAGE_KEY = 'papazian-archive-mode-cues-v1';

interface FirstVisitHintProps {
  isReady: boolean;
  currentMode: string;
  autoOpen?: boolean;
  replayToken?: number;
  onExploreWorks?: () => void;
}

const modes = [
  { icon: Globe, label: 'Orbit', description: 'Spatial overview' },
  { icon: Rows3, label: 'Works', description: '20-project spine' },
  { icon: LayoutGrid, label: 'Index', description: 'Evidence register' },
  { icon: Map, label: 'Map', description: 'Relations and routes' },
  { icon: BookOpen, label: 'Essays', description: 'Editorial reading' },
];

const spatialCues: Record<string, string> = {
  cylinder: 'Scroll or drag to orbit through the archive field.',
  map: 'Drag to pan, scroll or pinch to zoom, and tap a node to trace its relations.',
};

function readStorage(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // The guide remains functional when storage is unavailable.
  }
}

export function FirstVisitHint({
  isReady,
  currentMode,
  autoOpen = true,
  replayToken = 0,
  onExploreWorks,
}: FirstVisitHintProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<0 | 1>(0);
  const [cueMode, setCueMode] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isReady || !autoOpen) return;
    if (!readStorage(GUIDE_STORAGE_KEY)) setVisible(true);
  }, [autoOpen, isReady]);

  useEffect(() => {
    if (!isReady || replayToken === 0) return;
    setStep(0);
    setCueMode(null);
    setVisible(true);
  }, [isReady, replayToken]);

  useEffect(() => {
    if (!isReady || visible || !spatialCues[currentMode]) return;
    const seenModes = (readStorage(CUE_STORAGE_KEY) || '').split(',').filter(Boolean);
    if (seenModes.includes(currentMode)) return;
    setCueMode(currentMode);
  }, [currentMode, isReady, visible]);

  useEffect(() => {
    if (!cueMode) return;
    const timer = window.setTimeout(() => dismissCue(cueMode), 6500);
    return () => window.clearTimeout(timer);
  }, [cueMode]);

  const dismiss = () => {
    setVisible(false);
    writeStorage(GUIDE_STORAGE_KEY, '1');
  };

  const dismissCue = (mode: string) => {
    const seenModes = new Set((readStorage(CUE_STORAGE_KEY) || '').split(',').filter(Boolean));
    seenModes.add(mode);
    writeStorage(CUE_STORAGE_KEY, [...seenModes].join(','));
    setCueMode((current) => current === mode ? null : current);
  };

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.aside
            initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            transition={{ duration: reduceMotion ? 0 : MOTION_DURATION.slow, ease: MOTION_EASE }}
            className="fixed bottom-[116px] left-3 right-3 z-[200] border border-white/22 bg-[#050505]/96 shadow-2xl backdrop-blur-xl pointer-events-auto md:bottom-[118px] md:left-5 md:right-auto md:w-[380px]"
            aria-label="Archive navigation guide"
          >
            <div className="flex min-h-11 items-center justify-between border-b border-ui-border px-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
                Navigation guide · {step + 1}/2
              </span>
              <button
                type="button"
                onClick={dismiss}
                className="-mr-2 flex min-h-[44px] min-w-[44px] items-center justify-center text-text-muted transition-colors hover:text-white"
                aria-label="Close navigation guide"
              >
                <X size={15} />
              </button>
            </div>

            {step === 0 ? (
              <div className="px-4 py-4">
                <p className="font-display text-lg font-bold uppercase leading-tight text-white">
                  One archive, five projections.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  Scroll or drag to move through Orbit. Your selected work and relevant filters follow when you change views.
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex min-h-[44px] flex-1 items-center justify-between border border-white/24 px-3 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white hover:text-black"
                  >
                    See the modes <ArrowRight size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      dismiss();
                      onExploreWorks?.();
                    }}
                    className="min-h-[44px] border border-ui-border px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted transition-colors hover:border-white hover:text-white"
                  >
                    Works
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3">
                <div className="grid grid-cols-1 gap-px bg-ui-bg-hover sm:grid-cols-5">
                  {modes.map(({ icon: Icon, label, description }) => (
                    <div key={label} className="flex items-center gap-3 bg-[#050505] px-3 py-2.5 sm:block sm:px-2 sm:text-center">
                      <Icon size={14} className="shrink-0 text-accent sm:mx-auto" aria-hidden="true" />
                      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-white sm:mt-2 sm:block">
                        {label}
                      </span>
                      <span className="ml-auto font-mono text-[11px] text-text-muted sm:ml-0 sm:mt-1 sm:block sm:text-[9px]">
                        {description}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={dismiss}
                  className="mt-3 min-h-[44px] w-full bg-white px-4 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-black transition-colors hover:bg-white/88"
                >
                  Begin exploring
                </button>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!visible && cueMode && spatialCues[cueMode] && (
          <motion.aside
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : MOTION_DURATION.base, ease: MOTION_EASE }}
            className="fixed bottom-[116px] left-3 right-3 z-[198] flex min-h-[48px] items-center gap-3 border border-ui-border bg-black/90 px-3 pointer-events-auto md:bottom-[118px] md:left-5 md:right-auto md:w-[360px]"
            aria-label={`${cueMode === 'map' ? 'Map' : 'Orbit'} interaction hint`}
          >
            <Globe size={14} className="shrink-0 text-accent" aria-hidden="true" />
            <p className="flex-1 font-mono text-[11px] uppercase leading-relaxed tracking-[0.1em] text-white">
              {spatialCues[cueMode]}
            </p>
            <button
              type="button"
              onClick={() => dismissCue(cueMode)}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center text-text-muted hover:text-white"
              aria-label="Dismiss interaction hint"
            >
              <X size={14} />
            </button>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
