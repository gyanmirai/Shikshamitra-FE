// Browser validation uses the test-only runner dependency.
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'salary-setup.guest.spec.ts',
  workers: 1,
  timeout: 60000,
  outputDir: '../../.artifacts/salary-setup-browser',
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3956',
    headless: true,
    viewport: { width: 1440, height: 1000 },
    screenshot: 'only-on-failure',
  },
  webServer: {
    cwd: process.cwd(),
    command:
      'node node_modules/vite/bin/vite.js --config e2e/hr/salary-setup-harness/vite.config.mjs',
    url: 'http://127.0.0.1:3956',
    reuseExistingServer: true,
  },
});
