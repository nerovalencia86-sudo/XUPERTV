import { Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { BootGate } from './components/BootGate';
import { useSpatialNavigation } from './hooks/useSpatialNavigation';
import { HomePage } from './pages/HomePage';
import { LivePage } from './pages/LivePage';
import { MoviesPage } from './pages/MoviesPage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { SeriesPage } from './pages/SeriesPage';
import { SeriesDetailPage } from './pages/SeriesDetailPage';
import { SearchPage } from './pages/SearchPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { SettingsPage } from './pages/SettingsPage';
import { WatchPage } from './pages/WatchPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  const location = useLocation();
  useSpatialNavigation(!location.pathname.startsWith('/watch'));

  return (
    <BootGate>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="live" element={<LivePage />} />
          <Route path="movies" element={<MoviesPage />} />
          <Route path="movies/:id" element={<MovieDetailPage />} />
          <Route path="series" element={<SeriesPage />} />
          <Route path="series/:id" element={<SeriesDetailPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/watch/:kind/:id" element={<WatchPage />} />
      </Routes>
    </BootGate>
  );
}
