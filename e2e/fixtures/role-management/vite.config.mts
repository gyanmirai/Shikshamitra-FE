import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
const navigation = fileURLToPath(new URL('../school-identity/navigation.tsx', import.meta.url));
const seed = () =>
  Array.from({ length: 18 }, (_, index) => ({
    id: `qa-role-${index + 1}`,
    name: `QA Role ${String(index + 1).padStart(2, '0')}`,
    extraProperties: { color: '#00B96B', roleAudience: 'Employee', employeeGroupAudience: 'Both' },
  }));
let roles = seed();
let writes: unknown[] = [];
let failRead = false;
let failSave = false;
let delay = 0;

export default defineConfig({
  root: here,
  publicDir: `${repo}/public`,
  cacheDir: `${repo}/node_modules/.vite/role-management`,
  resolve: {
    alias: [
      { find: 'next/navigation', replacement: navigation },
      { find: 'next/link', replacement: navigation },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: {
    'process.env': JSON.stringify({
      NEXT_PUBLIC_API_URL: 'http://127.0.0.1:4328',
      BUILD_STATIC_EXPORT: 'false',
    }),
  },
  esbuild: { jsx: 'automatic' },
  server: { hmr: false, host: '127.0.0.1', port: 4328, strictPort: true, fs: { allow: [repo] } },
  plugins: [
    {
      name: 'synthetic-role-api',
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          const url = new URL(request.url!, 'http://127.0.0.1:4328');
          if (!url.pathname.startsWith('/api/') && !url.pathname.startsWith('/fixture/'))
            return next();
          const send = (value: unknown, status = 200) => {
            response.statusCode = status;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(value));
          };
          if (url.pathname === '/api/auth/session') return send(null);
          let body = '';
          if (request.method !== 'GET') for await (const chunk of request) body += chunk;
          if (url.pathname === '/fixture/reset') {
            roles = seed();
            writes = [];
            failRead = false;
            failSave = false;
            delay = 0;
            return send({ ok: true });
          }
          if (url.pathname === '/fixture/control') {
            const options = JSON.parse(body);
            failRead = options.failRead ?? failRead;
            failSave = options.failSave ?? failSave;
            delay = options.delay ?? delay;
            if (options.empty) roles = [];
            return send({ ok: true });
          }
          if (url.pathname === '/fixture/state') return send({ roles, writes });
          if (url.pathname === '/api/identity/roles/all')
            return failRead
              ? send({ detail: 'Synthetic role list unavailable. Retry the request.' }, 503)
              : send({ items: roles });
          if (url.pathname.startsWith('/api/identity/roles') && request.method !== 'GET') {
            writes.push({
              method: request.method,
              path: url.pathname,
              body: body ? JSON.parse(body) : null,
            });
            if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
            if (failSave) {
              failSave = false;
              return send({ detail: 'A role with this name already exists.' }, 409);
            }
            const id = url.pathname.split('/').at(-1)!;
            if (request.method === 'DELETE') roles = roles.filter((role) => role.id !== id);
            else if (request.method === 'PUT')
              roles = roles.map((role) =>
                role.id === id ? { ...role, ...JSON.parse(body) } : role
              );
            else roles.push({ id: `qa-new-${roles.length}`, ...JSON.parse(body) });
            return send({}, 200);
          }
          if (url.pathname === '/api/permission-management/permissions')
            return send({ groups: [] });
          return send({ detail: 'Unknown synthetic endpoint' }, 404);
        });
      },
    },
  ],
});
