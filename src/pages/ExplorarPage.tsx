import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { PageHeader } from '../components/PageHeader';
import { FilterChips } from '../components/FilterChips';
import { MovieCard, SeriesCard, ChannelCard } from '../components/Cards';
import { EmptyState } from '../components/EmptyState';
import { watchKey } from '../utils/media';

export function ExplorarPage() {
  const catalog = useStore((state) => state.catalog);
  const progress = useStore((state) => state.progress);
  const [section, setSection] = useState('Todo');

  const channels = catalog?.channels ?? [];
  const movies = catalog?.movies ?? [];
  const series = catalog?.series ?? [];

  const totalCount = channels.length + movies.length + series.length;

  return (
    <>
      <PageHeader
        eyebrow="Explora todo el universo"
        title="EXPLORAR"
        description="Todo el catálogo de televisión en vivo, películas taquilleras, series completas y anime en un solo lugar."
        right={<span className="count-pill">{totalCount} contenidos</span>}
      />
      <FilterChips options={['Todo', 'TV en vivo', 'Películas', 'Series']} value={section} onChange={setSection} />

      {(section === 'Todo' || section === 'TV en vivo') && channels.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#c6ff4a' }}>
            Canales de TV en directo ({channels.length})
          </h2>
          <div className="channel-grid">
            {channels.slice(0, 16).map((ch) => (
              <ChannelCard key={ch.id} channel={ch} />
            ))}
          </div>
        </div>
      )}

      {(section === 'Todo' || section === 'Películas') && movies.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#46e6ff' }}>
            Películas a la carta ({movies.length})
          </h2>
          <div className="poster-grid">
            {movies.slice(0, 16).map((movie) => {
              const entry = progress[watchKey('movie', movie.id)];
              const pct = entry && entry.duration > 0 ? entry.position / entry.duration : undefined;
              return <MovieCard key={movie.id} movie={movie} progress={pct} />;
            })}
          </div>
        </div>
      )}

      {(section === 'Todo' || section === 'Series') && series.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#ffb86b' }}>
            Series y Temporadas ({series.length})
          </h2>
          <div className="poster-grid">
            {series.slice(0, 16).map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
