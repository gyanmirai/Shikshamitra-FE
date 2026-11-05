/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'esic-archive.spec.ts',
  workers: 1,
  reporter: [['list']],
  outputDir: '../../.artifacts/esic-archive/playwright',
  use: { baseURL: 'http://127.0.0.1:4205', trace: 'retain-on-failure' },
  webServer: {
    command:
      'node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js --config e2e/fixtures/esic-archive/vite.config.mts',
    cwd: '../..',
    url: 'http://127.0.0.1:4205',
    reuseExistingServer: true,
  },
});
