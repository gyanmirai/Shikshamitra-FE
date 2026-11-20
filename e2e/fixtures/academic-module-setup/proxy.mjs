import http from 'node:http';
import { createECDH, randomUUID } from 'node:crypto';
import { createAcademicFixture } from './state.mjs';
import { handleManagers } from './managers.mjs';
import { handleDashboard } from './dashboard.mjs';
import { insightsPermissions } from './insights.mjs';
import { createNotificationRulesFixture } from './notification-rules.mjs';
import { createNotificationDeliveriesFixture } from './notification-deliveries.mjs';
import { createManualNotificationFixture, manualNotificationPermissions } from './notification-manual.mjs';
import { paged, year, board, medium, ids } from './data.mjs';

const upstream = 'http://127.0.0.1:4469';
const pushPath = '/api/communication/notifications/me/push';
const preferencePath = '/api/communication/notifications/me/preferences';
const preferenceChild = { studentId: 'b0000000-0000-4000-8000-000000000001', displayName: 'Sample Learner' };
const fixtureVapid = createECDH('prime256v1').generateKeys().toString('base64url');
let fixture = createAcademicFixture();
let notificationRules = null;
let notificationDeliveries = createNotificationDeliveriesFixture();
let manualNotification = null;
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
    notificationRules = body.notificationRules === true ? createNotificationRulesFixture() : null;
    notificationDeliveries = createNotificationDeliveriesFixture(
      body.notificationDeliveries === true, body.notificationRetry, body.notificationApproval,
    );
    manualNotification = body.manualNotification === true ? createManualNotificationFixture() : null;
    send(200, fixture.snapshot());
    return;
  }
  if (url.pathname === '/fixture/snapshot') {
    send(200, { ...fixture.snapshot(), notificationRuleWrites: notificationRules?.writes ?? [], manualNotificationWrites: manualNotification?.writes });
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
      groups: [
        {
          permissions: [...insightsPermissions(fixture.state.insights), ...(notificationRules ? ['Academics.Notification.Add'] : []),
            ...(manualNotification ? manualNotificationPermissions : [])].map((name) => ({
            name,
            isGranted: true,
          })),
        },
      ],
    });
    return;
  }
  const token = request.headers.authorization?.split('.')[1];
  const claims = token ? JSON.parse(Buffer.from(token, 'base64url').toString()) : {};
  if (url.pathname === preferencePath || url.pathname === preferencePath + '/options') {
    if (!claims.sub) { send(401, {}); return; }
    const rows = fixture.state.preferenceWrites.filter(({ user }) => user === claims.sub);
    if (url.pathname.endsWith('/options')) {
      send(200, { categories: [{ category: 'Academic.Homework', channels: [0, 2, 3, 4] }], students: [preferenceChild] });
    } else if (request.method === 'GET') {
      send(200, rows.map(({ preferences }) => preferences));
    } else if (request.method === 'PUT') {
      const writes = fixture.state.preferenceWrites;
      const index = writes.findIndex(({ user, preferences }) => user === claims.sub &&
        preferences.category === body.category && preferences.studentId === body.studentId);
      const preferences = { ...body, concurrencyStamp: randomUUID() };
      const row = { user: claims.sub, preferences };
      if (index < 0) writes.push(row);
      else writes[index] = row;
      send(200, preferences);
    } else {
      send(405, {});
    }
    return;
  }
  if (manualNotification?.handle(url, request.method, body, claims.sub, send)) return;
  if (notificationDeliveries(url, request.method, claims.sub, send)) return;
  if (claims.sub && notificationRules?.handle(url, request.method, body, send)) return;
  if (url.pathname.startsWith(pushPath + '/')) {
    if (!claims.sub) { send(401, {}); return; }
    if (url.pathname === pushPath + '/public-key' && request.method === 'GET') {
      send(200, fixture.state.pushEnabled
        ? { isConfigured: true, publicKey: fixtureVapid, vapidKeyVersion: 'fixture-v1' }
        : { isConfigured: false });
      return;
    }
    if (fixture.state.pushEnabled && url.pathname === pushPath + '/subscriptions' && request.method === 'POST') {
      const id = randomUUID();
      fixture.state.pushActions.push({ action: 'register', id, user: claims.sub, version: body.vapidKeyVersion });
      send(200, { id });
      return;
    }
    if (fixture.state.pushEnabled && url.pathname.startsWith(pushPath + '/subscriptions/') && request.method === 'DELETE') {
      fixture.state.pushActions.push({ action: 'disable', id: url.pathname.split('/').at(-1), user: claims.sub });
      response.writeHead(204);
      response.end();
      return;
    }
  }
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
