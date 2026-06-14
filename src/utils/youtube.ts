export interface YouTubeLike {
  youtubeId?: string;
  externalUrl?: string;
}

export function getYouTubeId(item?: YouTubeLike | null): string | null {
  if (!item) return null;
  const directId = normalizeYouTubeId(item.youtubeId);
  if (directId) return directId;
  if (!item.externalUrl) return null;

  try {
    const url = new URL(item.externalUrl);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      return normalizeYouTubeId(url.pathname.split('/').filter(Boolean)[0]);
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      const watchId = normalizeYouTubeId(url.searchParams.get('v'));
      if (watchId) return watchId;

      const [kind, id] = url.pathname.split('/').filter(Boolean);
      if (kind === 'shorts' || kind === 'embed' || kind === 'live') {
        return normalizeYouTubeId(id);
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function getYouTubeEmbedUrl(item?: YouTubeLike | null): string | null {
  const id = getYouTubeId(item);
  if (!id) return null;

  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });

  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

export function getYouTubeWatchUrl(item?: YouTubeLike | null): string | null {
  const id = getYouTubeId(item);
  return id ? `https://www.youtube.com/watch?v=${id}` : item?.externalUrl || null;
}

function normalizeYouTubeId(value?: string | null): string | null {
  const id = String(value || '').trim();
  return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
}
