function looksLikeHtml(text: string): boolean {
  const head = text.trimStart().slice(0, 40).toLowerCase();
  return head.startsWith('<!doctype') || head.startsWith('<html');
}

async function viaProxy(url: string): Promise<string> {
  const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = await response.text();
  if (looksLikeHtml(text) && /\.(m3u|m3u8|php|json)(\?|$)/i.test(url)) {
    throw new Error('El proxy CORS no está disponible');
  }
  return text;
}

async function direct(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

export async function fetchRemoteText(url: string): Promise<string> {
  const target = url.trim();
  if (!/^https?:\/\//i.test(target)) throw new Error('La URL debe comenzar con http:// o https://');

  try {
    return await viaProxy(target);
  } catch (proxyError) {
    try {
      return await direct(target);
    } catch {
      throw new Error(
        `No se pudo descargar el recurso (${(proxyError as Error).message}). Revisa la URL, que el servidor esté en línea o pega el contenido manualmente.`,
      );
    }
  }
}

export async function fetchRemoteJson<T>(url: string): Promise<T> {
  const text = await fetchRemoteText(url);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('El servidor no devolvió JSON válido. Verifica las credenciales y el servidor Xtream.');
  }
}
