/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'pf-coverage.spec.ts',
  workers: 1,
  reporter: [['list']],
  outputDir: '../../.artifacts/pf-coverage/playwright',
  use: { baseURL: 'http://127.0.0.1:4198', viewport: { width: 1440, height: 900 } },
  webServer: {
    command:
      'node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js --config e2e/fixtures/pf-coverage/vite.config.mts',
    cwd: '../..',
    url: 'http://127.0.0.1:4198',
    reuseExistingServer: true,
  },
});
