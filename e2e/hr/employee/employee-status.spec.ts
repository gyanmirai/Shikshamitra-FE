/* eslint-disable import/no-extraneous-dependencies */
import { test, expect } from '@playwright/test';

import { testIds } from './selectors';
import { createEmployeeFixture } from './employee-fixtures';
import { searchEmployee, gotoEmployeeList, openFirstRowAction } from './employee-page';
import { updateEmployeeStatus, createEmployeeFromExistingDefaults } from './employee-api';

test.describe('HR Employee status', () => {
  test('changes status through UI and validates required remarks', async ({ page }) => {
    await gotoEmployeeList(page);
    const employee = await createEmployeeFromExistingDefaults(page, createEmployeeFixture());
    await searchEmployee(page, employee.email);
    await openFirstRowAction(page, 'Change Status');

    await expect(page.getByTestId(testIds.statusDialog)).toBeVisible();
    await page.getByLabel(/Status/i).click();
    await page.getByRole('option', { name: /Left/i }).click();
    await page.getByRole('button', { name: /Submit/i }).click();
    await expect(page.getByText(/remarks|required/i)).toBeVisible();

    await page.getByLabel(/Remarks/i).fill(`E2E status update ${Date.now()}`);
    await page.getByRole('button', { name: /Submit/i }).click();
    await expect(page.getByTestId(testIds.statusDialog)).toBeHidden({ timeout: 20_000 });
  });

  test('blocks Left or Retired to Active transition and allows idempotent same-status API call', async ({
    page,
  }) => {
    await gotoEmployeeList(page);
    const employee = await createEmployeeFromExistingDefaults(page, createEmployeeFixture());
    const employeeId = employee.id;
    expect(employeeId).toBeTruthy();

    const leftResponse = await updateEmployeeStatus(
      page,
      employeeId!,
      2,
      `E2E left transition ${Date.now()}`
    );
    expect(leftResponse.ok()).toBeTruthy();

    const sameStatusResponse = await updateEmployeeStatus(page, employeeId!, 2, 'Idempotent check');
    expect(sameStatusResponse.ok()).toBeTruthy();

    const activeResponse = await updateEmployeeStatus(page, employeeId!, 0);
    expect(activeResponse.status()).toBe(400);
    await expect.poll(async () => activeResponse.text()).toContain('HR:Employee:010025');
  });
});
