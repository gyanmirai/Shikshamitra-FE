import { jsPDF } from 'jspdf';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
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
  server: { host: '127.0.0.1', port: 4614, strictPort: true, fs: { allow: [repo] } },
  plugins: [
    {
      name: 'synthetic-salary-documents',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/api/')) return next();
          const url = new URL(req.url, 'http://127.0.0.1');
          res.setHeader('Content-Type', 'application/json');
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
