/* eslint-disable import/no-extraneous-dependencies */
import { expect, type Page, type Locator } from '@playwright/test';

import { testIds, hrEmployeePath } from './selectors';

import type { EmployeeFixture } from './employee-fixtures';

export async function gotoEmployeeList(page: Page) {
  await page.goto(hrEmployeePath);
  await expect(page.getByTestId(testIds.employeePage)).toBeVisible();
  await expect(page.getByTestId(testIds.employeeList)).toBeVisible();
}

export async function expectNoRuntimeErrors(page: Page) {
  const runtimeErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      runtimeErrors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    runtimeErrors.push(error.message);
  });

  page.on('response', (response) => {
    const url = response.url();
    if (url.includes('/api/employees') && response.status() >= 500) {
      runtimeErrors.push(`${response.status()} ${url}`);
    }
  });

  return async () => {
    expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([]);
  };
}

export function table(page: Page) {
  return page.getByTestId(testIds.employeeTable);
}

export async function searchEmployee(page: Page, value: string) {
  const tableRoot = table(page);
  await tableRoot.getByPlaceholder('Search...').fill(value);
  await page.waitForResponse(
    (response) => response.url().includes('/api/employees') && response.request().method() === 'GET'
  );
}

export async function firstDataRow(page: Page) {
  const rows = table(page).locator('tbody tr').filter({ hasNotText: 'No Employee Found' });
  await expect(rows.first()).toBeVisible();
  return rows.first();
}

export async function openFirstRowProfile(page: Page) {
  const row = await firstDataRow(page);
  await row.getByTestId(testIds.viewAction).click();
  await expect(page.getByTestId(testIds.employeeProfile)).toBeVisible();
  await expect(page).toHaveURL(/employee=/);
}

export async function openFirstRowEdit(page: Page) {
  const row = await firstDataRow(page);
  await row.getByTestId(testIds.editAction).click();
  await expect(page.getByTestId(testIds.employeeForm)).toBeVisible();
}

export async function openFirstRowAction(page: Page, actionName: string) {
  const row = await firstDataRow(page);
  await row.getByTestId(testIds.moreAction).click();
  await page.getByRole('menuitem', { name: actionName }).click();
}

export async function clickAddEmployee(page: Page) {
  await page.getByTestId(testIds.addEmployeeButton).click();
  await expect(page.getByTestId(testIds.employeeForm)).toBeVisible();
}

export async function fillTextByLabel(scope: Page | Locator, label: string, value: string) {
  const field = scope.getByLabel(label, { exact: false }).first();
  await field.fill(value);
}

export async function pickFirstAutocompleteOption(page: Page, label: string) {
  const field = page.getByLabel(label, { exact: false }).first();
  await field.click();
  await field.press('ArrowDown');
  await field.press('Enter');
}

export async function pickOption(page: Page, label: string, optionText?: string | RegExp) {
  const field = page.getByLabel(label, { exact: false }).first();
  await field.click();

  if (optionText) {
    await page.getByRole('option', { name: optionText }).first().click();
    return;
  }

  await field.press('ArrowDown');
  await field.press('Enter');
}

export async function fillDate(page: Page, label: string, value: string) {
  const field = page.getByLabel(label, { exact: false }).first();
  await field.fill(value);
  await field.press('Tab');
}

export async function saveAndNext(page: Page) {
  await page.getByRole('button', { name: /Save & Next/i }).click();
}

export async function saveStep(page: Page) {
  await page.getByRole('button', { name: /^Save$/i }).click();
}

export async function submitStepper(page: Page) {
  await page.getByRole('button', { name: /^Submit$/i }).click();
}

export async function fillRequiredPersonalInformation(page: Page, employee: EmployeeFixture) {
  await fillTextByLabel(page, 'Last Name', employee.lastName);
  await fillTextByLabel(page, 'First Name', employee.firstName);
  await fillTextByLabel(page, 'Middle Name', employee.middleName);
  await fillDate(page, 'Date of Birth', employee.dob);
  await fillTextByLabel(page, 'Family Caste', employee.familyCaste);
  await pickOption(page, 'Category');
  await pickOption(page, 'Gender', /Male/i);
  await pickOption(page, 'Religion');
  await pickOption(page, 'Marital Status');
  await fillTextByLabel(page, 'Primary Contact', employee.primaryMobile);
  await fillTextByLabel(page, 'Secondary Contact', employee.secondaryMobile);
  await fillTextByLabel(page, 'Email', employee.email);
  await fillDate(page, 'Date of Joining', employee.doj);
  await pickOption(page, 'Employee Group');
  await pickFirstAutocompleteOption(page, 'Role');
  await pickFirstAutocompleteOption(page, 'Organization');
  await fillTextByLabel(page, 'Building', employee.addressLine1);
  await fillTextByLabel(page, 'Area', employee.addressLine2);
  await fillTextByLabel(page, 'Road', employee.addressLine3);
  await pickFirstAutocompleteOption(page, 'State');
  await pickFirstAutocompleteOption(page, 'City');
  await fillTextByLabel(page, 'Pincode', employee.pincode);
  await pickFirstAutocompleteOption(page, 'Shift');
}
