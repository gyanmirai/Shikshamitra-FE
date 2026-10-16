/* eslint-disable import/no-extraneous-dependencies -- Playwright configuration is test-only. */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'staff-policy-access.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 90000,
  expect: { timeout: 15000 },
  outputDir: '../../.artifacts/staff-policy-access/playwright',
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4197',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 } } },
    {
      name: 'tablet-dark',
      use: { browserName: 'chromium', viewport: { width: 768, height: 1024 }, colorScheme: 'dark' },
    },
  ],
  webServer: {
    command:
      'node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js --config e2e/fixtures/staff-policy-access/vite.config.mts',
    cwd: '../..',
    url: 'http://127.0.0.1:4197',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
