import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('../../../', import.meta.url));
export default defineConfig({
  root: path.join(root, 'tests/browser/hr-table-workspace-fixture'),
  resolve: { alias: [
    { find:'src/redux/hr/hr-policy-api',replacement:path.join(root,'tests/browser/hr-table-workspace-fixture/policy-api.ts') },
    { find:'src',replacement:path.join(root,'src') },
  ] },
  esbuild: { jsx: 'automatic' },
  define: {
    'process.env': JSON.stringify({ NODE_ENV: 'development', BUILD_STATIC_EXPORT: 'false' }),
  },
  server: { fs: { allow: [root] } },
});
