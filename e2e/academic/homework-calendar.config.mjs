import { defineConfig } from '@playwright/test';

process.env.ACADEMIC_SETUP_FIXTURE_API = 'http://127.0.0.1:4497';
export default defineConfig({
  testDir: '.',
  testMatch: 'homework-calendar.spec.ts',
  workers: 1,
  timeout: 120000,
  expect: { timeout: 30000 },
  outputDir: '../../.artifacts/homework-calendar/browser',
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4498',
    browserName: 'chromium',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node e2e/fixtures/homework-calendar/serve.mjs',
    cwd: '../..',
    url: 'http://127.0.0.1:4498/login',
    reuseExistingServer: true,
    timeout: 600000,
  },
});
