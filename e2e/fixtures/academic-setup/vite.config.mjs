import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, '../../..');
export default defineConfig({
  root,
  publicDir: path.join(repo, 'public'),
  resolve: {
    alias: [
      {
        find: 'next/navigation',
        replacement: path.join(root, 'navigation.tsx'),
      },
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
    port: 4322,
    strictPort: true,
    fs: { allow: [repo] },
    proxy: {
      '/api': { target: 'http://127.0.0.1:4392', changeOrigin: true },
      '/fixture': { target: 'http://127.0.0.1:4392', changeOrigin: true },
    },
  },
});
