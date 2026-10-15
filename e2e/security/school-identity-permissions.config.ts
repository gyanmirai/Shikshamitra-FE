/* eslint-disable import/no-extraneous-dependencies -- Playwright configuration is test-only. */
import { defineConfig } from '@playwright/test';

import inheritanceConfig from './permission-inheritance.config';

export default defineConfig({
  ...inheritanceConfig,
  testMatch: ['school-identity-permissions.spec.ts'],
  outputDir: '../../.artifacts/school-identity-permissions/playwright',
  use: { ...inheritanceConfig.use, baseURL: 'http://127.0.0.1:4187' },
  webServer: {
    command: 'node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js --config e2e/fixtures/permission-inheritance/school-identity.config.mts',
    cwd: '../..', url: 'http://127.0.0.1:4187', reuseExistingServer: false,
  },
});
