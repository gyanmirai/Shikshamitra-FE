/* eslint-disable import/no-extraneous-dependencies -- Playwright configuration is test-only. */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'visibility-prerequisite.spec.ts',
  workers: 1,
  preserveOutput: 'always',
  timeout: 120000,
  expect: { timeout: 15000 },
  outputDir: '../../.artifacts/security-prerequisites/playwright',
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4197',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command:
      'node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js --config e2e/fixtures/permission-bulk/visibility-prerequisite.config.mts',
    cwd: '../..',
    url: 'http://127.0.0.1:4197',
    reuseExistingServer: true,
  },
});
