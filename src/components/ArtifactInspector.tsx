import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, ArrowUpRight, Map, LayoutGrid, ExternalLink, Copy, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
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
              className="relative z-[301] flex flex-col lg:flex-row max-w-[1100px] w-[95vw] max-h-[90vh] bg-surface/95 backdrop-blur-xl border border-white/12 shadow-2xl overflow-hidden"
            >
              {/* Close button */}
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close inspector"
              >
                <X size={16} />
              </button>

              {/* Prev/Next navigation */}
              {onPrev && (
                <button
                  onClick={onPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-colors lg:left-3"
                  aria-label="Previous artifact"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              {onNext && (
                <button
                  onClick={onNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-colors lg:hidden"
                  aria-label="Next artifact"
                >
                  <ChevronRight size={18} />
                </button>
              )}

              {/* Left: Media Preview */}
              <div className="flex-1 min-h-[200px] lg:min-h-0 flex items-center justify-center p-4 lg:p-8 bg-black/30 relative overflow-hidden">
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
                      <img
                        src={record.poster}
                        alt={title}
                        className="max-h-[200px] object-contain"
                      />
                    )}
                    <div className="w-full flex items-center gap-4">
                      <Volume2 size={16} className="text-accent shrink-0" />
                      <audio src={record?.src} controls className="w-full h-8" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={record?.src || record?.thumbnail || ''}
                    alt={title}
                    className="max-w-full max-h-[60vh] object-contain"
                    loading="eager"
                  />
                )}

                {/* Video/Audio overlay play button hint */}
                {(isVideoType || isAudioType) && onPlayMedia && (
                  <button
                    onClick={() => onPlayMedia(record)}
                    className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 text-white font-mono text-[9px] uppercase tracking-[0.16em] hover:bg-white/20 transition-colors"
                    aria-label="Open in player"
                  >
                    <Play size={12} />
                    Open Player
                  </button>
                )}
              </div>

              {/* Right: Metadata Panel */}
              <div className="w-full lg:w-[340px] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col overflow-y-auto">
                {/* Header */}
                <div className="p-5 border-b border-white/8">
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
                <div className="p-5 flex flex-col gap-3 border-b border-white/8 flex-1">
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
                    <div className="mt-2 pt-3 border-t border-white/6">
                      <p className="font-mono text-[9px] text-text-muted/50 uppercase tracking-[0.16em] mb-1">
                        Caption
                      </p>
                      <p className="text-xs text-text-body leading-relaxed">
                        {record.caption}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="p-4 flex flex-col gap-2">
                  {onOpenRail && projectSlug && (
                    <ActionButton
                      icon={<ArrowUpRight size={12} />}
                      label="Open Rail"
                      sublabel={`Enter ${parentTitle} cinematic view`}
                      onClick={() => onOpenRail(projectSlug)}
                    />
                  )}
                  {onShowInMaps && projectSlug && (
                    <ActionButton
                      icon={<Map size={12} />}
                      label="Show in Maps"
                      sublabel="View relations in atlas"
                      onClick={() => onShowInMaps(projectSlug)}
                    />
                  )}
                  {record?.externalUrl && (
                    <a
                      href={record.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2.5 border border-white/10 hover:bg-white/5 transition-colors group"
                    >
                      <ExternalLink size={12} className="text-text-muted group-hover:text-accent shrink-0" />
                      <div className="min-w-0">
                        <span className="font-mono text-[9px] text-white uppercase tracking-[0.16em] block truncate">
                          External Link
                        </span>
                      </div>
                    </a>
                  )}
                  {watchUrl && (
                    <a
                      href={watchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2.5 border border-white/10 hover:bg-white/5 transition-colors group"
                    >
                      <Play size={12} className="text-text-muted group-hover:text-accent shrink-0" />
                      <div className="min-w-0">
                        <span className="font-mono text-[9px] text-white uppercase tracking-[0.16em] block truncate">
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

                {/* Next button on desktop */}
                {onNext && (
                  <div className="hidden lg:block border-t border-white/8 p-2">
                    <button
                      onClick={onNext}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-text-muted hover:text-white hover:bg-white/5 transition-colors font-mono text-[9px] uppercase tracking-[0.16em]"
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
      className="flex items-center gap-3 px-3 py-2.5 border border-white/10 hover:bg-white/5 transition-colors group text-left"
    >
      <span className="text-text-muted group-hover:text-accent shrink-0 transition-colors">
        {icon}
      </span>
      <div className="min-w-0">
        <span className="font-mono text-[9px] text-white uppercase tracking-[0.16em] block truncate">
          {label}
        </span>
        {sublabel && (
          <span className="font-mono text-[7px] text-text-muted/40 uppercase tracking-[0.1em] block truncate mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </button>
  );
}
