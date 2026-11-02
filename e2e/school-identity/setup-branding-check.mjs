import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const output = '.artifacts/setup-school-identity';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
try {
  await page.goto('http://127.0.0.1:4519/?setup&empty');
  await expect(page.getByText('SYNTHETIC_SCHOOL', { exact: true })).toBeVisible();
  const brands = page.getByRole('link', { name: 'SYNTHETIC_SCHOOL home' });
  await expect(brands).toHaveCount(2);
  await expect(brands.locator('svg')).toHaveCount(2);
  await page.getByRole('button', { name: 'Edit school defaults', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: /Edit School Defaults/ });
  await dialog.getByRole('combobox', { name: 'School logo setting' }).click();
  await page.getByRole('option', { name: 'Use custom asset', exact: true }).click();
  const png = Buffer.from(await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#336699'; context.fillRect(0, 0, 256, 256);
    return canvas.toDataURL('image/png').split(',')[1];
  }), 'base64');
  await writeFile(`${output}/synthetic-logo.png`, png);
  await dialog.locator('[data-identity-kind="logo"] input[type=file]').setInputFiles({ name: 'synthetic-logo.png', mimeType: 'image/png', buffer: png });
  await page.getByRole('dialog', { name: 'Adjust Image in Frame', exact: true }).getByRole('button', { name: 'Use framed image', exact: true }).click();
  await expect(dialog.locator('[data-identity-kind="logo"] img')).toBeVisible();
  await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(brands.getByRole('img', { name: 'School logo', exact: true })).toHaveCount(2);
  await page.screenshot({ path: `${output}/desktop-saved.png` });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Edit school defaults', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `${output}/mobile-saved.png` });
  await page.getByRole('button', { name: 'Edit school defaults', exact: true }).click();
  await dialog.getByRole('combobox', { name: 'School logo setting' }).click();
  await page.getByRole('option', { name: 'No image configured', exact: true }).click();
  await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(brands.locator('svg')).toHaveCount(2);
  expect(errors).toEqual([]);
  await writeFile(`${output}/browser-results.json`, JSON.stringify({ passed: ['default icon', 'school code', 'upload and submit', 'expanded and compact saved logo', 'mobile edit and cancel', 'removed logo fallback'], errors }, null, 2));
  console.log('PASS setup identity upload, school-code branding, fallback and mobile controls');
} finally {
  await browser.close();
}
