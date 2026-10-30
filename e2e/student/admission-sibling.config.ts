import path from 'node:path';
// eslint-disable-next-line import/no-extraneous-dependencies -- Browser regression dependency only.
import { defineConfig } from '@playwright/test';

const repo = path.resolve(__dirname, '../..');
export default defineConfig({
  testDir: '.',
  testMatch: 'admission-sibling.spec.ts',
  workers: 1,
  retries: 0,
  timeout: 60000,
  expect: { timeout: 10000 },
  outputDir: path.join(repo, '.artifacts/add-sibling-20261029/browser-results'),
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4227',
    browserName: 'chromium',
    channel: 'msedge',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command:
      'node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js --config e2e/fixtures/admission-sibling/vite.config.mts',
    cwd: repo,
    url: 'http://127.0.0.1:4227',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
