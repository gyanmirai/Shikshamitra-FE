import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
export default defineConfig({
  root: here,
  cacheDir: repo + '/node_modules/.vite/charge-create',
  publicDir: repo + '/public',
  resolve: {
    alias: [
      { find: 'next-auth/react', replacement: here + '/auth.ts' },
      { find: /^@mui\/icons-material$/, replacement: here + '/../fee-structure/icon-barrel.ts' },
      {
        find: /^src\/redux\/(customQueryAndMutation|student|class\/classApi|finance\/chargeCategory|finance\/ChargeManagement\/chargeApi)$/,
        replacement: here + '/mock-api.ts',
      },
      { find: 'src', replacement: repo + '/src' },
    ],
  },
  define: { 'process.env': '{}' },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4192, strictPort: true, fs: { allow: [repo] } },
});
