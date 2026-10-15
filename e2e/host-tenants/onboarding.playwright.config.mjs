import { defineConfig } from '@playwright/test';
import base from './playwright.config.mjs';

const apiOrigin = 'http://127.0.0.1:4499';
const clientOrigin = 'http://127.0.0.1:4498';
process.env.HOST_TENANT_API_ORIGIN = apiOrigin;

export default defineConfig({
  ...base,
  testMatch: 'initial-setup.spec.ts',
  timeout: 600000,
  outputDir: '../../.artifacts/onboarding-regression-browser',
  use: { ...base.use, baseURL: clientOrigin, actionTimeout: 30000, navigationTimeout: 120000 },
  webServer: [
    {
      ...base.webServer[0],
      url: apiOrigin,
      env: { HOST_TENANT_CLIENT_ORIGIN: clientOrigin, HOST_TENANT_API_PORT: '4499' },
    },
    {
      ...base.webServer[1],
      command: base.webServer[1].command.replace('--webpack', '--turbopack').replace('--port 4398', '--port 4498'),
      url: `${clientOrigin}/login`,
      timeout: 600000,
      env: {
        ...base.webServer[1].env,
        NEXT_PUBLIC_API_URL: apiOrigin,
        AUTH_URL: clientOrigin,
        NEXTAUTH_URL: clientOrigin,
        NEXT_DIST_DIR: '.artifacts/onboarding-next',
      },
    },
  ],
});
