import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
const shared = fileURLToPath(new URL('../staff-policy-access/', import.meta.url));

export default defineConfig({
  root: here,
  cacheDir: `${repo}/node_modules/.vite/hr-setup-polish`,
  publicDir: `${repo}/public`,
  resolve: {
    alias: [
      { find: 'next/navigation', replacement: `${shared}/navigation.tsx` },
      { find: 'next/link', replacement: `${shared}/navigation.tsx` },
      { find: 'next-auth/react', replacement: `${shared}/auth.ts` },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: {
    'process.env': JSON.stringify({ NEXT_PUBLIC_API_URL: '', BUILD_STATIC_EXPORT: 'false' }),
  },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4197, strictPort: true, fs: { allow: [repo] } },
  plugins: [
    {
      name: 'synthetic-pf-coverage-only',
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          if (!request.url?.startsWith('/api/')) return next();
          response.setHeader('Content-Type', 'application/json');
          if (
            request.url.split('?')[0] === '/api/payroll/pf-rules/coverage' &&
            request.method === 'GET'
          ) {
            response.end(JSON.stringify({ hasSchoolWideScope: true, history: [] }));
          } else {
            // No backend connection and no persistence in this visual fixture.
            response.statusCode = 503;
            response.end(
              JSON.stringify({ error: { message: 'Synthetic preview: saving is unavailable.' } })
            );
          }
        });
      },
    },
  ],
});
