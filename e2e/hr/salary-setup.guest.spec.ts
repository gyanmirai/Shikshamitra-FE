import { test, expect } from '@playwright/test';

test('guided salary setup retains drafts, invalidates previews and recovers from a failed save', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => {
    errors.push(error.message);
    console.error('Harness error:', error.message);
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
  await page.getByLabel('Monthly salary', { exact: true }).fill('18000');
  await page.screenshot({
    path: '.artifacts/salary-setup-browser/details-desktop.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Statutory Setup', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save salary', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Preview salary', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save salary', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Salary Details', exact: true }).click();
  await expect(page.getByLabel('Monthly salary', { exact: true })).toHaveValue('₹ 18,000');
  await page.getByLabel('Monthly salary', { exact: true }).fill('19000');
  await page.getByRole('button', { name: 'Review & Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save salary', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Refresh preview', exact: true }).click();
  await page.evaluate(() => {
    (window as typeof window & { failNextSalarySave?: boolean }).failNextSalarySave = true;
  });
  await page.getByRole('button', { name: 'Save salary', exact: true }).click();
  await expect(page.getByText('The request did not finish with a confirmed result.')).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (window as typeof window & { salarySaveRequests?: unknown[] }).salarySaveRequests?.length
    )
  ).toBe(1);
  await expect(page.getByRole('button', { name: 'Save salary', exact: true })).toBeEnabled();
  await page.screenshot({ path: '.artifacts/salary-setup-browser/desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Save salary', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save salary', exact: true })).toBeDisabled();
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();
  await page.screenshot({
    path: '.artifacts/salary-setup-browser/desktop-saved.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '.artifacts/salary-setup-browser/mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
  const footer = page.getByTestId('salary-editor-footer');
  await expect(footer).toBeInViewport();
  expect(errors).toEqual([]);
});

test('template basis choices invalidate the server preview and settings explain task ownership', async ({
  page,
}) => {
  await page.goto('/?view=template');
  const basis = page.getByRole('radiogroup', { name: 'Default salary basis' });
  await expect(basis.getByRole('radio', { name: /^Monthly cost to school/ })).toBeChecked();
  await page.getByRole('button', { name: 'Preview salary', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save Changes', exact: true })).toBeEnabled();
  await basis.getByRole('radio', { name: /^Monthly salary/ }).check();
  await expect(page.getByRole('button', { name: 'Save Changes', exact: true })).toBeDisabled();
  await expect(page.getByRole('textbox', { name: 'Monthly salary', exact: true })).toBeVisible();
  await page.screenshot({
    path: '.artifacts/salary-setup-browser/template-desktop.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
  await page.screenshot({
    path: '.artifacts/salary-setup-browser/template-mobile.png',
    fullPage: true,
  });
  await page.goto('/?view=settings');
  await expect(page.getByRole('heading', { name: 'Component Library', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open salary templates' })).toHaveAttribute(
    'href',
    '/hr/payroll/setting/salary-templates'
  );
  await expect(page.getByRole('link', { name: 'Earning components' })).toHaveAttribute(
    'href',
    '/hr/payroll/setting/earning-component'
  );
});
