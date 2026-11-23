import { useEffect } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import {
  Clapperboard,
  Film,
  Heart,
  Home,
  Search,
  Settings,
  Tv,
  Wifi,
} from 'lucide-react';
import { useStore } from '../store';
import { useClock } from '../hooks/useClock';
import { useBackNavigation } from '../hooks/useBackNavigation';
import { formatClock } from '../utils/format';

const NAV_ITEMS = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/live', label: 'En vivo', icon: Tv },
  { to: '/movies', label: 'Películas', icon: Film },
  { to: '/series', label: 'Series', icon: Clapperboard },
  { to: '/favorites', label: 'Favoritos', icon: Heart },
  { to: '/search', label: 'Buscar', icon: Search },
  { to: '/settings', label: 'Ajustes', icon: Settings },
];

function sectionTitle(pathname: string): string {
  if (pathname === '/') return 'Inicio';
  if (pathname.startsWith('/live')) return 'En vivo';
  if (pathname.startsWith('/movies/')) return 'Detalle de película';
  if (pathname.startsWith('/movies')) return 'Películas';
  if (pathname.startsWith('/series/')) return 'Detalle de serie';
  if (pathname.startsWith('/series')) return 'Series';
  if (pathname.startsWith('/favorites')) return 'Favoritos';
  if (pathname.startsWith('/search')) return 'Buscar';
  if (pathname.startsWith('/settings')) return 'Ajustes';
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

  const sourceText = sourceLabel ?? (mode === 'demo' ? 'Contenido demo' : mode === 'm3u' ? 'Lista M3U' : 'Xtream Codes');

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
              <item.icon size={21} strokeWidth={1.9} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <span className="sidebar-dot" />
          <span>TV · v0.1</span>
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
            <span className="key-hint">← ↑ → ↓ mover · Enter abrir · Esc volver</span>
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
