import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'academic-module-setup.spec.ts',
  workers: 1,
  fullyParallel: false,
  timeout: 120000,
  expect: { timeout: 30000 },
  outputDir: '../../.artifacts/academic-module-setup/browser',
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4468',
    browserName: 'chromium',
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node e2e/fixtures/academic-module-setup/serve.mjs',
    cwd: '../..',
    url: 'http://127.0.0.1:4468/login',
    reuseExistingServer: true,
    timeout: 600000,
  },
});
