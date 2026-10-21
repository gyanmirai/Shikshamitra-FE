import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const output = new URL('../../.artifacts/school-identity/upload/', import.meta.url);
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
const openEditor = async (query = '') => {
  await page.goto(`http://127.0.0.1:4319/?${query}`);
  await page.getByRole('button', { name: 'Edit school defaults', exact: true }).click();
  return page.getByRole('dialog');
};
const png = Buffer.from(await page.evaluate(() => {
  const canvas = document.createElement('canvas');
  canvas.width = 32; canvas.height = 32;
  return canvas.toDataURL('image/png').split(',')[1];
}), 'base64');
const applyFrame = () => page.getByRole('dialog', { name: 'Adjust Image in Frame', exact: true })
  .getByRole('button', { name: 'Use framed image', exact: true }).click();
try {
  await check(
    'invalid formats and each size limit reject files without changing the draft',
    async () => {
      const dialog = await openEditor();
      for (const [kind, limit] of [
        ['logo', 2],
        ['banner', 5],
        ['signature', 1],
      ]) {
        const section = dialog.locator(`[data-identity-kind="${kind}"]`);
        await section.locator('input[type=file]').setInputFiles({
          name: 'large.png',
          mimeType: 'image/png',
          buffer: Buffer.alloc(limit * 1024 * 1024 + 1),
        });
        await expect(section.getByRole('alert')).toHaveText(
          `Choose an image no larger than ${limit} MB.`
        );
        await expect(section.getByRole('button', { name: /^Replace / })).toHaveAttribute(
          'aria-invalid',
          'true'
        );
        await expect(section.getByRole('img')).toBeVisible();
      }
      const logo = dialog.locator('[data-identity-kind="logo"]');
      await logo.locator('input[type=file]').setInputFiles({
        name: 'document.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('test'),
      });
      await expect(logo.getByRole('alert')).toHaveText('Choose a PNG or JPG image.');
      await expect(dialog.getByRole('button', { name: 'Submit', exact: true })).toBeDisabled();
      await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    }
  );
  await check(
    'keyboard browsing uploads one image, updates the filename, clears rejection, and supports reselection',
    async () => {
      const dialog = await openEditor();
      const section = dialog.locator('[data-identity-kind="logo"]');
      await section.locator('input[type=file]').setInputFiles({
        name: 'bad.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('test'),
      });
      await expect(section.getByRole('alert')).toBeVisible();
      const pickerEvent = page.waitForEvent('filechooser');
      await section.getByRole('button', { name: 'Replace logo', exact: true }).press('Enter');
      const picker = await pickerEvent;
      expect(picker.isMultiple()).toBe(false);
      await picker.setFiles({ name: 'test-logo.png', mimeType: 'image/png', buffer: png });
      await applyFrame();
      await expect(section.getByText('test-logo-framed.png', { exact: true })).toBeVisible();
      await expect(section.getByRole('alert')).toHaveCount(0);
      await section
        .locator('input[type=file]')
        .setInputFiles({ name: 'test-logo.png', mimeType: 'image/png', buffer: png });
      await applyFrame();
      await expect(dialog.getByRole('button', { name: 'Submit', exact: true })).toBeEnabled();
      page.once('dialog', (prompt) => prompt.accept());
      await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
      await expect(dialog).not.toBeVisible();
      await page.getByRole('button', { name: 'Edit school defaults', exact: true }).click();
      await expect(page.getByRole('dialog').getByText('test-logo-framed.png')).toHaveCount(0);
      await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
    }
  );
  await check('drag and drop rejects multiple files and accepts a valid image', async () => {
    const dialog = await openEditor();
    const target = dialog.getByRole('group', { name: 'School logo upload', exact: true });
    const drop = async (names) => {
      const transfer = await page.evaluateHandle(({ files, bytes }) => {
        const data = new DataTransfer();
        files.forEach((name) =>
          data.items.add(
            new File(
              [
                Uint8Array.from(bytes),
              ],
              name,
              { type: 'image/png' }
            )
          )
        );
        return data;
      }, { files: names, bytes: [...png] });
      await target.dispatchEvent('drop', { dataTransfer: transfer });
      await transfer.dispose();
    };
    await drop(['one.png', 'two.png']);
    await expect(dialog.getByRole('alert')).toHaveText('Choose one image at a time.');
    await drop(['dropped-logo.png']);
    await applyFrame();
    await expect(dialog.getByText('dropped-logo-framed.png')).toBeVisible();
    await expect(dialog.getByRole('alert')).toHaveCount(0);
    page.once('dialog', (prompt) => prompt.accept());
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  });
  await check(
    'empty and populated upload dialogs fit phones, tablets and desktops in both themes',
    async () => {
      for (const state of ['populated', 'empty']) {
        const dialog = await openEditor(state === 'empty' ? 'empty' : '');
        if (state === 'empty') {
          for (const label of [
            'School logo',
            'School banner / letterhead',
            'Principal’s signature',
          ]) {
            await dialog.getByRole('combobox', { name: `${label} setting`, exact: true }).click();
            await page.getByRole('option', { name: 'Use custom asset', exact: true }).click();
          }
        }
        for (const [width, height] of [
          [320, 740],
          [390, 844],
          [768, 1024],
          [1440, 900],
        ]) {
          await page.setViewportSize({ width, height });
          for (const mode of ['light', 'dark']) {
            await page.evaluate(
              (theme) => document.documentElement.setAttribute('data-mui-color-scheme', theme),
              mode
            );
            await expect
              .poll(() => dialog.evaluate((node) => node.scrollWidth <= node.clientWidth))
              .toBe(true);
            await expect
              .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
              .toBe(true);
            await expect(
              dialog.getByRole('button', { name: 'Cancel', exact: true })
            ).toBeInViewport();
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
              path: fileURLToPath(new URL(`${state}-${width}-${mode}.png`, output)),
            });
          }
        }
        if (state === 'empty') page.once('dialog', (prompt) => prompt.accept());
        await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
      }
    }
  );
  expect(errors).toEqual([]);
  await writeFile(new URL('checks.json', output), JSON.stringify({ results, errors }, null, 2));
} finally {
  await browser.close();
}
