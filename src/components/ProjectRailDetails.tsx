import { Play, Volume2 } from 'lucide-react';

interface ProjectRailDetailsProps {
  activeNode: any;
  displayRailImage: any;
  displayRailIndex: number;
  railTotal: number;
  railChapter: string;
  railType: string;
  railRole: string;
  railBeat: string;
  railEmbedUrl?: string | null;
  relatedSlugs: string[];
  mobileSheetState: 'peek' | 'full';
  isMobileViewport: boolean;
  onOpenMedia: (media: any) => void;
  onSelectSlug: (slug: string) => void;
}

export default function ProjectRailDetails({
  activeNode,
  displayRailImage,
  displayRailIndex,
  railTotal,
  railChapter,
  railType,
  railRole,
  railBeat,
  railEmbedUrl,
  relatedSlugs,
  mobileSheetState,
  isMobileViewport,
  onOpenMedia,
  onSelectSlug,
}: ProjectRailDetailsProps) {
  if (mobileSheetState !== 'full' && isMobileViewport) return null;

  const title = String(displayRailImage?.label || activeNode?.title || 'NODE').toUpperCase();
  const code = String(displayRailImage?.id || activeNode?.slug || '0000').toUpperCase().slice(-9);
  const charSum = (value: string) => value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const latency = (charSum(code) % 100) * 0.0004 + 0.012;
  const entropy = (charSum(title) % 100) * 0.005 + 0.085;
  const faultRate = charSum(title) % 10 === 0 ? '0.04%' : '0.00%';

  return (
    <div className="mt-4 border-y border-ui-border py-4 md:mt-10 md:py-5">
      <div className="flex items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
        <span>ACTIVE / {String(displayRailIndex + 1).padStart(2, '0')} / {String(Math.max(railTotal, 1)).padStart(2, '0')}</span>
        <span className="truncate text-accent">{railChapter} / {railType} / {railRole}</span>
      </div>

      <p className="mt-3 font-display text-lg uppercase leading-tight text-white md:text-xl">
        {displayRailImage?.label || activeNode.title}
      </p>

      {String(railChapter).toUpperCase() === 'AUTHORSHIP' ? (
        <div className="mt-4 space-y-4">
          {railBeat && <p className="text-xs leading-relaxed text-text-muted">{railBeat}</p>}
          {displayRailImage?.body && (
            <div className="mt-4 border-t border-ui-border pt-4">
              <p className="mb-2.5 font-mono text-[9px] uppercase tracking-[0.2em] text-accent">Role Deliverables</p>
              <div className="grid grid-cols-2 gap-2">
                {(Array.isArray(displayRailImage.body) ? displayRailImage.body : [displayRailImage.body]).map((item: string, index: number) => (
                  <div key={item} className="flex items-start gap-2 border border-white/5 bg-ui-bg p-2 font-mono text-[9px] uppercase tracking-wider">
                    <span className="font-bold text-accent">0{index + 1}</span>
                    <span className="leading-tight text-text-muted">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : railBeat ? (
        <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-text-muted md:line-clamp-none">{railBeat}</p>
      ) : null}

      <div className="mt-4 flex items-center justify-between border-t border-ui-border pt-4 font-mono text-[8px] uppercase tracking-[0.16em] text-text-muted-quiet">
        <span>LATENCY: {latency.toFixed(4)} MS</span>
        <span>ENTROPY: {entropy.toFixed(3)} BITS</span>
        <span>FAULT RATE: {faultRate}</span>
      </div>

      {(railType === 'video' || railType === 'audio') && (
        <button
          type="button"
          disabled={!railEmbedUrl}
          onClick={() => railEmbedUrl && onOpenMedia(displayRailImage)}
          className="mt-4 flex w-full items-center justify-center gap-2 border border-accent/40 bg-accent/10 py-3 font-mono text-[9px] uppercase tracking-[0.18em] text-white transition-colors hover:border-accent hover:bg-accent/18 disabled:cursor-not-allowed disabled:border-ui-border disabled:bg-ui-bg disabled:text-white/28"
        >
          {railType === 'audio' ? <Volume2 size={14} /> : <Play size={14} />}
          {railEmbedUrl ? 'Play in Archive' : 'Video unavailable'}
        </button>
      )}

      {relatedSlugs.length > 0 && (
        <div className={`${mobileSheetState === 'full' ? 'block' : 'hidden'} mt-5 md:block`}>
          <p className="mb-2 font-mono text-[8px] uppercase tracking-[0.2em] text-text-muted">Related</p>
          <div className="flex flex-wrap gap-2">
            {relatedSlugs.map((slug) => (
              <button
                key={slug}
                type="button"
                onClick={() => onSelectSlug(slug)}
                className="min-h-[44px] border border-ui-border px-2 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-text-muted transition-colors hover:border-accent/60 hover:text-white md:min-h-0"
              >
                {slug.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
