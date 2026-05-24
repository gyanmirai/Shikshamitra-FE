/* eslint-disable import/no-extraneous-dependencies */
import path from 'node:path';
import { expect, type Page, test as setup } from '@playwright/test';

const authFile = path.join(process.cwd(), 'playwright/.auth/hr-manager.json');

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('School Code').fill(process.env.E2E_TENANT || 'DDVS');
  await page.getByLabel('Email / Username').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /Sign In/i }).click();
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 30_000 });
}

setup('authenticate HR manager', async ({ page }) => {
  await login(
    page,
    process.env.E2E_HR_EMAIL || 'hr-manager@ddvs.com',
    process.env.E2E_HR_PASSWORD || 'Temp@123'
  );

  await page.context().storageState({ path: authFile });
});
