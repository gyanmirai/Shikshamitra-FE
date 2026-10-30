import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('../../../', import.meta.url));
const children = [];
function start(args, env = {}) {
  const child = spawn(process.execPath, args, {
    cwd,
    windowsHide: true,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  children.push(child);
}
start(['e2e/fixtures/host-tenants/server.mjs'], {
  HOST_TENANT_API_PORT: '4479',
  HOST_TENANT_CLIENT_ORIGIN: 'http://127.0.0.1:4478',
});
start(['e2e/fixtures/timetable-weekly-slots/server.mjs']);
start(
  [
    'node_modules/next/dist/bin/next',
    'dev',
    '--webpack',
    '--hostname',
    '127.0.0.1',
    '--port',
    '4478',
  ],
  {
    NEXT_PUBLIC_API_URL: 'http://127.0.0.1:4477',
    NEXT_PUBLIC_CLIENT_ID: 'local-fixture',
    NEXT_PUBLIC_CLIENT_SECRET: 'synthetic-client-secret',
    NEXT_PUBLIC_SCOPE: 'openid profile ShikshaMitra',
    AUTH_SECRET: 'synthetic-weekly-lecture-regression-session-key',
    AUTH_URL: 'http://127.0.0.1:4478',
    NEXTAUTH_URL: 'http://127.0.0.1:4478',
    NEXT_DIST_DIR: '.artifacts/timetable-weekly-slots/next',
  }
);
const close = () => children.forEach((child) => child.kill());
process.on('SIGINT', close);
process.on('SIGTERM', close);
process.on('exit', close);
