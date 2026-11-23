import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { PageHeader } from '../components/PageHeader';
import { FilterChips } from '../components/FilterChips';
import { MovieCard } from '../components/Cards';
import { EmptyState } from '../components/EmptyState';
import { watchKey } from '../utils/media';

export function MoviesPage() {
  const catalog = useStore((state) => state.catalog);
  const progress = useStore((state) => state.progress);
  const navigate = useNavigate();
  const [genre, setGenre] = useState('Todas');

  const movies = catalog?.movies ?? [];
  const genres = useMemo(
    () => ['Todas', ...Array.from(new Set(movies.flatMap((movie) => movie.genres)))],
    [movies],
  );
  const visible = genre === 'Todas' ? movies : movies.filter((movie) => movie.genres.includes(genre));

  if (movies.length === 0) {
    return (
      <EmptyState
        title="Sin películas por ahora"
        message="Tu fuente actual solo incluye canales en vivo. Conecta una cuenta Xtream Codes para acceder al catálogo VOD completo."
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
        eyebrow="Catálogo a la carta"
        title="Películas"
        description="Acción, drama, ciencia ficción y más. Todo listo para tu próxima noche de cine."
        right={<span className="count-pill">{visible.length} títulos</span>}
      />
      <FilterChips options={genres} value={genre} onChange={setGenre} />
      <div className="poster-grid">
        {visible.map((movie, index) => {
          const entry = progress[watchKey('movie', movie.id)];
          const pct = entry && entry.duration > 0 ? entry.position / entry.duration : undefined;
          return <MovieCard key={movie.id} movie={movie} progress={pct} autoFocus={index === 0} />;
        })}
      </div>
    </>
  );
}
