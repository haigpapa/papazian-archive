import * as React from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import { getProjectWorld } from '../data/worlds';

interface AccessibleArchiveIndexProps {
  open: boolean;
  nodes: any[];
  contextNode?: any;
  onClose: () => void;
  onOpenNode: (node: any) => void;
}

export function filterArchiveNodes(nodes: any[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return nodes;
  return nodes.filter((node) => [
    node.title,
    node.year,
    node.category,
    node.summary,
    ...(node.domains || []),
    ...(node.tags || []),
  ].filter(Boolean).some((value) => String(value).toLowerCase().includes(normalizedQuery)));
}

export function resolveArchiveNode(nodes: any[], selectedSlug: string | null) {
  return nodes.find((node) => node.slug === selectedSlug) || nodes[0] || null;
}

export default function AccessibleArchiveIndex({
  open,
  nodes,
  contextNode,
  onClose,
  onOpenNode,
}: AccessibleArchiveIndexProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = React.useRef<HTMLElement | null>(null);
  const [query, setQuery] = React.useState('');
  const [selectedSlug, setSelectedSlug] = React.useState<string | null>(contextNode?.slug || nodes[0]?.slug || null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
      if (!dialog.open) dialog.showModal();
      window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    } else if (dialog.open) {
      dialog.close();
      previouslyFocusedRef.current?.focus();
    }
  }, [open]);

  React.useEffect(() => {
    if (contextNode?.slug) setSelectedSlug(contextNode.slug);
  }, [contextNode?.slug]);

  const filteredNodes = React.useMemo(() => {
    return filterArchiveNodes(nodes, query);
  }, [nodes, query]);

  const selectedNode = resolveArchiveNode(filteredNodes, selectedSlug);
  const selectedWorld = selectedNode ? getProjectWorld(selectedNode.slug) : null;

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="text-archive-dialog"
      aria-labelledby="text-archive-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) close();
      }}
    >
      {open && (
        <div className="text-archive-shell" onClick={(event) => event.stopPropagation()}>
          <header className="flex min-h-[64px] items-center justify-between border-b border-ui-border px-4 md:px-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Text archive</p>
              <h2 id="text-archive-title" className="mt-1 font-display text-lg font-bold uppercase tracking-[0.06em] text-white">
                Browse all project records
              </h2>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={close}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center border border-ui-border text-text-muted hover:border-white hover:text-white"
              aria-label="Close text archive"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </header>

          <div className="grid min-h-0 flex-1 grid-rows-[minmax(220px,44dvh)_minmax(0,1fr)] md:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)] md:grid-rows-1">
            <section className="flex min-h-0 flex-col border-b border-ui-border md:border-b-0 md:border-r" aria-labelledby="text-archive-list-title">
              <h3 id="text-archive-list-title" className="sr-only">Project list</h3>
              <form className="border-b border-ui-border p-3 md:p-4" role="search" onSubmit={(event) => event.preventDefault()}>
                <label htmlFor="text-archive-search" className="mb-2 block font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                  Search project records
                </label>
                <div className="flex min-h-[44px] items-center gap-3 border border-ui-border px-3 focus-within:border-white">
                  <Search size={15} className="shrink-0 text-accent" aria-hidden="true" />
                  <input
                    id="text-archive-search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="min-h-[44px] min-w-0 flex-1 self-stretch bg-transparent text-sm text-white outline-none placeholder:text-text-muted"
                    placeholder="Title, world, medium, year"
                    autoComplete="off"
                  />
                </div>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
                  {filteredNodes.length} of {nodes.length} records
                </p>
              </form>

              <ol className="min-h-0 flex-1 overflow-y-auto custom-scrollbar" aria-label="Archive project records">
                {filteredNodes.map((node, index) => {
                  const world = getProjectWorld(node.slug);
                  const selected = node.slug === selectedNode?.slug;
                  return (
                    <li key={node.slug} className={`border-b border-ui-border ${index >= 8 ? 'deferred-archive-row' : ''}`}>
                      <button
                        type="button"
                        onClick={() => setSelectedSlug(node.slug)}
                        className={`grid min-h-[64px] w-full grid-cols-[3rem_1fr_auto] items-center gap-3 px-3 text-left hover:bg-ui-bg ${selected ? 'bg-white/[0.07] shadow-[inset_3px_0_0_0_var(--color-accent)]' : ''}`}
                        aria-current={selected ? 'true' : undefined}
                      >
                        <span className="font-mono text-[11px] text-text-muted">{String(index + 1).padStart(3, '0')}</span>
                        <span className="min-w-0">
                          <span className="block truncate font-display text-sm font-bold uppercase text-white">{node.title}</span>
                          <span className="mt-1 block truncate font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">
                            {world?.name || 'Unassigned'} · {node.year}
                          </span>
                        </span>
                        <ArrowRight size={14} className={selected ? 'text-accent' : 'text-text-muted'} aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className="min-h-0 overflow-y-auto p-5 custom-scrollbar md:p-8" aria-label="Selected project record">
              {selectedNode ? (
                <div className="mx-auto max-w-[68ch]">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                    {selectedWorld?.roman || '00'} / {selectedWorld?.name || 'Archive'}
                  </p>
                  <h3 id="text-archive-detail-title" className="mt-3 text-balance font-display text-2xl font-bold uppercase leading-tight text-white md:text-4xl">
                    {selectedNode.title}
                  </h3>
                  <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted">
                    {selectedNode.year} · {(selectedNode.domains || [selectedNode.category]).join(' · ')}
                  </p>
                  <p className="mt-6 text-base leading-relaxed text-text text-pretty">
                    {selectedNode.summary || selectedNode.shortDescription}
                  </p>
                  {selectedNode.fullDescription && selectedNode.fullDescription !== selectedNode.summary && (
                    <p className="mt-4 text-sm leading-relaxed text-text-muted text-pretty">
                      {selectedNode.fullDescription}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onOpenNode(selectedNode);
                      close();
                    }}
                    className="mt-8 flex min-h-[48px] w-full items-center justify-between border border-accent bg-accent px-4 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-black hover:bg-white md:w-auto md:min-w-[240px]"
                  >
                    Show in Works
                    <ArrowRight size={15} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <div className="flex min-h-48 items-center justify-center text-center text-sm text-text-muted">
                  No project records match this search.
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </dialog>
  );
}
