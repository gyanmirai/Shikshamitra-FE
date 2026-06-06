/* eslint-disable import/no-extraneous-dependencies */
import { test, expect, type Locator } from '@playwright/test';

import { createEmployeeFixture } from './employee-fixtures';
import {
  fillDate,
  saveStep,
  pickOption,
  saveAndNext,
  fillTextByLabel,
  gotoEmployeeList,
  openFirstRowEdit,
  pickFirstAutocompleteOption,
} from './employee-page';

async function expectBelow(referenceLocator: Locator, targetLocator: Locator) {
  const referenceBox = await referenceLocator.boundingBox();
  const targetBox = await targetLocator.boundingBox();

  expect(referenceBox).not.toBeNull();
  expect(targetBox).not.toBeNull();

  if (!referenceBox || !targetBox) {
    throw new Error('Unable to measure payroll field layout');
  }

  expect(targetBox.y).toBeGreaterThanOrEqual(referenceBox.y + referenceBox.height - 1);
}

test.describe('HR Employee edit stepper', () => {
  test('updates personal, family, additional, work experience, payroll, reporting, and academic steps', async ({
    page,
  }) => {
    const employee = createEmployeeFixture('E2E HR EDIT');

    await gotoEmployeeList(page);
    await openFirstRowEdit(page);

    await fillTextByLabel(page, 'Middle Name', employee.middleName);
    await fillTextByLabel(page, 'Area', employee.addressLine2);
    await saveStep(page);
    await expect(page.getByText(/saved|updated|success/i)).toBeVisible({ timeout: 15_000 });

    await page.getByText('Family Information').click();
    await fillTextByLabel(page, 'Father Name', employee.family.fatherName);
    await fillTextByLabel(page, 'Mother Name', employee.family.motherName);
    await fillTextByLabel(page, 'Spouse Name', employee.family.spouseName);
    await saveStep(page);

    await page.getByText('Additional Details').click();
    await fillTextByLabel(page, 'BPL', employee.additional.bplCardNo);
    await pickOption(page, 'Person With Disability', /No/i);
    await fillTextByLabel(page, 'Second Language', employee.additional.secondLanguage);
    await saveStep(page);

    await page.getByText('Work Experience').click();
    await page.getByRole('button', { name: /Add/i }).first().click();
    await fillTextByLabel(page, 'Organization Name', employee.workExperience.mediumStageName);
    await fillTextByLabel(page, 'Department', employee.workExperience.department);
    await fillDate(page, 'Start Date', employee.workExperience.startDate);
    await fillDate(page, 'End Date', employee.workExperience.endDate);
    await saveStep(page);

    await page.getByText('Payroll').click();
    await fillTextByLabel(page, 'Bank Name', employee.bank.bankName);
    await fillTextByLabel(page, 'Branch Name', employee.bank.branchName);
    await fillTextByLabel(page, 'Account Holder Name', employee.bank.accountHolderName);
    await fillTextByLabel(page, 'Account Number', employee.bank.accountNumber);
    await fillTextByLabel(page, 'IFSC', employee.bank.ifscCode);
    await fillTextByLabel(page, 'EPF', employee.bank.epfNumber);
    await fillTextByLabel(page, 'UAN', employee.bank.uanNumber);
    await fillTextByLabel(page, 'Punch', employee.bank.punchId);
    await saveStep(page);

    await page.getByText('Assign Reporting Manager').click();
    await pickFirstAutocompleteOption(page, 'Reporting Manager');
    await saveStep(page);

    await page.getByText('Academic Permission').click();
    await page.getByRole('checkbox').first().check({ force: true });
    await saveAndNext(page);

    await expect(page.getByTestId('hr-employee-list')).toBeVisible({ timeout: 20_000 });
  });

  test('validates work experience date ordering and payroll bank fields', async ({ page }) => {
    await gotoEmployeeList(page);
    await openFirstRowEdit(page);

    await page.getByText('Work Experience').click();
    await page.getByRole('button', { name: /Add/i }).first().click();
    await fillTextByLabel(page, 'Organization Name', `Invalid Dates ${Date.now()}`);
    await fillDate(page, 'Start Date', '01-04-2024');
    await fillDate(page, 'End Date', '01-04-2023');
    await saveStep(page);
    await expect(page.getByText(/End Date must be greater than start date/i)).toBeVisible();

    await page.getByText('Payroll').click();
    await fillTextByLabel(page, 'Account Number', 'ABC');
    await fillTextByLabel(page, 'IFSC', 'BAD');
    await saveStep(page);
    await expect(page.getByText(/Account number must contain only digits/i)).toBeVisible();
    const ifscInput = page.getByLabel('IFSC', { exact: false }).first();
    const ifscError = page.getByText(/IFSC code must follow/i).first();
    await expect(ifscError).toBeVisible();
    await expectBelow(ifscInput, ifscError);

    const saveButton = page.getByRole('button', { name: /^Save$/i });
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();
    await saveButton.click({ trial: true });
  });
});
