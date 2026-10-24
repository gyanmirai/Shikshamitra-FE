import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
export default defineConfig({
  root: here,
  cacheDir: `${repo}/node_modules/.vite/fee-details`,
  publicDir: `${repo}/public`,
  resolve: {
    alias: [
      {
        find: /^@mui\/icons-material$/,
        replacement: `${repo}/e2e/fixtures/fee-structure/icon-barrel.ts`,
      },
      { find: /^src\/redux\/feeCollection\/feeCollection$/, replacement: `${here}/mock-api.ts` },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: { 'process.env': JSON.stringify({ NEXT_PUBLIC_APP_URL: '', BUILD_STATIC_EXPORT: 'false' }) },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 42637, strictPort: true, fs: { allow: [repo] } },
});
