import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('../../../', import.meta.url));
const here = fileURLToPath(new URL('.', import.meta.url));
const mock = `${here}/mock.tsx`;
export default defineConfig({
  root: here,
  cacheDir: `${repo}/.artifacts/attendance-register/vite`,
  publicDir: `${repo}/public`,
  resolve: {
    alias: [
      ...[
        'src/redux/hr/attendanceApi',
        'src/redux/hr/employeeApi',
        'src/redux/customQueryAndMutation',
        'src/screens/hr/hooks/use-hr-table-export',
        'src/screens/hr/hooks/useAcademicOrganizationOptions',
        'src/components/toast',
        'next/navigation',
        'next/link',
      ].map((find) => ({ find, replacement: mock })),
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  esbuild: { jsx: 'automatic' },
  define: {
    'process.env': JSON.stringify({ NODE_ENV: 'development', BUILD_STATIC_EXPORT: 'false' }),
  },
  server: { host: '127.0.0.1', port: 5188, strictPort: true, fs: { allow: [repo] } },
});
