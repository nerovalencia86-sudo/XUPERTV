import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Catalog, Season, SourceSettings, WatchProgress } from './types';
import { loadContent } from './data/source';
import { watchKey } from './utils/media';

interface AppStore {
  settings: SourceSettings;
  favorites: string[];
  progress: Record<string, WatchProgress>;
  volume: number;

  catalog: Catalog | null;
  catalogLoading: boolean;
  catalogError: string | null;

  loadCatalog: () => Promise<void>;
  applyCatalog: (catalog: Catalog) => void;
  updateSettings: (partial: Partial<SourceSettings>) => void;
  toggleFavorite: (key: string) => void;
  setProgress: (kind: 'movie' | 'episode', id: string, position: number, duration: number) => void;
  removeProgress: (key: string) => void;
  setVolume: (volume: number) => void;
  updateSeriesSeasons: (seriesId: string, seasons: Season[]) => void;
  clearLibrary: () => void;
}

const defaultSettings: SourceSettings = {
  mode: 'demo',
  m3uUrl: '',
  m3uText: '',
  xtreamServer: '',
  xtreamUsername: '',
  xtreamPassword: '',
};

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      favorites: [],
      progress: {},
      volume: 0.9,

      catalog: null,
      catalogLoading: false,
      catalogError: null,

      loadCatalog: async () => {
        if (get().catalogLoading) return;
        set({ catalogLoading: true, catalogError: null });
        try {
          const catalog = await loadContent(get().settings);
          set({ catalog, catalogLoading: false, catalogError: null });
        } catch (error) {
          set({
            catalogLoading: false,
            catalogError: error instanceof Error ? error.message : 'No se pudo cargar el contenido.',
          });
        }
      },

      applyCatalog: (catalog) => set({ catalog, catalogLoading: false, catalogError: null }),

      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),

      toggleFavorite: (key) =>
        set((state) => ({
          favorites: state.favorites.includes(key)
            ? state.favorites.filter((item) => item !== key)
            : [...state.favorites, key],
        })),

      setProgress: (kind, id, position, duration) => {
        if (!Number.isFinite(position) || !Number.isFinite(duration) || duration <= 0) return;
        const key = watchKey(kind, id);
        set((state) => ({
          progress: {
            ...state.progress,
            [key]: { position, duration, updatedAt: Date.now() },
          },
        }));
      },

      removeProgress: (key) =>
        set((state) => {
          const next = { ...state.progress };
          delete next[key];
          return { progress: next };
        }),

      setVolume: (volume) => set({ volume }),

      updateSeriesSeasons: (seriesId, seasons) =>
        set((state) => {
          if (!state.catalog) return state;
          return {
            catalog: {
              ...state.catalog,
              series: state.catalog.series.map((series) =>
                series.id === seriesId ? { ...series, seasons } : series,
              ),
            },
          };
        }),

      clearLibrary: () => set({ favorites: [], progress: {} }),
    }),
    {
      name: 'xuper-tv-state',
      version: 1,
      partialize: (state) => ({
        settings: state.settings,
        favorites: state.favorites,
        progress: state.progress,
        volume: state.volume,
      }),
    },
  ),
);
