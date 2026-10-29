/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 60000,
  expect: { timeout: 15000 },
  testDir: './security',
  testMatch: 'user-directory.spec.ts',
  workers: 1,
  outputDir: '../.artifacts/user-directory/browser',
  use: { baseURL: 'http://127.0.0.1:4488', viewport: { width: 1440, height: 900 } },
  webServer: {
    command:
      'node ../node_modules/vite/bin/vite.js --config fixtures/user-directory/vite.config.mts',
    url: 'http://127.0.0.1:4488',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
