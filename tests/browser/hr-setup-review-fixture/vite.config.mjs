import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const fixture = path.join(root, 'tests/browser/hr-setup-review-fixture');
export default defineConfig({
  root: fixture,
  resolve: {
    alias: [
      { find: 'src/redux/hr/hr-setup-review-api', replacement: path.join(fixture, 'api.tsx') },
      { find: 'next/link', replacement: path.join(fixture, 'link.tsx') },
      { find: 'src', replacement: path.join(root, 'src') },
    ],
  },
  esbuild: { jsx: 'automatic' },
  define: {
    'process.env': JSON.stringify({ NODE_ENV: 'development', BUILD_STATIC_EXPORT: 'false' }),
  },
  server: { host: '127.0.0.1', port: 4329, strictPort: true, fs: { allow: [root] } },
});
