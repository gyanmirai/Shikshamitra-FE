import { test, expect } from '@playwright/test';

async function selectStaff(page: import('@playwright/test').Page, name = 'Synthetic Employee A') {
  const staff = page.getByRole('combobox', { name: 'Staff member' });
  await staff.fill('Synthetic');
  await page.getByRole('option', { name, exact: true }).click();
}

[
  [390, 844],
  [768, 1024],
  [1440, 900],
].forEach(([width, height]) => {
  ['light', 'dark'].forEach((theme) => {
    test(`readable PDF, grouped controls and reachable history at ${width}px ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/?theme=${theme}`);
      await selectStaff(page);
      const viewer = page.getByRole('region', { name: 'Payslip PDF viewer' });
      await expect(viewer.locator('canvas')).toHaveCount(2);
      await expect(page.getByRole('combobox', { name: 'PDF zoom' })).toContainText('Fit width');
      const actions = page.getByRole('group', { name: 'Payslip actions' });
      await expect(actions.getByRole('button')).toHaveText([
        'Print',
        'Download',
        'Resend',
        'Record payment',
        'Replace document details',
        'Correct payroll',
      ]);
      await expect(actions.getByRole('button', { name: 'Print', exact: true })).toBeEnabled();
      await viewer.scrollIntoViewIfNeeded();
      const before = await actions.boundingBox();
      await viewer.focus();
      await viewer.press('End');
      await expect.poll(() => viewer.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
      expect(await actions.boundingBox()).toEqual(before);
      await page.getByRole('combobox', { name: 'PDF zoom' }).click();
      await page.getByRole('option', { name: '150%', exact: true }).click();
      await viewer.focus();
      await viewer.press('Home');
      await viewer.press('End');
      await expect.poll(() => viewer.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
      await page.getByRole('button', { name: 'Document versions' }).click();
      await page.getByRole('button', { name: 'View', exact: true }).last().click();
      await expect(viewer.locator('canvas')).toHaveCount(2);
      await expect(actions.getByRole('button', { name: 'Record payment' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Delivery history' })).toBeVisible();
      await page.getByRole('button', { name: 'Delivery history' }).click();
      await expect(page.getByText(/Accepted by email provider/)).toBeVisible();
      await selectStaff(page, 'Synthetic Employee B');
      await expect(viewer.locator('canvas')).toHaveCount(2);
      await expect(actions.getByRole('button', { name: 'Print', exact: true })).toBeEnabled();
      await expect(page.getByRole('combobox', { name: 'PDF zoom' })).toContainText('Fit width');
      await expect.poll(() => viewer.evaluate((el) => el.scrollTop)).toBe(0);
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <= window.innerWidth &&
            document.body.scrollWidth <= window.innerWidth &&
            document.body.scrollHeight <= window.innerHeight
        )
      ).toBe(true);
      await page.screenshot({
        path: `.artifacts/salary-documents/${width}-${theme}.png`,
        fullPage: true,
      });
    });
  });
});

test('keeps controls available through PDF loading, failure and retry', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/payslip-documents/*/pdf', async (route) => {
    await pending;
    await route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
  });
  await page.goto('/');
  await selectStaff(page);
  await expect(page.getByLabel('Loading payslip', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Print', exact: true })).toBeDisabled();
  await expect(page.getByRole('combobox', { name: 'Staff member' })).toBeEnabled();
  release();
  await expect(page.getByText('The payslip PDF could not be loaded.')).toBeVisible();
  await page.unroute('**/payslip-documents/*/pdf');
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(
    page.getByRole('region', { name: 'Payslip PDF viewer' }).locator('canvas')
  ).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Print', exact: true })).toBeEnabled();
});
