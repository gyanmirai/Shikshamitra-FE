/* eslint-disable import/no-extraneous-dependencies */
import { test, expect } from '@playwright/test';

import { testIds } from './selectors';
import { createEmployeeFixture } from './employee-fixtures';
import { searchEmployee, gotoEmployeeList, openFirstRowAction } from './employee-page';
import {
  updateEmployeeStatus,
  assignReportingManager,
  createEmployeeFromExistingDefaults,
} from './employee-api';

test.describe('HR Employee status', () => {
  test('changes status through UI and validates required remarks', async ({ page }) => {
    await gotoEmployeeList(page);
    const employee = await createEmployeeFromExistingDefaults(page, createEmployeeFixture());
    await searchEmployee(page, employee.email);
    await openFirstRowAction(page, 'Change Status');

    await expect(page.getByTestId(testIds.statusDialog)).toBeVisible();
    await page.getByLabel(/Status/i).click();
    await page.getByRole('option', { name: /Left/i }).click();
    await page.getByTestId(testIds.statusUpdateButton).click();
    await expect(page.getByText(/remarks|required/i)).toBeVisible();

    await page.getByLabel(/Remarks/i).fill(`E2E status update ${Date.now()}`);
    await page.getByTestId(testIds.statusUpdateButton).click();
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

  test('warns and disables update when deactivating a reporting manager with active staff', async ({
    page,
  }) => {
    await gotoEmployeeList(page);
    const manager = await createEmployeeFromExistingDefaults(
      page,
      createEmployeeFixture('Status Manager')
    );
    const reportee = await createEmployeeFromExistingDefaults(
      page,
      createEmployeeFixture('Status Reportee')
    );
    const newManager = await createEmployeeFromExistingDefaults(
      page,
      createEmployeeFixture('Status New Manager')
    );
    expect(manager.id).toBeTruthy();
    expect(reportee.id).toBeTruthy();
    expect(newManager.id).toBeTruthy();

    const assignResponse = await assignReportingManager(page, reportee.id!, manager.id!);
    expect(assignResponse.ok()).toBeTruthy();

    let statusUpdateRequests = 0;
    page.on('request', (request) => {
      if (
        request.method() === 'PUT' &&
        request.url().includes(`/api/employees/${manager.id}/status`)
      ) {
        statusUpdateRequests += 1;
      }
    });

    await searchEmployee(page, manager.email);
    await openFirstRowAction(page, 'Change Status');

    await expect(page.getByTestId(testIds.statusDialog)).toBeVisible();
    await page.getByLabel(/Status/i).click();
    await page.getByRole('option', { name: /^Inactive$/i }).click();

    await expect(page.getByTestId(testIds.managerDeactivationWarningDialog)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cannot Deactivate Manager' })).toBeVisible();
    await expect(
      page.getByText(
        'This employee is currently assigned as a Reporting Manager for active staff members. Please assign a new manager to their team before making this employee inactive.'
      )
    ).toBeVisible();
    await expect(page.getByTestId(testIds.statusUpdateButton)).toBeDisabled();
    await expect(page.getByText(/Failed to update status/i)).toHaveCount(0);
    await expect(
      page.getByText(/HR:Employee:010032|Reporting manager has active reports/i)
    ).toHaveCount(0);
    expect(statusUpdateRequests).toBe(0);

    await page
      .getByTestId(testIds.managerDeactivationWarningDialog)
      .getByRole('button', { name: /^OK$/i })
      .click();
    await page.getByRole('button', { name: /^Cancel$/i }).click();
    await expect(page.getByTestId(testIds.statusDialog)).toBeHidden();

    const reassignResponse = await assignReportingManager(page, reportee.id!, newManager.id!);
    expect(reassignResponse.ok()).toBeTruthy();

    await openFirstRowAction(page, 'Change Status');
    await expect(page.getByTestId(testIds.statusDialog)).toBeVisible();
    await page.getByLabel(/Status/i).click();
    await page.getByRole('option', { name: /^Inactive$/i }).click();

    await expect(page.getByTestId(testIds.managerDeactivationWarningDialog)).toBeHidden();
    await expect(page.getByTestId(testIds.statusUpdateButton)).toBeEnabled();
    await page.getByTestId(testIds.statusUpdateButton).click();
    await expect(page.getByTestId(testIds.statusDialog)).toBeHidden({ timeout: 20_000 });
    expect(statusUpdateRequests).toBeGreaterThan(0);
  });

  test('fails closed when manager deactivation check cannot be verified', async ({ page }) => {
    await gotoEmployeeList(page);
    const employee = await createEmployeeFromExistingDefaults(
      page,
      createEmployeeFixture('Status Check Failure')
    );
    expect(employee.id).toBeTruthy();

    let statusUpdateRequests = 0;
    page.on('request', (request) => {
      if (
        request.method() === 'PUT' &&
        request.url().includes(`/api/employees/${employee.id}/status`)
      ) {
        statusUpdateRequests += 1;
      }
    });

    await page.route(`**/api/employees/${employee.id}/status-deactivation-check`, (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unable to verify reporting-manager assignments.' }),
      })
    );

    await searchEmployee(page, employee.email);
    await openFirstRowAction(page, 'Change Status');

    await expect(page.getByTestId(testIds.statusDialog)).toBeVisible();
    await page.getByLabel(/Status/i).click();
    await page.getByRole('option', { name: /^Inactive$/i }).click();

    await expect(
      page.getByText('Unable to verify reporting-manager assignments. Please try again.')
    ).toBeVisible();
    await expect(page.getByTestId(testIds.statusUpdateButton)).toBeDisabled();
    await expect(page.getByTestId(testIds.managerDeactivationWarningDialog)).toBeHidden();
    expect(statusUpdateRequests).toBe(0);
  });
});
