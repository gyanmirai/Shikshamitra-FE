import fs from 'node:fs';
import path from 'node:path';
import { expect, type Page, test as setup } from '@playwright/test';

const authFile = path.join(process.cwd(), 'playwright/.auth/admin.json');

const tenant = () => process.env.E2E_TENANT || 'DDVS';
const password = () => process.env.E2E_PASSWORD || process.env.E2E_ADMIN_PASSWORD || 'Temp@123';
const adminCandidates = () => [
  process.env.E2E_ADMIN_EMAIL || 'admin-ddvs',
  'admin-ddvs@ddvs.com',
].filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index);

async function hasAccessToken(page: Page) {
  return page.evaluate(async () => {
    const response = await fetch('/api/auth/session');
    if (!response.ok) return false;

    const session = await response.json();
    return Boolean(session?.accessToken);
  });
}

async function login(page: Page, email: string) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('textbox', { name: 'School Code' })).toBeVisible({
    timeout: 60_000,
  });
  await page.getByRole('textbox', { name: 'School Code' }).fill(tenant());
  await page.getByRole('textbox', { name: 'Email / Username' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password());
  await page.getByRole('button', { name: /Sign In/i }).click();

  await expect.poll(() => hasAccessToken(page), {
    message: `expected ${email} to produce an authenticated session`,
    timeout: 60_000,
  }).toBe(true);
}

setup('authenticate academic admin', async ({ page }) => {
  setup.setTimeout(90_000);

  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  let lastError: unknown;
  for (const candidate of adminCandidates()) {
    try {
      await login(page, candidate);
      await page.evaluate(() => localStorage.setItem('onboarding_completed', 'true'));
      await page.context().storageState({ path: authFile });
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Unable to authenticate academic admin.');
});
