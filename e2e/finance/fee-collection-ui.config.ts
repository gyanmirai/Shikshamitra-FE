/* eslint-disable import/no-extraneous-dependencies -- Playwright is a test-only dependency. */
import path from 'node:path';
import { defineConfig } from '@playwright/test';

const repo = path.resolve(__dirname, '../..');
const artifacts = path.join(repo, '.artifacts/fee-collection-ui/e2e-20261018');

export default defineConfig({
  testDir: '.',
  testMatch: 'fee-collection-ui.spec.ts',
  workers: 1,
  fullyParallel: false,
  retries: 0,
  timeout: 60000,
  expect: { timeout: 10000 },
  outputDir: path.join(artifacts, 'results'),
  reporter: [
    ['list'],
    ['json', { outputFile: path.join(artifacts, 'results.json') }],
    ['html', { outputFolder: path.join(artifacts, 'report'), open: 'never' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:5177',
    browserName: 'chromium',
    channel: 'msedge',
    colorScheme: 'light',
    viewport: { width: 1440, height: 900 },
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command:
      'node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js preview --config e2e/fixtures/fee-collection-late-fees/vite.config.mts --outDir ../../../.artifacts/fee-collection-late-fees-browser --host 127.0.0.1 --port 5177 --strictPort',
    cwd: repo,
    url: 'http://127.0.0.1:5177',
    reuseExistingServer: true,
    timeout: 30000,
  },
});
