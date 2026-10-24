/* eslint-disable import/no-extraneous-dependencies -- Playwright is a test dependency. */
import path from 'node:path';
import { defineConfig } from '@playwright/test';

const repo = path.resolve(__dirname, '../..');

export default defineConfig({
  testDir: '.',
  testMatch: 'configuration-section-scroll.spec.ts',
  workers: 1,
  retries: 0,
  timeout: 60000,
  expect: { timeout: 10000 },
  outputDir: path.join(repo, '.artifacts/configuration-section-scroll/results'),
  reporter: [
    ['list'],
    ['html', { outputFolder: '.artifacts/configuration-section-scroll/report', open: 'never' }],
  ],
  use: {
    browserName: 'chromium',
    channel: 'msedge',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: ['proration-policy', 'payment-term-template'].map((fixture, index) => ({
    command: `node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js --config e2e/fixtures/${fixture}/vite.config.mts`,
    cwd: repo,
    url: `http://127.0.0.1:${index === 0 ? 4186 : 4185}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  })),
});
