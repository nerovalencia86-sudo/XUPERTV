import { Star } from 'lucide-react';
import { useStore } from '../store';

interface FavoriteButtonProps {
  itemKey: string;
  variant?: 'round' | 'pill';
  focusable?: boolean;
}

export function FavoriteButton({ itemKey, variant = 'round', focusable = true }: FavoriteButtonProps) {
  const active = useStore((state) => state.favorites.includes(itemKey));
  const toggleFavorite = useStore((state) => state.toggleFavorite);

  return (
    <button
      type="button"
      className={`favorite-btn ${variant} ${active ? 'is-active' : ''}`}
      data-focusable={focusable ? true : undefined}
      aria-pressed={active}
      aria-label={active ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      title={active ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      onClick={() => toggleFavorite(itemKey)}
    >
      <Star size={18} fill={active ? 'currentColor' : 'none'} />
      {variant === 'pill' ? <span>{active ? 'En favoritos' : 'Favorito'}</span> : null}
    </button>
  );
}
