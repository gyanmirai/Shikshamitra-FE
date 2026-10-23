import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
export default defineConfig({
  plugins: [{
    name: 'fixture-direct-mui-icons',
    enforce: 'pre',
    transform(code, id) {
      if (!/[\\/]src[\\/]/.test(id)) return undefined;
      return code.replace(/import\s*\{([^}]+)\}\s*from\s*['"]@mui\/icons-material['"];?/g,
        (statement, names: string) => {
          const matches = names.split(',').map((name) => /^(\w+)(?:\s+as\s+(\w+))?$/.exec(name.trim()));
          if (matches.some((match) => !match)) return statement;
          return matches.map((match) => `import ${match![2] ?? match![1]} from '@mui/icons-material/${match![1]}';`).join('\n');
        });
    },
  }],
  root: here,
  cacheDir: `${repo}/node_modules/.vite/concession-request-ui`,
  publicDir: `${repo}/public`,
  resolve: {
    alias: [
      {
        find: 'src/redux/finance/concessionType',
        replacement: `${here}/mock-api.ts`,
      },
      {
        find: 'src/components/preview-document/DocumentPreviewDialog',
        replacement: `${here}/mock-document-preview.tsx`,
      },
      {
        find: 'src/redux/finance/ConcessionManagement/concessionManagementApi',
        replacement: `${here}/mock-api.ts`,
      },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: { 'process.env': '{"BUILD_STATIC_EXPORT":"false"}' },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4211, strictPort: true, fs: { allow: [repo] } },
});
