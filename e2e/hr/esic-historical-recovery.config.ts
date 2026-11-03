/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from '@playwright/test';

import base from './salary-components.config';

export default defineConfig({
  ...base,
  testMatch: 'esic-historical-recovery.spec.ts',
  outputDir: '../../.artifacts/esic-historical-browser',
});
