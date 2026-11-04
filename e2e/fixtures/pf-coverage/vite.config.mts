import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
export default defineConfig({
  root: here,
  publicDir: `${repo}/public`,
  resolve: {
    alias: [
      { find: 'src/redux/hr/pf-coverage-api', replacement: `${here}/mock-api.ts` },
      { find: 'src/components/toast', replacement: `${here}/mock-toast.ts` },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: { 'process.env': JSON.stringify({ BUILD_STATIC_EXPORT: 'false' }) },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4198, strictPort: true, fs: { allow: [repo] } },
});
