/* eslint-disable import/no-extraneous-dependencies -- Playwright configuration is test-only. */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'shared-permission-feedback.spec.ts',
  workers: 1,
  timeout: 45000,
  expect: { timeout: 10000 },
  outputDir: '../../.artifacts/shared-permission-feedback/playwright',
  reporter: [
    ['list'],
    ['json', { outputFile: '../../.artifacts/shared-permission-feedback/results.json' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:4198',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command:
      'node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js --config e2e/fixtures/shared-permission-feedback/vite.config.mts',
    cwd: '../..',
    url: 'http://127.0.0.1:4198',
    reuseExistingServer: true,
  },
});
