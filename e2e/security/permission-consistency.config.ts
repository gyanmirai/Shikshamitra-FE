// This standalone test runner imports a development-only dependency.
// eslint-disable-next-line import/no-extraneous-dependencies
import { devices, defineConfig } from '@playwright/test';

const baseURL = process.env.SECURITY_BROWSER_URL;
const apiURL = process.env.SECURITY_API_URL;
if (process.env.SECURITY_LOCAL_WRITES !== '1' || !baseURL || !apiURL ||
  [baseURL, apiURL].some((value) => !['localhost', '127.0.0.1', '[::1]'].includes(new URL(value).hostname))) {
  throw new Error('Security browser writes require explicitly enabled disposable loopback UI and API URLs.');
}

export default defineConfig({
  testDir: '.', testMatch: 'permission-consistency.spec.ts', fullyParallel: false,
  workers: 1, retries: 0, timeout: 120_000, expect: { timeout: 15_000 },
  outputDir: '../../.artifacts/security-browser/results',
  reporter: [['list'], ['json', { outputFile: '.artifacts/security-browser/results.json' }]],
  use: { baseURL, actionTimeout: 15_000, navigationTimeout: 15_000, screenshot: 'only-on-failure', trace: 'off', video: 'off' },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox', use: devices['Desktop Firefox'] },
    { name: 'webkit', use: devices['Desktop Safari'] },
    { name: 'mobile-chrome', use: devices['Pixel 7'] },
    { name: 'mobile-safari', use: devices['iPhone 15'] },
  ],
});
