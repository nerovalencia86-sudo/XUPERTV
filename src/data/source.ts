import type { Catalog, SourceSettings } from '../types';
import { demoCatalog } from './demo';
import { parseM3U } from './m3u';
import { fetchRemoteText } from './http';
import { fetchXtreamCatalog } from './xtream';

export async function loadContent(settings: SourceSettings): Promise<Catalog> {
  if (settings.mode === 'demo') {
    return demoCatalog;
  }

  if (settings.mode === 'm3u') {
    const pasted = settings.m3uText.trim();
    const url = settings.m3uUrl.trim();

    if (!pasted && !url) {
      throw new Error('Configura una URL de lista M3U o pega el contenido de la lista.');
    }

    const content = pasted || (await fetchRemoteText(url));
    const channels = parseM3U(content, pasted ? undefined : url);

    if (channels.length === 0) {
      throw new Error('No se encontraron canales en la lista M3U. Revisa el formato del contenido.');
    }

    return {
      channels,
      movies: [],
      series: [],
      sourceLabel: 'Lista M3U',
    };
  }

  return fetchXtreamCatalog(settings);
}
