import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const fixture = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));

export default defineConfig({
  root: fixture,
  cacheDir: `${repo}/node_modules/.vite/pipeline-drawer-width`,
  publicDir: `${repo}/public`,
  resolve: { alias: { src: `${repo}/src` } },
  define: { 'process.env': JSON.stringify({ BUILD_STATIC_EXPORT: 'false' }) },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4219, strictPort: true, fs: { allow: [repo] } },
});
