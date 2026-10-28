import path from 'node:path';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: [
    'payroll-policy-drawer.spec.ts',
    'hr-policy-drawers.spec.ts',
    'manual-attendance-filters.spec.ts',
    'pf-coverage-settings.spec.ts',
  ],
  timeout: 30000,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:4208', browserName: 'chromium', headless: true },
  reporter: [['list']],
  outputDir: '../../test-results-payroll-policy-drawer',
  webServer: {
    cwd: path.resolve(__dirname, '../..'),
    command:
      'node node_modules/vite/bin/vite.js --config e2e/fixtures/hr-policy-safety/vite.config.mts',
    url: 'http://127.0.0.1:4208',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
