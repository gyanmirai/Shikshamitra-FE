/* eslint-disable import/no-extraneous-dependencies */
import path from 'node:path';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'hr-table-filter.spec.ts',
  timeout: 30000,
  expect: { timeout: 4000 },
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:3018', browserName: 'chromium', headless: true },
  reporter: [['list']],
  outputDir: '../../test-results-hr-table-filters',
  webServer: {
    cwd: path.resolve(__dirname, '../..'),
    command:
      'node node_modules/vite/bin/vite.js --config tests/browser/hr-table-filter-fixture/vite.config.mjs --host 127.0.0.1 --port 3018 --strictPort',
    url: 'http://127.0.0.1:3018',
    reuseExistingServer: false,
    timeout: 30000,
  },
});
