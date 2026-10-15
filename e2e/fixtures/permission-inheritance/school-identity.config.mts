/* eslint-disable import/no-extraneous-dependencies -- Vite configuration is test-only. */
import { defineConfig } from 'vite';

import inheritanceConfig from './vite.config.mts';

export default defineConfig({
  ...inheritanceConfig,
  cacheDir: `${inheritanceConfig.cacheDir}-school-identity`,
  define: {
    'process.env': JSON.stringify({
      NEXT_PUBLIC_API_URL: 'http://127.0.0.1:4187',
      NEXT_PUBLIC_APP_URL: '',
      BUILD_STATIC_EXPORT: 'false',
    }),
  },
  server: { ...inheritanceConfig.server, port: 4187 },
});
