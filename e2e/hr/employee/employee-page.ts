/* eslint-disable import/no-extraneous-dependencies */
import { expect, type Page, type Locator } from '@playwright/test';

import { testIds, hrEmployeePath } from './selectors';

import type { EmployeeFixture } from './employee-fixtures';

export async function gotoEmployeeList(page: Page, timeout?: number) {
  await page.addInitScript(() => localStorage.setItem('onboarding_completed', 'true'));
  await page.goto(hrEmployeePath);
  await expect(page.getByTestId(testIds.employeePage)).toBeVisible({ timeout });
  await dismissAcademicYearTour(page);
  await expect(page.getByTestId(testIds.employeeListFilters)).toBeVisible();
  await expect(table(page)).toBeVisible();
}

export async function dismissAcademicYearTour(page: Page) {
  const tourDialog = page.getByRole('dialog', { name: /Select Academic Year/i });
  if (await tourDialog.isVisible().catch(() => false)) {
    await tourDialog.getByRole('button', { name: /^Skip$/i }).click();
    await expect(tourDialog).toBeHidden();
  }

  const driverOverlay = page.locator('.driver-overlay');
  if (await driverOverlay.isVisible().catch(() => false)) {
    await page.keyboard.press('Escape');
    if (await driverOverlay.isVisible().catch(() => false)) {
      await page.evaluate(() => {
        document
          .querySelectorAll('.driver-overlay, .driver-popover')
          .forEach((element) => element.remove());
        localStorage.setItem('onboarding_completed', 'true');
      });
    }
    await expect(driverOverlay).toBeHidden();
  }
}

export async function expectNoRuntimeErrors(page: Page) {
  const runtimeErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() !== 'error') {
      return;
    }

    const text = message.text();
    if (/^Failed to load resource: the server responded with a status of \d+ \(\)$/.test(text)) {
      return;
    }

    runtimeErrors.push(text);
  });

  page.on('pageerror', (error) => {
    runtimeErrors.push(error.message);
  });

  page.on('response', (response) => {
    const url = response.url();
    if (url.includes('/api/') && response.status() >= 500) {
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

const labelAliases: Record<string, string[]> = {
  Building: ['Building No./Flat/House No.', 'Building'],
  Area: ['Area/Locality/Road Name', 'Area'],
  Road: ['Landmark', 'Road'],
  'Primary Contact': ['Primary Contact No.', 'Primary Contact'],
  'Secondary Contact': ['Secondary Contact No.', 'Secondary Contact'],
  Pincode: ['PIN Code', 'Pincode'],
};

function labelCandidates(label: string) {
  return labelAliases[label] || [label];
}

function exactAccessibleNames(label: string) {
  return [label, `${label} *`];
}

async function firstVisibleFieldByLabel(scope: Page | Locator, label: string) {
  const fields = labelCandidates(label).flatMap((candidate) => [
    ...exactAccessibleNames(candidate).flatMap((accessibleName) => [
      scope.getByRole('textbox', { name: accessibleName, exact: true }).first(),
      scope.getByLabel(accessibleName, { exact: true }).first(),
    ]),
    scope.getByRole('textbox', { name: new RegExp(candidate, 'i') }).first(),
    scope.getByLabel(candidate, { exact: false }).first(),
  ]);

  const firstVisible = async (index = 0): Promise<Locator | undefined> => {
    const field = fields[index];
    if (!field) {
      return undefined;
    }

    return (await field.isVisible().catch(() => false)) ? field : firstVisible(index + 1);
  };

  const visibleField = await firstVisible();
  if (visibleField) {
    return visibleField;
  }

  return scope.getByLabel(label, { exact: false }).first();
}

export async function searchEmployee(page: Page, value: string) {
  const tableRoot = table(page);
  await tableRoot.getByPlaceholder('Search...').fill(value);
  await page.waitForResponse(
    (response) => response.url().includes('/api/employees') && response.request().method() === 'GET'
  );
}

export async function firstDataRow(page: Page) {
  const rows = table(page).locator('tbody tr').filter({ hasNotText: 'No Staff Found' });
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
  const editButton = row.getByTestId(testIds.editAction);
  await editButton.scrollIntoViewIfNeeded();
  await editButton.evaluate((element) => (element as HTMLElement).click());
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

export async function uploadProfilePhoto(page: Page) {
  const fileInput = page.getByTestId(testIds.employeeForm).locator('input[type="file"]').first();
  await fileInput.setInputFiles({
    name: 'employee-e2e-profile.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lN8mxQAAAABJRU5ErkJggg==',
      'base64'
    ),
  });
}

export async function fillTextByLabel(scope: Page | Locator, label: string, value: string) {
  const field = await firstVisibleFieldByLabel(scope, label);
  await field.fill(value);
}

export async function fillOtpByLabel(page: Page, label: string, value: string) {
  const field = page
    .locator('label')
    .filter({ hasText: label })
    .locator('..')
    .locator('input')
    .first();
  await field.fill(value);
}

export async function pickFirstAutocompleteOption(page: Page, label: string) {
  const field = await firstVisibleFieldByLabel(page, label);
  await field.click();
  await field.press('ArrowDown');
  await field.press('Enter');
}

export async function pickOption(page: Page, label: string, optionText?: string | RegExp) {
  if (label === 'Gender') {
    const genderName = typeof optionText === 'string' ? optionText : 'Male';
    await page.getByRole('radio', { name: genderName, exact: true }).click();
    return;
  }

  const field = await firstVisibleFieldByLabel(page, label);
  await field.click();

  if (optionText) {
    await page.getByRole('option', { name: optionText }).first().click();
    return;
  }

  await page.getByRole('option').first().click();
  await expect(page.getByRole('listbox')).toBeHidden();
}

export async function fillDate(page: Page, label: string, value: string) {
  const [day, month, year] = value.split('-');
  const dateGroup = page.getByRole('group', { name: new RegExp(label, 'i') }).first();
  if (await dateGroup.isVisible().catch(() => false)) {
    await dateGroup.getByRole('spinbutton', { name: /Day/i }).fill(day);
    await dateGroup.getByRole('spinbutton', { name: /Month/i }).fill(month);
    await dateGroup.getByRole('spinbutton', { name: /Year/i }).fill(year);
    await dateGroup.getByRole('spinbutton', { name: /Year/i }).press('Tab');
    return;
  }

  const labelledControl = await firstVisibleFieldByLabel(page, label);
  const field =
    (await labelledControl.evaluate((element) => element.tagName).catch(() => '')) === 'INPUT'
      ? labelledControl
      : labelledControl.locator('input').first();
  await field.fill(value);
  await field.press('Tab');
}

export async function saveAndNext(page: Page) {
  await dismissNotifications(page);
  await page.getByRole('button', { name: /Save & Next/i }).click();
}

export async function saveStep(page: Page) {
  await dismissNotifications(page);
  await page.getByRole('button', { name: /^Save$/i }).click();
}

export async function submitStepper(page: Page) {
  await dismissNotifications(page);
  await page.getByRole('button', { name: /^Submit$/i }).click();
}

export async function dismissNotifications(page: Page) {
  const closeButtons = page
    .getByRole('region', { name: /Notifications/i })
    .getByRole('button', { name: /close/i });
  const count = await closeButtons.count().catch(() => 0);

  await Promise.all(
    Array.from({ length: count }, (_, index) =>
      closeButtons
        .nth(index)
        .click()
        .catch(() => undefined)
    )
  );
}

export async function fillRequiredPersonalInformation(page: Page, employee: EmployeeFixture) {
  const form = page.getByTestId(testIds.employeeForm);

  await uploadProfilePhoto(page);
  await fillTextByLabel(form, 'Last Name', employee.lastName);
  await fillTextByLabel(form, 'First Name', employee.firstName);
  await fillTextByLabel(form, 'Middle Name', employee.middleName);
  await fillDate(page, 'Date of Birth', employee.dob);
  await fillTextByLabel(form, 'Family Caste', employee.familyCaste);
  await pickOption(page, 'Category');
  await pickOption(page, 'Gender', /Male/i);
  await pickOption(page, 'Religion');
  await pickOption(page, 'Marital Status');
  await fillTextByLabel(form, 'Primary Contact', employee.primaryMobile);
  await fillTextByLabel(form, 'Secondary Contact', employee.secondaryMobile);
  await fillTextByLabel(form, 'Email', employee.email);
  await fillOtpByLabel(page, 'Aadhaar No.', employee.adharNo);
  await fillOtpByLabel(page, 'PAN No.', employee.panNo);
  await fillDate(page, 'Date of Joining', employee.doj);
  await pickOption(page, 'Staff Group');
  await pickFirstAutocompleteOption(page, 'Role');
  await fillTextByLabel(form, 'Building', employee.addressLine1);
  await fillTextByLabel(form, 'Area', employee.addressLine2);
  await fillTextByLabel(form, 'Road', employee.addressLine3);
  await pickFirstAutocompleteOption(page, 'State');
  await pickFirstAutocompleteOption(page, 'City');
  await fillTextByLabel(form, 'Pincode', employee.pincode);
  await pickFirstAutocompleteOption(page, 'Shift');
}
