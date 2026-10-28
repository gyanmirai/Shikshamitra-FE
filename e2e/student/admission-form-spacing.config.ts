import path from 'node:path';
import { defineConfig } from '@playwright/test';

const repo = path.resolve(__dirname, '../..');
export default defineConfig({
  testDir: '.',
  testMatch: 'admission-form-spacing.spec.ts',
  workers: 1,
  retries: 0,
  timeout: 30000,
  outputDir: path.join(repo, '.artifacts/admission-form-spacing/results'),
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4221',
    browserName: 'chromium',
    channel: 'msedge',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command:
      'node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js --config e2e/fixtures/admission-form-spacing/vite.config.mts',
    cwd: repo,
    url: 'http://127.0.0.1:4221',
    reuseExistingServer: !process.env.CI,
  },
});
