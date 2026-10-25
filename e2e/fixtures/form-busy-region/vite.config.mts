import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const fixture = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
const mockedModules = [
  'next-auth/react',
  'next/navigation',
  'src/redux/customQueryAndMutation',
  'src/redux/class/classApi',
  'src/redux/student',
  'src/redux/finance/concessionType',
  'src/redux/finance/ConcessionManagement/concessionManagementApi',
];

export default defineConfig({
  root: fixture,
  publicDir: repo + '/public',
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
      ...mockedModules.map((find) => ({ find, replacement: fixture + '/mocks.ts' })),
      {
        find: 'src/components/preview-document/DocumentPreviewDialog',
        replacement: fixture + '/../concession-request-ui/mock-document-preview.tsx',
      },
      { find: 'src', replacement: repo + '/src' },
    ],
  },
  define: { 'process.env': '{"BUILD_STATIC_EXPORT":"false"}' },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4214, strictPort: true, fs: { allow: [repo] } },
});
