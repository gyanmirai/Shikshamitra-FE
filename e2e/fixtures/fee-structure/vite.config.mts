import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
export default defineConfig({
  root: here,
  cacheDir: `${repo}/node_modules/.vite/fee-structure`,
  publicDir: `${repo}/public`,
  resolve: {
    alias: [
      { find: /.*hooks\/useFeeStructureLookups$/, replacement: `${here}/mock-lookups.ts` },
      { find: /^src\/redux\/customQueryAndMutation$/, replacement: `${here}/mock-api.ts` },
      {
        find: /^src\/redux\/finance\/(feeStructureWorkspace|financeFeeStructure)$/,
        replacement: `${here}/mock-api.ts`,
      },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: { 'process.env': '{}' },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4178, strictPort: true, fs: { allow: [repo] } },
});
