import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Play, Star } from 'lucide-react';
import { useStore } from '../store';
import { PosterArt, artBackground } from '../components/PosterArt';
import { FavoriteButton } from '../components/FavoriteButton';
import { EmptyState } from '../components/EmptyState';
import { fetchXtreamSeasons } from '../data/xtream';
import { episodeCode, formatTime, initials } from '../utils/format';
import { watchKey } from '../utils/media';

export function SeriesDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const catalog = useStore((state) => state.catalog);
  const progress = useStore((state) => state.progress);
  const settings = useStore((state) => state.settings);
  const updateSeriesSeasons = useStore((state) => state.updateSeriesSeasons);

  const series = catalog?.series.find((item) => item.id === id);
  const [seasonNumber, setSeasonNumber] = useState<number>(series?.seasons[0]?.number ?? 1);
  const [seasonsLoading, setSeasonsLoading] = useState(false);
  const [seasonsError, setSeasonsError] = useState<string | null>(null);

  useEffect(() => {
    setSeasonNumber(series?.seasons[0]?.number ?? 1);
  }, [series?.id]);

  useEffect(() => {
    if (!series || series.seasons.length > 0 || settings.mode !== 'xtream') return;
    let cancelled = false;
    setSeasonsLoading(true);
    setSeasonsError(null);
    fetchXtreamSeasons(settings, series.id)
      .then((seasons) => {
        if (cancelled) return;
        setSeasonsLoading(false);
        if (seasons.length === 0) {
          setSeasonsError('Este título no tiene episodios disponibles en el servidor.');
          return;
        }
        updateSeriesSeasons(series.id, seasons);
        setSeasonNumber(seasons[0].number);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setSeasonsLoading(false);
        setSeasonsError(error instanceof Error ? error.message : 'No se pudieron cargar los episodios.');
      });
    return () => {
      cancelled = true;
    };
  }, [series?.id, series?.seasons.length, settings, updateSeriesSeasons]);

  const activeSeason = useMemo(() => {
    if (!series) return null;
    return series.seasons.find((season) => season.number === seasonNumber) ?? series.seasons[0] ?? null;
  }, [series, seasonNumber]);

  if (!series) {
    return (
      <EmptyState
        title="Serie no encontrada"
        message="Puede que ya no esté disponible en tu catálogo actual."
        action={
          <button type="button" className="btn btn-primary" data-focusable data-autofocus onClick={() => navigate('/series')}>
            Ver series
          </button>
        }
      />
    );
  }

  const firstEpisode = series.seasons[0]?.episodes[0];
  const totalEpisodes = series.seasons.reduce((total, season) => total + season.episodes.length, 0);

  return (
    <div className="detail-page">
      <section className="detail-hero">
        <div className="detail-bg" style={artBackground(series.colors)} />
        <div className="detail-shade" />
        <span className="detail-glyph" aria-hidden>{initials(series.title)}</span>
        <div className="detail-inner">
          <div className="detail-poster">
            <PosterArt title={series.title} colors={series.colors} rating={series.rating} badge="SERIE" meta={String(series.year)} />
          </div>
          <div className="detail-info">
            <span className="eyebrow">Serie · {catalog?.sourceLabel}</span>
            <h1>{series.title}</h1>
            <div className="detail-meta">
              <span className="rating-inline">
                <Star size={14} fill="currentColor" /> {series.rating.toFixed(1)}
              </span>
              <span>{series.year}</span>
              <span>{series.seasons.length} temporadas</span>
              <span>{totalEpisodes} episodios</span>
              <span>{series.genres.join(' · ')}</span>
            </div>
            <p className="detail-desc">{series.description}</p>
            <div className="detail-actions">
              {firstEpisode ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  data-focusable
                  data-autofocus
                  onClick={() => navigate(`/watch/episode/${firstEpisode.id}`)}
                >
                  <Play size={18} fill="currentColor" /> Ver T1 E1
                </button>
              ) : (
                <button type="button" className="btn btn-primary" data-focusable data-autofocus disabled>
                  <Play size={18} fill="currentColor" /> Sin episodios
                </button>
              )}
              <FavoriteButton itemKey={`series:${series.id}`} variant="pill" />
              <button type="button" className="btn btn-ghost" data-focusable onClick={() => navigate(-1)}>
                <ArrowLeft size={17} /> Volver
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="episodes-panel">
        {seasonsLoading ? (
          <div className="inline-loading">
            <Loader2 size={22} className="spin" /> Cargando episodios…
          </div>
        ) : seasonsError ? (
          <div className="inline-error">{seasonsError}</div>
        ) : series.seasons.length === 0 ? (
          <div className="inline-error">No hay episodios disponibles para esta serie.</div>
        ) : (
          <>
            <div className="season-tabs">
              <span className="season-label">Temporadas</span>
              <div className="chips">
                {series.seasons.map((season) => (
                  <button
                    key={season.number}
                    type="button"
                    className={`chip ${season.number === seasonNumber ? 'is-active' : ''}`}
                    data-focusable
                    onClick={() => setSeasonNumber(season.number)}
                  >
                    T{season.number}
                  </button>
                ))}
              </div>
            </div>

            <div className="episode-list">
              {activeSeason?.episodes.map((episode) => {
                const entry = progress[watchKey('episode', episode.id)];
                const pct = entry && entry.duration > 0 ? Math.min(100, (entry.position / entry.duration) * 100) : 0;
                return (
                  <button
                    key={episode.id}
                    type="button"
                    className="episode-row"
                    data-focusable
                    onClick={() => navigate(`/watch/episode/${episode.id}`)}
                  >
                    <span className="episode-number">{String(episode.number).padStart(2, '0')}</span>
                    <span className="episode-body">
                      <span className="episode-head">
                        <span className="episode-name">
                          {episode.title}
                          <span className="episode-code">
                            {episodeCode(activeSeason.number, episode.number)}
                          </span>
                        </span>
                        <span className="episode-duration">{episode.duration} min</span>
                      </span>
                      <span className="episode-desc">{episode.description}</span>
                      {pct > 0 ? (
                        <span className="episode-progress" aria-hidden>
                          <span style={{ width: `${pct}%` }} />
                        </span>
                      ) : null}
                    </span>
                    <span className="episode-play">
                      <Play size={17} fill="currentColor" />
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
