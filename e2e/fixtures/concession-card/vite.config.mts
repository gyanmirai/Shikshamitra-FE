import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
export default defineConfig({
  plugins: [
    {
      name: 'fixture-direct-mui-icons',
      enforce: 'pre',
      transform(code, id) {
        if (!/[\\/]src[\\/]/.test(id)) return undefined;
        const transformed = code.replace(
          /import\s*\{([^}]+)\}\s*from\s*['"]@mui\/icons-material['"];?/g,
          (statement, names: string) => {
            const matches = names
              .split(',')
              .map((name) => name.trim())
              .filter(Boolean)
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
        return transformed === code ? undefined : { code: transformed, map: null };
      },
    },
  ],
  optimizeDeps: {
    include: ['react', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    exclude: ['@mui/icons-material'],
  },
  root: here,
  cacheDir: `${repo}/node_modules/.vite/concession-card`,
  resolve: {
    alias: [
      ...[
        'src/redux/finance/ConcessionManagement/concessionManagementApi',
        'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api',
        'src/redux/customQueryAndMutation',
        'src/redux/session-cache',
      ].map((find) => ({ find, replacement: `${here}/mock-api.ts` })),
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: { 'process.env': '{"BUILD_STATIC_EXPORT":"false"}' },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4212, strictPort: true, fs: { allow: [repo] } },
});
