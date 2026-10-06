import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));

export default defineConfig({
  root: here,
  cacheDir: `${repo}/node_modules/.vite/concession-policy`,
  publicDir: `${repo}/public`,
  resolve: {
    alias: [
      { find: /^@mui\/icons-material$/, replacement: `${here}/icon-barrel.ts` },
      { find: /^(src\/redux\/service|\.\.\/service)$/, replacement: `${here}/mock-service.ts` },
      { find: /^src\/redux\/customQueryAndMutation$/, replacement: `${here}/mock-query.ts` },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: { 'process.env': '{"BUILD_STATIC_EXPORT":"false"}' },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4187, strictPort: true, fs: { allow: [repo] } },
});
