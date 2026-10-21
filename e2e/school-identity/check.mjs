import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const output = new URL('../../.artifacts/school-identity/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const results = [];
const check = async (name, action) => {
  await action(); results.push({ name, status: 'passed' }); console.log(`PASS ${name}`);
};
const choose = async (label, option, scope = page) => {
  await scope.getByRole('combobox', { name: label }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
};
try {
  await page.goto('http://127.0.0.1:4319/');
  await expect(page.getByRole('button', { name: 'Edit school defaults', exact: true })).toBeEnabled();
  await check('saved defaults render and editing changes only the selected asset', async () => {
    await page.getByRole('button', { name: 'Edit school defaults', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await choose('School banner / letterhead setting', 'Do not display', dialog);
    await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText('Do not display', { exact: true })).toBeVisible();
    await expect(page.getByRole('img', { name: 'School logo', exact: true })).toBeVisible();
  });
  await check('invalid principal details focus the field that needs correction', async () => {
    await page.getByRole('button', { name: 'Edit school defaults', exact: true }).click();
    const dialog = page.getByRole('dialog');
    const name = dialog.getByRole('textbox', { name: 'Principal’s name', exact: true });
    await name.fill('P'.repeat(129));
    await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(name).toBeFocused();
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    page.once('dialog', prompt => prompt.accept());
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(dialog).not.toBeVisible();
  });
  await check('preview opens a real backend-generated PDF and downloads the same bytes', async () => {
    await page.getByRole('button', { name: 'Preview document', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'School Identity Preview', exact: true });
    await expect(dialog.locator('iframe[title="School Identity PDF preview"]')).toBeVisible();
    const downloadEvent = page.waitForEvent('download');
    await dialog.getByRole('link', { name: 'Download preview', exact: true }).click();
    const download = await downloadEvent;
    await download.saveAs(fileURLToPath(new URL('browser-preview.pdf', output)));
    await dialog.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(dialog).not.toBeVisible();
  });
  await check('upload remains a draft and cancellation preserves saved choices', async () => {
    await page.getByRole('button', { name: 'Edit school defaults', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await choose('School banner / letterhead setting', 'Use custom asset', dialog);
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aRZkAAAAASUVORK5CYII=', 'base64');
    await dialog.locator('input[type=file]').nth(1).setInputFiles({ name: 'synthetic-banner.png', mimeType: 'image/png', buffer: png });
    await expect(dialog.getByRole('img', { name: 'School banner / letterhead', exact: true })).toBeVisible();
    page.once('dialog', prompt => prompt.accept());
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText('Do not display', { exact: true })).toBeVisible();
  });
  await check('conflict preserves draft and supports a subsequent successful save', async () => {
    await page.getByRole('button', { name: 'Simulate next save conflict', exact: true }).click();
    await page.getByRole('button', { name: 'Edit school defaults', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await choose('School banner / letterhead setting', 'No image configured', dialog);
    await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(dialog.getByRole('alert')).toContainText('changed since you opened');
    await expect(dialog.getByRole('combobox', { name: 'School banner / letterhead setting' })).toContainText('No image configured');
    await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(dialog).not.toBeVisible();
  });
  await check('failed replacement upload preserves the original image and allows cancellation', async () => {
    await page.getByRole('button', { name: 'Simulate next upload error', exact: true }).click();
    await page.getByRole('button', { name: 'Edit school defaults', exact: true }).click();
    const dialog = page.getByRole('dialog');
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aRZkAAAAASUVORK5CYII=', 'base64');
    await dialog.locator('input[type=file]').first().setInputFiles({ name: 'synthetic-logo.png', mimeType: 'image/png', buffer: png });
    await expect(dialog.getByRole('alert')).toContainText('could not be uploaded');
    await expect(dialog.getByRole('img', { name: 'School logo', exact: true })).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(dialog).not.toBeVisible();
  });
  await check('copy across years and reset keep effective inheritance visible', async () => {
    await page.getByRole('tab', { name: 'Board, medium & organization overrides' }).click();
    await choose('Board', 'GSEB');
    await page.getByRole('button', { name: 'More actions', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Copy from another year' }).click();
    const dialog = page.getByRole('dialog');
    await choose('Academic year', '2025-2026', dialog);
    await choose('Board', 'GSEB', dialog);
    await dialog.getByRole('button', { name: 'Copy overrides', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText('Do not display', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'More actions', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Reset to inherited', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Reset to inherited', exact: true }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('No image configured', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'View history', exact: true }).click();
    await expect(page.getByRole('dialog')).toContainText('Configuration updated');
    await page.getByRole('dialog').getByRole('button', { name: 'close', exact: true }).click();
  });
  await check('phone tablet and desktop layouts remain contained in both themes', async () => {
    for (const [width, height] of [[390, 844], [768, 1024], [1440, 900]]) {
      await page.setViewportSize({ width, height });
      for (const mode of ['light', 'dark']) {
        await page.evaluate(mode => document.documentElement.setAttribute('data-mui-color-scheme', mode), mode);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        expect(overflow).toBe(false);
        await page.screenshot({ path: fileURLToPath(new URL(`identity-${width}-${mode}.png`, output)), fullPage: true });
      }
    }
  });
  await check('read failure exposes retry and restricted editors never receive signature fields', async () => {
    await page.goto('http://127.0.0.1:4319/?failReadOnce&signatureRestricted');
    await expect(page.getByRole('alert').filter({ hasText: 'could not be loaded' })).toBeVisible();
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(page.getByText('Signature access is restricted', { exact: true })).toBeVisible();
    await expect(page.getByText('Synthetic Principal', { exact: false })).not.toBeVisible();
    await page.getByRole('button', { name: 'Edit school defaults', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('combobox', { name: 'Principal’s signature setting' })).toHaveCount(0);
    await dialog.getByRole('button', { name: 'close', exact: true }).press('Escape');
    await expect(dialog).not.toBeVisible();
  });
  expect(errors).toEqual([]);
  await check('backend read-only capability hides writes despite frontend action grants', async () => {
    await page.goto('http://127.0.0.1:4319/?readOnly');
    await expect(page.getByRole('alert').filter({ hasText: 'Editing requires management access' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit school defaults', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'View history', exact: true })).toBeEnabled();
  });
  expect(errors).toEqual([]);
  await writeFile(new URL('browser-tests.json', output), JSON.stringify({ results, errors }, null, 2));
} finally { await browser.close(); }
