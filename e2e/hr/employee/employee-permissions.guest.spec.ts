/* eslint-disable import/no-extraneous-dependencies */
import { test, expect, type Page } from '@playwright/test';

import { testIds, hrEmployeePath } from './selectors';

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('School Code').fill(process.env.E2E_TENANT || 'DDVS');
  await page.getByLabel('Email / Username').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /Sign In/i }).click();
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 30_000 });
}

test.describe('HR Staff permissions', () => {
  test('HR Manager can see write actions', async ({ page, browser }) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/hr-manager.json',
    });
    const hrPage = await context.newPage();

    await hrPage.goto(hrEmployeePath);
    await expect(hrPage.getByTestId(testIds.addEmployeeButton)).toBeVisible();
    await expect(hrPage.getByTestId(testIds.moreAction).first()).toBeVisible();
    await expect(hrPage.getByTestId(testIds.editAction).first()).toBeVisible();

    await context.close();
  });

  test('lower-permission teacher cannot perform Staff write workflow', async ({ page }) => {
    await login(
      page,
      process.env.E2E_LIMITED_EMAIL || 'teacher-demo-1@ddvs.com',
      process.env.E2E_LIMITED_PASSWORD || 'Temp@123'
    );

    await page.goto(hrEmployeePath);

    const addButton = page.getByTestId(testIds.addEmployeeButton);
    if (await addButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await addButton.click();
      await expect(page.getByText(/Unauthorized|Forbidden|403|access/i)).toBeVisible({
        timeout: 15_000,
      });
    } else {
      await expect(addButton).toBeHidden();
    }
  });
});
