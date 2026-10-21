import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ headless: true });
const browserContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await browserContext.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const origin = 'http://127.0.0.1:4319';
const choose = async (label, option, scope = page) => {
  await scope.getByRole('combobox', { name: label, exact: true }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
};
try {
  await page.goto(`${origin}/?scope=overrides`);
  await choose('Board', 'GSEB');
  await expect(page.getByRole('combobox', { name: 'Organization', exact: true })).toBeDisabled();
  await choose('Medium', 'Gujarati');
  await choose('Organization', 'Primary');
  await expect(page).toHaveURL(/organizationId=year-26-GSEB-0-Primary/);
  await expect(page.getByRole('button', { name: 'Edit organization images' })).toBeEnabled();
  await page.getByRole('button', { name: 'Edit organization images' }).click();
  let dialog = page.getByRole('dialog', { name: 'Edit Organization Images', exact: true });
  await choose('School banner / letterhead setting', 'Use custom asset', dialog);
  const png = Buffer.from(await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1400; canvas.height = 300;
    return canvas.toDataURL('image/png').split(',')[1];
  }), 'base64');
  await dialog.locator('input[type=file]').setInputFiles({ name: 'organization.png', mimeType: 'image/png', buffer: png });
  await page.getByRole('dialog', { name: 'Adjust Image in Frame', exact: true })
    .getByRole('button', { name: 'Use framed image', exact: true }).click();
  await expect(dialog.getByRole('img', { name: 'School banner / letterhead', exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText('Organization override', { exact: true })).toBeVisible();
  console.log('PASS organization uploads and saves use the selected context');

  await choose('Organization', 'Secondary');
  await expect(page.getByText('Organization override', { exact: true })).toHaveCount(0);
  await choose('Organization', 'Primary');
  await expect(page.getByText('Organization override', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'View history', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Configuration updated');
  await page.getByRole('dialog').getByRole('button', { name: 'close', exact: true }).click();
  console.log('PASS sibling organizations remain independent and history loads');

  await page.getByRole('button', { name: 'More actions', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Reset to inherited', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reset to inherited', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText('Organization override', { exact: true })).toHaveCount(0);
  console.log('PASS reset restores inherited images');

  await choose('Medium', 'English');
  await expect(page.getByRole('combobox', { name: 'Organization', exact: true })).toContainText('All organizations');
  expect(new URL(page.url()).searchParams.has('organizationId')).toBe(false);
  await choose('Organization', 'Primary');
  await choose('Academic year', '2025-2026');
  expect(new URL(page.url()).searchParams.has('organizationId')).toBe(false);
  console.log('PASS changing medium or year clears the organization');

  await page.goto(`${origin}/?scope=overrides&boardId=year-26-GSEB&mediumId=year-26-GSEB-gu&organizationId=year-26-GSEB-0-Primary`);
  await expect(page.getByRole('button', { name: 'Edit organization images' })).toBeEnabled();
  await page.getByRole('combobox', { name: 'Organization', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('combobox', { name: 'Organization', exact: true })).toContainText('Secondary');
  await choose('Organization', 'Primary');
  const accessibility = await new AxeBuilder({ page }).include('section:has(#identity-context-heading)').analyze();
  expect(accessibility.violations).toEqual([]);
  console.log('PASS keyboard organization selection and context accessibility');
  await mkdir('.artifacts/school-identity', { recursive: true });
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const mode of ['light', 'dark']) {
      if (mode === 'dark') await page.getByRole('button', { name: 'Switch theme', exact: true }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `.artifacts/school-identity/organization-${width}-${mode}.png`, fullPage: true });
      if (mode === 'dark') await page.getByRole('button', { name: 'Switch theme', exact: true }).click();
    }
  }
  expect(errors).toEqual([]);
  console.log('PASS deep links and phone, tablet, desktop layouts in both themes; no page errors');
  await page.goto(`${origin}/?organizationName`);
  const nameDialog = page.getByRole('dialog', { name: 'Edit Stage Primary', exact: true });
  await expect(nameDialog.getByRole('textbox', { name: 'Stage name' })).toHaveValue('Primary');
  await expect(nameDialog.locator('input[type=file]')).toHaveCount(0);
  await expect(nameDialog.getByRole('button', { name: /banner/i })).toHaveCount(0);
  await nameDialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  console.log('PASS organization name dialog has no image uploader');
} finally {
  await browser.close();
}
