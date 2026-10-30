/* eslint-disable no-restricted-syntax -- Each viewport/theme case is a distinct regression check. */
import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    test(`in-form sibling review at ${viewport.width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/?long');
      if (theme === 'dark') await page.getByRole('button', { name: 'Change theme' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-mui-color-scheme', theme);
      await expect(page.getByRole('heading', { name: 'Existing Family Found' })).toBeVisible();
      await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
      const toggle = page.getByRole('button', { name: 'Different family?' });
      const reason = page.getByRole('textbox', { name: 'Reason for creating a separate family' });
      await expect(reason).toHaveCount(0);
      await toggle.focus();
      await page.keyboard.press('Enter');
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(page.getByRole('button', { name: 'Create separate family' })).toBeDisabled();
      await reason.fill('Two different families share the contact number.');
      await toggle.click();
      await expect(reason).toHaveCount(0);
      await toggle.click();
      await expect(reason).toHaveValue('Two different families share the contact number.');
      await toggle.click();
      await page.getByRole('button', { name: 'Add sibling', exact: true }).click();
      await expect(page.getByText('Select a parent.', { exact: true })).toBeVisible();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await page.getByRole('combobox', { name: 'Parent', exact: false }).click();
      await page.getByRole('option', { name: /Father · QA Father/ }).click();
      await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBeTruthy();
      await page.screenshot({
        path: `.artifacts/add-sibling-20261029/sibling-${viewport.width}-${theme}.png`,
        fullPage: true,
        animations: 'disabled',
      });
      await page.getByRole('button', { name: 'Add sibling', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: 'Add Sibling?' });
      await expect(dialog).toBeVisible();
      await expect(page.getByLabel('Sibling confirmations')).toHaveText('0');
      await dialog.getByRole('button', { name: 'Add sibling' }).click();
      await expect(page.getByLabel('Sibling confirmations')).toHaveText('1');
      await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
      await expect(dialog.getByRole('button', { name: 'Add sibling' })).toBeDisabled();
      await expect(dialog).toHaveCount(0);
      await expect(page.getByLabel('Sibling confirmations')).toHaveText('1');
      await page.getByRole('button', { name: 'Open inquiry' }).click();
      await expect(page.getByLabel('Opened inquiry')).toHaveText('synthetic-inquiry-1');
    });
  }
}

test('multiple matches keep one reason action, and unavailable parents cannot link', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?multi&noParents');
  await expect(page.getByRole('heading', { name: 'Possible Family Matches' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Different family?' })).toHaveCount(1);
  await Promise.all(
    (await page.getByRole('button', { name: 'Add sibling', exact: true }).all()).map((button) =>
      expect(button).toBeDisabled()
    )
  );
  await page.getByRole('button', { name: 'Different family?' }).click();
  await page
    .getByRole('textbox', { name: 'Reason for creating a separate family' })
    .fill('Unrelated family confirmed by staff.');
  await page.getByRole('button', { name: 'Create separate family' }).click();
  await expect(page.getByLabel('Separate family submissions')).toHaveText('1');
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
  ).toBeTruthy();
  await page.goto('/?denied');
  await expect(page.getByRole('button', { name: 'Add sibling', exact: true })).toBeDisabled();
  await expect(page.getByText(/not available for linking/)).toBeVisible();
});

test('email-only family match retains the different-mobile confirmation', async ({ page }) => {
  await page.goto('/?emailOnly');
  await page.getByRole('combobox', { name: 'Parent', exact: false }).click();
  await page.getByRole('option', { name: /Father · QA Father/ }).click();
  await page.getByRole('button', { name: 'Add sibling', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Add Sibling?' });
  await expect(dialog.getByText(/entered mobile differs/)).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByLabel('Sibling confirmations')).toHaveText('0');
});
