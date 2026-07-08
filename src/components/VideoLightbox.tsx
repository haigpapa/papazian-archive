import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, X, Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { getYouTubeEmbedUrl, getYouTubeWatchUrl } from '../utils/youtube';
import { ImageWithFallback } from './ImageWithFallback';

interface VideoLightboxProps {
  media: any | null;
  onClose: () => void;
  onEnterProject?: (slug: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function VideoLightbox({ media, onClose, onEnterProject, onPrev, onNext }: VideoLightboxProps) {
  const embedUrl = getYouTubeEmbedUrl(media);
  const watchUrl = getYouTubeWatchUrl(media);
  const isVideoType = media?.type === 'video' || embedUrl;
  const isAudioType = media?.type === 'audio';
  const isImageType = media?.type === 'image' || (!isVideoType && !isAudioType);

  const localVideoSrc = !embedUrl && /\.(mp4|webm|mov)(\?.*)?$/i.test(media?.src || '') ? media.src : null;
  const audioSrc = isAudioType && /\.(mp3|wav|ogg|aac|m4a)(\?.*)?$/i.test(media?.src || '') ? media.src : null;

  // Audio playback state
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (media) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
      if (!dialog.open) {
        dialog.showModal();
        setTimeout(() => {
          closeButtonRef.current?.focus();
        }, 50);
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
      previouslyFocusedRef.current?.focus();
    }
  }, [media]);

  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  React.useEffect(() => {
    if (!media) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && onPrev) onPrev();
      if (event.key === 'ArrowRight' && onNext) onNext();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [media, onPrev, onNext]);

  // Audio effect triggers
  React.useEffect(() => {
    if (isAudioType && audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((err) => console.log('Audio playback block:', err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isAudioType]);

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Reset audio playback on media change
  React.useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [media]);

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className="lightbox-dialog fixed inset-0 z-[220] pointer-events-auto"
    >
      <AnimatePresence>
        {media && (
          <motion.div
            className="relative w-full max-w-[95vw] md:max-w-[940px] h-[85svh] md:h-[580px] border border-white/16 bg-[#050505]/96 md:bg-surface/92 backdrop-blur-xl flex flex-col md:flex-row rounded-none shadow-2xl overflow-hidden pointer-events-auto"
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.985 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            {/* Close Button: Fixed Static Position */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="absolute top-4 right-4 z-[100] flex h-9 w-9 items-center justify-center border border-ui-border text-white/50 bg-black/40 backdrop-blur-sm transition-all hover:border-white/35 hover:text-white cursor-pointer"
              aria-label="Close panel"
            >
              <X size={16} />
            </button>

            {/* Desktop Keyboard Shortcut Keycaps (Linear-inspired) */}
            <div className="absolute top-6 right-16 hidden md:flex items-center gap-1.5 font-mono text-[7px] text-white/30 tracking-widest pointer-events-none select-none z-[100]">
              <span className="flex items-center justify-center h-4.5 min-w-[18px] px-1 border border-ui-border bg-white/[0.03] text-white/40 text-[8px] font-sans">
                ←
              </span>
              <span className="flex items-center justify-center h-4.5 min-w-[18px] px-1 border border-ui-border bg-white/[0.03] text-white/40 text-[8px] font-sans">
                →
              </span>
              <span className="text-[6px] opacity-60">PREV/NEXT</span>
              <span className="w-px h-2.5 bg-ui-bg-hover mx-1" />
              <span className="flex items-center justify-center h-4.5 min-w-[26px] px-1 border border-ui-border bg-white/[0.03] text-white/40 text-[7px]">
                ESC
              </span>
              <span className="text-[6px] opacity-60">CLOSE</span>
            </div>

            {/* Left Column: Media Viewer (Width: 58%) */}
            <div className="w-full h-[45vh] md:h-full md:w-[58%] relative bg-black/45 border-b md:border-b-0 md:border-r border-ui-border flex items-center justify-center p-3">
              {/* Floating Prev/Next Chevron Controls inside the media container */}
              {onPrev && (
                <button
                  onClick={onPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 flex h-10 w-10 items-center justify-center border border-ui-border bg-black/60 text-white/70 rounded-none transition-all hover:bg-accent hover:text-black hover:border-accent cursor-pointer shadow-lg active:scale-95 group"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                </button>
              )}
              {onNext && (
                <button
                  onClick={onNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 flex h-10 w-10 items-center justify-center border border-ui-border bg-black/60 text-white/70 rounded-none transition-all hover:bg-accent hover:text-black hover:border-accent cursor-pointer shadow-lg active:scale-95 group"
                  aria-label="Next image"
                >
                  <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              {/* VIDEO VIEWER */}
              {isVideoType && (
                <div className="w-full h-full flex items-center justify-center">
                  {embedUrl ? (
                    <iframe
                      className="w-full h-full max-h-full object-contain border-0"
                      src={embedUrl}
                      title={media.label || 'Embedded video'}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="eager"
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  ) : localVideoSrc ? (
                    <video
                      className="w-full h-full max-h-full object-contain"
                      src={localVideoSrc}
                      controls
                      autoPlay
                      muted
                      playsInline
                    />
                  ) : (
                    <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/44">
                      Video stream unavailable
                    </div>
                  )}
                </div>
              )}

              {/* IMAGE VIEWER */}
              {isImageType && (
                <div className="w-full h-full flex items-center justify-center p-2">
                  <ImageWithFallback
                    className="max-w-full max-h-full object-contain border border-white/5 select-none"
                    src={media.src}
                    fallbackSrc={media.src?.replace(/\.webp$/, '.jpg')}
                    alt={media.label || 'Archive specimen'}
                    draggable={false}
                    decoding="async"
                    fetchpriority="high"
                    containerClassName="w-full h-full"
                  />
                </div>
              )}

              {/* AUDIO VIEWER */}
              {isAudioType && (
                <div className="flex flex-col items-center justify-center bg-[#070709] p-6 w-full h-full">
                  <div className="flex h-14 items-center justify-center gap-1 w-full max-w-[240px] mb-6">
                    {Array.from({ length: 22 }).map((_, i) => {
                      const heights = [14, 32, 45, 25, 10, 18, 32, 45, 55, 38, 20, 28, 48, 58, 50, 32, 22, 38, 42, 30, 14, 25];
                      const height = heights[i % heights.length];
                      return (
                        <motion.div
                          key={i}
                          className="w-[2.5px] bg-accent/70"
                          animate={isPlaying ? {
                            height: [height * 0.3, height, height * 0.4, height * 0.8, height * 0.3],
                          } : {
                            height: height * 0.25
                          }}
                          transition={{
                            duration: 1.2 + (i % 5) * 0.15,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      );
                    })}
                  </div>

                  {audioSrc && (
                    <audio
                      ref={audioRef}
                      src={audioSrc}
                      onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
                      onDurationChange={() => audioRef.current && setDuration(audioRef.current.duration)}
                      onEnded={() => setIsPlaying(false)}
                    />
                  )}

                  <div className="w-full max-w-[240px] border border-ui-border bg-black/45 p-3">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="flex h-8 w-8 items-center justify-center bg-accent text-black transition-transform active:scale-95 cursor-pointer"
                      >
                        {isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" className="ml-0.5" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-[8px] tracking-wider text-accent truncate">
                          {media.label}
                        </p>
                      </div>
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="flex h-7 w-7 items-center justify-center border border-ui-border text-white/70 hover:text-white"
                      >
                        {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                      </button>
                    </div>

                    {audioSrc && (
                      <div className="flex items-center gap-2 font-mono text-[8px] text-white/50">
                        <span>{formatTime(currentTime)}</span>
                        <input
                          type="range"
                          min={0}
                          max={duration || 100}
                          value={currentTime}
                          onChange={(e) => {
                            if (audioRef.current) {
                              const val = parseFloat(e.target.value);
                              audioRef.current.currentTime = val;
                              setCurrentTime(val);
                            }
                          }}
                          className="flex-1 h-[1.5px] bg-ui-bg-hover accent-accent cursor-pointer"
                        />
                        <span>{formatTime(duration)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Information Readout (Width: 42%) styled like the Info Console */}
            <div className="w-full flex-1 md:h-full md:w-[42%] flex flex-col min-h-0 p-5 md:p-6 bg-surface/10">
              {/* Header section */}
              <div className="shrink-0">
                <p className="font-mono text-[8px] uppercase tracking-[0.26em] text-accent">
                  {media.chapter || 'Archive'} / {media.role || 'evidence'}
                </p>
                <h2 className="mt-1 font-display text-sm font-bold uppercase tracking-[0.08em] text-white truncate w-[85%]">
                  {media.label || 'Artifact'}
                </h2>
                
                <div className="mt-3 flex items-center gap-3">
                  <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-accent/40">
                    {media.type || 'specimen'}
                  </span>
                  <span className="h-px flex-1 bg-ui-bg-hover" />
                </div>
              </div>

              {/* Scrollable body content styled like the Info Console */}
              <div className="flex-1 overflow-y-auto custom-scrollbar my-4 pr-1 min-h-0 space-y-4">
                {media.caption && (
                  <p className="text-xs leading-relaxed text-text font-mono text-pretty">
                    {media.caption}
                  </p>
                )}
                {media.body && (
                  <p className="text-[11px] leading-relaxed text-text-muted font-mono text-pretty">
                    {Array.isArray(media.body) ? media.body.join(' ') : media.body}
                  </p>
                )}
              </div>

              {/* Action Bridge & Pagination Footer */}
              <div className="shrink-0 border-t border-ui-border pt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.18em] text-white/28">
                  <span>Project Code: {media.projectId?.toUpperCase() || 'SPECIMEN'}</span>
                  <span>{media.assetIndex !== undefined && `IMAGE ${String(media.assetIndex + 1).padStart(2, '0')}`}</span>
                </div>

                {media.projectId && onEnterProject && (
                  <button
                    onClick={() => {
                      onEnterProject(media.projectId);
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 border border-accent/25 bg-accent/5 px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-accent hover:border-accent hover:bg-accent/15 transition-all cursor-pointer select-none active:scale-[0.98]"
                  >
                    Enter Project Rail
                    <ArrowUpRight size={12} />
                  </button>
                )}

                {watchUrl && (
                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 border border-ui-border px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-white/60 hover:border-ui-border-hover hover:text-white transition-colors cursor-pointer select-none"
                  >
                    Watch on YouTube
                    <ArrowUpRight size={11} />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}
