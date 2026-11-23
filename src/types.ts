export type SourceMode = 'demo' | 'm3u' | 'xtream';

export interface SourceSettings {
  mode: SourceMode;
  m3uUrl: string;
  m3uText: string;
  xtreamServer: string;
  xtreamUsername: string;
  xtreamPassword: string;
}

export interface Channel {
  id: string;
  name: string;
  category: string;
  streamUrl: string;
  colors: [string, string];
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  rating: number;
  genres: string[];
  duration: number;
  description: string;
  streamUrl: string;
  colors: [string, string];
  posterUrl?: string;
}

export interface Episode {
  id: string;
  number: number;
  title: string;
  description: string;
  duration: number;
  streamUrl: string;
}

export interface Season {
  number: number;
  episodes: Episode[];
}

export interface Series {
  id: string;
  title: string;
  year: number;
  rating: number;
  genres: string[];
  description: string;
  colors: [string, string];
  seasons: Season[];
  posterUrl?: string;
}

export interface Catalog {
  channels: Channel[];
  movies: Movie[];
  series: Series[];
  sourceLabel: string;
}

export interface WatchProgress {
  position: number;
  duration: number;
  updatedAt: number;
}

export type MediaKind = 'live' | 'movie' | 'episode';

export interface ResolvedMedia {
  id: string;
  kind: MediaKind;
  title: string;
  subtitle?: string;
  description?: string;
  streamUrl: string;
  live: boolean;
  colors: [string, string];
  seriesId?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  durationLabel?: string;
  channel?: Channel;
}

export interface ContinueItem {
  key: string;
  progress: WatchProgress;
  media: ResolvedMedia;
}
