import path from 'node:path';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: [
    'payroll-policy-drawer.spec.ts',
    'payroll-settings-layout.spec.ts',
    'hr-policy-drawers.spec.ts',
  ],
  timeout: 30000,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:4218', browserName: 'chromium', headless: true },
  reporter: [['list']],
  outputDir: '../../test-results-payroll-policy-drawer',
  webServer: {
    cwd: path.resolve(__dirname, '../..'),
    command:
      'node node_modules/vite/bin/vite.js --config e2e/fixtures/hr-policy-safety/vite.config.mts --port 4218',
    url: 'http://127.0.0.1:4218',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
