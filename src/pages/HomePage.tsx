import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { useClock } from '../hooks/useClock';
import { Hero } from '../components/Hero';
import { Rail } from '../components/Rails';
import {
  ChannelCard,
  ContinueCard,
  MovieCard,
  SeriesCard,
} from '../components/Cards';
import { EmptyState } from '../components/EmptyState';
import { scheduleFor } from '../utils/epg';
import { formatMinutes } from '../utils/format';
import {
  getContinueItems,
  getFavoriteChannels,
  getFavoriteMovies,
  getFavoriteSeries,
  watchKey,
} from '../utils/media';

export function HomePage() {
  const catalog = useStore((state) => state.catalog);
  const progress = useStore((state) => state.progress);
  const favorites = useStore((state) => state.favorites);
  const navigate = useNavigate();
  const now = useClock(30000);

  if (!catalog) {
    return (
      <EmptyState
        title="Todavía no hay señal"
        message="Configura una fuente de contenido para empezar a ver televisión."
        action={
          <button type="button" className="btn btn-primary" data-focusable data-autofocus onClick={() => navigate('/settings')}>
            Configurar fuente
          </button>
        }
      />
    );
  }

  const featuredMovie = [...catalog.movies].sort((a, b) => b.rating - a.rating)[0];
  const featuredChannel = catalog.channels[0];
  const continueItems = getContinueItems(catalog, progress);
  const favoriteMovies = getFavoriteMovies(catalog, favorites);
  const favoriteSeries = getFavoriteSeries(catalog, favorites);
  const favoriteChannels = getFavoriteChannels(catalog, favorites);
  const hasFavorites = favorites.length > 0;
  const hasCatalog = catalog.channels.length + catalog.movies.length + catalog.series.length > 0;

  if (!hasCatalog) {
    return (
      <EmptyState
        title="Catálogo vacío"
        message="La fuente configurada no devolvió contenido. Revisa los ajustes o vuelve al contenido demo."
        action={
          <button type="button" className="btn btn-primary" data-focusable data-autofocus onClick={() => navigate('/settings')}>
            Ir a ajustes
          </button>
        }
      />
    );
  }

  const movieProgress = (movieId: string) => {
    const entry = progress[watchKey('movie', movieId)];
    return entry && entry.duration > 0 ? entry.position / entry.duration : undefined;
  };

  return (
    <>
      {featuredMovie ? (
        <Hero
          eyebrow={`${catalog.sourceLabel} · Película destacada`}
          title={featuredMovie.title}
          meta={[
            `★ ${featuredMovie.rating.toFixed(1)}`,
            String(featuredMovie.year),
            featuredMovie.genres.join(' · '),
            formatMinutes(featuredMovie.duration),
          ]}
          description={featuredMovie.description}
          colors={featuredMovie.colors}
          image="/assets/hero.png"
          primaryLabel="Reproducir"
          onPrimary={() => navigate(`/watch/movie/${featuredMovie.id}`)}
          secondaryLabel="Ver detalles"
          onSecondary={() => navigate(`/movies/${featuredMovie.id}`)}
          favoriteKey={`movie:${featuredMovie.id}`}
        />
      ) : featuredChannel ? (
        <Hero
          eyebrow={`Señal en vivo · ${featuredChannel.category}`}
          title={featuredChannel.name}
          meta={['EN VIVO', scheduleFor(featuredChannel, now).current]}
          description="Estás viendo la señal en directo de XUPERTV. Explora la parrilla completa y descubre todos los canales disponibles."
          colors={featuredChannel.colors}
          image="/assets/hero.png"
          primaryLabel="Ver en vivo"
          onPrimary={() => navigate(`/watch/live/${featuredChannel.id}`)}
          secondaryLabel="Todos los canales"
          onSecondary={() => navigate('/live')}
          favoriteKey={`live:${featuredChannel.id}`}
        />
      ) : null}

      <div className="home-rails">
        {continueItems.length > 0 ? (
          <Rail title="Continuar viendo">
            {continueItems.map((item, index) => (
              <ContinueCard key={item.key} item={item} autoFocus={index === 0 && !featuredMovie} />
            ))}
          </Rail>
        ) : null}

        {catalog.channels.length > 0 ? (
          <Rail title="En vivo ahora" moreTo="/live">
            {catalog.channels.slice(0, 8).map((channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </Rail>
        ) : null}

        {catalog.movies.length > 0 ? (
          <Rail title="Películas destacadas" moreTo="/movies">
            {catalog.movies.slice(0, 10).map((movie) => (
              <MovieCard key={movie.id} movie={movie} progress={movieProgress(movie.id)} />
            ))}
          </Rail>
        ) : null}

        {catalog.series.length > 0 ? (
          <Rail title="Series para maratonear" moreTo="/series">
            {catalog.series.slice(0, 10).map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </Rail>
        ) : null}

        {hasFavorites ? (
          <Rail title="Tus favoritos" moreTo="/favorites">
            {favoriteMovies.slice(0, 4).map((movie) => (
              <MovieCard key={movie.id} movie={movie} progress={movieProgress(movie.id)} />
            ))}
            {favoriteSeries.slice(0, 4).map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
            {favoriteChannels.slice(0, 4).map((channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </Rail>
        ) : null}
      </div>
    </>
  );
}
