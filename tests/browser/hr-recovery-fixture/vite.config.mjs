import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('../../../', import.meta.url));
export default defineConfig({
  root: path.join(root, 'tests/browser/hr-recovery-fixture'),
  cacheDir: path.join(root, '.next/hr-recovery-vite'),
  resolve: {
    alias: {
      src: path.join(root, 'src'),
      'next/navigation': path.join(root, 'tests/browser/hr-recovery-fixture/navigation.ts'),
    },
  },
  esbuild: { jsx: 'automatic' },
  define: {
    'process.env': JSON.stringify({ NODE_ENV: 'development', BUILD_STATIC_EXPORT: 'false' }),
  },
  server: { host: '127.0.0.1', port: 4196, strictPort: true, fs: { allow: [root] } },
});
