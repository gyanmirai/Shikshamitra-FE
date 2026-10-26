import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const rows = Array.from({ length: 30 }, (_, index) => ({
  id: String(index),
  candidate: 'Synthetic staff ' + String(index).padStart(2, '0'),
  status: index % 2,
  actions: 'View',
}));
const filtered = (query) =>
  rows.filter(
    (row) =>
      (!query.search || row.candidate.includes(query.search)) &&
      (query.status === undefined || query.status === '' || row.status === Number(query.status))
  );
const jobs = new Map();
export default defineConfig({
  plugins: [
    {
      name: 'synthetic-hr-readers',
      configureServer(server) {
        server.middlewares.use('/synthetic-hr', async (req, res) => {
          const url = new URL(req.url, 'http://localhost');
          if (url.pathname === '/list') {
            const query = Object.fromEntries(url.searchParams);
            const matches = filtered(query);
            const start = (Number(query.page) - 1) * Number(query.pageSize);
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                items: matches.slice(start, start + Number(query.pageSize)),
                totalCount: matches.length,
              })
            );
            return;
          }
          if (url.pathname === '/exports' && req.method === 'POST') {
            let raw = '';
            for await (const chunk of req) raw += chunk;
            const request = JSON.parse(raw);
            const matches = filtered(request.query);
            const book = XLSX.utils.book_new();
            const data = [
              request.columns.map((column) => column.label),
              ...matches.map((row) => request.columns.map((column) => row[column.id])),
            ];
            XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(data), 'Data');
            jobs.set('synthetic-export', XLSX.write(book, { type: 'buffer', bookType: 'xlsx' }));
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                id: 'synthetic-export',
                status: 'Completed',
                rowCount: matches.length,
              })
            );
            return;
          }
          if (url.pathname === '/exports/synthetic-export/download') {
            res.setHeader(
              'Content-Type',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.end(jobs.get('synthetic-export'));
            return;
          }
          res.statusCode = 404;
          res.end();
        });
      },
    },
  ],
  root: path.join(root, 'tests/browser/hr-table-workspace-fixture'),
  resolve: {
    alias: [
      {
        find: 'src/redux/hr/hrTableExportApi',
        replacement: path.join(root, 'tests/browser/hr-table-workspace-fixture/export-api.ts'),
      },
      {
        find: 'src/redux/hr/hr-policy-api',
        replacement: path.join(root, 'tests/browser/hr-table-workspace-fixture/policy-api.ts'),
      },
      { find: 'src', replacement: path.join(root, 'src') },
    ],
  },
  esbuild: { jsx: 'automatic' },
  define: {
    'process.env': JSON.stringify({ NODE_ENV: 'development', BUILD_STATIC_EXPORT: 'false' }),
  },
  server: { fs: { allow: [root] } },
});
