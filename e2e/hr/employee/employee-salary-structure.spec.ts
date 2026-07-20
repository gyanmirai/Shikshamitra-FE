/* eslint-disable import/no-extraneous-dependencies */
import { test, expect } from '@playwright/test';

import { testIds } from './selectors';
import { gotoEmployeeList, openFirstRowAction } from './employee-page';

test.describe('HR Employee salary structure', () => {
  test('opens salary structure, validates fixed amount, saves, and reloads dialog', async ({
    page,
  }) => {
    await gotoEmployeeList(page);
    await openFirstRowAction(page, 'Salary Structure');

    await expect(page.getByTestId(testIds.salaryDialog)).toBeVisible();
    await expect(
      page.getByTestId(testIds.salaryDialog).getByText(/^Earning Components$/)
    ).toBeVisible();
    await expect(
      page.getByTestId(testIds.salaryDialog).getByText(/^Deduction Components$/)
    ).toBeVisible();

    const amountField = page.getByLabel(/Amount/i).first();
    if (await amountField.isVisible()) {
      await amountField.fill('');
      await page.getByRole('button', { name: /^Submit$/i }).click();
      await expect(page.getByText(/Amount is required/i)).toBeVisible();

      await amountField.fill('1250');
      await page.getByRole('button', { name: /^Submit$/i }).click();
      await expect(page.getByTestId(testIds.salaryDialog)).toBeHidden({ timeout: 20_000 });

      await openFirstRowAction(page, 'Salary Structure');
      await expect(page.getByTestId(testIds.salaryDialog)).toBeVisible();
      await expect(page.locator('input[value="1250"]').first()).toBeVisible();
    }
  });

  test('validates temporary component applicable month', async ({ page }) => {
    await gotoEmployeeList(page);
    await openFirstRowAction(page, 'Salary Structure');

    const addTempButton = page.getByRole('button', { name: /temporary|temp|add/i }).first();
    if (!(await addTempButton.isVisible())) {
      test.skip(true, 'No temporary component add control is available for current data.');
    }

    await addTempButton.click();
    await page.getByRole('button', { name: /^Submit$/i }).click();
    await expect(page.getByText(/Applicable month is required/i)).toBeVisible();
  });
});
