import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { PageHeader } from '../components/PageHeader';
import { FilterChips } from '../components/FilterChips';
import { MovieCard, SeriesCard } from '../components/Cards';
import { EmptyState } from '../components/EmptyState';
import { watchKey } from '../utils/media';

export function KidsPage() {
  const catalog = useStore((state) => state.catalog);
  const progress = useStore((state) => state.progress);
  const [filter, setFilter] = useState('Todos');

  const movies = catalog?.movies.filter((m) => m.genres.includes('Kids') || m.genres.includes('Cartoon')) ?? [];
  const series = catalog?.series.filter((s) => s.genres.includes('Kids') || s.genres.includes('Cartoon')) ?? [];
  const allItems = [...series, ...movies];

  const visible = useMemo(() => {
    if (filter === 'Películas') return movies;
    if (filter === 'Series') return series;
    return allItems;
  }, [filter, movies, series, allItems]);

  if (allItems.length === 0) {
    return <EmptyState title="Sin contenido infantil" message="Pronto habrá más contenido para los más pequeños." />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Zona Infantil"
        title="KIDS"
        description="Animación, caricaturas, canciones infantiles y diversión para toda la familia."
        right={<span className="count-pill">{visible.length} títulos</span>}
      />
      <FilterChips options={['Todos', 'Películas', 'Series']} value={filter} onChange={setFilter} />
      <div className="poster-grid">
        {visible.map((item, index) => {
          if ('seasons' in item) {
            return <SeriesCard key={item.id} series={item} autoFocus={index === 0} />;
          }
          const entry = progress[watchKey('movie', item.id)];
          const pct = entry && entry.duration > 0 ? entry.position / entry.duration : undefined;
          return <MovieCard key={item.id} movie={item} progress={pct} autoFocus={index === 0} />;
        })}
      </div>
    </>
  );
}
