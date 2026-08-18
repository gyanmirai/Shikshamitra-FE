/* eslint-disable import/no-extraneous-dependencies, no-restricted-syntax, no-continue */
import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { devices, defineConfig, type Project } from '@playwright/test';

// Inline loader for .env.local and .env files to populate process.env
(() => {
  for (const fileName of ['.env.local', '.env']) {
    const filePath = path.resolve(process.cwd(), fileName);
    if (!existsSync(filePath)) continue;

    for (const rawLine of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const separator = line.indexOf('=');
      if (separator <= 0) continue;

      const key = line.slice(0, separator).trim();
      let value = line.slice(separator + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      // Only assign if not already defined in shell environment
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
})();

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const browserExecutablePath = process.env.E2E_BROWSER_EXECUTABLE_PATH;
const fullBrowserMatrix = process.env.E2E_FULL_BROWSERS === '1';
const isVivaldiExecutable =
  browserExecutablePath && path.basename(browserExecutablePath).toLowerCase() === 'vivaldi.exe';
const browserLaunchOptions = browserExecutablePath
  ? {
      executablePath: browserExecutablePath,
      ...(isVivaldiExecutable ? { args: ['--disable-vivaldi'] } : {}),
    }
  : undefined;

const authenticatedProjects: Project[] = [
  {
    name: 'chromium',
    dependencies: ['setup'],
    use: {
      ...devices['Desktop Chrome'],
      launchOptions: browserLaunchOptions,
      storageState: 'playwright/.auth/hr-manager.json',
      locale: 'en-IN',
      timezoneId: 'Asia/Kolkata',
    },
    testIgnore: /.*\.guest\.spec\.ts/,
  },
];

if (fullBrowserMatrix) {
  authenticatedProjects.push(
    {
      name: 'firefox',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/hr-manager.json',
        locale: 'en-IN',
        timezoneId: 'Asia/Kolkata',
      },
      testIgnore: /.*\.guest\.spec\.ts/,
    },
    {
      name: 'webkit',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Safari'],
        storageState: 'playwright/.auth/hr-manager.json',
        locale: 'en-IN',
        timezoneId: 'Asia/Kolkata',
      },
      testIgnore: /.*\.guest\.spec\.ts/,
    },
    {
      name: 'mobile-chrome',
      dependencies: ['setup'],
      use: {
        ...devices['Pixel 7'],
        storageState: 'playwright/.auth/hr-manager.json',
        locale: 'en-IN',
        timezoneId: 'Asia/Kolkata',
      },
      testIgnore: /.*\.guest\.spec\.ts/,
    },
    {
      name: 'mobile-safari',
      dependencies: ['setup'],
      use: {
        ...devices['iPhone 15'],
        storageState: 'playwright/.auth/hr-manager.json',
        locale: 'en-IN',
        timezoneId: 'Asia/Kolkata',
      },
      testIgnore: /.*\.guest\.spec\.ts/,
    }
  );
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  timeout: 120_000,
  expect: {
    timeout: 15_000,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
    ['junit', { outputFile: 'test-results/playwright-results.xml' }],
  ],
  use: {
    baseURL,
    actionTimeout: 15_000,
    navigationTimeout: 90_000,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: {
        launchOptions: browserLaunchOptions,
      },
    },
    ...authenticatedProjects,
    {
      name: 'chromium-guest',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: browserLaunchOptions,
        locale: 'en-IN',
        timezoneId: 'Asia/Kolkata',
      },
      testMatch: /.*\.guest\.spec\.ts/,
    },
  ],
});
