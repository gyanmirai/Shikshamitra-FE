/* eslint-disable import/no-extraneous-dependencies */
import { test, expect } from '@playwright/test';

import { findEmployeeBySearch } from './employee-api';
import { createEmployeeFixture, invalidEmployeeValues } from './employee-fixtures';
import {
  fillDate,
  saveAndNext,
  searchEmployee,
  fillTextByLabel,
  clickAddEmployee,
  gotoEmployeeList,
  fillRequiredPersonalInformation,
} from './employee-page';

test.describe('HR Employee create', () => {
  test('creates an employee from the Personal Information step', async ({ page }) => {
    const employee = createEmployeeFixture();

    await gotoEmployeeList(page);
    await clickAddEmployee(page);
    await fillRequiredPersonalInformation(page, employee);
    await saveAndNext(page);

    await expect(page.getByText(/Family Information/i)).toBeVisible();

    const created = await findEmployeeBySearch(page, employee.email);
    expect(created?.id).toBeTruthy();
    expect(created?.employeeIdentifier || created?.employeeCode).toMatch(/[A-Z0-9]{3,}/);

    await page.goto('/hr/employee');
    await searchEmployee(page, employee.email);
    await expect(page.getByText(employee.email)).toBeVisible();
  });

  test('validates required and invalid Personal Information fields', async ({ page }) => {
    await gotoEmployeeList(page);
    await clickAddEmployee(page);
    await saveAndNext(page);

    await expect(page.getByText(/First Name is required/i)).toBeVisible();
    await expect(page.getByText(/Last Name is required/i)).toBeVisible();
    await expect(page.getByText(/Date of Birth is required/i)).toBeVisible();

    await fillTextByLabel(page, 'Primary Contact', invalidEmployeeValues.mobile);
    await fillTextByLabel(page, 'Email', invalidEmployeeValues.email);
    await fillTextByLabel(page, 'Pincode', invalidEmployeeValues.pincode);
    await fillDate(page, 'Date of Joining', invalidEmployeeValues.futureDate);
    await saveAndNext(page);

    await expect(page.getByText(/Primary Contact No\. is not valid/i)).toBeVisible();
    await expect(page.getByText(/Please enter a valid email/i)).toBeVisible();
    await expect(page.getByText(/Date of Joining cannot be in the future/i)).toBeVisible();
  });
});
