import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Map } from 'lucide-react';
import { WORLDS } from '../data/worlds';
import { MOTION_DURATION, MOTION_EASE } from '../ui/motion';

export interface TraversalRoute {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  nodes: string[];
}

export const TRAVERSAL_ROUTES: TraversalRoute[] = [
  {
    id: 'route-01',
    name: 'ROUTE 01: VISIBILITY BECOMES INFRASTRUCTURE',
    subtitle: 'The Structural Arc',
    description: 'Traces the evolution of visibility, vulnerability, and spatial agency from the stadium stages of Mashrou’ Leila into physical blueprints of sanctuary in Queens.',
    nodes: ['mashrou-leila', 'cost-of-being-queer-and-arab', 'mekena-nyc', 'architectures-of-belonging'],
  },
  {
    id: 'route-02',
    name: 'ROUTE 02: MEMORY DOES NOT RESOLVE',
    subtitle: 'The Literary Arc',
    description: 'Tracks the cartography of damaged space, exilic drift, and digital memory decay across Bartlett drawings, hypertext operating systems, and generative neural pipelines.',
    nodes: ['architecture-in-low-res', 'cartography-of-absence', 'sometimes-i-wake-up-elsewhere', 'sparrowos', 'derive'],
  },
  {
    id: 'route-03',
    name: 'ROUTE 03: RED-TEAMING THE MACHINE',
    subtitle: 'The Forensic Arc',
    description: 'Examines the computational and acoustic resistance to Western bias in generative language models, microtonal tuning systems, and human-AI duos.',
    nodes: ['localization-gap', 'hah-was', 'maqamai', 'tebr'],
  },
];

interface MapModeToolsProps {
  nodes: any[];
  activeRoute: TraversalRoute | null;
  onRouteChange: (route: TraversalRoute | null) => void;
  onRouteStepChange: (step: number) => void;
  onNodeClick: (node: any) => void;
}

const WORLD_COLORS: Record<string, string> = {
  'foundation-world': '#d5a2a2',
  'public-culture-world': '#d7e7ef',
  'exile-machines-world': '#9fd6bf',
  'memory-interfaces-world': '#c7b28a',
  'sonic-intelligence-world': '#7aa6ff',
  'spatial-futures-world': '#8fa8c2',
};

export default function MapModeTools({
  nodes,
  activeRoute,
  onRouteChange,
  onRouteStepChange,
  onNodeClick,
}: MapModeToolsProps) {
  const [showMobileTools, setShowMobileTools] = React.useState(false);

  const startRoute = (route: TraversalRoute) => {
    onRouteChange(route);
    onRouteStepChange(0);
    const firstNode = nodes.find((node) => node.slug === route.nodes[0]);
    if (firstNode) onNodeClick(firstNode);
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ duration: MOTION_DURATION.base, ease: MOTION_EASE }}
        className="desktop-map-tools fixed left-5 top-24 z-[100] hidden w-[290px] flex-col gap-1.5 pointer-events-auto md:flex"
        aria-label="Curated traversal routes"
      >
        <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.28em] text-accent">Traversal Routes</p>
        {TRAVERSAL_ROUTES.map((route) => (
          <button
            key={route.id}
            type="button"
            onClick={() => startRoute(route)}
            className="border border-ui-border bg-black/40 p-3 text-left backdrop-blur-sm transition-colors hover:border-accent/50 hover:bg-ui-bg group"
          >
            <span className="block font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-white transition-colors group-hover:text-accent">{route.name}</span>
            <span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.14em] text-text-muted">{route.subtitle} / {route.nodes.length} stops</span>
          </button>
        ))}
      </motion.nav>

      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ duration: MOTION_DURATION.base, ease: MOTION_EASE, delay: 0.08 }}
        className="desktop-map-tools fixed left-5 bottom-[108px] z-[100] hidden w-[200px] pointer-events-auto md:block"
        aria-label="Map legend"
      >
        <p className="mb-2 font-mono text-[8px] uppercase tracking-[0.28em] text-text-muted">World Legend</p>
        <div className="space-y-1.5">
          {WORLDS.map((world) => (
            <div key={world.id} className="flex items-center gap-2.5">
              <span className="h-2 w-2 shrink-0" style={{ backgroundColor: WORLD_COLORS[world.id] || '#d7e7ef' }} />
              <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-text-muted">{world.roman} {world.name}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="mobile-map-tools fixed z-[90] flex flex-col gap-2 pointer-events-auto md:hidden"
      >
        <AnimatePresence>
          {showMobileTools && (
            <motion.div
              id="mobile-map-tools-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-h-[min(54svh,430px)] overflow-y-auto momentum-scroll bg-black/92 backdrop-blur-md border border-ui-border p-4 flex flex-col gap-4 rounded-none"
            >
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[11px] uppercase tracking-widest text-text-muted">Routes</span>
                {TRAVERSAL_ROUTES.map((route) => (
                  <button
                    key={route.id}
                    type="button"
                    onClick={() => {
                      if (activeRoute?.id === route.id) onRouteChange(null);
                      else startRoute(route);
                      setShowMobileTools(false);
                    }}
                    className={`min-h-[44px] border px-3 py-2 text-left font-mono text-[11px] uppercase tracking-wider transition-colors ${
                      activeRoute?.id === route.id
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-ui-border text-white hover:bg-ui-bg'
                    }`}
                  >
                    {route.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setShowMobileTools((visible) => !visible)}
          aria-expanded={showMobileTools}
          aria-controls="mobile-map-tools-panel"
          className="flex min-h-[44px] w-full items-center justify-center gap-2 border border-ui-border bg-surface/92 px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white shadow-lg backdrop-blur-md"
        >
          <Map size={12} /> {showMobileTools ? 'CLOSE TOOLS' : 'MAP TOOLS & ROUTES'}
        </button>
      </motion.div>
    </>
  );
}
