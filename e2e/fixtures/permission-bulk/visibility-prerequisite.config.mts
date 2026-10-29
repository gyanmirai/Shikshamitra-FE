import { mergeConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import base from './vite.config.mts';

export default mergeConfig(base, {
  server: { port: 4197 },
  cacheDir: fileURLToPath(new URL('../../../node_modules/.vite/security-prerequisites', import.meta.url)),
  define: { 'process.env': JSON.stringify({
    NEXT_PUBLIC_API_URL: 'http://127.0.0.1:4197', NEXT_PUBLIC_APP_URL: '', BUILD_STATIC_EXPORT: 'false',
  }) },
});
