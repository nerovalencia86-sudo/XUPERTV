import type {
  Catalog,
  ContinueItem,
  Episode,
  MediaKind,
  ResolvedMedia,
  WatchProgress,
} from '../types';

export function watchKey(kind: MediaKind, id: string): string {
  return `${kind}:${id}`;
}

export function parseWatchKey(key: string): { kind: 'live' | 'movie' | 'episode'; id: string } | null {
  const separator = key.indexOf(':');
  if (separator < 0) return null;
  const kind = key.slice(0, separator);
  const id = key.slice(separator + 1);
  if (kind !== 'live' && kind !== 'movie' && kind !== 'episode') return null;
  return { kind, id };
}

export function resolveMedia(catalog: Catalog | null, kind: string, id: string): ResolvedMedia | null {
  if (!catalog) return null;

  if (kind === 'live') {
    const channel = catalog.channels.find((item) => item.id === id);
    if (!channel) return null;
    return {
      id: channel.id,
      kind: 'live',
      title: channel.name,
      subtitle: channel.category,
      streamUrl: channel.streamUrl,
      live: true,
      colors: channel.colors,
      channel,
    };
  }

  if (kind === 'movie') {
    const movie = catalog.movies.find((item) => item.id === id);
    if (!movie) return null;
    return {
      id: movie.id,
      kind: 'movie',
      title: movie.title,
      subtitle: `${movie.year} · ${movie.genres.join(' · ')}`,
      description: movie.description,
      streamUrl: movie.streamUrl,
      live: false,
      colors: movie.colors,
      durationLabel: `${movie.duration} min`,
    };
  }

  if (kind === 'episode') {
    for (const series of catalog.series) {
      for (const season of series.seasons) {
        const episode = season.episodes.find((item) => item.id === id);
        if (episode) {
          return {
            id: episode.id,
            kind: 'episode',
            title: series.title,
            subtitle: `T${season.number} E${episode.number} · ${episode.title}`,
            description: episode.description,
            streamUrl: episode.streamUrl,
            live: false,
            colors: series.colors,
            seriesId: series.id,
            seasonNumber: season.number,
            episodeNumber: episode.number,
            durationLabel: `${episode.duration} min`,
          };
        }
      }
    }
  }

  return null;
}

export function findNextEpisode(
  catalog: Catalog | null,
  seriesId: string | undefined,
  episodeId: string,
): { episode: Episode; seasonNumber: number } | null {
  if (!catalog || !seriesId) return null;
  const series = catalog.series.find((item) => item.id === seriesId);
  if (!series) return null;

  const flat: Array<{ episode: Episode; seasonNumber: number }> = [];
  for (const season of series.seasons) {
    for (const episode of season.episodes) {
      flat.push({ episode, seasonNumber: season.number });
    }
  }

  const index = flat.findIndex((item) => item.episode.id === episodeId);
  if (index < 0 || index + 1 >= flat.length) return null;
  return flat[index + 1];
}

export function getContinueItems(
  catalog: Catalog | null,
  progress: Record<string, WatchProgress>,
): ContinueItem[] {
  if (!catalog) return [];

  const items: ContinueItem[] = [];
  for (const [key, item] of Object.entries(progress)) {
    const parsed = parseWatchKey(key);
    if (!parsed || parsed.kind === 'live') continue;
    const media = resolveMedia(catalog, parsed.kind, parsed.id);
    if (!media) continue;
    const pct = item.duration > 0 ? item.position / item.duration : 0;
    if (pct >= 0.97) continue;
    items.push({ key, progress: item, media });
  }

  return items.sort((a, b) => b.progress.updatedAt - a.progress.updatedAt).slice(0, 12);
}

export function getFavoriteMovies(catalog: Catalog | null, favorites: string[]) {
  if (!catalog) return [];
  return catalog.movies.filter((movie) => favorites.includes(`movie:${movie.id}`));
}

export function getFavoriteSeries(catalog: Catalog | null, favorites: string[]) {
  if (!catalog) return [];
  return catalog.series.filter((series) => favorites.includes(`series:${series.id}`));
}

export function getFavoriteChannels(catalog: Catalog | null, favorites: string[]) {
  if (!catalog) return [];
  return catalog.channels.filter((channel) => favorites.includes(`live:${channel.id}`));
}
