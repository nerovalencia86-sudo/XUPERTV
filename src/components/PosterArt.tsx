import type { CSSProperties } from 'react';
import { Star } from 'lucide-react';
import { initials } from '../utils/format';

interface PosterArtProps {
  title: string;
  colors: [string, string];
  rating?: number;
  badge?: string;
  meta?: string;
  posterUrl?: string;
}

export function artBackground(colors: [string, string]): CSSProperties {
  return {
    background: `radial-gradient(125% 85% at 12% 0%, ${colors[0]}66 0%, transparent 58%),
      radial-gradient(115% 95% at 92% 102%, ${colors[1]}C4 0%, transparent 64%),
      linear-gradient(155deg, ${colors[1]}55 0%, #070b12 58%, ${colors[0]}26 100%)`,
  };
}

export function PosterArt({ title, colors, rating, badge, meta, posterUrl }: PosterArtProps) {
  return (
    <div className="poster-art" style={posterUrl ? { backgroundImage: `url(${posterUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : artBackground(colors)}>
      {posterUrl ? <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,11,18,0.2) 0%, rgba(7,11,18,0.85) 100%)' }} /> : null}
      <span className="poster-grain" aria-hidden />
      {!posterUrl && (
        <span className="poster-glyph" aria-hidden>
          {initials(title)}
        </span>
      )}
      <div className="poster-top" style={{ position: 'relative', zIndex: 2 }}>
        {badge ? <span className="badge">{badge}</span> : <span />}
        {rating ? (
          <span className="rating">
            <Star size={11} fill="currentColor" /> {rating.toFixed(1)}
          </span>
        ) : null}
      </div>
      <div className="poster-bottom" style={{ position: 'relative', zIndex: 2 }}>
        <span className="poster-name">{title}</span>
        {meta ? <span className="poster-meta">{meta}</span> : null}
      </div>
    </div>
  );
}
