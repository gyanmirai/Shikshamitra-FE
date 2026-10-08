import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
export default defineConfig({
  root: here,
  cacheDir: `${repo}/node_modules/.vite/fee-category-readonly`,
  publicDir: `${repo}/public`,
  resolve: { alias: [
    { find: /^src\/redux\/(customQueryAndMutation|feeCategory\/feeCategoryApi|feeHeadManage\/feeHeadManageApi)$/, replacement: `${here}/mock-api.ts` },
    { find: 'src', replacement: `${repo}/src` },
  ] },
  define: { 'process.env': '{}' },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4181, strictPort: true, fs: { allow: [repo] } },
});
