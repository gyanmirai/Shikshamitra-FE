import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(new URL('../../../', import.meta.url));
export default defineConfig({
  resolve: { alias: { src: repo + '/src' } },
  test: {
    root: repo,
    include: [
      'src/screens/finance/accounts/Registers/academicMonths.test.ts',
      'src/screens/finance/accounts/Registers/manualEntrySchema.test.ts',
    ],
    environment: 'node',
    setupFiles: [],
    pool: 'forks',
    maxWorkers: 1,
  },
});
