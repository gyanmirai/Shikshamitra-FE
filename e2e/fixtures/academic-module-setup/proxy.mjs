import http from 'node:http';
import { createAcademicFixture } from './state.mjs';
import { handleManagers } from './managers.mjs';
import { handleDashboard } from './dashboard.mjs';
import { permissionNames, paged, year, board, medium, ids } from './data.mjs';

const upstream = 'http://127.0.0.1:4469';
let fixture = createAcademicFixture();
export const server = http.createServer(async (request, response) => {
  response.setHeader(
    'Access-Control-Allow-Origin',
    request.headers.origin ?? 'http://127.0.0.1:4468'
  );
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Headers', 'authorization,content-type,__tenant');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  const send = (status, value) => {
    response.writeHead(status, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(value));
  };
  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }
  const url = new URL(request.url, upstream);
  let raw = '';
  for await (const chunk of request) raw += chunk;
  const body =
    raw && request.headers['content-type']?.includes('application/json') ? JSON.parse(raw) : {};
  if (url.pathname === '/fixture/health') {
    send(200, { ready: true });
    return;
  }
  if (url.pathname === '/fixture/context') {
    send(200, { year, board, medium, ids });
    return;
  }
  if (url.pathname === '/fixture/reset') {
    fixture = createAcademicFixture(body);
    send(200, fixture.snapshot());
    return;
  }
  if (url.pathname === '/fixture/snapshot') {
    send(200, fixture.snapshot());
    return;
  }
  if (url.pathname === '/fixture/mark-visited') {
    fixture.state.visited = true;
    send(200, {});
    return;
  }
  if (url.pathname === '/fixture/failure') {
    fixture.state.failNext = body.failNext;
    fixture.state.saveDelay = body.saveDelay ?? 0;
    send(200, {});
    return;
  }
  if (url.pathname === '/api/permission-management/permissions') {
    send(200, {
      groups: [{ permissions: permissionNames.map((name) => ({ name, isGranted: true })) }],
    });
    return;
  }
  const token = request.headers.authorization?.split('.')[1];
  const claims = token ? JSON.parse(Buffer.from(token, 'base64url').toString()) : {};
  if (await fixture.handle(url, request.method, body, send)) return;
  if (handleDashboard(url, request.method, send, fixture)) return;
  if (await handleManagers(url, request.method, body, send, fixture, claims)) return;
  if (url.pathname === '/api/academic/audit-events') {
    send(200, paged([]));
    return;
  }
  if (
    url.pathname.startsWith('/api/') &&
    !['/api/host/session-context', '/api/abp/application-configuration'].includes(url.pathname)
  ) {
    fixture.state.requests.push({ method: request.method, path: url.pathname, fallback: true });
    if (request.method !== 'GET') {
      send(501, { title: 'Synthetic endpoint not implemented' });
      return;
    }
    send(200, paged([]));
    return;
  }
  const headers = { ...request.headers };
  delete headers.host;
  delete headers['content-length'];
  const form = new URLSearchParams(raw);
  const secondUser = url.pathname === '/connect/token' && form.get('username') === 'admin2';
  if (secondUser) {
    form.set('username', 'admin');
    raw = form.toString();
  }
  const upstreamResponse = await fetch(`${upstream}${url.pathname}${url.search}`, {
    method: request.method,
    headers,
    ...(request.method !== 'GET' && request.method !== 'HEAD' ? { body: raw } : {}),
  });
  const result = await upstreamResponse.json();
  if (secondUser && result.access_token) {
    const parts = result.access_token.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    payload.sub = 'synthetic-second-academic-user';
    parts[1] = Buffer.from(JSON.stringify(payload)).toString('base64url');
    result.access_token = parts.join('.');
  }
  send(upstreamResponse.status, result);
});

server.listen(4467, '127.0.0.1', () =>
  process.stdout.write('Academic synthetic proxy listening on4467\n')
);
