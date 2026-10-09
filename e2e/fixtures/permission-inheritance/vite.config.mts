import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { createFixture } from './catalogue.mjs';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
let fixture = createFixture();
export default defineConfig({
  root: here, cacheDir: `${repo}/node_modules/.vite/permission-inheritance`, publicDir: `${repo}/public`,
  resolve: { alias: { src: `${repo}/src` } },
  define: { 'process.env': JSON.stringify({ NEXT_PUBLIC_API_URL: 'http://127.0.0.1:4186', NEXT_PUBLIC_APP_URL: '', BUILD_STATIC_EXPORT: 'false' }) },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4186, strictPort: true, fs: { allow: [repo] } },
  plugins: [{ name: 'synthetic-permission-network', configureServer(server) {
    server.middlewares.use(async (request, response, next) => {
      const url = new URL(request.url!, 'http://127.0.0.1:4186');
      if (!url.pathname.startsWith('/api/') && !url.pathname.startsWith('/fixture/')) return next();
      const send = (value: unknown) => { response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify(value)); };
      if (url.pathname === '/api/auth/session') return send(null);
      if (url.pathname === '/fixture/reset') { fixture = createFixture(); return send({ ok: true }); }
      if (url.pathname === '/fixture/writes') return send(fixture.writes);
      const userRoute = url.pathname.match(/^\/api\/shikshamitra-permissions\/users\/([^/]+)\/permissions$/);
      if (url.pathname !== '/api/permission-management/permissions' && !userRoute) { response.statusCode = 404; return send({ error: 'Unknown fixture route' }); }
      const provider = userRoute ? 'U' : url.searchParams.get('providerName')!;
      const key = userRoute ? decodeURIComponent(userRoute[1]) : url.searchParams.get('providerKey')!;
      if (request.method === 'PUT') {
        let body = ''; for await (const chunk of request) body += chunk;
        fixture.update(provider, key, JSON.parse(body).permissions);
        response.statusCode = 204; response.end(); return;
      }
      return send(fixture.read(provider, key));
    });
  } }],
});
