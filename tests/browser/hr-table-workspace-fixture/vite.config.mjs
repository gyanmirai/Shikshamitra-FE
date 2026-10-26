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
const staffRows = Array.from({ length: 125 }, (_, index) => ({
  id: `staff-${index}`,
  fullName: `Staff ${String(index).padStart(3, '0')}`,
  employeeIdentifier: `SYN-${String(index).padStart(4, '0')}`,
  designation: index % 2 ? 'Clerk' : 'Teacher',
  thumbnailPicture: 'synthetic',
  mobileNo: '0000000000',
  readiness: 'Ready',
  roleValue: 'Staff',
  dob: '1990-01-01',
  doi: '2020-01-01',
  genderValue: index % 2 ? 'Female' : 'Male',
  email: `staff-${index}@example.invalid`,
  isTeaching: index % 2 === 0,
  shiftName: 'Morning',
  organization: 'Synthetic school',
  statusValue: index % 3 ? 'Active' : 'Upcoming',
  employeeName: `Staff ${String(index).padStart(3, '0')}`,
  present: index % 20,
  employeeGroup: index % 2 ? 'NonTeaching' : 'Teaching',
  department: 'Synthetic department',
  exceptions: index % 3 === 0 ? 'Locked 1' : index % 3 === 1 ? 'Absent 1' : 'Clear',
  editability: index % 3 === 0 ? '0 editable; 1 locked' : '1 editable',
}));
const imports = new Map();
function importRows(key) {
  if (!imports.has(key))
    imports.set(
      key,
      Array.from({ length: 30 }, (_, index) => ({
        id: `import-${index}`,
        employeeId: `employee-${index}`,
        employeeName: `Import staff ${String(index).padStart(3, '0')}`,
        rowNumber: index + 1,
        attendanceDate: '2026-10-26',
        timeIn: '09:00',
        timeOut: '17:00',
        status: 'Present',
        statusCode: 0,
        errors: [],
        warnings: [],
      }))
    );
  return imports.get(key);
}
function operationalMatches(query, criteria = {}) {
  let matches =
    query.fixtureState === 'empty'
      ? []
      : [
          ...(query.fixtureKind === 'import'
            ? importRows(query.fixtureKey)
            : ['directory', 'icard', 'register'].includes(query.fixtureKind)
              ? staffRows
              : operationalRows),
        ];
  if (criteria.search || query.search)
    matches = matches.filter((row) =>
      JSON.stringify(row)
        .toLowerCase()
        .includes((criteria.search || query.search).toLowerCase())
    );
  for (const column of new Set((criteria.filters || []).map((filter) => filter.column))) {
    const alternatives = criteria.filters.filter((filter) => filter.column === column);
    matches = matches.filter((row) =>
      alternatives.some((filter) => {
        const value =
          column === 'fullName' ? `${row.fullName} ${row.employeeIdentifier}` : row[column];
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
          if (url.pathname === '/save-import-rows' && req.method === 'POST') {
            let raw = '';
            for await (const chunk of req) raw += chunk;
            const body = JSON.parse(raw);
            for (const entry of body.entries) {
              const row = importRows(body.fixtureKey).find((item) => item.id === entry.rowId);
              Object.assign(row, {
                timeIn: entry.inTime,
                timeOut: entry.outTime,
                status: entry.statusWire,
                statusCode: { Present: 0, Absent: 1, HalfDay: 2 }[entry.statusWire],
              });
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ upsertedCount: body.entries.length }));
            return;
          }
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
            const matches = [
              'hr-pf-rules',
              'employee-table',
              'employee-icard-selection-table',
              'hr-attendance-register',
            ].includes(request.table)
              ? operationalMatches(request.query, request.query.criteria)
              : filtered(request.query);
            const book = XLSX.utils.book_new();
            const data = [
              request.columns.map((column) => column.label),
              ...matches.map((row) =>
                request.columns.map((column) =>
                  column.id === 'fullName' &&
                  ['employee-table', 'employee-icard-selection-table'].includes(request.table)
                    ? `${row.fullName} ${row.employeeIdentifier}`
                    : row[column.id]
                )
              ),
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
