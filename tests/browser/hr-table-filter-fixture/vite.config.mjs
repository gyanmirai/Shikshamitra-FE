import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('../../../', import.meta.url));
export default defineConfig({
  root: path.join(root, 'tests/browser/hr-table-filter-fixture'),
  resolve: { alias: { src: path.join(root, 'src') } },
  esbuild: { jsx: 'automatic' },
  define: {
    'process.env': JSON.stringify({ NODE_ENV: 'development', BUILD_STATIC_EXPORT: 'false' }),
  },
  server: { fs: { allow: [root] } },
});
