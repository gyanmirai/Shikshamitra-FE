import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, '../../..');
export default defineConfig({
  plugins: [{ name: 'school-identity-test-preview', configureServer(server) {
    server.middlewares.use('/fixture-preview.pdf', async (_request, response) => {
      try {
        const bytes = await readFile(path.join(repo, '.artifacts/school-identity/preview.pdf'));
        response.setHeader('Content-Type', 'application/pdf'); response.end(bytes);
      } catch { response.statusCode = 503; response.end('Run the PostgreSQL identity test and copy its synthetic preview PDF first.'); }
    });
  } }],
  root, publicDir: path.join(repo, 'public'),
  resolve: { alias: [
    { find: 'next/navigation', replacement: path.join(root, 'navigation.tsx') },
    { find: 'next/link', replacement: path.join(root, 'navigation.tsx') },
    { find: 'next-auth/react', replacement: path.join(root, 'auth.ts') },
    { find: 'src/redux/session-cache', replacement: path.join(root, 'auth.ts') },
    { find: 'src', replacement: path.join(repo, 'src') },
  ] },
  define: { 'process.env': JSON.stringify({ NEXT_PUBLIC_API_URL: '', BUILD_STATIC_EXPORT: 'false' }) },
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 4319, strictPort: true, fs: { allow: [repo] } },
});
