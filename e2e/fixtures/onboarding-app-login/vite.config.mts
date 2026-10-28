import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const fixture = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));
const mocks = `${fixture}mock-api.ts`.replaceAll('\\', '/');

export default defineConfig({
  root: fixture,
  cacheDir: `${repo}/node_modules/.vite/onboarding-app-login`,
  publicDir: `${repo}/public`,
  resolve: {
    alias: [
      { find: 'next/navigation', replacement: `${fixture}navigation.tsx` },
      { find: 'next/link', replacement: `${fixture}navigation.tsx` },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: { 'process.env': JSON.stringify({ BUILD_STATIC_EXPORT: 'false' }) },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4237, strictPort: true, fs: { allow: [repo] } },
  plugins: [
    {
      name: 'synthetic-app-login-api',
      enforce: 'pre',
      transform(code, id) {
        if (!id.replaceAll('\\', '/').includes('/src/screens/student/onboarding/student-setup/'))
          return undefined;
        return code.replaceAll(
          "'src/redux/student/onboarding/student-onboarding-api'",
          `'${mocks}'`
        );
      },
    },
  ],
});
