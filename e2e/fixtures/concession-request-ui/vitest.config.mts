import path from 'node:path';
import { defineConfig } from 'vitest/config';
export default defineConfig({
  resolve: { alias: { src: path.resolve(import.meta.dirname, '../../../src') } },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [path.resolve(import.meta.dirname, 'setup.ts')],
    env: { BUILD_STATIC_EXPORT: 'false' },
    maxWorkers: 1,
    pool: 'threads',
    testTimeout: 30000,
    include: [
      'src/screens/finance/Concession/Components/ConcessionSteps/ValueEntryStep.test.tsx',
      'src/screens/finance/ConcessionAdmin/ReadOnlyConcessionApprovalView.test.tsx',
    ],
  },
});
