import base from './academic-module-setup.config.mjs';

export default {
  ...base,
  testMatch: ['academic-insights.spec.ts', 'academic-calendar-preview.spec.ts', 'academic-module-setup.spec.ts'],
  outputDir: '../../.artifacts/academic-insights/browser',
  reporter: [
    ['list'],
    ['json', { outputFile: '../../.artifacts/academic-insights/playwright-results.json' }],
  ],
};
