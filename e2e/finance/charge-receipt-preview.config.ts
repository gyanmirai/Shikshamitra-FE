import path from 'node:path';
import { defineConfig } from '@playwright/test';

import base from './fee-collection-ui.config';

const artifacts = path.resolve(__dirname, '../../.artifacts/charge-receipt-preview');

export default defineConfig({
  ...base,
  testMatch: 'charge-receipt-preview.spec.ts',
  timeout: 120000,
  outputDir: path.join(artifacts, 'results'),
  reporter: [
    ['list'],
    ['json', { outputFile: path.join(artifacts, 'results.json') }],
    ['html', { outputFolder: path.join(artifacts, 'report'), open: 'never' }],
  ],
});
