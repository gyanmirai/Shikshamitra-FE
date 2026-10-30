import { defineConfig } from '@playwright/test';

process.env.ACADEMIC_SETUP_FIXTURE_API = 'http://127.0.0.1:4487';

export default defineConfig({
  testDir: '.',
  testMatch: 'elective-late-admission.spec.ts',
  workers: 1,
  timeout: 120000,
  expect: { timeout: 30000 },
  outputDir: '../../.artifacts/elective-late-admission/browser',
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4488',
    browserName: 'chromium',
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node e2e/fixtures/elective-late-admission/serve.mjs',
    cwd: '../..',
    url: 'http://127.0.0.1:4488/login',
    reuseExistingServer: true,
    timeout: 600000,
  },
});
