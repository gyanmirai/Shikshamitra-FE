import path from 'node:path';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'hr-table-workspace.spec.ts',
  timeout: 60000,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:3028', browserName: 'chromium', headless: true },
  reporter: [['list']],
  outputDir: '../../test-results-hr-table-workspace',
  webServer: {
    cwd: path.resolve(__dirname, '../..'),
    command:
      'node node_modules/vite/bin/vite.js --config tests/browser/hr-table-workspace-fixture/vite.config.mjs --host 127.0.0.1 --port 3028 --strictPort',
    url: 'http://127.0.0.1:3028',
    reuseExistingServer: false,
    timeout: 60000,
  },
});
