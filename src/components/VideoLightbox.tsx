import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, X } from 'lucide-react';
import { getYouTubeEmbedUrl, getYouTubeWatchUrl } from '../utils/youtube';

interface VideoLightboxProps {
  media: any | null;
  onClose: () => void;
}

export default function VideoLightbox({ media, onClose }: VideoLightboxProps) {
  const embedUrl = getYouTubeEmbedUrl(media);
  const watchUrl = getYouTubeWatchUrl(media);
  const localVideoSrc = !embedUrl && /\.(mp4|webm|mov)(\?.*)?$/i.test(media?.src || '') ? media.src : null;

  React.useEffect(() => {
    if (!media) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [media, onClose]);

  return (
    <AnimatePresence>
      {media && (
        <motion.div
          data-ui-layer="true"
          className="fixed inset-0 z-[220] flex items-center justify-center bg-black/92 px-4 py-5 pointer-events-auto md:px-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={media.label || 'Video player'}
        >
          <motion.div
            className="relative w-full max-w-6xl"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center border border-white/16 text-white/72 transition-colors hover:border-white/38 hover:text-white"
              aria-label="Close video"
            >
              <X size={18} />
            </button>

            <div className="mb-4 flex items-end justify-between gap-4 border-b border-white/12 pb-4">
              <div className="min-w-0">
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-accent">
                  {media.chapter || 'Video'} / {media.role || 'evidence'}
                </p>
                <h2 className="mt-2 truncate font-display text-2xl font-bold uppercase tracking-tight text-white md:text-4xl">
                  {media.label || 'Video'}
                </h2>
              </div>
              {watchUrl && (
                <a
                  href={watchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden shrink-0 items-center gap-2 border border-white/12 px-4 py-3 font-mono text-[9px] uppercase tracking-[0.18em] text-white/66 transition-colors hover:border-accent/60 hover:text-white md:flex"
                >
                  YouTube
                  <ArrowUpRight size={13} />
                </a>
              )}
            </div>

            <div className="relative aspect-video w-full overflow-hidden border border-white/14 bg-white/[0.03] shadow-2xl">
              {embedUrl ? (
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={embedUrl}
                  title={media.label || 'Embedded video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="eager"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : localVideoSrc ? (
                <video
                  className="absolute inset-0 h-full w-full object-contain"
                  src={localVideoSrc}
                  poster={media.poster}
                  controls
                  autoPlay
                  muted
                  playsInline
                />
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-white/44">
                  Video embed unavailable
                </div>
              )}
            </div>

            {(media.caption || watchUrl) && (
              <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                {media.caption && (
                  <p className="max-w-3xl text-sm leading-relaxed text-white/64">
                    {media.caption}
                  </p>
                )}
                {watchUrl && (
                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 border border-white/12 px-4 py-3 font-mono text-[9px] uppercase tracking-[0.18em] text-white/66 transition-colors hover:border-accent/60 hover:text-white md:hidden"
                  >
                    Open on YouTube
                    <ArrowUpRight size={13} />
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
