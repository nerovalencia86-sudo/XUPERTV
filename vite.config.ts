import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function corsProxy(): Plugin {
  const middleware = (req: any, res: any, next: () => void) => {
    if (!req.url || !req.url.startsWith('/api/proxy')) return next();

    let target = '';
    try {
      target = new URL(req.url, 'http://localhost').searchParams.get('url') ?? '';
    } catch {
      target = '';
    }

    let parsed: URL;
    try {
      parsed = new URL(target);
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('URL inválida');
      return;
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      res.statusCode = 400;
      res.end('Protocolo no permitido');
      return;
    }

    fetch(parsed.toString(), {
      headers: {
        'User-Agent': 'XUPERTV/0.1 (+iptv-player)',
        Accept: '*/*',
      },
    })
      .then(async (upstream) => {
        const body = Buffer.from(await upstream.arrayBuffer());
        res.statusCode = upstream.status;
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader(
          'Content-Type',
          upstream.headers.get('content-type') ?? 'application/octet-stream',
        );
        res.end(body);
      })
      .catch((error: unknown) => {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end(`No se pudo conectar con el servidor remoto: ${String(error)}`);
      });
  };

  return {
    name: 'xuper-cors-proxy',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig({
  plugins: [react(), corsProxy()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
});
