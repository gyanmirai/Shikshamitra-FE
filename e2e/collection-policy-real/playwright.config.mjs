import { defineConfig } from '@playwright/test';

const artifacts = process.env.COLLECTION_LATEFEE_ARTIFACTS || '../../.artifacts/collection-latefee';

export default defineConfig({
  testDir: '.',
  testMatch: 'common-latefee.spec.ts',
  timeout: 300000,
  expect: { timeout: 30000 },
  workers: 1,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: `${artifacts}/playwright-results.json` }]],
  outputDir: `${artifacts}/playwright`,
  use: {
    baseURL: 'http://127.0.0.1:4196',
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    navigationTimeout: 120000,
  },
});
