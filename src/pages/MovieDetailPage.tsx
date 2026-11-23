import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Play, Star } from 'lucide-react';
import { useStore } from '../store';
import { PosterArt, artBackground } from '../components/PosterArt';
import { FavoriteButton } from '../components/FavoriteButton';
import { Rail } from '../components/Rails';
import { MovieCard } from '../components/Cards';
import { EmptyState } from '../components/EmptyState';
import { formatMinutes, formatTime, initials } from '../utils/format';
import { watchKey } from '../utils/media';

export function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const catalog = useStore((state) => state.catalog);
  const progress = useStore((state) => state.progress);

  const movie = catalog?.movies.find((item) => item.id === id);

  if (!movie) {
    return (
      <EmptyState
        title="Película no encontrada"
        message="Puede que ya no esté disponible en tu catálogo actual."
        action={
          <button type="button" className="btn btn-primary" data-focusable data-autofocus onClick={() => navigate('/movies')}>
            Ver películas
          </button>
        }
      />
    );
  }

  const entry = progress[watchKey('movie', movie.id)];
  const pct = entry && entry.duration > 0 ? entry.position / entry.duration : 0;
  const similar = (catalog?.movies ?? [])
    .filter((item) => item.id !== movie.id && item.genres.some((genre) => movie.genres.includes(genre)))
    .slice(0, 10);

  return (
    <div className="detail-page">
      <section className="detail-hero">
        <div className="detail-bg" style={artBackground(movie.colors)} />
        <div className="detail-shade" />
        <span className="detail-glyph" aria-hidden>{initials(movie.title)}</span>
        <div className="detail-inner">
          <div className="detail-poster">
            <PosterArt title={movie.title} colors={movie.colors} rating={movie.rating} badge="PELÍCULA" meta={String(movie.year)} />
          </div>
          <div className="detail-info">
            <span className="eyebrow">Película · {catalog?.sourceLabel}</span>
            <h1>{movie.title}</h1>
            <div className="detail-meta">
              <span className="rating-inline">
                <Star size={14} fill="currentColor" /> {movie.rating.toFixed(1)}
              </span>
              <span>{movie.year}</span>
              <span>{formatMinutes(movie.duration)}</span>
              <span>{movie.genres.join(' · ')}</span>
            </div>
            <p className="detail-desc">{movie.description}</p>
            {entry && pct < 0.97 ? (
              <div className="resume-row">
                <div className="resume-bar">
                  <span style={{ width: `${Math.min(100, pct * 100)}%` }} />
                </div>
                <span className="resume-text">
                  Continuar desde {formatTime(entry.position)} · {Math.round(pct * 100)}% visto
                </span>
              </div>
            ) : null}
            <div className="detail-actions">
              <button
                type="button"
                className="btn btn-primary"
                data-focusable
                data-autofocus
                onClick={() => navigate(`/watch/movie/${movie.id}`)}
              >
                <Play size={18} fill="currentColor" /> {entry && pct < 0.97 ? 'Continuar' : 'Reproducir'}
              </button>
              <FavoriteButton itemKey={`movie:${movie.id}`} variant="pill" />
              <button type="button" className="btn btn-ghost" data-focusable onClick={() => navigate(-1)}>
                <ArrowLeft size={17} /> Volver
              </button>
            </div>
          </div>
        </div>
      </section>

      {similar.length > 0 ? (
        <div className="detail-rails">
          <Rail title="También te puede gustar">
            {similar.map((item) => (
              <MovieCard key={item.id} movie={item} />
            ))}
          </Rail>
        </div>
      ) : null}
    </div>
  );
}
