import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('../../../', import.meta.url));
const children = [];
function start(args, env) {
  const child = spawn(process.execPath, args, {
    cwd,
    windowsHide: true,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  children.push(child);
  child.on('exit', (code) => {
    if (code) process.exitCode = code;
  });
  return child;
}
start(['e2e/fixtures/host-tenants/server.mjs'], {
  HOST_TENANT_API_PORT: '4469',
  HOST_TENANT_CLIENT_ORIGIN: 'http://127.0.0.1:4468',
});
start(['--watch', 'e2e/fixtures/academic-module-setup/proxy.mjs'], {});
let ready = false;
for (let attempt = 0; attempt < 50 && !ready; attempt += 1) {
  try {
    ready = (
      await fetch('http://127.0.0.1:4469/fixture/reset', {
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
    '--turbopack',
    '--hostname',
    '127.0.0.1',
    '--port',
    '4468',
  ],
  {
    NEXT_PUBLIC_API_URL: 'http://127.0.0.1:4467',
    NEXT_PUBLIC_CLIENT_ID: 'local-fixture',
    NEXT_PUBLIC_CLIENT_SECRET: 'synthetic-client-secret',
    NEXT_PUBLIC_SCOPE: 'openid profile ShikshaMitra',
    AUTH_SECRET: 'synthetic-academic-module-setup-session-key',
    AUTH_URL: 'http://127.0.0.1:4468',
    NEXTAUTH_URL: 'http://127.0.0.1:4468',
    NEXT_DIST_DIR: '.artifacts/academic-module-setup/next',
  }
);
const close = () => {
  children.forEach((child) => child.kill());
};
process.on('SIGINT', close);
process.on('SIGTERM', close);
process.on('exit', close);
