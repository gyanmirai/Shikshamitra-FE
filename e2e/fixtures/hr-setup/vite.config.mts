import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
const sharedFixture = fileURLToPath(new URL('../staff-policy-access/', import.meta.url));

export default defineConfig({
  root: here,
  cacheDir: `${repo}/node_modules/.vite/hr-setup`,
  publicDir: `${repo}/public`,
  resolve: {
    alias: [
      { find: 'next/dynamic', replacement: `${here}/dynamic.tsx` },
      { find: 'next/navigation', replacement: `${sharedFixture}/navigation.tsx` },
      { find: 'next/link', replacement: `${sharedFixture}/navigation.tsx` },
      { find: 'next-auth/react', replacement: `${sharedFixture}/auth.ts` },
      { find: 'src', replacement: `${repo}/src` },
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
    fs: { allow: [repo] },
    proxy: { '/api': 'http://127.0.0.1:4396', '/fixture': 'http://127.0.0.1:4396' },
  },
});
