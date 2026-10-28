import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const fixture = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));

export default defineConfig({
  root: fixture,
  cacheDir: `${repo}/node_modules/.vite/admission-finalization`,
  publicDir: `${repo}/public`,
  resolve: { alias: { src: `${repo}/src` } },
  define: {
    'process.env': JSON.stringify({
      BUILD_STATIC_EXPORT: 'false',
      NEXT_PUBLIC_API_URL: 'http://127.0.0.1:4226',
    }),
  },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4226, strictPort: true, fs: { allow: [repo] } },
});
