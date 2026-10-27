import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));

export default defineConfig({
  root: here,
  publicDir: `${repo}/public`,
  resolve: {
    alias: [
      { find: /^@mui\/icons-material$/, replacement: `${repo}/e2e/fixtures/fee-structure/icon-barrel.ts` },
      { find: /^(src\/redux\/service|\.\.\/service)$/, replacement: `${here}/mock-service.ts` },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: { 'process.env': '{"BUILD_STATIC_EXPORT":"false"}' },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4186, strictPort: true, fs: { allow: [repo] } },
});
