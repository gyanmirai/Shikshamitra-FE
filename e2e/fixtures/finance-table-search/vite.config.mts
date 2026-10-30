import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
export default defineConfig({
  root: here,
  plugins: [
    {
      name: 'fixture-direct-mui-icon-imports',
      enforce: 'pre',
      transform(code, id) {
        if (!/[\\/]src[\\/]/.test(id)) return undefined;
        // Resolve the exact same icons directly, avoiding the library barrel's
        // thousands of unrelated modules during isolated browser QA builds.
        const transformed = code.replace(
          /import\s*\{([^}]+)\}\s*from\s*['"]@mui\/icons-material['"];?/g,
          (statement, names: string) => {
            const imports = names
              .split(',')
              .map((name) => name.trim())
              .filter(Boolean);
            const matches = imports.map((name) => /^(\w+)(?:\s+as\s+(\w+))?$/.exec(name));
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
  cacheDir: repo + '/node_modules/.vite/finance-table-search',
  publicDir: repo + '/public',
  resolve: {
    alias: [
      { find: /^src\/redux\/service$/, replacement: here + '/mock-service.ts' },
      {
        find: /^(?:.*\/)?useFinanceAcademicFilters$/,
        replacement: here + '/academic-filters.ts',
      },
      {
        find: /^(?:.*\/)?FinanceAcademicContextFilter$/,
        replacement: here + '/academic-controls.tsx',
      },
      {
        find: /^(?:.*\/)?FinanceClassDivisionFilter$/,
        replacement: here + '/academic-controls.tsx',
      },
      { find: /^next\/navigation$/, replacement: here + '/../receipt-lifecycle/navigation.ts' },
      { find: 'src', replacement: repo + '/src' },
    ],
  },
  define: { 'process.env': '{"BUILD_STATIC_EXPORT":"false"}' },
  optimizeDeps: { exclude: ['jspdf', 'jspdf-autotable', 'xlsx', 'html2canvas', 'dompurify'] },
  build: {
    rolldownOptions: {
      onLog(level, log, handler) {
        if (log.code === 'MODULE_LEVEL_DIRECTIVE') return;
        handler(level, log);
      },
    },
  },
  server: { host: '127.0.0.1', port: 5195, strictPort: true, fs: { allow: [repo] } },
});
