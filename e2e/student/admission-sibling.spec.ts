/* eslint-disable no-restricted-syntax -- Each viewport/theme combination is a separate browser regression. */
import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    test(`parent review at ${viewport.width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/?long&siblings');
      if (theme === 'dark') await page.getByRole('button', { name: 'Change theme' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-mui-color-scheme', theme);
      await expect(
        page.getByRole('button', { name: 'Add as Sibling', exact: true })
      ).toBeDisabled();
      await expect(page.getByText(/Separate Family|Different Family/i)).toHaveCount(0);
      await page.getByRole('combobox', { name: 'Parent', exact: false }).click();
      await page.getByRole('option', { name: /Father · QA Father/ }).click();
      const children = page.getByRole('list', { name: 'Children in this family' });
      await expect(children.getByRole('listitem')).toHaveCount(2);
      await expect(children.getByRole('button')).toHaveCount(0);
      await expect(children.getByRole('combobox')).toHaveCount(0);
      await expect(page.getByLabel('Sibling confirmations')).toHaveText('0');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBeTruthy();
      await page.getByRole('button', { name: 'Add as Sibling', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Edit Contact Details' })).toBeDisabled();
      await expect(
        page.getByRole('button', { name: 'Add as Sibling', exact: true })
      ).toBeDisabled();
      await expect(page.getByLabel('Sibling confirmations')).toHaveText('1');
      await expect(page.getByRole('button', { name: 'Add as Sibling', exact: true })).toBeEnabled();
      await expect(page.getByRole('dialog')).toHaveCount(0);
    });
  }
}
test('dialog closes locally for contact editing and preserves the parent draft', async ({
  page,
}) => {
  await page.goto('/?dialog&siblings');
  const dialog = page.getByRole('dialog', { name: 'Check Parent Details' });
  await dialog.getByRole('button', { name: 'Edit Contact Details' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Parent or guardian name' })).toHaveValue(
    'QA Parent'
  );
  await page.getByRole('button', { name: 'Review matches' }).click();
  await expect(dialog).toBeVisible();
});
test('unavailable parents cannot link and have no separate-family bypass', async ({ page }) => {
  await page.goto('/?multi&noParents');
  await expect(page.getByRole('button', { name: 'Add as Sibling' })).toBeDisabled();
  await expect(page.getByText(/No saved Father or Mother/)).toBeVisible();
  await expect(page.getByText(/Separate Family|Different Family/i)).toHaveCount(0);
  await page.goto('/?denied');
  await expect(page.getByRole('button', { name: 'Add as Sibling' })).toBeDisabled();
});
test('email-only matching explains different saved mobile on the review itself', async ({
  page,
}) => {
  await page.goto('/?emailOnly');
  await expect(page.getByText('This email matches a saved parent.')).toBeVisible();
  await page.getByRole('combobox', { name: 'Parent', exact: false }).click();
  await page.getByRole('option', { name: /Father · QA Father/ }).click();
  await expect(page.getByText(/saved mobile is different/)).toBeVisible();
  await expect(page.getByLabel('Sibling confirmations')).toHaveText('0');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
