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
          if (path === '/api/payroll/run/approval-settings')
            return res.end(JSON.stringify({ mode: 'Legacy', version: 0, approverId: null, allowSelfFinalization: false }));
          if (path === '/api/payroll/run/previews/current') {
            const { searchParams } = new URL(req.url!, 'http://127.0.0.1');
            const month = searchParams.get('month');
            const match = Array.from(months.entries()).reverse().find((entry) => entry[1] === month);
            return res.end(JSON.stringify({ currentRun: match ? status(match[0]) : null }));
          }
          if (path === '/api/payroll/run/previews') {
            started += 1;
            const id =
              !input.refresh && input.month === '2026-09'
                ? 'run-1'
                : `run-${input.month}-${started}`;
            months.set(id, input.month);
            return res.end(JSON.stringify(status(id)));
          }
          if (path?.endsWith('/employees') || path === '/api/payroll/run/register') {
            const criteria = new URL(req.url!, 'http://127.0.0.1').searchParams;
            const requestedMonth = criteria.get('month');
            const id = requestedMonth
              ? Array.from(months.entries()).reverse().find((entry) => entry[1] === requestedMonth)?.[0]
              : path.split('/').at(-2);
            const registerRows = id && path === '/api/payroll/run/register'
              ? [
                  {
                    employeeId: 'fixture-staff-1', employeeName: 'Asha Rao',
                    employeeIdentifier: 'PAY-001', payableDays: 22, totalWorkingDays: 22,
                    grossSalary: 39500, totalEarnings: 42000, totalDeduction: 3600, netPay: 38400,
                    previousMonthNetPay: 37800, netPayDelta: 600, netPayDeltaPercent: 1.59,
                    reviewStatus: 'REVIEWED', issueCodes: [],
                  },
                  {
                    employeeId: 'fixture-staff-2', employeeName: 'Vikram Shah',
                    employeeIdentifier: 'PAY-002', payableDays: 20, totalWorkingDays: 22,
                    grossSalary: 34800, totalEarnings: 34800, totalDeduction: 2800, netPay: 32000,
                    previousMonthNetPay: 33800, netPayDelta: -1800, netPayDeltaPercent: -5.33,
                    reviewStatus: 'PENDING', issueCodes: ['ESI_WAGE_CLASSIFICATION_REQUIRED'],
                  },
                ]
              : [];
            const search = criteria.get('search')?.toLowerCase();
            const reviewState = criteria.get('reviewState');
            const issueCode = criteria.get('issueCode');
            const issueClass = criteria.get('issueClass');
            const matchingRows = registerRows.filter((row) =>
              (!search || `${row.employeeName} ${row.employeeIdentifier}`.toLowerCase().includes(search)) &&
              (!reviewState || row.reviewStatus === reviewState) &&
              (!issueCode || row.issueCodes.includes(issueCode)) &&
              (!issueClass || (issueClass === 'CLEAN' ? !row.issueCodes.length : row.issueCodes.length > 0))
            );
            const sort = criteria.get('sort');
            const direction = criteria.get('descending') === 'true' ? -1 : 1;
            matchingRows.sort((left, right) => {
              if (sort === 'payableDays' || sort === 'netPay' || sort === 'netPayDelta')
                return direction * (left[sort] - right[sort]);
              return direction * left.employeeName.localeCompare(right.employeeName);
            });
            return res.end(
              JSON.stringify({
                previewRunId: id ?? null,
                isCurrent: Boolean(id),
                isGenerated: false,
                totalCount: matchingRows.length,
                currentPage: 0,
                pageSize: 25,
                items: matchingRows,
                readiness: {
                  month: requestedMonth ?? months.get(id!) ?? '2026-09',
                  employeeCount: registerRows.length || 1,
                  snapshotCount: registerRows.length || 1,
                  lockedCount: 0,
                  reviewedCount: id === 'run-1' ? 1 : 0,
                  missingAttendanceCount: 0,
                  missingSalaryStructureCount: 0,
                  policyConfigurationIssueCount: 0,
                  blockingIssues: ['ESI_WAGE_CLASSIFICATION_REQUIRED', 'NEW_UNKNOWN_BLOCKER'],
                },
              })
            );
          }
          if (path?.startsWith('/api/payroll/run/previews/'))
            return res.end(JSON.stringify(status(path.split('/').at(-1))));
          return res.end(JSON.stringify({ items: [], totalCount: 0 }));
        });
      },
    },
  ],
});
