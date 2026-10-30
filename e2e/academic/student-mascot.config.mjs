import base from './academic-module-setup.config.mjs';

export default {
  ...base,
  testMatch: 'student-mascot.spec.ts',
  outputDir: '../../.artifacts/student-mascot/browser',
};
