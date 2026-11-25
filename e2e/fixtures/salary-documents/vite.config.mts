import { jsPDF } from 'jspdf';
import { defineConfig } from 'vite';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
const pdfWorkerDir = realpathSync(
  fileURLToPath(new URL('../../../node_modules/pdfjs-dist/build', import.meta.url))
);
const document = (id: string, revision = 2) => ({
  id: `${id}-r${revision}`,
  salarySlipId: `${id}-slip`,
  revision,
  issuedAt: '2026-11-03T08:00:00Z',
  issuedBy: 'Synthetic HR',
  sha256: 'fixture',
  isCurrent: revision === 2,
  replacesDocumentId: null,
  replacementReason: null,
  recipientEmail: 'synthetic@example.test',
  paymentStatus: 'Finalized',
  paidAt: null,
  paymentReference: null,
});
export default defineConfig({
  root: here,
  publicDir: `${repo}/public`,
  cacheDir: `${repo}/node_modules/.vite/salary-documents`,
  resolve: {
    alias: [
      { find: 'next/navigation', replacement: `${here}/../payroll-overview/navigation.tsx` },
      { find: 'next/link', replacement: `${here}/../payroll-overview/navigation.tsx` },
      { find: 'next-auth/react', replacement: `${here}/../staff-policy-access/auth.ts` },
      { find: 'next/dynamic', replacement: `${here}/../hr-setup/dynamic.tsx` },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: {
    'process.env': JSON.stringify({ NEXT_PUBLIC_API_URL: '', BUILD_STATIC_EXPORT: 'false' }),
  },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4614, strictPort: true, fs: { allow: [repo, pdfWorkerDir] } },
  plugins: [
    {
      name: 'synthetic-salary-documents',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/api/')) return next();
          const url = new URL(req.url, 'http://127.0.0.1');
          res.setHeader('Content-Type', 'application/json');
          if (
            url.pathname.endsWith('/reports/preview') ||
            url.pathname.endsWith('/hr/table-query')
          ) {
            const chunks = [];
            for await (const chunk of req) chunks.push(Buffer.from(chunk));
            const body = JSON.parse(Buffer.concat(chunks).toString());
            const request = body.query ?? body;
            const search = body.criteria?.search?.trim().toLowerCase();
            const filters = request.filters;
            const isRegister = request.dataSource === 'payroll_register';
            const columns = [
              ['month', 'Month'],
              ['employeeCode', 'Staff code'],
              ['employeeName', 'Staff name'],
              ['totalEarnings', 'Total earnings'],
              ['totalDeduction', 'Total deductions'],
              ['netPay', 'Net pay'],
              ['pf', 'PF'],
              ['pt', 'PT'],
              ['status', 'Document status'],
            ]
              .filter(([id]) => request.columns.includes(id) || id === 'pf' || id === 'pt')
              .map(([id, label]) => ({ id, label }));
            const months = isRegister
              ? [filters.month, filters.month]
              : ['2026-10', '2026-09', '2026-08', '2026-07', '2026-06', '2026-05'].filter(
                  (month) =>
                    month >= filters.fromDate.slice(0, 7) && month <= filters.toDate.slice(0, 7)
                );
            const rows = months
              .map((month, index) => {
                const firstEmployee = isRegister
                  ? index === 0
                  : filters.employeeIds[0] === 'employee-a';
                return {
                  month,
                  employeeCode: firstEmployee ? 'PAY-001' : 'PAY-002',
                  employeeName: firstEmployee ? 'Synthetic Employee A' : 'Synthetic Employee B',
                  totalEarnings: index === 0 ? '56750.00' : '55000.00',
                  totalDeduction: '2250.00',
                  netPay: index === 0 ? '54500.00' : '52750.00',
                  pf: '2050.00',
                  pt: '200.00',
                  status: isRegister ? 'Issued' : 'Paid',
                };
              })
              .filter(
                (row) =>
                  !search ||
                  Object.values(row).some((value) => value.toLowerCase().includes(search))
              );
            const sum = (key: 'totalEarnings' | 'totalDeduction' | 'netPay') =>
              rows.reduce((total, row) => total + Number(row[key]), 0);
            return res.end(
              JSON.stringify({
                columns,
                rows,
                totalCount: rows.length,
                dataSource: request.dataSource,
                reportType: request.reportType,
                page: request.page,
                pageSize: request.pageSize,
                normalizedFilters: filters,
                totalsLabel: isRegister && !search ? 'Payroll totals' : 'Displayed Row Totals',
                queryWarnings: isRegister ? ['2 of 2 staff finalized.'] : [],
                totals: {
                  totalEarnings: sum('totalEarnings'),
                  totalDeduction: sum('totalDeduction'),
                  netPay: sum('netPay'),
                },
              })
            );
          }
          if (url.pathname.endsWith('/payslip-settings'))
            return res.end(
              JSON.stringify({ presentation: { statementColumns: ['status', 'payableDays'] } })
            );
          if (url.pathname.endsWith('/employees/options'))
            return res.end(
              JSON.stringify({
                items: [
                  { id: 'employee-a', fullName: 'Synthetic Employee A' },
                  { id: 'employee-b', fullName: 'Synthetic Employee B' },
                ],
                hasMore: false,
              })
            );
          if (url.pathname.endsWith('/payslip-documents/issued')) {
            const period = url.searchParams.get('monthYear');
            const search = url.searchParams.get('search')?.toLowerCase();
            const skip = Number(url.searchParams.get('skipCount') ?? 0);
            const size = Number(url.searchParams.get('maxResultCount') ?? 25);
            const items = ['2026-10', '2026-09']
              .map((monthYear, index) => ({
                id: `employee-${index}-issued`,
                employeeId: index === 0 ? 'employee-a' : 'employee-b',
                employeeName: `Synthetic Employee ${index === 0 ? 'A' : 'B'}`,
                employeeCode: `PAY-00${index + 1}`,
                monthYear,
                issuedAt: '2026-11-03T08:00:00Z',
                revision: 2,
                isPaid: index === 0,
              }))
              .filter(
                (row) =>
                  (!period || row.monthYear === period) &&
                  (!search ||
                    `${row.employeeName} ${row.employeeCode}`.toLowerCase().includes(search))
              );
            return res.end(
              JSON.stringify({ items: items.slice(skip, skip + size), totalCount: items.length })
            );
          }
          if (url.pathname.endsWith('/payslip-documents')) {
            const id = url.searchParams.get('employeeId') ?? 'employee-a';
            return res.end(JSON.stringify([document(id), document(id, 1)]));
          }
          if (url.pathname.endsWith('/payslip-deliveries'))
            return res.end(
              JSON.stringify([
                {
                  id: 'delivery',
                  documentId: `${url.searchParams.get('salarySlipId')?.replace('-slip', '')}-r2`,
                  revision: 2,
                  status: 'PROVIDER_ACCEPTED',
                  recipient: 'synthetic@example.test',
                  requestedAt: '2026-11-03T08:00:00Z',
                },
              ])
            );
          if (url.pathname.endsWith('/pdf')) {
            const pdf = new jsPDF();
            for (let page = 1; page <= 2; page += 1) {
              if (page > 1) pdf.addPage();
              pdf.setFontSize(18);
              pdf.text(`SYNTHETIC PAYSLIP - Page ${page}`, 15, 25);
              pdf.setFontSize(12);
              pdf.text(url.pathname.split('/').at(-2) ?? '', 15, 40);
              for (let row = 0; row < 20; row += 1)
                pdf.text(`Salary document detail ${row + 1}`, 15, 55 + row * 10);
            }
            res.setHeader('Content-Type', 'application/pdf');
            return res.end(Buffer.from(pdf.output('arraybuffer')));
          }
          if (url.pathname.endsWith('/salary-slips')) return res.end('null');
          res.statusCode = 404;
          return res.end(JSON.stringify({ detail: 'Unsupported synthetic endpoint' }));
        });
      },
    },
  ],
});
