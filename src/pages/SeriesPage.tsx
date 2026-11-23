import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { PageHeader } from '../components/PageHeader';
import { FilterChips } from '../components/FilterChips';
import { SeriesCard } from '../components/Cards';
import { EmptyState } from '../components/EmptyState';

export function SeriesPage() {
  const catalog = useStore((state) => state.catalog);
  const navigate = useNavigate();
  const [genre, setGenre] = useState('Todas');

  const series = catalog?.series ?? [];
  const genres = useMemo(
    () => ['Todas', ...Array.from(new Set(series.flatMap((item) => item.genres)))],
    [series],
  );
  const visible = genre === 'Todas' ? series : series.filter((item) => item.genres.includes(genre));

  if (series.length === 0) {
    return (
      <EmptyState
        title="Sin series por ahora"
        message="Tu fuente actual no incluye series. Conecta una cuenta Xtream Codes en ajustes para ver temporadas completas."
        action={
          <button type="button" className="btn btn-primary" data-focusable data-autofocus onClick={() => navigate('/settings')}>
            Configurar fuente
          </button>
        }
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Maratones sin fin"
        title="Series"
        description="Temporadas completas, episodios nuevos y las historias favoritas de la casa."
        right={<span className="count-pill">{visible.length} series</span>}
      />
      <FilterChips options={genres} value={genre} onChange={setGenre} />
      <div className="poster-grid">
        {visible.map((item, index) => (
          <SeriesCard key={item.id} series={item} autoFocus={index === 0} />
        ))}
      </div>
    </>
  );
}
