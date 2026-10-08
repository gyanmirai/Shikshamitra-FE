import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('../../', import.meta.url));

export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  workers: 1,
  timeout: 180000,
  expect: { timeout: 60000 },
  outputDir: '../../.artifacts/host-tenant-browser',
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4398',
    viewport: { width: 1440, height: 900 },
    browserName: 'chromium',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      cwd: repo,
      command: 'node e2e/fixtures/host-tenants/server.mjs',
      url: 'http://127.0.0.1:4399',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      cwd: repo,
      command:
        'node node_modules/next/dist/bin/next dev --webpack --hostname 127.0.0.1 --port 4398',
      url: 'http://127.0.0.1:4398/login',
      reuseExistingServer: !process.env.CI,
      timeout: 300000,
      env: {
        NEXT_PUBLIC_API_URL: 'http://127.0.0.1:4399',
        NEXT_PUBLIC_CLIENT_ID: 'local-fixture',
        NEXT_PUBLIC_CLIENT_SECRET: 'synthetic-client-secret',
        NEXT_PUBLIC_SCOPE: 'openid profile ShikshaMitra',
        AUTH_SECRET: 'local-only-synthetic-host-tenant-browser-fixture-key',
        AUTH_URL: 'http://127.0.0.1:4398',
        NEXTAUTH_URL: 'http://127.0.0.1:4398',
        NEXT_DIST_DIR: '.artifacts/host-tenant-next',
      },
    },
  ],
});
