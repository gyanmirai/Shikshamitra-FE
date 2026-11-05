/* eslint-disable no-restricted-syntax -- Enumerate viewport and theme test cases. */
import { test, expect } from '@playwright/test';

for (const size of [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
]) {
  for (const theme of ['light', 'dark']) {
    test(`dependency review ${size.width} ${theme}`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.goto(`/?theme=${theme}`);
      await page.getByRole('button', { name: 'Review archive' }).click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toContainText('DM Salary Template');
      await expect(dialog).toContainText('2026-01-01 to 2026-12-31');
      await expect(dialog.getByRole('button', { name: 'Archive policy' })).toBeDisabled();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBe(true);
      await dialog.getByRole('button', { name: 'Cancel' }).click();
      await expect(dialog).not.toBeVisible();
      expect(await page.locator('body').getAttribute('data-requests')).toBeNull();
    });
  }
}
test('failed review retries and successful archive is explicit and locked', async ({ page }) => {
  await page.goto('/?scenario=failed');
  await page.getByRole('button', { name: 'Review archive' }).click();
  await expect(page.getByRole('button', { name: 'Archive policy' })).toBeDisabled();
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByText('No live salary templates select this policy.')).toBeVisible();
  await page.getByRole('button', { name: 'Archive policy' }).click();
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  expect(await page.locator('body').getAttribute('data-requests')).toBe('1');
  expect(JSON.parse((await page.locator('body').getAttribute('data-payload'))!)).toEqual({
    id: 'p1',
    concurrencyStamp: 'reviewed',
    confirmed: true,
  });
});
test('stale mutation keeps review open with an error', async ({ page }) => {
  await page.goto('/?scenario=stale');
  await page.getByRole('button', { name: 'Review archive' }).click();
  await page.getByRole('button', { name: 'Archive policy' }).click();
  await expect(page.getByRole('alert')).toContainText('Dependencies changed');
  await expect(page.getByRole('dialog')).toBeVisible();
});
