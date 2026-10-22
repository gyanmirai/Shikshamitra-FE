import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
export default defineConfig({
  root: here,
  publicDir: `${repo}/public`,
  cacheDir: `${repo}/node_modules/.vite/finance-settings-regression`,
  resolve: {
    alias: [
      { find: /^next\/navigation$/, replacement: `${here}/mock-navigation.ts` },
      {
        find: /^@mui\/icons-material$/,
        replacement: `${here}/../payment-term-template/icon-barrel.ts`,
      },
      {
        find: /^src\/redux\/finance\/(chargeCategory|concessionType|financeRoutingApi)$/,
        replacement: `${here}/mock-api.ts`,
      },
      { find: /^src\/redux\/customQueryAndMutation$/, replacement: `${here}/mock-query.ts` },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: { 'process.env': '{"BUILD_STATIC_EXPORT":"false"}' },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4194, strictPort: true, fs: { allow: [repo] } },
});
