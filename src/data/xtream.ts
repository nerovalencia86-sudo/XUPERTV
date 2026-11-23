import type { Catalog, Channel, Episode, Movie, Season, Series, SourceSettings } from '../types';
import { COLOR_PAIRS } from './demo';
import { fetchRemoteJson } from './http';

interface XtreamCategory {
  category_id: string;
  category_name: string;
}

interface XtreamLiveStream {
  stream_id: number;
  name: string;
  stream_icon?: string;
  category_id?: string;
}

interface XtreamVodStream {
  stream_id: number;
  name: string;
  stream_icon?: string;
  category_id?: string;
  container_extension?: string;
  rating?: string;
  genre?: string;
  year?: string;
  plot?: string;
  duration?: string;
}

interface XtreamSeriesRow {
  series_id: number;
  name: string;
  cover?: string;
  category_id?: string;
  rating?: string;
  genre?: string;
  plot?: string;
  releaseDate?: string;
}

interface XtreamSeriesInfo {
  episodes?: Record<string, Array<{
    id: string | number;
    episode_num: number;
    title: string;
    season?: number;
    container_extension?: string;
    info?: {
      plot?: string;
      duration_secs?: number | string;
      duration?: string;
    };
  }>>;
}

function normalizeServer(server: string): string {
  let value = server.trim();
  if (!/^https?:\/\//i.test(value)) value = `http://${value}`;
  return value.replace(/\/+$/, '');
}

function credentials(settings: SourceSettings): string {
  return `username=${encodeURIComponent(settings.xtreamUsername)}&password=${encodeURIComponent(settings.xtreamPassword)}`;
}

function apiUrl(settings: SourceSettings, action?: string, extra?: string): string {
  const base = normalizeServer(settings.xtreamServer);
  const actionPart = action ? `&action=${action}` : '';
  const extraPart = extra ? `&${extra}` : '';
  return `${base}/player_api.php?${credentials(settings)}${actionPart}${extraPart}`;
}

function colorFor(value: string): [string, string] {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 100000;
  }
  return COLOR_PAIRS[hash % COLOR_PAIRS.length];
}

function categoryNames(categories: XtreamCategory[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const category of categories ?? []) {
    map.set(String(category.category_id), category.category_name || 'General');
  }
  return map;
}

function parseYear(value?: string): number {
  const match = String(value ?? '').match(/(19|20)\d{2}/);
  return match ? Number(match[0]) : new Date().getFullYear();
}

function parseRating(value?: string): number {
  const rating = Number.parseFloat(String(value ?? ''));
  return Number.isFinite(rating) && rating > 0 ? Math.round(rating * 10) / 10 : 7.0;
}

function parseDurationMinutes(value?: string): number {
  if (!value) return 100;
  const parts = String(value).split(':').map((part) => Number(part));
  if (parts.length === 3 && parts.every((part) => Number.isFinite(part))) {
    return Math.max(1, Math.round(parts[0] * 60 + parts[1] + parts[2] / 60));
  }
  const numeric = Number.parseFloat(String(value));
  return Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric) : 100;
}

export function xtreamStreamBase(settings: SourceSettings): string {
  return normalizeServer(settings.xtreamServer);
}

export async function fetchXtreamCatalog(settings: SourceSettings): Promise<Catalog> {
  if (!settings.xtreamServer || !settings.xtreamUsername || !settings.xtreamPassword) {
    throw new Error('Completa servidor, usuario y contraseña de Xtream Codes.');
  }

  const [liveCategories, liveStreams, vodCategories, vodStreams, seriesCategories, seriesRows] = await Promise.all([
    fetchRemoteJson<XtreamCategory[]>(apiUrl(settings, 'get_live_categories')).catch(() => []),
    fetchRemoteJson<XtreamLiveStream[]>(apiUrl(settings, 'get_live_streams')),
    fetchRemoteJson<XtreamCategory[]>(apiUrl(settings, 'get_vod_categories')).catch(() => []),
    fetchRemoteJson<XtreamVodStream[]>(apiUrl(settings, 'get_vod_streams')).catch(() => []),
    fetchRemoteJson<XtreamCategory[]>(apiUrl(settings, 'get_series_categories')).catch(() => []),
    fetchRemoteJson<XtreamSeriesRow[]>(apiUrl(settings, 'get_series')).catch(() => []),
  ]);

  if (!Array.isArray(liveStreams) || liveStreams.length === 0) {
    throw new Error('El servidor Xtream no devolvió canales. Verifica las credenciales o si la cuenta está activa.');
  }

  const base = normalizeServer(settings.xtreamServer);
  const liveCategoryMap = categoryNames(liveCategories);
  const vodCategoryMap = categoryNames(vodCategories);
  const seriesCategoryMap = categoryNames(seriesCategories);

  const channels: Channel[] = liveStreams.slice(0, 600).map((stream) => ({
    id: `xt-live-${stream.stream_id}`,
    name: stream.name || `Canal ${stream.stream_id}`,
    category: liveCategoryMap.get(String(stream.category_id)) ?? 'General',
    streamUrl: `${base}/live/${encodeURIComponent(settings.xtreamUsername)}/${encodeURIComponent(settings.xtreamPassword)}/${stream.stream_id}.m3u8`,
    colors: colorFor(`${stream.name}${stream.category_id}`),
  }));

  const movies: Movie[] = (Array.isArray(vodStreams) ? vodStreams : []).slice(0, 600).map((stream) => {
    const year = parseYear(stream.year || stream.name);
    return {
      id: `xt-vod-${stream.stream_id}`,
      title: stream.name || `Película ${stream.stream_id}`,
      year,
      rating: parseRating(stream.rating),
      genres: [stream.genre || vodCategoryMap.get(String(stream.category_id)) || 'Cine'],
      duration: parseDurationMinutes(stream.duration),
      description: stream.plot || 'Sinopsis no disponible.',
      streamUrl: `${base}/movie/${encodeURIComponent(settings.xtreamUsername)}/${encodeURIComponent(settings.xtreamPassword)}/${stream.stream_id}.${stream.container_extension || 'mp4'}`,
      colors: colorFor(stream.name || String(stream.stream_id)),
    };
  });

  const series: Series[] = (Array.isArray(seriesRows) ? seriesRows : []).slice(0, 400).map((row) => ({
    id: `xt-series-${row.series_id}`,
    title: row.name || `Serie ${row.series_id}`,
    year: parseYear(row.releaseDate),
    rating: parseRating(row.rating),
    genres: [row.genre || seriesCategoryMap.get(String(row.category_id)) || 'Serie'],
    description: row.plot || 'Sinopsis no disponible.',
    colors: colorFor(row.name || String(row.series_id)),
    seasons: [],
  }));

  return {
    channels,
    movies,
    series,
    sourceLabel: 'Xtream Codes',
  };
}

export async function fetchXtreamSeasons(settings: SourceSettings, seriesId: string): Promise<Season[]> {
  const numericId = seriesId.replace('xt-series-', '');
  const info = await fetchRemoteJson<XtreamSeriesInfo>(apiUrl(settings, 'get_series_info', `series_id=${encodeURIComponent(numericId)}`));
  const rawEpisodes = info.episodes ?? {};
  const base = normalizeServer(settings.xtreamServer);
  const seasons: Season[] = [];

  for (const [seasonKey, list] of Object.entries(rawEpisodes)) {
    const seasonNumber = Number(seasonKey);
    if (!Array.isArray(list)) continue;
    const episodes: Episode[] = list.map((raw) => {
      const durationSecs = Number(raw.info?.duration_secs ?? 0);
      const duration = Number.isFinite(durationSecs) && durationSecs > 0
        ? Math.max(1, Math.round(durationSecs / 60))
        : parseDurationMinutes(raw.info?.duration);
      return {
        id: `xt-ep-${seriesId.replace('xt-series-', '')}-${raw.id}`,
        number: Number(raw.episode_num ?? 1),
        title: raw.title || `Episodio ${raw.episode_num}`,
        description: raw.info?.plot || 'Sinopsis no disponible.',
        duration,
        streamUrl: `${base}/series/${encodeURIComponent(settings.xtreamUsername)}/${encodeURIComponent(settings.xtreamPassword)}/${raw.id}.${raw.container_extension || 'mp4'}`,
      };
    });
    if (episodes.length > 0) {
      seasons.push({ number: Number.isFinite(seasonNumber) ? seasonNumber : seasons.length + 1, episodes });
    }
  }

  seasons.sort((a, b) => a.number - b.number);
  return seasons;
}
