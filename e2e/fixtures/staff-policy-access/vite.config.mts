import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
const policyPaths = new Map([
  ['/api/hr/payroll/policies', 'Payroll'],
  ['/api/hr/attendance/policies', 'Attendance'],
  ['/api/leave-policies', 'Leave'],
]);

export default defineConfig({
  root: here,
  cacheDir: `${repo}/node_modules/.vite/staff-policy-access`,
  publicDir: `${repo}/public`,
  plugins: [
    {
      name: 'synthetic-staff-policy-responses',
      configureServer(server) {
        const attempts = new Map<string, number>();
        server.middlewares.use(async (request, response, next) => {
          if (!request.url?.startsWith('/api/')) return next();
          const url = new URL(request.url, 'http://127.0.0.1');
          const referrer = new URL(request.headers.referer || 'http://127.0.0.1');
          const scenario = referrer.searchParams.get('scenario') || 'ready';
          const run = referrer.searchParams.get('run') || 'manual';
          const key = `${scenario}:${run}:${url.pathname}`;
          const attempt = (attempts.get(key) || 0) + 1;
          attempts.set(key, attempt);
          response.setHeader('Content-Type', 'application/json');
          const send = (body: unknown, status = 200) => {
            response.statusCode = status;
            response.end(JSON.stringify(body));
          };
          const policy = policyPaths.get(url.pathname);
          if (policy) {
            if (scenario === 'forbidden') return send({ error: { message: 'Forbidden' } }, 403);
            if (scenario === 'transient' && attempt === 1) {
              return send({ error: { message: 'Policy service unavailable' } }, 503);
            }
            const items =
              scenario === 'missing-default'
                ? []
                : [
                    {
                      id: `synthetic-${policy.toLowerCase()}-policy`,
                      name: `${policy} default`,
                      policyName: `${policy} default`,
                      status: 'Active',
                      isActive: true,
                      isDefault: true,
                      academicYearId: 'synthetic-year',
                    },
                  ];
            if (scenario === 'multiple-default' && items[0]) {
              items.push({ ...items[0], id: `${items[0].id}-duplicate` });
            }
            return send({ items, totalCount: items.length });
          }
          if (url.pathname === '/api/permission-management/permissions') {
            const grants = [
              'HR.Employee.EmployeeList.View',
              'HR.Employee.EmployeeList.Add',
              'HR.Policies.View',
              'HR.LeaveManagement.Setting.LeavePolicy.View',
              'HR.Policies.Assign',
              'HR.Policies.PreviewImpact',
            ];
            return send({
              groups: [
                { name: 'HR', permissions: grants.map((name) => ({ name, isGranted: true })) },
              ],
            });
          }
          if (
            url.pathname === '/api/identity/roles/all' ||
            url.pathname === '/api/employees/assignable-roles'
          ) {
            return send({
              items: [
                {
                  id: 'synthetic-role',
                  name: 'Teacher',
                  roleAudience: 'Employee',
                  employeeGroupAudience: 'Teaching',
                  employeeOnboardingAssignable: true,
                },
              ],
            });
          }
          if (url.pathname === '/api/app/shift-management') {
            return send({
              items: [
                {
                  id: 'synthetic-shift',
                  shiftName: 'Morning',
                  startTime: '08:00:00',
                  endTime: '16:00:00',
                },
              ],
            });
          }
          if (url.pathname === '/api/employees/synthetic-employee/personal-info') {
            return send({
              id: 'synthetic-employee',
              firstName: 'Existing',
              lastName: 'Staff',
              email: 'existing@example.invalid',
              dob: '1990-01-01',
              doj: '2026-04-01',
              mobileNo: '9876543210',
              gender: 0,
              religion: 0,
              casteType: 0,
              maritalStatus: 0,
              isTeaching: true,
            });
          }
          if (request.method !== 'GET') {
            return send({ error: { message: 'Synthetic fixture refuses writes' } }, 405);
          }
          return send({ items: [], totalCount: 0 });
        });
      },
    },
  ],
  resolve: {
    alias: [
      { find: 'next/navigation', replacement: `${here}/navigation.tsx` },
      { find: 'next/link', replacement: `${here}/navigation.tsx` },
      { find: 'next-auth/react', replacement: `${here}/auth.ts` },
      { find: /^\.\/employee-form-fields$/, replacement: `${here}/personal-step.tsx` },
      {
        find: /^\.\/(?:payroll-profile-workspace|payroll-edit-details)$/,
        replacement: `${here}/unvisited-steps.tsx`,
      },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: {
    'process.env': JSON.stringify({ NEXT_PUBLIC_API_URL: '', BUILD_STATIC_EXPORT: 'false' }),
  },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4197, strictPort: true, fs: { allow: [repo] } },
});
