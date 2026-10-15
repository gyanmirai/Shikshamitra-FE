import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, '../../..');
export default defineConfig({
  root,
  publicDir: path.join(repo, 'public'),
  plugins: [
    {
      name: 'shift-fixture-session-context',
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          let body;
          if (request.url?.startsWith('/api/host/session-context')) {
            body = {
              accountMode: 'tenant',
              tenantId: request.headers.authorization?.replace('Bearer ', ''),
              canViewTenants: false,
              canCreateTenants: false,
              canUpdateTenants: false,
              canManageTenantStatus: false,
              setupCompleted: true,
              canManageSetup: false,
            };
          } else if (request.url?.startsWith('/api/permission-management/permissions')) {
            body = { groups: [] };
          } else {
            next();
            return;
          }
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify(body));
        });
      },
    },
  ],
  resolve: {
    alias: [
      { find: 'next/navigation', replacement: path.join(root, 'navigation.tsx') },
      { find: 'next/link', replacement: path.join(root, 'navigation.tsx') },
      { find: 'next-auth/react', replacement: path.join(root, 'auth.ts') },
      { find: 'src', replacement: path.join(repo, 'src') },
    ],
  },
  define: {
    'process.env': JSON.stringify({ NEXT_PUBLIC_API_URL: '', BUILD_STATIC_EXPORT: 'false' }),
  },
  esbuild: { jsx: 'automatic' },
  server: {
    host: '127.0.0.1',
    port: 4321,
    strictPort: true,
    fs: { allow: [repo] },
    proxy: { '/api': { target: 'http://127.0.0.1:4391', changeOrigin: true } },
  },
});
