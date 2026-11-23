import { useEffect } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import {
  Clapperboard,
  Compass,
  Film,
  Heart,
  Search,
  Settings,
  Smile,
  Sparkles,
  Tv,
  Wifi,
  Zap,
} from 'lucide-react';
import { useStore } from '../store';
import { useClock } from '../hooks/useClock';
import { useBackNavigation } from '../hooks/useBackNavigation';
import { formatClock } from '../utils/format';

// Menú idéntico al de la aplicación móvil de XuperTV
const NAV_ITEMS = [
  { to: '/live', label: 'TV', icon: Tv },
  { to: '/', label: 'DESTACADOS', icon: Sparkles },
  { to: '/movies', label: 'PELICULAS', icon: Film },
  { to: '/series', label: 'SERIES', icon: Clapperboard },
  { to: '/kids', label: 'KIDS', icon: Smile },
  { to: '/anime', label: 'ANIME', icon: Zap },
  { to: '/explorar', label: 'EXPLORAR', icon: Compass },
  { to: '/favorites', label: 'FAVORITOS', icon: Heart },
  { to: '/search', label: 'BUSCAR', icon: Search },
  { to: '/settings', label: 'AJUSTES', icon: Settings },
];

function sectionTitle(pathname: string): string {
  if (pathname === '/') return 'DESTACADOS';
  if (pathname.startsWith('/live')) return 'TV EN VIVO';
  if (pathname.startsWith('/movies/')) return 'DETALLE PELÍCULA';
  if (pathname.startsWith('/movies')) return 'PELICULAS';
  if (pathname.startsWith('/series/')) return 'DETALLE SERIE';
  if (pathname.startsWith('/series')) return 'SERIES';
  if (pathname.startsWith('/kids')) return 'KIDS';
  if (pathname.startsWith('/anime')) return 'ANIME';
  if (pathname.startsWith('/explorar')) return 'EXPLORAR';
  if (pathname.startsWith('/favorites')) return 'FAVORITOS';
  if (pathname.startsWith('/search')) return 'BUSCAR';
  if (pathname.startsWith('/settings')) return 'AJUSTES';
  return 'XUPERTV';
}

export function AppShell() {
  const location = useLocation();
  const now = useClock(15000);
  const mode = useStore((state) => state.settings.mode);
  const sourceLabel = useStore((state) => state.catalog?.sourceLabel);
  useBackNavigation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const timer = window.setTimeout(() => {
      const active = document.activeElement;
      const focusIsLost = !active || active === document.body || !document.body.contains(active);
      if (focusIsLost) {
        document.querySelector<HTMLElement>('.page [data-autofocus]')?.focus({ preventScroll: true });
      }
    }, 90);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  const sourceText = sourceLabel ?? (mode === 'demo' ? 'XuperTV VIP' : mode === 'm3u' ? 'Lista M3U' : 'Xtream Codes');

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand" data-focusable aria-label="XUPERTV, ir al inicio">
          <span className="brand-mark">X</span>
          <span className="brand-word">
            XUPER<span>TV</span>
          </span>
        </Link>

        <nav className="nav" aria-label="Navegación principal">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
              data-focusable
            >
              <item.icon size={20} strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <span className="sidebar-dot" />
          <span>VOD · UNLIMITED</span>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-title">
            <span className="topbar-crumb">XUPERTV</span>
            <span className="topbar-sep">/</span>
            <span>{sectionTitle(location.pathname)}</span>
          </div>
          <div className="topbar-right">
            <span className="key-hint">← ↑ → ↓ navegar · Enter reproducir · Esc atrás</span>
            <span className="source-pill">
              <Wifi size={13} /> {sourceText}
            </span>
            <span className="clock">{formatClock(new Date(now))}</span>
          </div>
        </header>

        <main className="page" key={location.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
