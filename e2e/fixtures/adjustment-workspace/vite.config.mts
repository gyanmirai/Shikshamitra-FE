import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
export default defineConfig({
  root: here,
  cacheDir: join(tmpdir(), 'shikshamitra-adjustment-workspace-vite'),
  plugins: [
    {
      name: 'direct-mui-icon-imports',
      enforce: 'pre',
      transform(code, id) {
        if (!/[\\/]src[\\/]/.test(id)) return;
        const result = code.replace(
          /import\s*\{([^}]+)\}\s*from\s*['"]@mui\/icons-material['"];?/g,
          (statement, names: string) => {
            const entries = names
              .split(',')
              .map((name) => name.trim())
              .filter(Boolean)
              .map((name) => /^(\w+)(?:\s+as\s+(\w+))?$/.exec(name));
            return entries.some((entry) => !entry)
              ? statement
              : entries
                  .map(
                    (entry) =>
                      `import ${entry![2] || entry![1]} from '@mui/icons-material/${entry![1]}';`
                  )
                  .join('\n');
          }
        );
        return result === code ? undefined : { code: result, map: null };
      },
    },
  ],
  resolve: {
    alias: [
      ...[
        'src/redux/finance/adjustments/adjustmentApi',
        'src/redux/finance/financeWorkContextApi',
        'src/redux/finance/RefundManagement/feeRefundManage',
        'src/redux/class/classApi',
        'src/redux/student',
        'src/redux/customQueryAndMutation',
      ].map((find) => ({ find, replacement: `${here}/mock-api.ts` })),
      { find: 'next/navigation', replacement: `${here}/mock-navigation.tsx` },
      { find: 'src/routes/hooks', replacement: `${here}/mock-navigation.tsx` },
      { find: 'next/link', replacement: `${here}/mock-navigation.tsx` },
      { find: 'src/redux/session-cache', replacement: `${here}/../concession-card/mock-api.ts` },
      {
        find: 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api',
        replacement: `${here}/../concession-card/mock-api.ts`,
      },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  optimizeDeps: {
    include: ['react', 'react-dom/client', 'react/jsx-runtime'],
    exclude: ['@mui/icons-material'],
  },
  define: { 'process.env': '{"BUILD_STATIC_EXPORT":"false"}' },
  build: {
    rolldownOptions: {
      onLog(level, log, handler) {
        if (log.code === 'MODULE_LEVEL_DIRECTIVE') return;
        handler(level, log);
      },
    },
    outDir: join(tmpdir(), 'shikshamitra-adjustment-workspace-dist'),
    emptyOutDir: false,
    minify: false,
    sourcemap: false,
  },
  preview: { host: '127.0.0.1', port: 4229, strictPort: true },
  server: { host: '127.0.0.1', port: 4229, strictPort: true, fs: { allow: [repo] } },
});
