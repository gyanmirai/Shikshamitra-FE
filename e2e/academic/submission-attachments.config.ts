import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'submission-attachments.spec.ts',
  workers: 1,
  timeout: 90000,
  expect: { timeout: 20000 },
  outputDir: '../../.artifacts/submission-attachments/playwright',
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4341',
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command:
      'node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js --config e2e/fixtures/submission-attachments/vite.config.mts',
    cwd: '../..',
    url: 'http://127.0.0.1:4341',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
