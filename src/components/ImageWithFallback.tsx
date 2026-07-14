import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { MEDIA_DIMENSIONS } from '../data/generated/mediaDimensions';

interface Props extends React.HTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  draggable?: boolean;
  className?: string;
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'auto' | 'sync';
  fetchPriority?: 'high' | 'low' | 'auto';
  fallbackSrc?: string;
  fallbackText?: string;
  containerClassName?: string;
  priority?: boolean;
}

export function ImageWithFallback({ 
  src, 
  fallbackSrc, 
  fallbackText = 'MEDIA UNAVAILABLE',
  containerClassName = '',
  className,
  priority = false,
  loading,
  decoding,
  fetchPriority,
  alt = '',
  ...props 
}: Props) {
  const [errorCount, setErrorCount] = useState(0);
  const activeSrc = errorCount === 1 && fallbackSrc ? fallbackSrc : src;
  const intrinsic = activeSrc ? MEDIA_DIMENSIONS[activeSrc] : undefined;

  // If both src and fallbackSrc fail, we show the placeholder.
  const hasFailed = errorCount > (fallbackSrc ? 1 : 0);

  if (hasFailed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-ui-bg border border-ui-border text-text-muted ${containerClassName} ${className}`}
        style={intrinsic ? { aspectRatio: `${intrinsic.width} / ${intrinsic.height}` } : undefined}
      >
        <AlertTriangle size={24} className="mb-2 opacity-50" />
        <span className="font-mono text-[9px] uppercase tracking-wider">{fallbackText}</span>
      </div>
    );
  }

  return (
    <img
      src={activeSrc}
      alt={alt}
      onError={() => setErrorCount(c => c + 1)}
      className={className}
      width={props.width ?? intrinsic?.width}
      height={props.height ?? intrinsic?.height}
      loading={loading ?? (priority ? 'eager' : 'lazy')}
      decoding={decoding ?? (priority ? 'sync' : 'async')}
      fetchPriority={fetchPriority ?? (priority ? 'high' : 'auto')}
      {...props}
    />
  );
}
