import type { CSSProperties } from 'react';
import { Info, Play } from 'lucide-react';
import { initials } from '../utils/format';
import { artBackground } from './PosterArt';
import { FavoriteButton } from './FavoriteButton';

interface HeroProps {
  eyebrow: string;
  title: string;
  meta: string[];
  description: string;
  colors: [string, string];
  image?: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
  favoriteKey?: string;
}

export function Hero({
  eyebrow,
  title,
  meta,
  description,
  colors,
  image,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  favoriteKey,
}: HeroProps) {
  const tintStyle = {
    '--hero-a': `${colors[0]}55`,
    '--hero-b': `${colors[1]}66`,
  } as CSSProperties;

  return (
    <section className="hero" style={tintStyle} aria-label={title}>
      <div
        className="hero-media"
        style={image ? { backgroundImage: `url(${image})` } : artBackground(colors)}
      />
      <div className="hero-shade" />
      <span className="hero-glyph" aria-hidden>
        {initials(title)}
      </span>
      <div className="hero-content">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="hero-title">{title}</h1>
        <div className="hero-meta">
          {meta.map((item) => (
            <span key={item} className="hero-meta-item">
              {item}
            </span>
          ))}
        </div>
        <p className="hero-desc">{description}</p>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary" data-focusable data-autofocus onClick={onPrimary}>
            <Play size={18} fill="currentColor" /> {primaryLabel}
          </button>
          <button type="button" className="btn btn-glass" data-focusable onClick={onSecondary}>
            <Info size={18} /> {secondaryLabel}
          </button>
          {favoriteKey ? <FavoriteButton itemKey={favoriteKey} /> : null}
        </div>
      </div>
      <span className="hero-corner" aria-hidden>
        XUPER
      </span>
    </section>
  );
}
