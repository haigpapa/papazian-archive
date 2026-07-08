import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, ArrowUpRight, Map, LayoutGrid, ExternalLink, Copy, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { getYouTubeEmbedUrl, getYouTubeWatchUrl } from '../utils/youtube';
import { getProjectWorld } from '../data/worlds';

interface ArtifactInspectorProps {
  record: any | null;
  parentNode?: any | null;
  onClose: () => void;
  onOpenRail?: (slug: string) => void;
  onShowInMaps?: (slug: string) => void;
  onPlayMedia?: (record: any) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function ArtifactInspector({
  record,
  parentNode,
  onClose,
  onOpenRail,
  onShowInMaps,
  onPlayMedia,
  onPrev,
  onNext,
}: ArtifactInspectorProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = React.useRef<HTMLElement | null>(null);

  const embedUrl = getYouTubeEmbedUrl(record);
  const watchUrl = getYouTubeWatchUrl(record);
  const isVideoType = record?.type === 'video' || !!embedUrl;
  const isAudioType = record?.type === 'audio';
  const isImageType = !isVideoType && !isAudioType;
  const localVideoSrc = !embedUrl && /\.(mp4|webm|mov)(\?.*)?$/i.test(record?.src || '') ? record.src : null;

  const projectSlug = record?.projectId || record?.slug || '';
  const world = parentNode?.world || getProjectWorld(projectSlug);

  // Compute metadata fields
  const title = record?.label || record?.title || 'Untitled';
  const parentTitle = record?.projectTitle || parentNode?.title || projectSlug;
  const year = parentNode?.year || record?.year || '';
  const medium = (parentNode?.domains || []).join(' · ') || record?.category || '';
  const assetType = record?.type || 'image';
  const role = record?.role || 'evidence';
  const chapter = record?.chapter || '';

  // Dialog management
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (record) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
      if (!dialog.open) {
        dialog.showModal();
        setTimeout(() => closeButtonRef.current?.focus(), 50);
      }
    } else {
      if (dialog.open) dialog.close();
      previouslyFocusedRef.current?.focus();
    }
  }, [record]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!record) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev?.();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext?.();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [record, onClose, onPrev, onNext]);

  const handleCopyLink = () => {
    const assetIndex = record?.assetIndex || 0;
    const hash = `#mode=grid&record=${projectSlug}${assetIndex ? `&asset=${assetIndex}` : ''}`;
    navigator.clipboard?.writeText(`${window.location.origin}${window.location.pathname}${hash}`);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-[300] bg-transparent backdrop:bg-transparent m-0 p-0 w-full h-full max-w-full max-h-full border-none outline-none"
      onCancel={(e) => { e.preventDefault(); onClose(); }}
    >
      <AnimatePresence>
        {record && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[300] flex items-center justify-center"
            onClick={handleBackdropClick}
          >
            {/* Scrim */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Inspector Container */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-[301] flex flex-col lg:flex-row max-w-[1100px] w-[95vw] max-h-[90vh] bg-surface/95 backdrop-blur-xl border border-ui-border-hover shadow-2xl overflow-hidden"
            >
              {/* Close button */}
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center text-text-muted hover:text-white hover:bg-ui-bg-hover transition-colors"
                aria-label="Close inspector"
              >
                <X size={16} />
              </button>

              {/* Prev/Next navigation */}
              {onPrev && (
                <button
                  onClick={onPrev}
                  className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center text-text-muted hover:text-white hover:bg-ui-bg-hover transition-colors"
                  aria-label="Previous artifact"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              {onNext && (
                <button
                  onClick={onNext}
                  className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center text-text-muted hover:text-white hover:bg-ui-bg-hover transition-colors"
                  aria-label="Next artifact"
                >
                  <ChevronRight size={18} />
                </button>
              )}

              {/* Left: Media Preview */}
              <div className="flex-1 min-h-[200px] lg:min-h-0 flex items-center justify-center p-4 lg:p-8 bg-black/30 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={record?.src || embedUrl || localVideoSrc || 'empty'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    {isVideoType && embedUrl ? (
                      <div className="w-full aspect-video max-h-[60vh]">
                        <iframe
                          src={embedUrl}
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                          className="w-full h-full"
                          title={title}
                        />
                      </div>
                    ) : isVideoType && localVideoSrc ? (
                      <video
                        src={localVideoSrc}
                        poster={record?.poster}
                        controls
                        className="max-w-full max-h-[60vh] object-contain"
                      />
                    ) : isAudioType ? (
                      <div className="w-full flex flex-col items-center gap-6 px-6">
                        {record?.poster && (
                          <ImageWithFallback
                            src={record.poster}
                            fallbackSrc={record.poster.replace(/\.webp$/, '.jpg')}
                            alt={title}
                            className="max-h-[200px] object-contain"
                            containerClassName="w-[300px] h-[200px]"
                          />
                        )}
                        <div className="w-full flex items-center gap-4">
                          <Volume2 size={16} className="text-accent shrink-0" />
                          <audio src={record?.src} controls className="w-full h-8" />
                        </div>
                      </div>
                    ) : (
                      <ImageWithFallback
                        src={record?.src || record?.thumbnail || ''}
                        fallbackSrc={(record?.src || record?.thumbnail || '').replace(/\.webp$/, '.jpg')}
                        alt={title}
                        className="max-w-full max-h-[60vh] object-contain"
                        containerClassName="w-full h-[60vh]"
                        loading="eager"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Video/Audio overlay play button hint */}
                {(isVideoType || isAudioType) && onPlayMedia && (
                  <button
                    onClick={() => onPlayMedia(record)}
                    className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-ui-bg-hover border border-ui-border-hover text-white font-mono text-[9px] uppercase tracking-[0.16em] hover:bg-ui-bg-active transition-colors"
                    aria-label="Open in player"
                  >
                    <Play size={12} />
                    Open Player
                  </button>
                )}
              </div>
              {/* Right: Metadata Panel */}
              <div className="w-full lg:w-[340px] border-t lg:border-t-0 lg:border-l border-ui-border flex flex-col overflow-hidden">
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto momentum-scroll">
                  {/* Header */}
                  <div className="p-5 border-b border-ui-border">
                    <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider leading-tight">
                      {title}
                    </h2>
                    {chapter && (
                      <p className="font-mono text-[9px] text-accent/60 uppercase tracking-[0.16em] mt-1">
                        {chapter}
                      </p>
                    )}
                  </div>

                  {/* Metadata Grid */}
                  <div className="p-5 flex flex-col gap-3 border-b border-ui-border">
                    <MetaRow label="Parent Project" value={parentTitle} />
                    {world && (
                      <MetaRow
                        label="World"
                        value={`${world.roman} — ${world.name}`}
                        accent={true}
                      />
                    )}
                    <MetaRow label="Year" value={year} />
                    <MetaRow label="Medium" value={medium} />
                    <MetaRow label="Asset Type" value={assetType.toUpperCase()} />
                    <MetaRow label="Evidence Role" value={role.toUpperCase()} />
                    {record?.caption && (
                      <div className="mt-2 pt-2 border-t border-white/6">
                        <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-text-muted block mb-1">CAPTION</span>
                        <p className="font-mono text-[9px] text-text-muted leading-relaxed">
                          {record.caption}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="p-5 flex flex-col gap-2">
                    {onOpenRail && projectSlug && (
                      <ActionButton
                        icon={<ArrowUpRight size={12} />}
                        label="Open Rail"
                        sublabel={`Enter ${parentTitle} cinematic view`}
                        onClick={() => onOpenRail(projectSlug)}
                      />
                    )}
                    {watchUrl && (
                      <a
                        href={watchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-left p-3 bg-ui-bg hover:bg-ui-bg-hover transition-colors border border-ui-border flex items-center justify-between"
                      >
                        <div className="min-w-0">
                          <span className="font-mono text-[9px] font-bold text-white block uppercase tracking-[0.16em]">
                            Watch on YouTube
                          </span>
                        </div>
                      </a>
                    )}
                    <ActionButton
                      icon={<Copy size={12} />}
                      label="Copy Link"
                      sublabel="Copy deep link to clipboard"
                      onClick={handleCopyLink}
                    />
                  </div>
                </div>

                {/* Mobile nav strip — only show below lg */}
                {(onPrev || onNext) && (
                  <div className="lg:hidden flex items-center justify-between border-t border-ui-border px-5 py-3 bg-surface/95 backdrop-blur-md shrink-0">
                    <button
                      onClick={onPrev}
                      disabled={!onPrev}
                      aria-label="Previous"
                      className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronLeft size={14} /> Prev
                    </button>
                    <button
                      onClick={onNext}
                      disabled={!onNext}
                      aria-label="Next"
                      className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                )}

                {/* Next button on desktop */}
                {onNext && (
                  <div className="hidden lg:block border-t border-ui-border p-2">
                    <button
                      onClick={onNext}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-text-muted hover:text-white hover:bg-ui-bg transition-colors font-mono text-[9px] uppercase tracking-[0.16em]"
                    >
                      Next Artifact <ChevronRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}

function MetaRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-mono text-[8px] text-text-muted/50 uppercase tracking-[0.2em] shrink-0">
        {label}
      </span>
      <span className={`font-mono text-[10px] uppercase tracking-[0.08em] text-right truncate ${accent ? 'text-accent' : 'text-white/80'}`}>
        {value}
      </span>
    </div>
  );
}

function ActionButton({ icon, label, sublabel, onClick }: { icon: React.ReactNode; label: string; sublabel?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 border border-ui-border hover:bg-ui-bg transition-colors group text-left"
    >
      <span className="text-text-muted group-hover:text-accent shrink-0 transition-colors">
        {icon}
      </span>
      <div className="min-w-0">
        <span className="font-mono text-[9px] text-white uppercase tracking-[0.16em] block truncate">
          {label}
        </span>
        {sublabel && (
          <span className="font-mono text-[7px] text-text-muted-quiet uppercase tracking-[0.1em] block truncate mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </button>
  );
}
