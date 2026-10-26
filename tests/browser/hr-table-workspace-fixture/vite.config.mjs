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
const operationalRows = Array.from({ length: 260 }, (_, index) => ({
  id: String(index),
  name: `PF rule ${String(index).padStart(3, '0')}`,
  wageCeiling: index === 259 ? null : (index % 20) / 2,
  effectiveFrom: new Date(Date.UTC(2026, 9, 1 + index)).toISOString().slice(0, 10),
}));
function operationalMatches(query, criteria = {}) {
  let matches = query.fixtureState === 'empty' ? [] : [...operationalRows];
  for (const column of new Set((criteria.filters || []).map((filter) => filter.column))) {
    const alternatives = criteria.filters.filter((filter) => filter.column === column);
    matches = matches.filter((row) =>
      alternatives.some((filter) => {
        const value = row[column];
        if (value == null) return false;
        if (filter.type === 'greaterThan') return Number(value) > Number(filter.value);
        if (filter.type === 'lessThan') return Number(value) < Number(filter.value);
        if (filter.type === 'equals')
          return String(value).toLowerCase() === String(filter.value).toLowerCase();
        return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
      })
    );
  }
  for (const sort of [...(criteria.sorts || [])].reverse())
    matches.sort((left, right) => {
      const a = sort.column === 'wageCeiling' ? (left[sort.column] ?? Infinity) : left[sort.column];
      const b =
        sort.column === 'wageCeiling' ? (right[sort.column] ?? Infinity) : right[sort.column];
      return (a === b ? 0 : a < b ? -1 : 1) * (sort.direction === 'desc' ? -1 : 1);
    });
  return matches;
}
export default defineConfig({
  plugins: [
    {
      name: 'synthetic-hr-readers',
      configureServer(server) {
        server.middlewares.use('/synthetic-hr', async (req, res) => {
          const url = new URL(req.url, 'http://localhost');
          if (['/table-query', '/typed-list'].includes(url.pathname) && req.method === 'POST') {
            let raw = '';
            for await (const chunk of req) raw += chunk;
            const body = JSON.parse(raw);
            res.setHeader('Content-Type', 'application/json');
            if (body.query.fixtureState === 'error') {
              res.statusCode = 503;
              res.end(JSON.stringify({ detail: 'Synthetic query could not be loaded.' }));
              return;
            }
            if (body.query.fixtureState === 'loading')
              await new Promise((resolve) => setTimeout(resolve, 2000));
            const matches = operationalMatches(body.query, body.criteria);
            res.end(
              JSON.stringify({
                items: matches.slice(body.offset, body.offset + body.size),
                totalCount: matches.length,
              })
            );
            return;
          }
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
            const matches =
              request.table === 'hr-pf-rules'
                ? operationalMatches(request.query, request.query.criteria)
                : filtered(request.query);
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
        find: 'src/redux/hr/hrOperationalTableApi',
        replacement: path.join(root, 'tests/browser/hr-table-workspace-fixture/operational-api.ts'),
      },
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
