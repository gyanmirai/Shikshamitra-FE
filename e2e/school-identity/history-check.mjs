import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const output = new URL('../../.artifacts/school-identity/history/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const errors = [];
const results = [];
page.on('pageerror', (error) => errors.push(error.message));
const check = async (name, action) => {
  await action();
  results.push({ name, status: 'passed' });
  console.log(`PASS ${name}`);
};
const open = async (query = '') => {
  await page.goto(`http://127.0.0.1:4319/?${query}`);
  await page.getByRole('button', { name: 'View history', exact: true }).click();
  return page.getByRole('dialog', { name: 'School Identity History', exact: true });
};
try {
  await check(
    'saved snapshots are ordered, labeled and readable across widths and themes',
    async () => {
      const dialog = await open('longHistory');
      await expect(dialog.getByRole('listitem')).toHaveCount(12);
      await expect(dialog.getByText('Latest', { exact: true })).toHaveCount(1);
      const dates = await dialog
        .locator('time')
        .evaluateAll((nodes) => nodes.map((node) => Date.parse(node.dateTime)));
      expect(dates).toEqual([...dates].sort((left, right) => right - left));
      await expect(dialog.getByText('School logo', { exact: true })).toHaveCount(12);
      await expect(dialog.getByText('Letterhead', { exact: true })).toHaveCount(12);
      for (const [width, height] of [
        [320, 740],
        [390, 844],
        [768, 1024],
        [1440, 900],
      ]) {
        await page.setViewportSize({ width, height });
        for (const mode of ['light', 'dark']) {
          await page.evaluate(
            (value) => document.documentElement.setAttribute('data-mui-color-scheme', value),
            mode
          );
          await expect
            .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
            .toBe(true);
          await expect
            .poll(() => dialog.evaluate((node) => node.scrollWidth <= node.clientWidth))
            .toBe(true);
          await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeInViewport();
          await expect
            .poll(
              async () =>
                (
                  await new AxeBuilder({ page })
                    .include('[role="dialog"]')
                    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
                    .analyze()
                ).violations,
              { timeout: 10000 }
            )
            .toEqual([]);
          await page.screenshot({
            path: fileURLToPath(new URL(`history-${width}-${mode}.png`, output)),
          });
        }
      }
      await dialog.getByRole('button', { name: 'Close', exact: true }).press('Enter');
      await expect(dialog).not.toBeVisible();
      await expect(page.getByRole('button', { name: 'View history', exact: true })).toBeFocused();
    }
  );
  await check('empty context history is explicit and closes with Escape', async () => {
    const dialog = await open('scope=overrides&academicYearId=year-26&boardId=year-26-CBSE');
    await expect(dialog.getByText('No saved changes yet', { exact: true })).toBeVisible();
    await expect(dialog.getByRole('listitem')).toHaveCount(0);
    await dialog.getByRole('button', { name: 'Close', exact: true }).press('Escape');
    await expect(dialog).not.toBeVisible();
  });
  await check('history errors offer Retry without losing the dialog', async () => {
    const dialog = await open('failHistoryOnce');
    await expect(dialog.getByRole('alert')).toContainText('History could not be loaded.');
    await dialog.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(dialog.getByRole('listitem')).toHaveCount(1);
    await expect(dialog.getByRole('alert')).toHaveCount(0);
    await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  });
  expect(errors).toEqual([]);
  await writeFile(new URL('checks.json', output), JSON.stringify({ results, errors }, null, 2));
} finally {
  await browser.close();
}
