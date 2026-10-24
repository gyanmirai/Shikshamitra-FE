import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
export default defineConfig({
  root: here,
  cacheDir: `${repo}/node_modules/.vite/concession-status`,
  publicDir: `${repo}/public`,
  resolve: { alias: [
    { find: /^@mui\/icons-material$/, replacement: `${here}/../concession-policy/icon-barrel.ts` },
    ...[
      'src/redux/finance/ConcessionManagement/concessionManagementApi',
      'src/redux/customQueryAndMutation',
      'src/redux/session-cache',
      'src/screens/finance/hooks/useFinanceAcademicFilters',
      'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api',
    ].map((find) => ({ find, replacement: `${here}/mock-api.ts` })),
    { find: 'src', replacement: `${repo}/src` },
  ] },
  define: { 'process.env': '{"BUILD_STATIC_EXPORT":"false"}' },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4213, strictPort: true, fs: { allow: [repo] } },
});
