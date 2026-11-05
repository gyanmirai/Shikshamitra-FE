import { defineConfig } from '@playwright/test';
import path from 'node:path';

export default defineConfig({
  testDir: '.',
  testMatch: 'manual-attendance-6597.spec.ts',
  fullyParallel: false,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:5197', browserName: 'chromium', screenshot: 'only-on-failure' },
  outputDir: '../../.artifacts/manual-attendance/results',
  webServer: {
    cwd: path.resolve(__dirname, '../..'),
    command:
      'node node_modules/vite/bin/vite.js --config e2e/fixtures/manual-attendance/vite.config.mts',
    url: 'http://127.0.0.1:5197',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
