import { defineConfig } from '@playwright/test';

import setup from './academic-module-setup.config.mjs';

export default defineConfig({
  ...setup,
  testMatch: 'lecture-slot-ui.spec.ts',
  outputDir: '../../.artifacts/lecture-slot-ui/browser',
});
