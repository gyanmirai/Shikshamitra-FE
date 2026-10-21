/* eslint-disable import/no-extraneous-dependencies -- Playwright configuration is test-only. */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.', testMatch: 'permission-inheritance*.spec.ts', fullyParallel: false, workers: 1,
  timeout: 120000, expect: { timeout: 15000 },
  outputDir: '../../.artifacts/permission-inheritance/playwright',
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:4186', screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
    { name: 'tablet', use: { browserName: 'chromium', viewport: { width: 768, height: 1024 } } },
    { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 } } },
  ],
  webServer: { command: 'node node_modules/vite/bin/vite.js --config e2e/fixtures/permission-inheritance/vite.config.mts',
    cwd: '../..', url: 'http://127.0.0.1:4186', reuseExistingServer: true },
});
