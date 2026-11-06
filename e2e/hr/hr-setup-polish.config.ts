/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'hr-setup-polish.spec.ts',
  workers: 1,
  timeout: 120000,
  expect: { timeout: 20000 },
  reporter: [['list']],
  outputDir: '../../.artifacts/hr-setup-polish/results',
  use: {
    baseURL: 'http://127.0.0.1:4197',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command:
      'node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js --config e2e/fixtures/hr-setup-polish/vite.config.mts',
    cwd: '../..',
    url: 'http://127.0.0.1:4197',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
