/* eslint-disable import/no-extraneous-dependencies -- Playwright configuration is test-only. */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.', testMatch: 'academic-permission-navigation.spec.ts', fullyParallel: false, workers: 1,
  timeout: 60000, expect: { timeout: 10000 },
  outputDir: '../../.artifacts/academic-permission-navigation/playwright',
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:4296', screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
    { name: 'tablet', use: { browserName: 'chromium', viewport: { width: 768, height: 1024 } } },
    { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: 'node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js --config e2e/fixtures/academic-permission-navigation/vite.config.mts',
    cwd: '../..', url: 'http://127.0.0.1:4296', reuseExistingServer: true,
  },
});
