import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    {
      name: 'test-direct-mui-icons',
      enforce: 'pre',
      transform(code, id) {
        if (!/[\\/]src[\\/]/.test(id)) return undefined;
        // Keep the real icons while avoiding the complete icon catalogue during test collection.
        const transformed = code.replace(
          /import\s*\{([^}]+)\}\s*from\s*['"]@mui\/icons-material['"];?/g,
          (statement, names: string) => {
            const imports = names
              .split(',')
              .map((name) => name.trim())
              .filter(Boolean);
            const matches = imports.map((name) => /^(\w+)(?:\s+as\s+(\w+))?$/.exec(name));
            if (matches.some((match) => !match)) return statement;
            return matches
              .map(
                (match) =>
                  `import ${match![2] ?? match![1]} from '@mui/icons-material/${match![1]}';`
              )
              .join('\n');
          }
        );
        return transformed === code ? undefined : { code: transformed, map: null };
      },
    },
  ],
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    env: {
      // Required by src/config-global.ts which calls JSON.parse on this env var.
      // Without it the template-literal produces "undefined" and JSON.parse throws.
      BUILD_STATIC_EXPORT: 'false',
    },
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
});
