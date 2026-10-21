import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const base = process.argv[2] ?? 'http://127.0.0.1:4342/';
const output = new URL('../../.artifacts/institute-reports/preview-consistency/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const checks = [];
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const drawer = page.getByRole('dialog', { name: 'Report Preview', exact: true });
const check = async (name, action) => { await action(); checks.push(name); console.log(`PASS ${name}`); };
const open = async (width = 1440, height = 900, dark = false) => {
  await page.setViewportSize({ width, height });
  await page.goto(base);
  if (dark) await page.getByRole('button', { name: 'Switch Theme' }).click();
  await page.getByRole('button', { name: 'Report', exact: true }).click();
  if (width < 1200) {
    await page.getByRole('combobox', { name: 'Report type', exact: true }).click();
    await page.getByRole('option', { name: 'Rooms and buildings inventory', exact: true }).click();
  } else await page.getByText('Rooms and buildings inventory', { exact: true }).first().click();
  await page.getByRole('button', { name: 'Preview report', exact: true }).click();
  await expect(drawer).toBeVisible();
};
try {
  for (const [width, height] of [[390, 844], [768, 1024], [1440, 900]]) {
    for (const dark of [false, true]) await check(`layout, keyboard, help and contrast ${width}px ${dark ? 'dark' : 'light'}`, async () => {
      await open(width, height, dark);
      await expect(drawer.getByRole('status')).toContainText('31 matching rows');
      await expect(drawer.getByRole('table', { name: 'Report Preview table' })).toBeVisible();
      const help = drawer.getByRole('button', { name: 'About Report Preview' });
      await help.focus();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Shift+Tab');
      await expect(page.getByRole('tooltip')).toContainText('saved report filters');
      const titleBox = await drawer.getByRole('heading', { name: 'Report Preview' }).boundingBox();
      const helpBox = await help.boundingBox();
      expect(helpBox.x - titleBox.x - titleBox.width).toBeLessThanOrEqual(10);
      await drawer.getByRole('switch', { name: 'Dense' }).uncheck();
      await drawer.getByRole('switch', { name: 'Dense' }).check();
      const generate = drawer.getByRole('button', { name: 'Generate PDF report' });
      const buttonBox = await generate.boundingBox();
      expect(buttonBox.height).toBe(30);
      expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(width);
      const closeBox = await drawer.getByRole('button', { name: 'Close', exact: true }).boundingBox();
      expect(closeBox.y).toBe(buttonBox.y);
      const scroll = drawer.locator('.simplebar-content-wrapper').first();
      await scroll.evaluate((element) => { element.scrollTop = element.scrollHeight; element.scrollLeft = element.scrollWidth; });
      const after = await generate.boundingBox();
      expect(after.y).toBe(buttonBox.y);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const bounds = await drawer.evaluate((element) => [...element.querySelectorAll('button,[role="combobox"]')].map((control) => control.getBoundingClientRect()).every((rect) => rect.x >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight));
      expect(bounds).toBe(true);
      const a11y = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(a11y.violations).toEqual([]);
      await page.screenshot({ path: fileURLToPath(new URL(`preview-${width}-${dark ? 'dark' : 'light'}.png`, output)) });
      await help.press('Escape');
      await expect(drawer).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Preview report', exact: true })).toBeFocused();
    });
  }
  await check('server pagination, page size and preserved generation request', async () => {
    await open();
    await expect(drawer.getByRole('status')).toContainText('31 matching rows');
    await drawer.getByRole('button', { name: 'Go to next page' }).click();
    await expect(drawer.getByText('26–31 of 31')).toBeVisible();
    await expect(drawer.getByRole('cell', { name: 'Room 26', exact: true })).toBeVisible();
    await drawer.getByRole('combobox', { name: 'Rows per page:' }).click();
    await page.getByRole('option', { name: '10', exact: true }).click();
    await expect(drawer.getByText('1–10 of 31')).toBeVisible();
    const request = page.waitForRequest((item) => item.url().endsWith('/exports') && item.method() === 'POST');
    await drawer.getByRole('button', { name: 'Generate PDF report' }).click();
    expect((await request).postDataJSON()).toMatchObject({ reportType: 'rooms-inventory', page: 1, pageSize: 25, filters: {} });
    await expect(drawer).toHaveCount(0);
  });
  await check('loading, empty records, long content and null values', async () => {
    let release;
    const gate = new Promise((resolve) => { release = resolve; });
    await page.route('**/institute-setup-report/preview', async (route) => {
      await gate;
      await route.fulfill({ json: { reportType: 'Rooms', filterSummary: 'School-wide catalogue', columns: [{ id: 'room', label: 'Room' }], rows: [], totalCount: 0, page: 1, pageSize: 25 } });
    });
    await open(390, 844);
    await expect(drawer.getByRole('status')).toHaveText('Loading report preview...');
    await expect(drawer.getByRole('button', { name: 'Generate PDF report' })).toBeDisabled();
    release();
    await expect(drawer.getByText('No records match the selected report filters.')).toBeVisible();
    await page.unroute('**/institute-setup-report/preview');
    await page.route('**/institute-setup-report/preview', (route) => route.fulfill({ json: { reportType: 'Rooms', filterSummary: 'School-wide catalogue', columns: [{ id: 'room', label: 'Room' }, { id: 'note', label: 'Note' }], rows: [{ room: 'LongBuildingName'.repeat(25), note: null }], totalCount: 1, page: 1, pageSize: 25 } }));
    await open(390, 844);
    await expect(drawer.getByRole('cell', { name: 'Not set', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.unroute('**/institute-setup-report/preview');
  });
  await check('preview failure, retry, generation locks and failure recovery', async () => {
    await page.request.post(base + 'fixture/fail-preview');
    await open();
    await expect(drawer.getByRole('alert')).toContainText('Synthetic preview failure');
    await drawer.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(drawer.getByRole('status')).toContainText('31 matching rows');
    let release;
    const gate = new Promise((resolve) => { release = resolve; });
    await page.route('**/institute-setup-report/exports', async (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      await gate;
      return route.fulfill({ status: 503, json: { error: { message: 'Synthetic generation failure.' } } });
    });
    await drawer.getByRole('button', { name: 'Generate PDF report' }).click();
    for (const name of ['Close', 'Close Report Preview', 'Go to next page', 'Generate PDF report']) await expect(drawer.getByRole('button', { name, exact: true })).toBeDisabled();
    await page.keyboard.press('Escape');
    await expect(drawer).toBeVisible();
    release();
    await expect(page.getByText('Synthetic generation failure.')).toBeVisible();
    await expect(drawer.getByRole('button', { name: 'Close', exact: true })).toBeEnabled();
    await drawer.getByRole('button', { name: 'Close Report Preview', exact: true }).click();
    await expect(drawer).toHaveCount(0);
  });
  expect(errors).toEqual([]);
  await writeFile(new URL('checks.json', output), JSON.stringify({ checks, errors }, null, 2));
} catch (error) {
  await page.screenshot({ path: fileURLToPath(new URL('failure.png', output)) });
  await writeFile(new URL('failure.txt', output), `${error.stack}\n${errors.join('\n')}\n${await page.locator('body').innerText()}`);
  throw error;
} finally { await browser.close(); }
