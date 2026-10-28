import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import {
  year,
  attendance,
  calendars,
  leave,
  payroll,
  versions,
  policyImpact,
  manualAttendanceDay,
} from './data';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
export default defineConfig({
  root: here,
  cacheDir: `${repo}/node_modules/.vite/hr-policy-safety`,
  publicDir: `${repo}/public`,
  plugins: [
    {
      name: 'isolated-policy-fixture',
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          if (!request.url?.startsWith('/api/')) return next();
          response.setHeader('Content-Type', 'application/json');
          const path = new URL(request.url, 'http://127.0.0.1').pathname;
          const page = (items: unknown[]) =>
            response.end(JSON.stringify({ items, totalCount: items.length }));
          if (path === '/api/hr/table-query') {
            let body = '';
            for await (const chunk of request) body += chunk;
            const parsed = JSON.parse(body);
            const table = parsed.table;
            if (table === 'hr-manual-attendance')
              return response.end(JSON.stringify(manualAttendanceDay(parsed.query)));
            return page(
              table === 'hr-policy-attendance'
                ? attendance
                : table === 'hr-policy-payroll'
                  ? payroll
                  : table === 'hr-policy-leave'
                    ? leave
                    : []
            );
          }
          if (path === '/api/hr/policies/impact-preview' && request.method === 'POST') {
            return response.end(JSON.stringify(policyImpact));
          }
          if (request.method !== 'GET') {
            response.statusCode = 405;
            return response.end(
              JSON.stringify({ error: { message: 'Synthetic fixture refuses policy writes.' } })
            );
          }
          if (path.startsWith('/api/hr/setup-review/')) {
            return response.end(
              JSON.stringify({
                academicYearId: year.id,
                section: path.split('/').at(-1),
                configurationState: 'valid',
                reviewState: 'reviewed',
                fingerprint: 'synthetic-fingerprint',
                concurrencyStamp: 'synthetic-stamp',
                canReview: false,
                starterInitialized: true,
                tenantStarterEnabled: true,
                details: [],
                notices: [],
              })
            );
          }
          if (path.includes('holiday-import-preview') || path.endsWith('/holidays'))
            return response.end('[]');
          if (path === '/api/leave-management/year-end-settlements') return response.end('[]');
          if (path === '/api/hr/attendance/take-attendance/day')
            return response.end(
              JSON.stringify(
                manualAttendanceDay(
                  Object.fromEntries(new URL(request.url, 'http://127.0.0.1').searchParams)
                )
              )
            );
          if (path.endsWith('/restore-preview')) {
            return response.end(JSON.stringify({ ...policyImpact, blockingWarnings: [] }));
          }
          if (path.endsWith('/versions')) return page(versions);
          if (path === '/api/hr/work-calendar-policies') return page(calendars);
          if (path === '/api/hr/attendance/policies') return page(attendance);
          if (path === '/api/hr/payroll/policies') return page(payroll);
          if (path === '/api/leave-policies') return page(leave);
          return page([]);
        });
      },
    },
  ],
  resolve: {
    alias: [
      { find: 'next/navigation', replacement: `${here}/../staff-policy-access/navigation.tsx` },
      { find: 'next/link', replacement: `${here}/../staff-policy-access/navigation.tsx` },
      { find: 'next-auth/react', replacement: `${here}/../staff-policy-access/auth.ts` },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: {
    'process.env': JSON.stringify({ NEXT_PUBLIC_API_URL: '', BUILD_STATIC_EXPORT: 'false' }),
  },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4208, strictPort: true, fs: { allow: [repo] } },
});
