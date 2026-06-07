/* eslint-disable import/no-extraneous-dependencies, no-await-in-loop */
import path from 'node:path';
import { expect, type Page, test as setup } from '@playwright/test';

const authFile = path.join(process.cwd(), 'playwright/.auth/hr-manager.json');

setup.setTimeout(120_000);

const apiBaseUrl = () => {
  const url = process.env.E2E_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error('Set E2E_API_URL or NEXT_PUBLIC_API_URL before running authenticated E2E.');
  }
  return url.replace(/\/$/, '');
};

async function waitForBackend(page: Page) {
  const healthUrl = `${apiBaseUrl()}/api/abp/application-configuration`;
  const started = Date.now();
  let lastError = '';

  while (Date.now() - started < 60_000) {
    try {
      const response = await page.request.get(healthUrl, {
        headers: { __tenant: process.env.E2E_TENANT || 'DDVS' },
        timeout: 5_000,
      });
      if (response.ok()) {
        return;
      }
      lastError = `${response.status()} ${await response.text()}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    await page.waitForTimeout(2_000);
  }

  throw new Error(`Backend API is not ready at ${healthUrl}. Last error: ${lastError}`);
}

async function hasAccessToken(page: Page) {
  return page.evaluate(async () => {
    const response = await fetch('/api/auth/session');
    if (!response.ok) return false;

    const session = await response.json();
    return Boolean(session?.accessToken);
  });
}

async function login(page: Page, email: string, password: string) {
  await waitForBackend(page);
  await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await expect(page.getByLabel('School Code')).toBeVisible({ timeout: 60_000 });
  await page.getByLabel('School Code').fill(process.env.E2E_TENANT || 'DDVS');
  await page.getByLabel('Email / Username').fill(email);
  await page.getByLabel('Password').fill(password);

  const signInButton = page.getByRole('button', { name: /Sign In/i });
  await expect(signInButton).toBeEnabled({ timeout: 30_000 });
  await signInButton.click();

  const tokenReady = await expect
    .poll(() => hasAccessToken(page), { timeout: 20_000 })
    .toBe(true)
    .then(() => true)
    .catch(() => false);

  if (!tokenReady && (await signInButton.isVisible().catch(() => false))) {
    await signInButton.click();
  }

  await expect.poll(async () => hasAccessToken(page), { timeout: 60_000 }).toBe(true);
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 30_000 });
}

setup('authenticate HR manager', async ({ page }) => {
  await login(
    page,
    process.env.E2E_HR_EMAIL || 'hr-manager@ddvs.com',
    process.env.E2E_HR_PASSWORD || 'Temp@123'
  );

  await page.evaluate(() => localStorage.setItem('onboarding_completed', 'true'));
  await page.context().storageState({ path: authFile });
});
