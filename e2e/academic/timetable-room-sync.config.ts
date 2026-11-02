import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'timetable-room-sync.spec.ts',
  workers: 1,
  timeout: 60000,
  expect: { timeout: 15000 },
  outputDir: '../../.artifacts/timetable-room-sync/playwright',
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4338',
    viewport: { width: 1440, height: 1000 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command:
      'node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js --config e2e/fixtures/timetable-room-sync/vite.config.mts',
    cwd: '../..',
    url: 'http://127.0.0.1:4338',
    reuseExistingServer: true,
  },
});
