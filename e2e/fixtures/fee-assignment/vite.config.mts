import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
export default defineConfig({
  root: here,
  cacheDir: `${repo}/node_modules/.vite/fee-assignment`,
  publicDir: `${repo}/public`,
  resolve: {
    alias: [
      { find: /^@mui\/icons-material$/, replacement: `${here}/../fee-structure/icon-barrel.ts` },
      { find: /^src\/redux\/service$/, replacement: `${here}/mock-service.ts` },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: { 'process.env': '{"BUILD_STATIC_EXPORT":"false"}' },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4179, strictPort: true, fs: { allow: [repo] } },
});
