import { test, expect } from '@playwright/test';

// Real onboarding controls with module-local synthetic hooks; no staff/tenant API writes.
test('salary precedes Finalize; back, cancel, failure and retry preserve the draft', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Save & Next', exact: true }).click();
  await page.locator('input[maxlength="12"]').fill('123456789012');
  await page.locator('input[maxlength="10"]').fill('ABCDE1234F');
  await page.getByRole('combobox', { name: 'Religion *', exact: true }).click();
  await page.getByRole('option', { name: 'Hinduism', exact: true }).click();
  await page.getByRole('combobox', { name: 'Role *', exact: true }).click();
  await page.getByRole('option', { name: 'Office staff', exact: true }).click();
  await page.getByRole('combobox', { name: 'Shift *', exact: true }).click();
  await page.getByRole('option', { name: 'Day shift', exact: true }).click();
  await page.getByRole('button', { name: 'Save & Next', exact: true }).click();
  await page.getByRole('button', { name: 'Save & Next', exact: true }).click();
  const finalize = page.getByRole('button', { name: 'Finalize', exact: true });
  await expect(finalize).toBeDisabled();
  await expect(page.getByRole('switch', { name: 'Apply ESIC', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save salary', exact: true })).toHaveCount(0);
  const amount = page.getByLabel('Monthly salary', { exact: true });
  await amount.fill('18000');
  await page.getByRole('button', { name: 'Preview salary', exact: true }).click();
  await page.getByRole('button', { name: 'Refresh preview', exact: true }).click();
  await expect(finalize).toBeEnabled();
  await page.screenshot({
    path: '.artifacts/onboarding-salary-browser/salary-before-finalize.png',
  });
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('button', { name: 'Save & Next', exact: true }).click();
  await expect(amount).toHaveValue('₹ 18,000');
  await page.getByRole('button', { name: 'close', exact: true }).click();
  await expect(page.getByText('Discard unsaved changes?', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Keep editing', exact: true }).click();
  await expect(amount).toHaveValue('₹ 18,000');
  const reloadWarning = page.waitForEvent('dialog');
  // A dismissed beforeunload prevents the navigation from completing; bound that wait.
  const reload = page.reload({ timeout: 5000 }).catch(() => null);
  const warning = await reloadWarning;
  expect(warning.type()).toBe('beforeunload');
  await warning.dismiss();
  await reload;
  await expect(amount).toHaveValue('₹ 18,000');
  await page.evaluate(() => {
    (window as any).failNextFinalize = true;
  });
  await Promise.all([finalize.dispatchEvent('click'), finalize.dispatchEvent('click')]);
  await expect(
    page.getByText('Synthetic salary save failed. Retry finalization.', { exact: true })
  ).toBeVisible();
  await expect(amount).toHaveValue('₹ 18,000');
  await expect(finalize).toBeEnabled();
  await finalize.click();
  await expect(
    page.getByText('Staff and salary saved. Staff remains inactive.', { exact: true }).first()
  ).toBeVisible();
  const requests = await page.evaluate(() => (window as any).finalizeRequests);
  expect(requests).toHaveLength(2);
  expect(requests[1].body.salary.monthlyAmount).toBe(18000);
  expect(requests[1].body.statutoryProfile.applyEsic).toBe(true);
  await page.screenshot({ path: '.artifacts/onboarding-salary-browser/success.png' });
});
