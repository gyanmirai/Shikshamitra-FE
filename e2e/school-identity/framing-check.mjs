import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const output = '.artifacts/school-identity/framing';
await mkdir(output, { recursive: true });
const makePng = async (width, height) => Buffer.from(await page.evaluate(([w, h]) => {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#336699'; ctx.fillRect(0, 0, w / 2, h);
  ctx.fillStyle = '#ffcc00'; ctx.fillRect(w / 2, 0, w / 2, h);
  return canvas.toDataURL('image/png').split(',')[1];
}, [width, height]), 'base64');
const file = (buffer, name = 'test.png') => ({ name, mimeType: 'image/png', buffer });
const open = async (query = '') => {
  await page.goto(`http://127.0.0.1:4319/?${query}`);
  await page.getByRole('button', { name: query ? 'Edit override' : 'Edit school defaults', exact: true }).click();
  return page.getByRole('dialog').filter({ hasText: query ? 'Edit School Identity Override' : 'Edit School Defaults' });
};
try {
  let editor = await open('scope=overrides&academicYearId=year-26&boardId=year-26-CBSE&mediumId=year-26-CBSE-en');
  await expect(editor.getByText('Academic year: 2026-2027 · Board: CBSE · Medium: English')).toBeVisible();
  await page.screenshot({ path: `${output}/override-context.png` });
  await editor.getByRole('button', { name: 'Cancel', exact: true }).click();
  editor = await open('scope=overrides&academicYearId=year-26&boardId=year-26-CBSE');
  await expect(editor.getByText('Academic year: 2026-2027 · Board: CBSE · Medium: All mediums')).toBeVisible();
  await editor.getByRole('button', { name: 'Cancel', exact: true }).click();
  editor = await open();
  await page.evaluate(() => {
    const original = window.fetch;
    window.__identityUploads = 0;
    window.fetch = (input, init) => {
      const request = new Request(input instanceof Request ? input.clone() : input, init);
      if (request.method === 'POST' && new URL(request.url).pathname.endsWith('/school-identity/assets')) window.__identityUploads++;
      return original(input, init);
    };
  });
  await expect(editor.getByText('Editing school defaults', { exact: true })).toBeVisible();
  const count = 0;
  const minimums = [['logo', 32, 32], ['banner', 1400, 300], ['signature', 32, 32]];
  for (const [kind, width, height] of minimums) {
    const section = editor.locator(`[data-identity-kind="${kind}"]`);
    for (const [w, h] of [[width - 1, height], [width, height - 1]]) {
      await section.locator('input[type=file]').setInputFiles(file(await makePng(w, h)));
      await expect(section.getByRole('alert')).toContainText(`at least ${width} × ${height} px`);
      await expect(editor.getByRole('button', { name: 'Submit', exact: true })).toBeDisabled();
    }
    await section.locator('input[type=file]').setInputFiles(file(await makePng(width, height)));
    const frame = page.getByRole('dialog', { name: 'Adjust Image in Frame', exact: true });
    await expect(frame).toBeVisible();
    await frame.getByRole('button', { name: 'Cancel', exact: true }).click();
  }
  expect(await page.evaluate(() => window.__identityUploads)).toBe(count);
  console.log('PASS context, minimum width/height, exact boundaries and cancelled frames');
  const logo = editor.locator('[data-identity-kind="logo"]');
  await logo.locator('input[type=file]').setInputFiles(file(await makePng(200, 100), 'two-colors.png'));
  let frame = page.getByRole('dialog', { name: 'Adjust Image in Frame', exact: true });
  const fit = frame.getByRole('combobox', { name: 'Image fit' });
  await fit.click();
  await page.getByRole('option', { name: 'Fill frame (crop edges)', exact: true }).click();
  await frame.getByRole('slider', { name: 'Horizontal position' }).focus();
  await page.keyboard.press('End');
  await frame.getByRole('slider', { name: 'Zoom' }).focus();
  await page.keyboard.press('ArrowRight');
  await frame.getByRole('slider', { name: 'Vertical position' }).focus();
  await page.keyboard.press('Home');
  await frame.getByRole('button', { name: 'Reset image position', exact: true }).click();
  await expect(fit).toHaveText('Fit entire image');
  await expect(frame.getByRole('slider', { name: 'Zoom' })).toHaveAttribute('aria-valuenow', '1');
  await frame.screenshot({ path: `${output}/logo-frame-desktop.png` });
  const a11y = await new AxeBuilder({ page }).include('[role=dialog]').analyze();
  expect(a11y.violations).toEqual([]);
  await frame.getByRole('button', { name: 'Use framed image', exact: true }).click();
  await expect(logo.getByText('two-colors-framed.png', { exact: true })).toBeVisible();
  const pixels = await logo.locator('img').evaluate(async (img) => {
    await img.decode();
    const canvas = document.createElement('canvas'); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
    return { width: img.naturalWidth, height: img.naturalHeight,
      top: [...ctx.getImageData(0, 0, 1, 1).data], left: [...ctx.getImageData(0, 128, 1, 1).data], right: [...ctx.getImageData(255, 128, 1, 1).data] };
  });
  expect(pixels).toEqual({ width: 256, height: 256, top: [0, 0, 0, 0], left: [51, 102, 153, 255], right: [255, 204, 0, 255] });
  expect(await page.evaluate(() => window.__identityUploads)).toBe(count + 1);
  await expect(editor.getByRole('button', { name: 'Submit', exact: true })).toBeEnabled();
  await logo.getByRole('button', { name: 'Adjust image in frame' }).click();
  frame = page.getByRole('dialog', { name: 'Adjust Image in Frame', exact: true });
  await expect(frame.getByText(/256 × 256 px/)).toBeVisible();
  await frame.getByRole('button', { name: 'Cancel', exact: true }).click();
  await editor.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  console.log('PASS fit/fill, keyboard zoom/position, reset, accessible frame, upload, re-adjust and save');
  for (const [width, height] of [[390, 844], [768, 1024], [1440, 900]]) {
    await page.setViewportSize({ width, height });
    for (const dark of [false, true]) {
      editor = await open();
      if (dark) {
        await editor.getByRole('button', { name: 'Cancel', exact: true }).click();
        await page.getByRole('button', { name: 'Switch theme' }).click();
        await page.getByRole('button', { name: 'Edit school defaults', exact: true }).click();
      }
      await editor.locator('[data-identity-kind="banner"] input[type=file]').setInputFiles(file(await makePng(1400, 600), 'banner.png'));
      frame = page.getByRole('dialog', { name: 'Adjust Image in Frame', exact: true });
      await expect(frame).toBeVisible();
      expect(await frame.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
      await expect(frame.getByRole('button', { name: 'Use framed image', exact: true })).toBeInViewport();
      await frame.screenshot({ path: `${output}/banner-${width}-${dark ? 'dark' : 'light'}.png` });
      await frame.getByRole('button', { name: 'Cancel', exact: true }).click();
      await editor.getByRole('button', { name: 'Cancel', exact: true }).click();
    }
  }
  expect(errors).toEqual([]);
  console.log('PASS desktop/tablet/mobile, both themes, no horizontal overflow or runtime errors');
} finally { await browser.close(); }
