import { test, expect } from '@playwright/test';

test.use({ baseURL: 'http://127.0.0.1:5197', viewport: { width: 1280, height: 900 } });

['Fee', 'Provisional fee', 'Charge', 'Combined', 'Refund', 'Provisional refund'].forEach((name) => {
  test(`renders the ${name.toLowerCase()} document with download and zoom`, async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByRole('button', { name, exact: true }).click();
    await expect(page.getByRole('img', { name: /page 1$/ })).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole('status').filter({ hasText: 'Page 1 of 1' })).toBeVisible();
    const download = page.getByRole('link', { name: 'Download PDF', exact: true });
    await expect(download).toHaveAttribute('download', /\.pdf$/);
    await expect(page.getByRole('button', { name: 'Previous Page', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Next Page', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Zoom In', exact: true }).click();
    await page.getByRole('button', { name: 'Fit Width', exact: true }).click();
    await page.screenshot({ path: testInfo.outputPath('receipt-desktop.png') });
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});

test('keeps a refund document and its actions usable on a phone', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Refund', exact: true }).click();
  await expect(page.getByRole('img', { name: /page 1$/ })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole('link', { name: 'Download PDF', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('receipt-mobile.png') });
});
