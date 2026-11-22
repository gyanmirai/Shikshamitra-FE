import base from './academic-module-setup.config.mjs';

export default {
  ...base,
  testMatch: 'academic-notification-push.spec.ts',
  outputDir: '../../.artifacts/academic-notification-push/browser',
  reporter: [
    ['list'],
    ['json', { outputFile: '../../.artifacts/academic-notification-push/playwright-results.json' }],
  ],
};
