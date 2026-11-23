import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export function BootGate({ children }: { children: ReactNode }) {
  const catalog = useStore((state) => state.catalog);
  const loading = useStore((state) => state.catalogLoading);
  const error = useStore((state) => state.catalogError);
  const mode = useStore((state) => state.settings.mode);
  const loadCatalog = useStore((state) => state.loadCatalog);
  const updateSettings = useStore((state) => state.updateSettings);
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!catalog && !loading) {
      void loadCatalog();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => {
      document.querySelector<HTMLElement>('.boot-card [data-autofocus]')?.focus();
    }, 80);
    return () => window.clearTimeout(timer);
  }, [error]);

  if (catalog) return <>{children}</>;
  if (error && dismissed) return <>{children}</>;

  if (error) {
    return (
      <div className="boot-screen">
        <div className="boot-brand">
          <span className="brand-mark xl">X</span>
          <span className="boot-word">XUPERTV</span>
        </div>
        <div className="boot-card">
          <span className="eyebrow">Sin señal</span>
          <h1>No pudimos cargar el contenido</h1>
          <p>{error}</p>
          <div className="boot-actions">
            <button
              type="button"
              className="btn btn-primary"
              data-focusable
              data-autofocus
              onClick={() => void loadCatalog()}
            >
              Reintentar
            </button>
            {mode !== 'demo' ? (
              <button
                type="button"
                className="btn btn-glass"
                data-focusable
                onClick={() => {
                  updateSettings({ mode: 'demo' });
                  void loadCatalog();
                }}
              >
                Usar contenido demo
              </button>
            ) : null}
            <button
              type="button"
              className="btn btn-ghost"
              data-focusable
              onClick={() => {
                setDismissed(true);
                navigate('/settings');
              }}
            >
              Configurar fuente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="boot-screen">
      <div className="boot-brand">
        <span className="brand-mark xl">X</span>
        <span className="boot-word">XUPERTV</span>
      </div>
      <div className="boot-bar" aria-hidden>
        <span />
      </div>
      <p className="boot-note">Preparando tu televisión…</p>
    </div>
  );
}
