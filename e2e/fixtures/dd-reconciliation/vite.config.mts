import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
export default defineConfig({
  root: here,
  cacheDir: `${repo}/node_modules/.vite/dd-reconciliation`,
  publicDir: `${repo}/public`,
  resolve: {
    alias: [
      {
        find: /^@mui\/icons-material$/,
        replacement: `${here}/../payment-term-template/icon-barrel.ts`,
      },
      {
        find: /^src\/redux\/(customQueryAndMutation|finance\/reconciliation)$/,
        replacement: `${here}/mock-api.ts`,
      },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: { 'process.env': '{"BUILD_STATIC_EXPORT":"false"}' },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4188, strictPort: true, fs: { allow: [repo] } },
});
