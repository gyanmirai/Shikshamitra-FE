/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from '@playwright/test';

import setup from './hr-setup.config';

export default defineConfig({
  ...setup,
  testMatch: 'pf-page.spec.ts',
  outputDir: '../../.artifacts/pf-page/playwright',
});
