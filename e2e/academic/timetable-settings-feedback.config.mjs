import base from './academic-module-setup.config.mjs';

export default {
  ...base,
  testMatch: 'timetable-settings-feedback.spec.ts',
  outputDir: '../../.artifacts/timetable-settings-feedback/browser',
};
