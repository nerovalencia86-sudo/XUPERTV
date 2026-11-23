import { useNavigate } from 'react-router-dom';
import type { Channel, ContinueItem, Movie, Series } from '../types';
import { episodeCode, formatClock, initials } from '../utils/format';
import { scheduleFor } from '../utils/epg';
import { artBackground } from './PosterArt';
import { PosterArt } from './PosterArt';

interface CardBaseProps {
  autoFocus?: boolean;
}

export function MovieCard({ movie, progress, autoFocus }: CardBaseProps & { movie: Movie; progress?: number }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="poster-card"
      data-focusable
      data-autofocus={autoFocus ? true : undefined}
      onClick={() => navigate(`/movies/${movie.id}`)}
      aria-label={`${movie.title}, ${movie.year}`}
    >
      <div className="poster-shell">
        <PosterArt
          title={movie.title}
          colors={movie.colors}
          rating={movie.rating}
          badge="PELÍCULA"
          meta={`${movie.year} · ${movie.genres[0]}`}
          posterUrl={movie.posterUrl}
        />
        {progress !== undefined ? (
          <div className="card-progress" aria-hidden>
            <span style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }} />
          </div>
        ) : null}
      </div>
    </button>
  );
}

export function SeriesCard({ series, autoFocus }: CardBaseProps & { series: Series }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="poster-card"
      data-focusable
      data-autofocus={autoFocus ? true : undefined}
      onClick={() => navigate(`/series/${series.id}`)}
      aria-label={`${series.title}, ${series.year}`}
    >
      <div className="poster-shell">
        <PosterArt
          title={series.title}
          colors={series.colors}
          rating={series.rating}
          badge="SERIE"
          meta={`${series.year} · ${series.genres[0]}`}
          posterUrl={series.posterUrl}
        />
      </div>
    </button>
  );
}

export function ContinueCard({ item, autoFocus }: CardBaseProps & { item: ContinueItem }) {
  const navigate = useNavigate();
  const pct = item.progress.duration > 0 ? item.progress.position / item.progress.duration : 0;
  const meta = item.media.subtitle ?? '';
  return (
    <button
      type="button"
      className="poster-card"
      data-focusable
      data-autofocus={autoFocus ? true : undefined}
      onClick={() => navigate(`/watch/${item.media.kind}/${item.media.id}`)}
      aria-label={`Continuar ${item.media.title}`}
    >
      <div className="poster-shell">
        <PosterArt
          title={item.media.title}
          colors={item.media.colors}
          badge="CONTINUAR"
          meta={meta}
        />
        <div className="card-progress accent" aria-hidden>
          <span style={{ width: `${Math.min(100, Math.max(0, pct * 100))}%` }} />
        </div>
      </div>
    </button>
  );
}

export function ChannelCard({ channel, autoFocus }: CardBaseProps & { channel: Channel }) {
  const navigate = useNavigate();
  const epg = scheduleFor(channel);
  return (
    <button
      type="button"
      className="channel-card"
      data-focusable
      data-autofocus={autoFocus ? true : undefined}
      onClick={() => navigate(`/watch/live/${channel.id}`)}
      aria-label={`${channel.name}, en vivo`}
    >
      <div className="channel-tile" style={artBackground(channel.colors)}>
        <span className="channel-glyph" aria-hidden>
          {initials(channel.name)}
        </span>
        <span className="live-tag">
          <span className="live-dot" /> EN VIVO
        </span>
        <div className="channel-sheen" aria-hidden />
      </div>
      <div className="channel-info">
        <div className="channel-row">
          <span className="channel-name">{channel.name}</span>
          <span className="channel-cat">{channel.category}</span>
        </div>
        <div className="epg-line">{epg.current}</div>
        <div className="epg-bar" aria-hidden>
          <span style={{ width: `${Math.min(100, Math.max(0, epg.progress * 100))}%` }} />
        </div>
        <div className="epg-times">
          {formatClock(epg.startsAt)} – {formatClock(epg.endsAt)} · {epg.next}
        </div>
      </div>
    </button>
  );
}

export function EpisodeCode({ season, episode }: { season: number; episode: number }) {
  return <span className="episode-code">{episodeCode(season, episode)}</span>;
}
