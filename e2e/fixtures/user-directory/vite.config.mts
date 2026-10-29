import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
const users = Array.from({ length: 12 }, (_, index) => ({
  id: `qa-${index + 1}`,
  userName: `QA User ${String(index + 1).padStart(2, '0')}`,
  email: `qa-${index + 1}@example.invalid`,
  roleNames: index === 11 ? ['Teacher', 'HR Manager'] : index === 0 ? [] : ['Admin'],
}));
let fail = false;
let empty = false;
export default defineConfig({
  root: here,
  publicDir: `${repo}/public`,
  cacheDir: `${repo}/node_modules/.vite/user-directory`,
  resolve: { alias: { src: `${repo}/src` } },
  define: {
    'process.env': JSON.stringify({
      NEXT_PUBLIC_API_URL: 'http://127.0.0.1:4488',
      BUILD_STATIC_EXPORT: 'false',
    }),
  },
  esbuild: { jsx: 'automatic' },
  server: {
    hmr: false,
    watch: { ignored: ['**/*'] },
    host: '127.0.0.1',
    port: 4488,
    strictPort: true,
    fs: { allow: [repo] },
  },
  plugins: [
    {
      name: 'synthetic-user-directory',
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          const url = new URL(request.url!, 'http://127.0.0.1:4488');
          const send = (data: unknown, status = 200) => {
            response.statusCode = status;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(data));
          };
          if (url.pathname === '/api/auth/session') return send(null);
          if (url.pathname === '/fixture/reset') {
            fail = false;
            empty = false;
            return send({ ok: true });
          }
          if (url.pathname === '/fixture/control') {
            fail = url.searchParams.get('fail') === 'true';
            empty = url.searchParams.get('empty') === 'true';
            return send({ ok: true });
          }
          if (url.pathname === '/api/security/user-directory') {
            if (fail) return send({ error: { message: 'Synthetic user list unavailable' } }, 500);
            const skip = Number(url.searchParams.get('skipCount'));
            return send({
              items: empty ? [] : users.slice(skip, skip + 5),
              totalCount: empty ? 0 : users.length,
            });
          }
          return next();
        });
      },
    },
  ],
});
