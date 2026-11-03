/* eslint-disable import/no-extraneous-dependencies -- Playwright configuration is test-only. */
import { defineConfig } from '@playwright/test';

import base from './visibility-prerequisite.config';

export default defineConfig({
  ...base,
  testMatch: 'admin-permissions.spec.ts',
  outputDir: '../../.artifacts/admin-permissions/playwright',
});
