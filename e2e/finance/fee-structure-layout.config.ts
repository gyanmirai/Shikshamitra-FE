/* eslint-disable import/no-extraneous-dependencies -- Playwright is a test dependency. */
import path from 'node:path';
import { defineConfig } from '@playwright/test';

const repo = path.resolve(__dirname, '../..');

export default defineConfig({
  testDir: '.',
  testMatch: 'fee-structure-layout.spec.ts',
  workers: 1,
  retries: 0,
  timeout: 60000,
  expect: { timeout: 10000 },
  outputDir: path.join(repo, '.artifacts/fee-structure-layout/results'),
  reporter: [
    ['list'],
    ['html', { outputFolder: '.artifacts/fee-structure-layout/report', open: 'never' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:4178',
    browserName: 'chromium',
    channel: 'msedge',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command:
      'node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js --config e2e/fixtures/fee-structure/vite.config.mts',
    cwd: repo,
    url: 'http://127.0.0.1:4178',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
