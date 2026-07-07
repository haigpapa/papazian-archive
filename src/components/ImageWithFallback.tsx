import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props extends React.HTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  draggable?: boolean;
  className?: string;
  loading?: "eager" | "lazy";
  decoding?: 'async' | 'auto' | 'sync';
  fetchpriority?: 'high' | 'low' | 'auto';
  fallbackSrc?: string;
  fallbackText?: string;
  containerClassName?: string;
}

export function ImageWithFallback({ 
  src, 
  fallbackSrc, 
  fallbackText = 'MEDIA UNAVAILABLE',
  containerClassName = '',
  className,
  loading = 'eager',
  ...props 
}: Props) {
  const [errorCount, setErrorCount] = useState(0);

  // If both src and fallbackSrc fail, we show the placeholder.
  const hasFailed = errorCount > (fallbackSrc ? 1 : 0);

  if (hasFailed || !src) {
    return (
      <div className={`flex flex-col items-center justify-center bg-ui-bg border border-ui-border text-text-muted ${containerClassName} ${className}`}>
        <AlertTriangle size={24} className="mb-2 opacity-50" />
        <span className="font-mono text-[9px] uppercase tracking-wider">{fallbackText}</span>
      </div>
    );
  }

  return (
    <img
      src={errorCount === 1 && fallbackSrc ? fallbackSrc : src}
      onError={() => setErrorCount(c => c + 1)}
      className={className}
      loading={loading}
      {...props}
    />
  );
}
