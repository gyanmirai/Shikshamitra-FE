import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, '../../..');
export default defineConfig({
  root,
  cacheDir:
    process.env.COLLECTION_LATEFEE_CACHE_DIR ||
    path.join(repo, 'node_modules/.vite/collection-policy-real'),
  publicDir: path.join(repo, 'public'),
  resolve: {
    alias: [
      {
        find: /^@mui\/icons-material$/,
        replacement: path.join(repo, 'e2e/fixtures/concession-policy/icon-barrel.ts'),
      },
      {
        find: 'next/navigation',
        replacement: path.join(repo, 'e2e/fixtures/school-identity/navigation.tsx'),
      },
      {
        find: 'next/link',
        replacement: path.join(repo, 'e2e/fixtures/school-identity/navigation.tsx'),
      },
      {
        find: 'next-auth/react',
        replacement: path.join(repo, 'e2e/fixtures/school-documents/auth.ts'),
      },
      { find: 'src', replacement: path.join(repo, 'src') },
    ],
  },
  define: {
    'process.env': JSON.stringify({ NEXT_PUBLIC_API_URL: '', BUILD_STATIC_EXPORT: 'false' }),
  },
  esbuild: { jsx: 'automatic' },
  server: {
    host: '127.0.0.1',
    port: 4196,
    strictPort: true,
    hmr: false,
    fs: { allow: [repo] },
    proxy: {
      '/api': { target: 'http://127.0.0.1:4395', changeOrigin: true },
      '/fixture': { target: 'http://127.0.0.1:4395', changeOrigin: true },
    },
  },
});
