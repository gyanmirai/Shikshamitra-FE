import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('../../../', import.meta.url));
const children = [];
function start(args, env = {}) {
  children.push(
    spawn(process.execPath, args, {
      cwd,
      windowsHide: true,
      stdio: 'inherit',
      env: { ...process.env, ...env },
    })
  );
}
start(['e2e/fixtures/host-tenants/server.mjs'], {
  HOST_TENANT_API_PORT: '4489',
  HOST_TENANT_CLIENT_ORIGIN: 'http://127.0.0.1:4488',
});
start(['e2e/fixtures/elective-late-admission/server.mjs']);
let ready = false;
for (let attempt = 0; attempt < 50 && !ready; attempt += 1) {
  try {
    ready = (
      await fetch('http://127.0.0.1:4489/fixture/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setupCompleted: true }),
      })
    ).ok;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
if (!ready) throw new Error('Synthetic auth upstream did not start.');
start(
  [
    'node_modules/next/dist/bin/next',
    'dev',
    '--webpack',
    '--hostname',
    '127.0.0.1',
    '--port',
    '4488',
  ],
  {
    NEXT_PUBLIC_API_URL: 'http://127.0.0.1:4487',
    NEXT_PUBLIC_CLIENT_ID: 'local-fixture',
    NEXT_PUBLIC_CLIENT_SECRET: 'synthetic-client-secret',
    NEXT_PUBLIC_SCOPE: 'openid profile ShikshaMitra',
    AUTH_SECRET: 'synthetic-elective-admission-regression-key',
    AUTH_URL: 'http://127.0.0.1:4488',
    NEXTAUTH_URL: 'http://127.0.0.1:4488',
    NEXT_DIST_DIR: '.artifacts/elective-late-admission/next',
  }
);
const close = () => children.forEach((child) => child.kill());
process.on('SIGINT', close);
process.on('SIGTERM', close);
process.on('exit', close);
