/* eslint-disable no-restricted-syntax */
import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  for (const width of [390, 768, 1440]) {
    test(`Professional Tax form remains usable at ${width}px in ${theme}`, async ({
      page,
    }, info) => {
      await page.setViewportSize({
        width,
        height: width === 390 ? 844 : width === 768 ? 1024 : 900,
      });
      await page.goto(`/?surface=professional-tax&theme=${theme}`);
      await expect(
        page.getByRole('button', { name: 'Add tax range', exact: true })
      ).toBeInViewport();
      await page.getByRole('button', { name: 'Add tax range', exact: true }).click();
      const form = page.getByRole('dialog', { name: 'Add Tax Range', exact: true });
      await expect(form.getByRole('button', { name: 'Submit', exact: true })).toBeInViewport();
      await expect(
        form.getByRole('button', { name: 'Tax Range Details information' })
      ).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBe(true);
      await page.screenshot({ path: info.outputPath(`tax-form-${theme}-${width}.png`) });
    });
  }
}

test('Professional Tax retains validation and numeric payloads in the aligned form', async ({
  page,
}) => {
  await page.goto('/?surface=professional-tax');
  await page.getByRole('button', { name: 'Add tax range', exact: true }).click();
  const form = page.getByRole('dialog', { name: 'Add Tax Range', exact: true });
  await form.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(form.getByText('From salary is required')).toBeVisible();
  await expect(form.getByText('Tax amount is required')).toBeVisible();
  await form.getByLabel('From salary', { exact: false }).fill('12000.25');
  await form.getByLabel('Tax amount', { exact: false }).fill('200.5');
  await form.getByRole('switch', { name: 'Deduct in employment cessation month' }).uncheck();
  let submitted: Record<string, unknown> | undefined;
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/payroll/professional-taxes', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    submitted = route.request().postDataJSON();
    await pending;
    return route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({ error: { message: 'Synthetic tax conflict. Retry your draft.' } }),
    });
  });
  await form.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(form.getByRole('button', { name: 'close', exact: true })).toBeDisabled();
  await expect(form.getByRole('button', { name: 'Cancel', exact: true })).toBeDisabled();
  await expect(form.getByLabel('From salary', { exact: false })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(form).toBeVisible();
  release();
  await expect
    .poll(() => submitted)
    .toMatchObject({
      jurisdictionCode: 'IN-GJ',
      fromSalary: 12000.25,
      toSalary: null,
      taxAmount: 200.5,
      isActive: true,
      deductInCessationMonth: false,
    });
  await expect(form).toBeVisible();
  await expect(form.getByRole('alert')).toContainText('Synthetic tax conflict');
  await expect(form.getByLabel('From salary', { exact: false })).toHaveValue('₹ 12,000.25');
  page.once('dialog', (dialog) => dialog.accept());
  await form.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Edit Tax Range' })).toBeVisible();
  const edit = page.getByRole('dialog', { name: 'Edit Tax Range' });
  let updated: Record<string, unknown> | undefined;
  let updateAttempts = 0;
  await page.route('**/api/payroll/professional-taxes/tax-1', async (route) => {
    updated = route.request().postDataJSON();
    updateAttempts += 1;
    return route.fulfill({
      status: updateAttempts === 1 ? 409 : 200,
      contentType: 'application/json',
      body: '{}',
    });
  });
  await edit.getByLabel('Tax amount', { exact: false }).fill('350.75');
  await edit.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(edit.getByRole('alert')).toBeVisible();
  await expect(edit.getByLabel('Tax amount', { exact: false })).toHaveValue('₹ 350.75');
  expect(updated).toMatchObject({
    fromSalary: 12000,
    toSalary: null,
    taxAmount: 350.75,
    effectiveFrom: '2026-04-01',
  });
  await edit.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(edit).toBeHidden();
});
