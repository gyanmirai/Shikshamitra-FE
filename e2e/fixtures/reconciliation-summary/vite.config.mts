import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));

export default defineConfig({
  root: here,
  cacheDir: `${repo}/node_modules/.vite/reconciliation-summary`,
  publicDir: `${repo}/public`,
  resolve: {
    alias: [
      { find: /^@mui\/icons-material$/, replacement: `${here}/../payment-term-template/icon-barrel.ts` },
      { find: /^next\/navigation$/, replacement: `${here}/navigation.ts` },
      { find: /^next\/link$/, replacement: `${here}/../accounts-register/link.tsx` },
      {
        find: /^src\/redux\/(customQueryAndMutation|finance\/reconciliation)$/,
        replacement: `${here}/mock-api.ts`,
      },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: { 'process.env': '{"BUILD_STATIC_EXPORT":"false"}' },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4238, strictPort: true, fs: { allow: [repo] } },
});
