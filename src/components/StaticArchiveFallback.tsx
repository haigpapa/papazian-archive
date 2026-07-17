import * as React from 'react';
import { ArrowRight, RefreshCw, Search } from 'lucide-react';
import type { AtlasNode } from '../data/atlas';
import { CANONICAL_PROJECT_SET, CANONICAL_PROJECT_SLUGS } from '../data/canonicalProjects';
import { getProjectWorld } from '../data/worlds';

interface StaticArchiveFallbackProps {
  error: string;
  nodes: AtlasNode[];
  onRetry: () => void;
}

export default function StaticArchiveFallback({ error, nodes, onRetry }: StaticArchiveFallbackProps) {
  const [query, setQuery] = React.useState('');
  const projects = React.useMemo(() => {
    const canonical = nodes
      .filter((node) => CANONICAL_PROJECT_SET.has(node.slug))
      .sort((a, b) => CANONICAL_PROJECT_SLUGS.indexOf(a.slug) - CANONICAL_PROJECT_SLUGS.indexOf(b.slug));
    const normalized = query.trim().toLowerCase();
    if (!normalized) return canonical;
    return canonical.filter((node) => [
      node.title,
      node.year,
      node.summary,
      node.shortDescription,
      ...(node.domains || []),
      getProjectWorld(node.slug)?.name,
    ].filter(Boolean).some((value) => String(value).toLowerCase().includes(normalized)));
  }, [nodes, query]);

  return (
    <section className="fixed inset-0 z-[300] overflow-y-auto bg-black text-white pointer-events-auto custom-scrollbar" aria-labelledby="fallback-title">
      <header className="sticky top-0 z-10 border-b border-ui-border bg-black/95 px-4 py-4 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-6xl items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Text archive / Safe mode</p>
            <h1 id="fallback-title" className="mt-2 font-display text-xl font-bold uppercase tracking-tight md:text-3xl">
              Haig Papazian Archive
            </h1>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="flex min-h-[44px] shrink-0 items-center gap-2 border border-ui-border px-3 font-mono text-[11px] font-bold uppercase tracking-[0.12em] hover:border-white"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Retry 3D
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[minmax(240px,0.7fr)_minmax(0,1.3fr)] md:px-8 md:py-12">
        <aside>
          <p className="max-w-[48ch] text-sm leading-relaxed text-text">
            The WebGL spatial field could not start, but the complete selected-work archive remains available as ordinary text and links.
          </p>
          <p className="mt-3 font-mono text-[11px] leading-relaxed text-red-300" role="status">
            {error}
          </p>

          <form className="mt-6" role="search" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="fallback-search" className="mb-2 block font-mono text-[11px] font-bold uppercase tracking-[0.15em]">
              Search selected works
            </label>
            <div className="flex min-h-[48px] items-center gap-3 border border-ui-border px-3 focus-within:border-white">
              <Search size={15} className="text-accent" aria-hidden="true" />
              <input
                id="fallback-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-h-[44px] min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-text-muted"
                placeholder="Title, world, medium, year"
              />
            </div>
          </form>
        </aside>

        <div>
          <div className="mb-3 flex items-center justify-between border-b border-ui-border pb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted">
            <span>Selected works</span>
            <span>{projects.length} / {nodes.filter((node) => CANONICAL_PROJECT_SET.has(node.slug)).length}</span>
          </div>
          {projects.length ? (
            <ol>
              {projects.map((node, index) => {
                const world = getProjectWorld(node.slug);
                return (
                  <li key={node.slug} className={`border-b border-ui-border ${index >= 6 ? 'deferred-archive-row' : ''}`}>
                    <a
                      href={`/case-studies/${node.slug}`}
                      className="group grid min-h-[92px] grid-cols-[2.5rem_1fr_auto] items-center gap-3 py-4 hover:bg-white/[0.05] md:px-3"
                    >
                      <span className="font-mono text-[11px] text-text-muted">{String(index + 1).padStart(2, '0')}</span>
                      <span>
                        <span className="block font-display text-base font-bold uppercase text-white md:text-lg">{node.title}</span>
                        <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">
                          {world?.name || 'Archive'} · {node.year}
                        </span>
                        <span className="mt-2 block max-w-[64ch] text-sm leading-relaxed text-text">
                          {node.shortDescription || node.summary}
                        </span>
                      </span>
                      <ArrowRight size={16} className="text-accent transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="border border-ui-border p-6 text-sm text-text-muted">No selected works match this search.</p>
          )}
        </div>
      </div>
    </section>
  );
}
