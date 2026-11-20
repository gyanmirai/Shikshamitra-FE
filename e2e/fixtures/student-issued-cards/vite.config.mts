import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../', import.meta.url));

export default defineConfig({
  root: here,
  cacheDir: `${repo}/node_modules/.vite/student-issued-cards`,
  publicDir: `${repo}/public`,
  resolve: {
    alias: [
      { find: 'next/navigation', replacement: `${here}/navigation.tsx` },
      { find: 'next/link', replacement: `${here}/navigation.tsx` },
      { find: 'next-auth/react', replacement: `${here}/auth.tsx` },
      { find: /^src\/redux\/service$/, replacement: `${here}/service.ts` },
      { find: /^src\/layouts\/config-nav-dashboard$/, replacement: `${here}/navigation-data.ts` },
      { find: 'src', replacement: `${repo}/src` },
    ],
  },
  define: { 'process.env': '{"BUILD_STATIC_EXPORT":"false","NEXT_PUBLIC_API_URL":"/blocked"}' },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4191, strictPort: true, fs: { allow: [repo] } },
});
