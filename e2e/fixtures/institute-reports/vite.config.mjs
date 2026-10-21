import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { reportFixtureApi } from './mock-api.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, '../../..');
export default defineConfig({
  root, cacheDir: path.join(repo, 'node_modules/.vite/institute-reports'), publicDir: path.join(repo, 'public'),
  plugins: [reportFixtureApi()],
  resolve: { alias: [
    { find: 'next/navigation', replacement: path.join(repo, 'e2e/fixtures/school-identity/navigation.tsx') },
    { find: 'next/link', replacement: path.join(repo, 'e2e/fixtures/school-identity/navigation.tsx') },
    { find: 'next-auth/react', replacement: path.join(repo, 'e2e/fixtures/school-documents/auth.ts') },
    { find: 'src', replacement: path.join(repo, 'src') },
  ] },
  define: { 'process.env': JSON.stringify({ NEXT_PUBLIC_API_URL: '', BUILD_STATIC_EXPORT: 'false' }) },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4331, strictPort: true, fs: { allow: [repo] } },
});
