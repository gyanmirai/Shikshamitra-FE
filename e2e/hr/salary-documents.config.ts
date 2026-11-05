/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'salary-documents.spec.ts',
  workers: 1,
  timeout: 60000,
  expect: { timeout: 15000 },
  outputDir: '../../.artifacts/salary-documents/browser',
  use: { baseURL: 'http://127.0.0.1:4614' },
  webServer: {
    command:
      'node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js --configLoader runner --config e2e/fixtures/salary-documents/vite.config.mts',
    cwd: '../..',
    url: 'http://127.0.0.1:4614',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
