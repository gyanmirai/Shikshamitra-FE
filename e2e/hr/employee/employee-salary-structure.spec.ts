/* eslint-disable import/no-extraneous-dependencies */
import { test, expect } from '@playwright/test';

import { gotoEmployeeList, openFirstRowAction } from './employee-page';

test.describe('HR Staff salary editor page', () => {
  test('opens from Staff Directory and preserves a salary draft through ESIC and cancelled Back', async ({
    page,
  }) => {
    await gotoEmployeeList(page, 45_000);
    await expect(page).toHaveURL(/\/hr\/employee\/?\?employee=/);
    const origin = new URL(page.url());
    await openFirstRowAction(page, 'Salary Structure');
    await expect(page).toHaveURL(/\/hr\/payroll\/structure\/[^/]+\/edit/);
    await expect(page.getByRole('heading', { name: 'Edit Salary', exact: true })).toBeVisible();
    await expect(page.getByRole('dialog', { name: /Edit salary/i })).toHaveCount(0);
    await expect(
      page.getByTestId('salary-editor-footer').getByRole('button', { name: 'Calculate salary' })
    ).toBeVisible();
    const amount = page.getByRole('textbox', { name: /Monthly/ }).first();
    const originalAmount = await amount.inputValue();
    const draftAmount = String(Number(originalAmount.replace(/[^\d.-]/g, '') || 0) + 100);
    await amount.fill(draftAmount);
    const formattedDraft = await amount.inputValue();
    expect(formattedDraft).toContain('₹');
    expect(Number(formattedDraft.replace(/[^\d.-]/g, ''))).toBe(Number(draftAmount));
    const esiTrigger = page.getByRole('button', { name: 'ESIC details', exact: true });
    await esiTrigger.click();
    const esiClose = page.getByRole('button', { name: 'Close staff ESIC details' });
    await expect(esiClose).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'ESIC insurance number' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save enrollment', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(esiClose).toBeHidden();
    await expect(esiTrigger).toBeFocused();
    await expect(amount).toHaveValue(formattedDraft);
    await page
      .getByTestId('salary-editor-footer')
      .getByRole('button', { name: 'Back', exact: true })
      .click();
    await page.getByRole('button', { name: 'Keep editing', exact: true }).click();
    await expect(amount).toHaveValue(formattedDraft);
    await page
      .getByTestId('salary-editor-footer')
      .getByRole('button', { name: 'Back', exact: true })
      .click();
    await page.getByRole('button', { name: 'Discard changes', exact: true }).click();
    await expect(page).toHaveURL(origin.href);
  });

  test('protects an ESIC-only draft during browser Back and preserves it when cancelled', async ({
    page,
  }) => {
    await gotoEmployeeList(page, 45_000);
    await openFirstRowAction(page, 'Salary Structure');
    await expect(page.getByRole('button', { name: 'ESIC details', exact: true })).toBeVisible();
    const editorUrl = page.url();
    await page.getByRole('button', { name: 'ESIC details', exact: true }).click();
    const insurance = page.getByRole('textbox', { name: 'ESIC insurance number' });
    const originalInsurance = await insurance.inputValue();
    await insurance.fill(originalInsurance === '1234567890' ? '9876543210' : '1234567890');
    const draftInsurance = await insurance.inputValue();
    await page.evaluate(() => window.history.back());
    await expect(page.getByRole('dialog', { name: 'Discard unsaved changes?' })).toBeVisible();
    await page.getByRole('button', { name: 'Keep editing', exact: true }).click();
    await expect(page).toHaveURL(editorUrl);
    await expect(insurance).toHaveValue(draftInsurance);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Discard changes', exact: true }).click();
    await expect(page.getByRole('button', { name: 'ESIC details', exact: true })).toBeFocused();
    await page.goBack();
    await expect(page).toHaveURL(/\/hr\/employee/);
    await page.goForward();
    await expect(page).toHaveURL(editorUrl);
    await expect(page.getByRole('button', { name: 'ESIC details', exact: true })).toBeVisible();
  });

  test('opens from Payroll Structure, reloads directly, and restores the selected staff', async ({
    page,
  }) => {
    await gotoEmployeeList(page, 45_000);
    await openFirstRowAction(page, 'Salary Structure');
    await expect(page).toHaveURL(/\/hr\/payroll\/structure\/[^/]+\/edit/);
    const employeeId = new URL(page.url()).pathname.split('/').filter(Boolean).at(-2)!;
    await page.goto(`/hr/payroll/structure?employeeId=${encodeURIComponent(employeeId)}`);
    await page.getByRole('link', { name: /^(Edit salary|Set up salary)$/ }).click();
    await expect(page.getByTestId('salary-editor-page')).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: 'ESIC details', exact: true })).toBeVisible();
    await page
      .getByTestId('salary-editor-footer')
      .getByRole('button', { name: 'Back', exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`employeeId=${employeeId}`));
    await expect(page.getByRole('combobox', { name: 'Staff', exact: true })).not.toHaveValue('');
  });

  test('redirects legacy staff-edit bookmarks and rejects an external return destination', async ({
    page,
  }) => {
    await gotoEmployeeList(page, 45_000);
    await openFirstRowAction(page, 'Salary Structure');
    await expect(page).toHaveURL(/\/hr\/payroll\/structure\/[^/]+\/edit/);
    const employeeId = new URL(page.url()).pathname.split('/').filter(Boolean).at(-2)!;
    await page.goto(
      `/hr/payroll/structure?${new URLSearchParams({
        employeeId,
        setup: 'salary',
        from: 'staff-edit',
      })}`
    );
    await expect(page).toHaveURL(/\/edit\/?\?returnTo=/);
    const editor = new URL(page.url());
    expect(editor.searchParams.get('returnTo')).toBe(
      `/hr/employee?${new URLSearchParams({
        mode: 'form',
        editEmployee: employeeId,
        step: 'payroll',
      })}`
    );
    await page.goto(`${editor.pathname}?returnTo=https%3A%2F%2Fattacker.example%2Fhr%2Femployee`);
    await expect(page.getByRole('button', { name: 'ESIC details', exact: true })).toBeVisible();
    await page
      .getByTestId('salary-editor-footer')
      .getByRole('button', { name: 'Back', exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`/hr/payroll/structure/?\\?employeeId=${employeeId}`));
  });
});
