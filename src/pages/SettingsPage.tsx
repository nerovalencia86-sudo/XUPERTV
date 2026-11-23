import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  Server,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useStore } from '../store';
import { loadContent } from '../data/source';
import { PageHeader } from '../components/PageHeader';
import type { SourceMode, SourceSettings } from '../types';

type Status = { type: 'ok' | 'error'; message: string } | null;

const MODES: Array<{ id: SourceMode; title: string; description: string; icon: typeof Sparkles }> = [
  {
    id: 'demo',
    title: 'Contenido demo',
    description: 'Canales, películas y series de prueba para explorar sin configuración.',
    icon: Sparkles,
  },
  {
    id: 'm3u',
    title: 'Lista M3U',
    description: 'Carga una playlist por URL o pegando el contenido directamente.',
    icon: FileText,
  },
  {
    id: 'xtream',
    title: 'Xtream Codes',
    description: 'Conecta tu servidor con usuario y contraseña para el catálogo completo.',
    icon: Server,
  },
];

export function SettingsPage() {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);
  const applyCatalog = useStore((state) => state.applyCatalog);
  const clearLibrary = useStore((state) => state.clearLibrary);
  const navigate = useNavigate();

  const [draft, setDraft] = useState<SourceSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const patch = <Key extends keyof SourceSettings>(key: Key, value: SourceSettings[Key]) =>
    setDraft((previous) => ({ ...previous, [key]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus(null);

    if (draft.mode === 'm3u' && !draft.m3uUrl.trim() && !draft.m3uText.trim()) {
      setStatus({ type: 'error', message: 'Añade una URL de lista M3U o pega el contenido de la lista.' });
      return;
    }

    if (
      draft.mode === 'xtream' &&
      (!draft.xtreamServer.trim() || !draft.xtreamUsername.trim() || !draft.xtreamPassword.trim())
    ) {
      setStatus({ type: 'error', message: 'Completa servidor, usuario y contraseña para conectar con Xtream Codes.' });
      return;
    }

    setSaving(true);
    try {
      const catalog = await loadContent(draft);
      updateSettings(draft);
      applyCatalog(catalog);
      navigate('/');
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo cargar la fuente de contenido.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Configuración"
        title="Ajustes"
        description="Elige de dónde viene tu televisión. La fuente se valida antes de guardarse."
      />

      <form className="settings-form" onSubmit={handleSubmit}>
        <section className="panel">
          <div className="panel-head">
            <h2>Fuente de contenido</h2>
            <span className="panel-badge">Activa: {settings.mode === 'demo' ? 'Demo' : settings.mode === 'm3u' ? 'M3U' : 'Xtream'}</span>
          </div>

          <div className="mode-grid">
            {MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  type="button"
                  className={`mode-card ${draft.mode === mode.id ? 'is-active' : ''}`}
                  data-focusable
                  data-autofocus={draft.mode === mode.id ? true : undefined}
                  onClick={() => {
                    patch('mode', mode.id);
                    setStatus(null);
                  }}
                >
                  <span className="mode-icon">
                    <Icon size={22} />
                  </span>
                  <span className="mode-title">{mode.title}</span>
                  <span className="mode-desc">{mode.description}</span>
                </button>
              );
            })}
          </div>

          {draft.mode === 'm3u' ? (
            <div className="field-grid">
              <label className="field full">
                <span className="field-label">URL de la lista M3U</span>
                <input
                  type="url"
                  value={draft.m3uUrl}
                  onChange={(event) => patch('m3uUrl', event.target.value)}
                  placeholder="https://ejemplo.com/lista.m3u"
                  data-focusable
                  spellCheck={false}
                  autoComplete="off"
                />
              </label>
              <label className="field full">
                <span className="field-label">O pega el contenido de la lista</span>
                <textarea
                  rows={5}
                  value={draft.m3uText}
                  onChange={(event) => patch('m3uText', event.target.value)}
                  placeholder={'#EXTM3U\n#EXTINF:-1 group-title="Deportes",Mi canal\nhttps://…'}
                  data-focusable
                  spellCheck={false}
                />
                <span className="field-hint">Si hay contenido pegado, tiene prioridad sobre la URL.</span>
              </label>
            </div>
          ) : null}

          {draft.mode === 'xtream' ? (
            <div className="field-grid">
              <label className="field full">
                <span className="field-label">Servidor</span>
                <input
                  type="text"
                  value={draft.xtreamServer}
                  onChange={(event) => patch('xtreamServer', event.target.value)}
                  placeholder="http://mi-servidor.com:8080"
                  data-focusable
                  spellCheck={false}
                  autoComplete="off"
                />
              </label>
              <label className="field">
                <span className="field-label">Usuario</span>
                <input
                  type="text"
                  value={draft.xtreamUsername}
                  onChange={(event) => patch('xtreamUsername', event.target.value)}
                  placeholder="usuario"
                  data-focusable
                  spellCheck={false}
                  autoComplete="off"
                />
              </label>
              <label className="field">
                <span className="field-label">Contraseña</span>
                <input
                  type="password"
                  value={draft.xtreamPassword}
                  onChange={(event) => patch('xtreamPassword', event.target.value)}
                  placeholder="••••••••"
                  data-focusable
                  autoComplete="off"
                />
              </label>
            </div>
          ) : null}

          {draft.mode === 'demo' ? (
            <p className="hint">
              Incluye 12 canales en vivo, 12 películas y 6 series con transmisiones públicas de prueba.
              Ideal para recorrer la app; puedes cambiar de fuente cuando quieras.
            </p>
          ) : null}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" data-focusable disabled={saving}>
              {saving ? <Loader2 size={17} className="spin" /> : null}
              {saving ? 'Validando fuente…' : 'Guardar y cargar'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              data-focusable
              onClick={() => {
                setDraft(settings);
                setStatus(null);
              }}
            >
              Restablecer
            </button>
          </div>

          {status ? (
            <div className={`form-status ${status.type}`} role="status">
              {status.type === 'ok' ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
              <span>{status.message}</span>
            </div>
          ) : null}
        </section>

        <section className="panel">
          <h2>Datos en este dispositivo</h2>
          <p className="hint">
            Favoritos, progreso de reproducción y ajustes se guardan solo en este navegador.
            No se envía nada a servidores externos.
          </p>
          <div className="form-actions">
            {confirmClear ? (
              <>
                <button
                  type="button"
                  className="btn btn-danger"
                  data-focusable
                  onClick={() => {
                    clearLibrary();
                    setConfirmClear(false);
                    setStatus({ type: 'ok', message: 'Favoritos e historial eliminados.' });
                  }}
                >
                  Sí, borrar todo
                </button>
                <button type="button" className="btn btn-ghost" data-focusable onClick={() => setConfirmClear(false)}>
                  Cancelar
                </button>
              </>
            ) : (
              <button type="button" className="btn btn-danger-ghost" data-focusable onClick={() => setConfirmClear(true)}>
                <Trash2 size={17} /> Borrar favoritos e historial
              </button>
            )}
          </div>
        </section>

        <section className="panel">
          <h2>Acerca de XUPERTV</h2>
          <p>
            Versión 0.1 · Interfaz pensada para pantallas grandes y control remoto.
            Navega con las flechas, confirma con Enter y vuelve con Esc.
          </p>
          <ul className="shortcut-list">
            <li><kbd>← ↑ → ↓</kbd><span>Mover el foco</span></li>
            <li><kbd>Enter</kbd><span>Abrir o reproducir</span></li>
            <li><kbd>Esc</kbd><span>Volver</span></li>
            <li><kbd>Espacio</kbd><span>Pausa en el reproductor</span></li>
          </ul>
          <p className="hint">
            El contenido demo usa transmisiones públicas de prueba (Mux, Apple y Google) y requiere
            conexión a internet. Al desplegar en un hosting estático, la carga remota de listas M3U
            necesita el proxy CORS incluido en el servidor de desarrollo.
          </p>
        </section>
      </form>
    </>
  );
}
