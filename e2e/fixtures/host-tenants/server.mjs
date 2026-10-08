import http from 'node:http';
import { randomUUID } from 'node:crypto';

// Loopback-only synthetic network fixture. Production components and auth remain unchanged.
const origin = 'http://127.0.0.1:4398';
const permissions = [
  'AbpTenantManagement.Tenants',
  'AbpTenantManagement.Tenants.Create',
  'AbpTenantManagement.Tenants.Update',
  'AbpTenantManagement.Tenants.ManageStatus',
];
const defaults = {
  instituteName: 'Synthetic School',
  email: 'office@example.test',
  contactNumber: '9876543210',
  address1: 'Test Road',
  address2: '',
  address3: '',
  city: 'Surat',
  state: 'Gujarat',
  country: 'India',
  postalCode: '395001',
};
let rows, canWrite, failNext, delay;
const reset = (options = {}) => {
  rows = Array.from({ length: 32 }, (_, index) => ({
    ...defaults,
    id: randomUUID(),
    name: `SCHOOL_${String(index + 1).padStart(2, '0')}`,
    instituteName: `Synthetic School ${index + 1}`,
    isActive: true,
    concurrencyStamp: randomUUID(),
    creationTime: new Date().toISOString(),
  }));
  canWrite = options.canWrite !== false;
  failNext = options.failNext;
  delay = options.delay ?? 0;
};
reset();
const token = (tenantId) =>
  `eyJhbGciOiJub25lIn0.${Buffer.from(JSON.stringify({ sub: 'synthetic-host-user', name: 'Synthetic administrator', email: 'admin@example.test', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600, ...(tenantId ? { tenantid: tenantId } : {}) })).toString('base64url')}.signature`;

const server = http.createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Headers', 'authorization,content-type,__tenant');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  const send = (status, value) => {
    response.writeHead(status, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(value));
  };
  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }
  const url = new URL(request.url, 'http://127.0.0.1:4399');
  let raw = '';
  for await (const chunk of request) raw += chunk;
  const body =
    raw && request.headers['content-type']?.includes('application/json') ? JSON.parse(raw) : {};
  if (url.pathname === '/fixture/reset' && request.method === 'POST') {
    reset(body);
    send(200, { ready: true });
    return;
  }
  if (url.pathname === '/fixture/conflict' && request.method === 'POST') {
    failNext = 409;
    rows[0].instituteName = 'Changed by another administrator';
    rows[0].concurrencyStamp = randomUUID();
    send(200, { ready: true });
    return;
  }
  if (url.pathname === '/connect/token') {
    if (request.headers.__tenant === 'INACTIVE') {
      send(400, { error: 'invalid_grant', errorCode: 'TENANT_INACTIVE' });
      return;
    }
    const form = new URLSearchParams(raw);
    if (form.get('username') !== 'admin' || form.get('password') !== 'Fixture-Password-29!') {
      send(400, { error: 'invalid_grant' });
      return;
    }
    send(200, {
      access_token: token(request.headers.__tenant ? rows[0].id : null),
      refresh_token: 'synthetic-refresh',
      id_token: 'synthetic-id',
      expires_in: 3600,
      token_type: 'Bearer',
    });
    return;
  }
  if (!request.headers.authorization) {
    send(401, { title: 'Authentication required' });
    return;
  }
  if (url.pathname === '/api/permission-management/permissions') {
    send(200, {
      groups: [
        {
          permissions: permissions.map((name) => ({
            name,
            isGranted: canWrite || name === permissions[0],
          })),
        },
      ],
    });
    return;
  }
  if (url.pathname === '/api/host/session-context') {
    send(200, {
      accountMode: 'host',
      tenantId: null,
      canViewTenants: true,
      canCreateTenants: canWrite,
      canUpdateTenants: canWrite,
      canManageTenantStatus: canWrite,
    });
    return;
  }
  const match = url.pathname.match(/^\/api\/host\/tenants(?:\/([^/]+))?(\/status)?$/);
  if (!match) {
    send(404, { title: 'No synthetic endpoint' });
    return;
  }
  if (request.method === 'GET') {
    if (match[1]) {
      const row = rows.find((item) => item.id === match[1]);
      send(row ? 200 : 404, row || {});
      return;
    }
    const filter = (url.searchParams.get('filter') || '').toLowerCase();
    const active = url.searchParams.get('isActive');
    let matches = rows.filter(
      (row) =>
        (!filter || `${row.name} ${row.instituteName}`.toLowerCase().includes(filter)) &&
        (!active || row.isActive === (active === 'true'))
    );
    const sorting = url.searchParams.get('sorting') || 'name asc';
    const [key, direction] = sorting.split(' ');
    matches.sort(
      (left, right) =>
        String(left[key]).localeCompare(String(right[key])) * (direction === 'desc' ? -1 : 1)
    );
    const skip = Number(url.searchParams.get('skipCount') || 0),
      take = Number(url.searchParams.get('maxResultCount') || 10);
    send(200, { totalCount: matches.length, items: matches.slice(skip, skip + take) });
    return;
  }
  if (!canWrite) {
    send(403, { title: 'Permission denied' });
    return;
  }
  if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
  if (failNext) {
    const status = failNext;
    failNext = null;
    send(status, {
      title: status === 409 ? 'Concurrency conflict' : 'Synthetic retryable failure',
    });
    return;
  }
  if (request.method === 'POST') {
    if (rows.some((row) => row.name === body.name)) {
      send(400, { title: 'School code already exists' });
      return;
    }
    const { adminEmailAddress, adminPassword, ...details } = body;
    const row = {
      ...details,
      id: randomUUID(),
      isActive: true,
      concurrencyStamp: randomUUID(),
      creationTime: new Date().toISOString(),
    };
    rows.push(row);
    send(200, row);
    return;
  }
  const row = rows.find((item) => item.id === match[1]);
  if (!row) {
    send(404, { title: 'Tenant not found' });
    return;
  }
  if (body.concurrencyStamp !== row.concurrencyStamp) {
    send(409, { title: 'Concurrency conflict' });
    return;
  }
  if (match[2]) {
    row.isActive = body.isActive;
  } else {
    const { concurrencyStamp, name, isActive, ...details } = body;
    Object.assign(row, details);
  }
  row.concurrencyStamp = randomUUID();
  send(200, row);
});
server.listen(4399, '127.0.0.1', () =>
  process.stdout.write('Host tenant synthetic API listening on http://127.0.0.1:4399\n')
);
