import base from './academic-module-setup.config.mjs';

export default {
  ...base,
  testMatch: 'academic-notification-rules.spec.ts',
  outputDir: '../../.artifacts/academic-notification-rules/browser',
};
