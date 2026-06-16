/* eslint-disable import/no-extraneous-dependencies */
import { test, expect } from '@playwright/test';

import { createEmployeeFixture } from './employee-fixtures';
import { employeeApiRequest, createEmployeeFromExistingDefaults } from './employee-api';
import {
  searchEmployee,
  gotoEmployeeList,
  openFirstRowEdit,
  dismissAcademicYearTour,
} from './employee-page';

test.describe('HR Employee email and I-card regressions', () => {
  test('disables email while editing an existing employee', async ({ page }) => {
    const employee = createEmployeeFixture('Email Immutable');

    await gotoEmployeeList(page);
    await createEmployeeFromExistingDefaults(page, employee);
    await searchEmployee(page, employee.email);
    await openFirstRowEdit(page);

    const emailInput = page.getByLabel('Email', { exact: false }).first();
    await expect(emailInput).toHaveValue(employee.email);
    await expect(emailInput).toBeDisabled();
  });

  test('allows direct step navigation after saving a new I-card template in place', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('onboarding_completed', 'true'));
    await page.goto('/hr/i-card');
    await dismissAcademicYearTour(page);

    await expect(page.getByRole('heading', { name: /^Employee I-Card$/ })).toBeVisible({
      timeout: 30_000,
    });

    const createButton = page.getByRole('button', { name: /^Create Employee I-Card$/ });
    await expect(createButton).toBeEnabled({ timeout: 30_000 });
    await createButton.click();

    await expect(page.getByRole('heading', { name: /^Create Employee I-Card$/ })).toBeVisible();
    await page.getByLabel('Template Name').fill(`E2E I-Card ${Date.now()}`);

    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/employees/i-card/templates') &&
        response.request().method() === 'POST'
    );
    await page.getByRole('button', { name: /^Save$/ }).click();

    const createResponse = await createResponsePromise;
    if (!createResponse.ok()) {
      throw new Error(
        `I-card template create failed: ${createResponse.status()} ${await createResponse.text()}`
      );
    }
    const createdTemplate = await createResponse.json();

    try {
      await page.locator('#step-label-4').click();
      await expect(page.getByLabel('Cards per A4 page')).toBeVisible();

      await page.locator('#step-label-1').click();
      await expect(page.getByLabel('School Name')).toBeVisible();
    } finally {
      if (createdTemplate?.id) {
        const deleteResponse = await employeeApiRequest(
          page,
          `/employees/i-card/templates/${createdTemplate.id}`,
          { method: 'DELETE' }
        );
        expect(deleteResponse.ok()).toBeTruthy();
      }
    }
  });
});
