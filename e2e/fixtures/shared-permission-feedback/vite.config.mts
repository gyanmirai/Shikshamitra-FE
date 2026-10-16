import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));

export default defineConfig({
  root: here,
  publicDir: `${repo}/public`,
  cacheDir: `${repo}/node_modules/.vite/shared-permission-feedback`,
  resolve: {
    alias: [
      { find: 'next-auth/react', replacement: `${here}/auth.ts` },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: {
    'process.env': JSON.stringify({ NEXT_PUBLIC_API_URL: '', BUILD_STATIC_EXPORT: 'false' }),
  },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4198, strictPort: true, fs: { allow: [repo] } },
  plugins: [
    {
      name: 'synthetic-permission-responses',
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          if (!request.url?.startsWith('/api/')) return next();
          const referrer = new URL(request.headers.referer || 'http://127.0.0.1');
          const scenario = referrer.searchParams.get('response') || 'forbidden';
          const failures: Record<string, { status: number; body: unknown }> = {
            forbidden: {
              status: 403,
              body: {
                error: {
                  code: 'Volo.Authorization:010002',
                  message: "You don't have permission to access this resource.",
                },
              },
            },
            validation: {
              status: 400,
              body: {
                error: {
                  code: 'Fixture:InvalidValue',
                  message: 'The section name must contain at least three letters.',
                },
              },
            },
            conflict: {
              status: 409,
              body: {
                errorCode: 'Fixture:VersionConflict',
                detail: 'This record changed. Refresh its latest version before saving.',
              },
            },
            unavailable: {
              status: 503,
              body: {
                errorCode: 'Fixture:Unavailable',
                detail: 'The service is temporarily unavailable. Try again shortly.',
              },
            },
            'specific-forbidden': {
              status: 403,
              body: {
                error: {
                  code: 'HR:Employee:010043',
                  message: 'Policy access is required to add staff.',
                  data: { missingPermissions: ['HR.Policies.Assign'] },
                },
              },
            },
          };
          const failure = failures[scenario] || failures.forbidden;
          response.statusCode = failure.status;
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify(failure.body));
        });
      },
    },
  ],
});
