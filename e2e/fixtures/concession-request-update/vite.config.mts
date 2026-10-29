import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
export default defineConfig({
  root: here,
  cacheDir: `${repo}/node_modules/.vite/concession-request-update`,
  publicDir: `${repo}/public`,
  plugins: [
    {
      name: 'fixture-direct-mui-icons',
      enforce: 'pre',
      transform(code, id) {
        if (!/[\\/]src[\\/]/.test(id)) return undefined;
        return code.replace(
          /import\s*\{([^}]+)\}\s*from\s*['"]@mui\/icons-material['"];?/g,
          (statement, names: string) => {
            const matches = names
              .split(',')
              .map((name) => /^(\w+)(?:\s+as\s+(\w+))?$/.exec(name.trim()));
            if (matches.some((match) => !match)) return statement;
            return matches
              .map(
                (match) =>
                  `import ${match![2] ?? match![1]} from '@mui/icons-material/${match![1]}';`
              )
              .join('\n');
          }
        );
      },
    },
  ],
  resolve: {
    alias: [
      ...[
        'src/redux/finance/ConcessionManagement/concessionManagementApi',
        'src/redux/finance/concessionType',
        'src/redux/student',
        'src/redux/class/classApi',
      ].map((find) => ({ find, replacement: `${here}/mock-api.ts` })),
      ...[
        'react-redux',
        'next/navigation',
        'next-auth/react',
        'src/components/back-popup-check/BackPopUpCheck',
      ].map((find) => ({ find, replacement: `${here}/mock-shell.tsx` })),
      {
        find: 'src/components/preview-document/DocumentPreviewDialog',
        replacement: `${here}/../concession-request-ui/mock-document-preview.tsx`,
      },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: { 'process.env': '{"BUILD_STATIC_EXPORT":"false"}' },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4227, strictPort: true, fs: { allow: [repo] } },
});
