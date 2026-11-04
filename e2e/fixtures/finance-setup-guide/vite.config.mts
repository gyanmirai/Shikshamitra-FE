import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));

export default defineConfig({
  root: here,
  cacheDir: `${repo}/node_modules/.vite/finance-setup-guide`,
  publicDir: `${repo}/public`,
  resolve: {
    alias: [
      { find: 'next/navigation', replacement: `${here}/mock-navigation.ts` },
      { find: /^src\/redux\/service$/, replacement: `${here}/mock-service.ts` },
      {
        find: /^src\/layouts\/components\/global-academic-search$/,
        replacement: `${here}/mock-academic-search.tsx`,
      },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: { 'process.env': '{"BUILD_STATIC_EXPORT":"false"}' },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4188, strictPort: true, fs: { allow: [repo] } },
});
