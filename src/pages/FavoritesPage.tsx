import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useStore } from '../store';
import { PageHeader } from '../components/PageHeader';
import { ChannelCard, MovieCard, SeriesCard } from '../components/Cards';
import { EmptyState } from '../components/EmptyState';
import {
  getFavoriteChannels,
  getFavoriteMovies,
  getFavoriteSeries,
} from '../utils/media';

export function FavoritesPage() {
  const catalog = useStore((state) => state.catalog);
  const favorites = useStore((state) => state.favorites);
  const navigate = useNavigate();

  if (!catalog) {
    return <EmptyState title="Sin catálogo" message="Configura una fuente de contenido para ver tus favoritos." />;
  }

  const movies = getFavoriteMovies(catalog, favorites);
  const series = getFavoriteSeries(catalog, favorites);
  const channels = getFavoriteChannels(catalog, favorites);
  const total = movies.length + series.length + channels.length;

  if (total === 0) {
    return (
      <>
        <PageHeader eyebrow="Tu selección" title="Favoritos" />
        <EmptyState
          icon={<Heart size={34} />}
          title="Aún no tienes favoritos"
          message="Marca películas, series o canales con la estrella y aparecerán aquí para tenerlos siempre a mano."
          action={
            <button type="button" className="btn btn-primary" data-focusable data-autofocus onClick={() => navigate('/movies')}>
              Explorar películas
            </button>
          }
        />
      </>
    );
  }

  const focusGroup = movies.length > 0 ? 'movies' : series.length > 0 ? 'series' : 'channels';

  return (
    <>
      <PageHeader
        eyebrow="Tu selección"
        title="Favoritos"
        description="Todo lo que guardaste, en un solo lugar."
        right={<span className="count-pill">{total} títulos</span>}
      />

      {movies.length > 0 ? (
        <section className="favorites-group">
          <h2>Películas</h2>
          <div className="poster-grid">
            {movies.map((movie, index) => (
              <MovieCard key={movie.id} movie={movie} autoFocus={focusGroup === 'movies' && index === 0} />
            ))}
          </div>
        </section>
      ) : null}

      {series.length > 0 ? (
        <section className="favorites-group">
          <h2>Series</h2>
          <div className="poster-grid">
            {series.map((item, index) => (
              <SeriesCard key={item.id} series={item} autoFocus={focusGroup === 'series' && index === 0} />
            ))}
          </div>
        </section>
      ) : null}

      {channels.length > 0 ? (
        <section className="favorites-group">
          <h2>Canales</h2>
          <div className="channel-grid">
            {channels.map((channel, index) => (
              <ChannelCard key={channel.id} channel={channel} autoFocus={focusGroup === 'channels' && index === 0} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
