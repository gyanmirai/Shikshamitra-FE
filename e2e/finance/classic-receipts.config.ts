// Playwright is development-only test tooling.
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.', testMatch: 'classic-receipts.spec.ts', fullyParallel: false,
  workers: 1, timeout: 90_000, expect: { timeout: 20_000 },
  use: { browserName: 'chromium', channel: 'msedge', headless: true, trace: 'retain-on-failure' },
  reporter: 'list',
});
