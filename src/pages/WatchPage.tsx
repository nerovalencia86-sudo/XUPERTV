import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Hls from 'hls.js';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize,
  Minimize,
  Pause,
  Play,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useStore } from '../store';
import { useClock } from '../hooks/useClock';
import { FavoriteButton } from '../components/FavoriteButton';
import { scheduleFor } from '../utils/epg';
import { clamp, formatTime } from '../utils/format';
import { findNextEpisode, resolveMedia, watchKey } from '../utils/media';
import type { Channel } from '../types';

export function WatchPage() {
  const { kind = '', id = '' } = useParams();
  const navigate = useNavigate();
  const catalog = useStore((state) => state.catalog);
  const progress = useStore((state) => state.progress);
  const setProgressStore = useStore((state) => state.setProgress);
  const volume = useStore((state) => state.volume);
  const setVolume = useStore((state) => state.setVolume);
  const now = useClock(30000);

  const baseMedia = useMemo(() => resolveMedia(catalog, kind, id), [catalog, kind, id]);
  const [liveChannel, setLiveChannel] = useState<Channel | null>(baseMedia?.channel ?? null);

  useEffect(() => {
    setLiveChannel(baseMedia?.live ? baseMedia.channel ?? null : null);
  }, [baseMedia?.id]);

  const media = useMemo(() => {
    if (liveChannel) {
      return {
        id: liveChannel.id,
        kind: 'live' as const,
        title: liveChannel.name,
        subtitle: liveChannel.category,
        streamUrl: liveChannel.streamUrl,
        live: true,
        colors: liveChannel.colors,
        channel: liveChannel,
      };
    }
    return baseMedia;
  }, [baseMedia, liveChannel]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hideTimer = useRef<number | null>(null);

  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [ended, setEnded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const exit = useCallback(() => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  }, [navigate]);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setControlsVisible(false), 4500);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => setToast('No se pudo iniciar la reproducción.'));
    } else {
      video.pause();
    }
    showControls();
  }, [showControls]);

  const seekBy = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = clamp(video.currentTime + delta, 0, Math.max(0, video.duration - 0.5));
    setCurrentTime(video.currentTime);
    showControls();
  }, [showControls]);

  const adjustVolume = useCallback((delta: number) => {
    const next = clamp(volume + delta, 0, 1);
    setVolume(next);
    if (muted) setMuted(false);
    showControls();
  }, [volume, muted, setVolume, showControls]);

  const toggleMute = useCallback(() => {
    setMuted((previous) => !previous);
    showControls();
  }, [showControls]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await containerRef.current?.requestFullscreen();
    } catch {
      setToast('Pantalla completa no disponible en este dispositivo.');
    }
    showControls();
  }, [showControls]);

  const zap = useCallback((direction: number) => {
    if (!catalog || !liveChannel || catalog.channels.length < 2) return;
    const index = catalog.channels.findIndex((channel) => channel.id === liveChannel.id);
    if (index < 0) return;
    const nextIndex = (index + direction + catalog.channels.length) % catalog.channels.length;
    const nextChannel = catalog.channels[nextIndex];
    setEnded(false);
    setLiveChannel(nextChannel);
    setToast(nextChannel.name);
    showControls();
  }, [catalog, liveChannel, showControls]);

  const nextEpisode = useMemo(
    () => (media?.kind === 'episode' ? findNextEpisode(catalog, media.seriesId, media.id) : null),
    [catalog, media],
  );

  const playNext = useCallback(() => {
    if (nextEpisode) navigate(`/watch/episode/${nextEpisode.episode.id}`);
    else exit();
  }, [nextEpisode, navigate, exit]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
      video.muted = muted;
    }
  }, [volume, muted, media?.id]);

  useEffect(() => {
    setEnded(false);
    setBuffering(true);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setControlsVisible(true);
    if (!media) return;

    const video = videoRef.current;
    if (!video) return;
    const source = media.streamUrl;
    let hls: Hls | null = null;

    if (/\.m3u8(\?|$)/i.test(source)) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: Boolean(media.live), backBufferLength: 60 });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            setBuffering(false);
            setToast('No se pudo cargar la señal. Comprueba tu conexión o prueba otro canal.');
          }
        });
      } else {
        setBuffering(false);
        setToast('Este navegador no puede reproducir HLS.');
      }
    } else {
      video.src = source;
    }

    const onLoaded = () => {
      const total = Number.isFinite(video.duration) ? video.duration : 0;
      setDuration(total);
      if (!media.live) {
        const saved = progress[watchKey(media.kind as 'movie' | 'episode', media.id)];
        if (saved && saved.position > 20 && saved.duration - saved.position > 20) {
          video.currentTime = saved.position;
          setCurrentTime(saved.position);
          setToast(`Reanudando desde ${formatTime(saved.position)}`);
        }
      }
      void video.play().catch(() => {
        setToast('Pulsa ▶ o Enter para iniciar la reproducción.');
        setControlsVisible(true);
      });
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onWaiting = () => setBuffering(true);
    const onPlaying = () => {
      setBuffering(false);
      setPlaying(true);
    };
    const onTime = () => {
      setCurrentTime(video.currentTime);
      if (Number.isFinite(video.duration) && video.duration > 0) setDuration(video.duration);
    };
    const onEndedEvent = () => {
      setPlaying(false);
      setEnded(true);
      setControlsVisible(true);
      if (!media.live && video.duration > 0) {
        setProgressStore(media.kind as 'movie' | 'episode', media.id, video.duration, video.duration);
      }
    };

    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('ended', onEndedEvent);

    return () => {
      hls?.destroy();
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('ended', onEndedEvent);
      if (!media.live && video.duration > 0 && Number.isFinite(video.duration)) {
        setProgressStore(media.kind as 'movie' | 'episode', media.id, video.currentTime, video.duration);
      }
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media?.id, media?.streamUrl]);

  useEffect(() => {
    if (!media || media.live) return;
    const timer = window.setInterval(() => {
      const video = videoRef.current;
      if (video && Number.isFinite(video.duration) && video.duration > 0) {
        setProgressStore(media.kind as 'movie' | 'episode', media.id, video.currentTime, video.duration);
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [media, setProgressStore]);

  useEffect(() => {
    if (!playing || ended) {
      setControlsVisible(true);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      return;
    }
    showControls();
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [playing, ended, showControls]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const key = event.key;

      if (key === 'Escape' || key === 'BrowserBack' || key === 'Backspace') {
        const target = document.activeElement;
        const editable =
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          (target instanceof HTMLElement && target.isContentEditable);
        if (editable) return;
        event.preventDefault();
        exit();
        return;
      }

      if (ended) {
        if (key === 'Enter') {
          event.preventDefault();
          playNext();
        }
        return;
      }

      if (!media) return;

      const handled = [' ', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'm', 'M', 'f', 'F', 'k', 'K'];
      if (!handled.includes(key)) return;
      event.preventDefault();
      showControls();

      if (key === ' ' || key === 'Enter' || key === 'k' || key === 'K') {
        togglePlay();
      } else if (key === 'ArrowLeft') {
        if (media.live) zap(-1);
        else seekBy(-10);
      } else if (key === 'ArrowRight') {
        if (media.live) zap(1);
        else seekBy(10);
      } else if (key === 'ArrowUp') {
        adjustVolume(0.05);
      } else if (key === 'ArrowDown') {
        adjustVolume(-0.05);
      } else if (key === 'm' || key === 'M') {
        toggleMute();
      } else if (key === 'f' || key === 'F') {
        void toggleFullscreen();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [media, ended, exit, playNext, showControls, togglePlay, zap, seekBy, adjustVolume, toggleMute, toggleFullscreen]);

  if (!media) {
    return (
      <div className="player player-fallback">
        <div className="fallback-card">
          <span className="eyebrow">Contenido no disponible</span>
          <h1>No encontramos este título</h1>
          <p>Puede que se haya eliminado de la fuente actual o que la dirección sea incorrecta.</p>
          <button type="button" className="btn btn-primary" onClick={exit}>
            <ArrowLeft size={18} /> Volver
          </button>
        </div>
      </div>
    );
  }

  const epg = liveChannel ? scheduleFor(liveChannel, now) : null;

  return (
    <div className="player" ref={containerRef} onMouseMove={showControls}>
      <video ref={videoRef} className="player-video" playsInline onClick={togglePlay} />

      {buffering && !ended ? (
        <div className="player-buffering" aria-hidden>
          <Loader2 size={34} className="spin" />
        </div>
      ) : null}

      <div className={`player-ui ${controlsVisible ? 'is-visible' : ''}`}>
        <div className="player-top">
          <button type="button" className="player-btn" onClick={exit} aria-label="Volver">
            <ArrowLeft size={22} />
          </button>
          <div className="player-heading">
            <span className="player-brand">XUPERTV</span>
            <span className="player-title">{media.title}</span>
            <span className="player-sub">
              {media.subtitle}
              {media.live && epg ? ` · Ahora: ${epg.current}` : ''}
            </span>
          </div>
          <div className="player-top-right">
            {media.live ? (
              <span className="live-tag big">
                <span className="live-dot" /> EN VIVO
              </span>
            ) : (
              <span className="quality-tag">{media.kind === 'episode' ? 'SERIE' : 'PELÍCULA'}</span>
            )}
          </div>
        </div>

        <div className="player-bottom">
          {!media.live ? (
            <div className="seek-row">
              <span className="time">{formatTime(currentTime)}</span>
              <input
                className="seek"
                type="range"
                min={0}
                max={Math.max(duration, 0)}
                step={0.5}
                value={Math.min(currentTime, duration || 0)}
                onChange={(event) => {
                  const video = videoRef.current;
                  if (!video) return;
                  const next = Number(event.target.value);
                  video.currentTime = next;
                  setCurrentTime(next);
                }}
                aria-label="Progreso de reproducción"
              />
              <span className="time">{formatTime(duration)}</span>
            </div>
          ) : null}

          <div className="control-row">
            <button
              type="button"
              className="player-btn big"
              onClick={togglePlay}
              aria-label={playing ? 'Pausa' : 'Reproducir'}
            >
              {playing ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>

            {media.live ? (
              <div className="zap-group">
                <button type="button" className="player-btn" onClick={() => zap(-1)} aria-label="Canal anterior">
                  <ChevronLeft size={22} />
                </button>
                <span className="zap-label">Cambiar canal</span>
                <button type="button" className="player-btn" onClick={() => zap(1)} aria-label="Canal siguiente">
                  <ChevronRight size={22} />
                </button>
              </div>
            ) : (
              <span className="time-inline">
                {formatTime(currentTime)} <span>/</span> {formatTime(duration)}
              </span>
            )}

            <div className="control-spacer" />

            <div className="volume-group">
              <button
                type="button"
                className="player-btn"
                onClick={toggleMute}
                aria-label={muted ? 'Activar sonido' : 'Silenciar'}
              >
                {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                className="volume"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setVolume(next);
                  setMuted(next === 0);
                }}
                aria-label="Volumen"
              />
            </div>

            {media.kind === 'movie' ? (
              <FavoriteButton itemKey={`movie:${media.id}`} focusable={false} />
            ) : null}

            <button
              type="button"
              className="player-btn"
              onClick={() => void toggleFullscreen()}
              aria-label="Pantalla completa"
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>

          <div className="player-hints">
            <span><kbd>←</kbd><kbd>→</kbd> {media.live ? 'cambiar canal' : '−10 s / +10 s'}</span>
            <span><kbd>↑</kbd><kbd>↓</kbd> volumen</span>
            <span><kbd>Espacio</kbd> pausa</span>
            <span><kbd>Esc</kbd> volver</span>
          </div>
        </div>
      </div>

      {toast ? <div className="player-toast">{toast}</div> : null}

      {ended ? (
        <div className="player-ended">
          <div className="ended-card">
            <span className="eyebrow">Fin del contenido</span>
            <h2>{media.title}</h2>
            <p>{media.subtitle}</p>
            <div className="ended-actions">
              {nextEpisode ? (
                <button type="button" className="btn btn-primary" onClick={playNext}>
                  <SkipForward size={18} /> Siguiente episodio
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={exit}>
                  Volver
                </button>
              )}
              <button type="button" className="btn btn-ghost" onClick={exit}>
                Salir
              </button>
            </div>
            <span className="ended-hint">
              {nextEpisode ? 'Enter para el siguiente episodio · Esc para salir' : 'Esc para salir'}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
