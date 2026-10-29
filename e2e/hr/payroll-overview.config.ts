/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'payroll-overview.spec.ts',
  workers: 1,
  timeout: 60000,
  expect: { timeout: 15000 },
  outputDir: '../../.artifacts/payroll-overview/browser',
  use: { baseURL: 'http://127.0.0.1:4596', viewport: { width: 1440, height: 900 } },
  webServer: {
    command:
      'node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js --configLoader runner --config e2e/fixtures/payroll-overview/vite.config.mts',
    cwd: '../..',
    url: 'http://127.0.0.1:4596',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
