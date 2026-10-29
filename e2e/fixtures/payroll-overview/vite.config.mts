import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
const auth = fileURLToPath(new URL('../staff-policy-access/auth.ts', import.meta.url));
const navigation = `${here}/navigation.tsx`;
let started = 0;
const months = new Map([['run-1', '2026-09']]);
const status = (id = 'run-1') => ({
  id,
  month: months.get(id) ?? '2026-09',
  academicYearId: 'year-2026',
  status: 'SUCCEEDED',
  isCurrent: true,
  employeeCount: 1,
  completedEmployees: 1,
  errorCode: null,
  errorMessage: null,
});
export default defineConfig({
  root: here,
  publicDir: `${repo}/public`,
  cacheDir: `${repo}/node_modules/.vite/payroll-overview`,
  resolve: {
    alias: [
      { find: 'next/navigation', replacement: navigation },
      { find: 'next/link', replacement: navigation },
      { find: 'next-auth/react', replacement: auth },
      {
        find: 'next/dynamic',
        replacement: fileURLToPath(new URL('../hr-setup/dynamic.tsx', import.meta.url)),
      },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: {
    'process.env': JSON.stringify({ NEXT_PUBLIC_API_URL: '', BUILD_STATIC_EXPORT: 'false' }),
  },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4596, strictPort: true, fs: { allow: [repo] } },
  plugins: [
    {
      name: 'synthetic-payroll-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const path = req.url?.split('?')[0];
          if (path !== '/fixture/state' && !path?.startsWith('/api/')) return next();
          res.setHeader('Content-Type', 'application/json');
          if (path === '/fixture/state') {
            if (req.method === 'POST') started = 0;
            return res.end(JSON.stringify({ started }));
          }
          let body = '';
          for await (const chunk of req) body += chunk;
          const input = body ? JSON.parse(body) : {};
          if (path === '/api/payroll/run/previews') {
            started += 1;
            const id =
              !input.refresh && input.month === '2026-09'
                ? 'run-1'
                : `run-${input.month}-${started}`;
            months.set(id, input.month);
            return res.end(JSON.stringify(status(id)));
          }
          if (path?.endsWith('/employees'))
            return res.end(
              JSON.stringify({
                previewRunId: path.split('/').at(-2),
                isCurrent: true,
                isGenerated: false,
                totalCount: 0,
                currentPage: 0,
                pageSize: 25,
                items: [],
                readiness: {
                  month: months.get(path.split('/').at(-2)!) ?? '2026-09',
                  employeeCount: 1,
                  snapshotCount: 1,
                  lockedCount: 0,
                  reviewedCount: path.includes('run-1') ? 1 : 0,
                  missingAttendanceCount: 0,
                  missingSalaryStructureCount: 0,
                  policyConfigurationIssueCount: 0,
                  blockingIssues: ['ESI_WAGE_CLASSIFICATION_REQUIRED', 'NEW_UNKNOWN_BLOCKER'],
                },
              })
            );
          if (path?.startsWith('/api/payroll/run/previews/'))
            return res.end(JSON.stringify(status(path.split('/').at(-1))));
          return res.end(JSON.stringify({ items: [], totalCount: 0 }));
        });
      },
    },
  ],
});
