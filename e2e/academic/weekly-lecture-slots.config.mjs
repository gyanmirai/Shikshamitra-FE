import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'weekly-lecture-slots.spec.ts',
  workers: 1,
  timeout: 120000,
  expect: { timeout: 30000 },
  reporter: [['list']],
  outputDir: '../../.artifacts/timetable-weekly-slots/tests',
  use: {
    baseURL: 'http://127.0.0.1:4478',
    browserName: 'chromium',
    viewport: { width: 1440, height: 1000 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node e2e/fixtures/timetable-weekly-slots/serve.mjs',
    cwd: '../..',
    url: 'http://127.0.0.1:4478/login',
    reuseExistingServer: true,
    timeout: 600000,
  },
});
