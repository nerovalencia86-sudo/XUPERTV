import { useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useStore } from '../store';
import { PageHeader } from '../components/PageHeader';
import { Rail } from '../components/Rails';
import { ChannelCard, MovieCard, SeriesCard } from '../components/Cards';
import { EmptyState } from '../components/EmptyState';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { normalizeText } from '../utils/format';

export function SearchPage() {
  const catalog = useStore((state) => state.catalog);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const term = normalizeText(query.trim());

  const results = useMemo(() => {
    if (!catalog || !term) {
      return { channels: [], movies: [], series: [] };
    }
    const matches = (value: string) => normalizeText(value).includes(term);
    return {
      channels: catalog.channels.filter(
        (channel) => matches(channel.name) || matches(channel.category),
      ),
      movies: catalog.movies.filter(
        (movie) => matches(movie.title) || movie.genres.some(matches),
      ),
      series: catalog.series.filter(
        (series) => matches(series.title) || series.genres.some(matches),
      ),
    };
  }, [catalog, term]);

  const suggestions = useMemo(() => {
    if (!catalog) return [];
    const genres = Array.from(new Set([
      ...catalog.movies.flatMap((movie) => movie.genres),
      ...catalog.series.flatMap((series) => series.genres),
    ]));
    if (genres.length > 0) return genres.slice(0, 10);
    return Array.from(new Set(catalog.channels.map((channel) => channel.category))).slice(0, 10);
  }, [catalog]);

  if (!catalog) {
    return <EmptyState title="Sin catálogo" message="Configura una fuente de contenido para poder buscar." />;
  }

  const total = results.channels.length + results.movies.length + results.series.length;

  const append = (character: string) => setQuery((previous) => previous + character);
  const backspace = () => setQuery((previous) => previous.slice(0, -1));
  const clear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <>
      <PageHeader
        eyebrow="Explora el catálogo"
        title="Buscar"
        description="Usa el teclado en pantalla con el control remoto o escribe directamente con un teclado físico."
        right={<span className="count-pill">{total} resultados</span>}
      />

      <div className="search-panel">
        <div className="search-box">
          <Search size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Canales, películas, series, géneros…"
            aria-label="Buscar contenido"
            data-focusable
            data-autofocus
            spellCheck={false}
            autoComplete="off"
          />
          {query ? (
            <button type="button" className="search-clear" data-focusable onClick={clear} aria-label="Limpiar búsqueda">
              <X size={18} />
            </button>
          ) : null}
        </div>
        <VirtualKeyboard onInput={append} onBackspace={backspace} onClear={clear} />
      </div>

      {!term ? (
        <section className="search-suggest">
          <h2>Empieza con una categoría</h2>
          <div className="chips">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="chip"
                data-focusable
                onClick={() => setQuery(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </section>
      ) : total === 0 ? (
        <EmptyState
          title="Sin resultados"
          message={`No encontramos nada para “${query.trim()}”. Prueba con otro título o categoría.`}
          action={
            <button type="button" className="btn btn-glass" data-focusable onClick={clear}>
              Limpiar búsqueda
            </button>
          }
        />
      ) : (
        <div className="search-results">
          {results.channels.length > 0 ? (
            <Rail title={`Canales (${results.channels.length})`}>
              {results.channels.slice(0, 12).map((channel) => (
                <ChannelCard key={channel.id} channel={channel} />
              ))}
            </Rail>
          ) : null}
          {results.movies.length > 0 ? (
            <Rail title={`Películas (${results.movies.length})`}>
              {results.movies.slice(0, 12).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </Rail>
          ) : null}
          {results.series.length > 0 ? (
            <Rail title={`Series (${results.series.length})`}>
              {results.series.slice(0, 12).map((series) => (
                <SeriesCard key={series.id} series={series} />
              ))}
            </Rail>
          ) : null}
        </div>
      )}
    </>
  );
}
