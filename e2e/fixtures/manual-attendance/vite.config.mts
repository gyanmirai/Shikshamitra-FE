import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('../../../', import.meta.url));
const here = fileURLToPath(new URL('.', import.meta.url));
const staff = Array.from({ length: 63 }, (_, i) => ({
  employeeId: `synthetic-${i + 1}`,
  employeeCode: `SYN-${i + 1}`,
  fullName: `Synthetic staff ${i + 1}`,
  isTeaching: i % 2 === 0,
  department: i % 2 === 0 ? 'Academic' : 'Support',
  status: i % 3,
  captureMode: 'manual_status',
  dateIso: '2026-10-24',
}));
export default defineConfig({
  root: here,
  cacheDir: `${repo}/.artifacts/manual-attendance/vite`,
  publicDir: `${repo}/public`,
  plugins: [
    {
      name: 'synthetic-attendance-reader',
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          if (!request.url?.startsWith('/api/')) return next();
          response.setHeader('Content-Type', 'application/json');
          const url = new URL(request.url, 'http://127.0.0.1');
          let query = Object.fromEntries(url.searchParams) as Record<string, any>;
          let offset = Number(query.skipCount || 0);
          let size = Number(query.maxResultCount || 50);
          let criteria: any;
          if (url.pathname === '/api/hr/table-query' && request.method === 'POST') {
            let raw = '';
            for await (const chunk of request) raw += chunk;
            const body = JSON.parse(raw);
            query = body.query;
            offset = body.offset;
            size = body.size;
            criteria = body.criteria;
          } else if (request.method !== 'GET') {
            response.statusCode = 405;
            return response.end(
              JSON.stringify({ error: { message: 'Synthetic fixture refuses all writes.' } })
            );
          }
          if (
            !url.pathname.endsWith('/take-attendance/day') &&
            url.pathname !== '/api/hr/table-query'
          )
            return response.end('{}');
          let items = staff.filter(
            (row) =>
              (query.isTeaching === undefined ||
                row.isTeaching === (String(query.isTeaching) === 'true')) &&
              (!query.department || row.department.includes(query.department)) &&
              (!query.search ||
                `${row.fullName} ${row.employeeCode}`
                  .toLowerCase()
                  .includes(query.search.toLowerCase()))
          );
          for (const filter of criteria?.filters ?? []) {
            items = items.filter((row) =>
              String(row[filter.column as keyof typeof row] ?? '')
                .toLowerCase()
                .includes(String(filter.value).toLowerCase())
            );
          }
          // Longer first-day reads allow browser tests to prove obsolete responses cannot replace the current date.
          if (query.attendanceDate === '2026-10-23')
            await new Promise((resolve) => setTimeout(resolve, 700));
          response.end(
            JSON.stringify({
              date: query.attendanceDate,
              isDayLocked: false,
              totalCount: items.length,
              items: items
                .slice(offset, offset + size)
                .map((row) => ({ ...row, dateIso: query.attendanceDate })),
            })
          );
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
  server: { host: '127.0.0.1', port: 5197, strictPort: true, fs: { allow: [repo] } },
});
