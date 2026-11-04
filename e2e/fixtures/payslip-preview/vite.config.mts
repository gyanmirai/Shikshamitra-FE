import { jsPDF } from 'jspdf';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
export default defineConfig({
  root: here,
  publicDir: `${repo}/public`,
  cacheDir: `${repo}/node_modules/.vite/payslip-preview`,
  resolve: {
    preserveSymlinks: true,
    alias: [
      { find: 'next/navigation', replacement: `${here}/../payroll-overview/navigation.tsx` },
      { find: 'next/link', replacement: `${here}/../payroll-overview/navigation.tsx` },
      { find: 'next-auth/react', replacement: `${here}/../staff-policy-access/auth.ts` },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: {
    'process.env': JSON.stringify({ NEXT_PUBLIC_API_URL: '', BUILD_STATIC_EXPORT: 'false' }),
  },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4607, strictPort: true, fs: { allow: [repo] } },
  plugins: [
    {
      name: 'synthetic-payslip-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/api/payroll/payslip-settings')) return next();
          if (req.url.endsWith('/preview')) {
            let body = '';
            for await (const chunk of req) body += chunk;
            const settings = JSON.parse(body);
            const pdf = new jsPDF();
            for (let page = 1; page <= 2; page += 1) {
              if (page > 1) pdf.addPage();
              pdf.setFontSize(22);
              pdf.text('SYNTHETIC SAMPLE', 20, 25);
              pdf.setFontSize(14);
              pdf.text(`Salary Slip - ${settings.layout} - Page ${page}`, 20, 40);
              for (let row = 0; row < 15; row += 1) {
                pdf.text(`Sample payroll detail ${row + 1}`, 20, 65 + row * 12);
                pdf.line(20, 68 + row * 12, 190, 68 + row * 12);
              }
              pdf.text('End of sample page', 20, 275);
            }
            res.setHeader('Content-Type', 'application/pdf');
            return res.end(Buffer.from(pdf.output('arraybuffer')));
          }
          res.setHeader('Content-Type', 'application/json');
          return res.end(
            JSON.stringify({
              schoolName: 'Sample School',
              schoolAddress: 'Sample address',
              automaticEmail: false,
            })
          );
        });
      },
    },
  ],
});
