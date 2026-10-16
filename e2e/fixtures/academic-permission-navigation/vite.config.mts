import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));

export default defineConfig({
  root: here,
  cacheDir: `${repo}/node_modules/.vite/academic-permission-navigation`,
  publicDir: `${repo}/public`,
  resolve: { alias: [
    { find: 'next/navigation', replacement: `${here}/navigation.tsx` },
    { find: 'next/link', replacement: `${here}/navigation.tsx` },
    { find: 'src', replacement: `${repo}/src` },
  ] },
  define: { 'process.env': JSON.stringify({ NEXT_PUBLIC_API_URL: '', NEXT_PUBLIC_APP_URL: '', BUILD_STATIC_EXPORT: 'false' }) },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4296, strictPort: true, hmr: false, fs: { allow: [repo] } },
});
