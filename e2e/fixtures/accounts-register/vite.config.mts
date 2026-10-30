import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
export default defineConfig({
  root: here,
  cacheDir: repo + '/node_modules/.vite/accounts-register',
  publicDir: repo + '/public',
  resolve: {
    alias: [
      { find: /^src\/redux\/service$/, replacement: here + '/api.ts' },
      { find: /^next\/link$/, replacement: here + '/link.tsx' },
      { find: /^next\/navigation$/, replacement: here + '/navigation.ts' },
      { find: /^@mui\/icons-material$/, replacement: here + '/icon-barrel.ts' },
      { find: 'src', replacement: repo + '/src' },
    ],
  },
  define: { 'process.env': { BUILD_STATIC_EXPORT: 'false' } },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4209, strictPort: true, fs: { allow: [repo] } },
});
