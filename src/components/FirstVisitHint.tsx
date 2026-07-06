import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, MousePointer2, ArrowLeftRight, Grid3x3, Globe } from 'lucide-react';

const STORAGE_KEY = 'papazian-archive-hint-seen';

interface FirstVisitHintProps {
  isReady: boolean;
}

export function FirstVisitHint({ isReady }: FirstVisitHintProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        // Delay hint appearance to let the user absorb the initial view
        const timer = setTimeout(() => setVisible(true), 2400);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable — skip hint
    }
  }, [isReady]);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // silent
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[200] pointer-events-auto max-w-[360px] w-[calc(100vw-48px)]"
        >
          <div className="bg-surface/95 backdrop-blur-2xl border border-white/16 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <span className="font-mono text-[8px] uppercase tracking-[0.26em] text-accent">
                Navigation Guide
              </span>
              <button
                onClick={dismiss}
                className="text-text-muted hover:text-white transition-colors p-3 -m-2"
                aria-label="Dismiss hint"
              >
                <X size={14} />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-4 space-y-4">
              <HintRow
                icon={<MousePointer2 size={14} />}
                label="Orbit"
                description="Drag to rotate, scroll to zoom the spatial field"
              />
              <HintRow
                icon={<ArrowLeftRight size={14} />}
                label="Works"
                description="Click any card to enter the cinematic rail view"
              />
              <HintRow
                icon={<Grid3x3 size={14} />}
                label="Index"
                description="Filter and sort all 120 works by world, medium, or type"
              />
              <HintRow
                icon={<Globe size={14} />}
                label="Map"
                description="Explore projects as a spatial atlas with connections"
              />
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 px-5 py-3">
              <button
                onClick={dismiss}
                className="w-full min-h-[44px] bg-accent hover:bg-accent/80 text-black font-mono text-[9px] font-bold tracking-[0.16em] uppercase px-4 py-2.5 transition-all cursor-pointer"
              >
                Begin Exploring
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HintRow({ icon, label, description }: { icon: React.ReactNode; label: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-accent mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-white block">
          {label}
        </span>
        <span className="font-mono text-[9px] text-text-muted leading-relaxed block mt-0.5">
          {description}
        </span>
      </div>
    </div>
  );
}
