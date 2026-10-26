import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'onboarding-salary.guest.spec.ts',
  workers: 1,
  timeout: 90000,
  outputDir: '../../.artifacts/onboarding-salary-browser',
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3955',
    headless: false,
    launchOptions: process.env.E2E_BROWSER_EXECUTABLE_PATH
      ? { executablePath: process.env.E2E_BROWSER_EXECUTABLE_PATH, args: ['--disable-vivaldi'] }
      : undefined,
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
  },
  webServer: {
    cwd: process.cwd(),
    command:
      'node node_modules/vite/bin/vite.js --config e2e/hr/onboarding-salary-harness/vite.config.mjs',
    url: 'http://127.0.0.1:3955',
    reuseExistingServer: true,
  },
});
