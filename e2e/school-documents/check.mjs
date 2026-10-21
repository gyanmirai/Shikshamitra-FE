import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const output = new URL('../../.artifacts/school-documents/', import.meta.url);
await mkdir(output, { recursive: true });
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aRZkAAAAASUVORK5CYII=',
  'base64'
);
const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R 6 0 R] /Count 2 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
];
const content = 'BT /F1 18 Tf 50 780 Td (School Documents - synthetic approval fixture) Tj ET';
objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
objects.push(
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 7 0 R >>'
);
const secondPage = 'BT /F1 18 Tf 50 780 Td (Synthetic approval annexure - page two) Tj ET';
objects.push(`<< /Length ${secondPage.length} >>\nstream\n${secondPage}\nendstream`);
let pdf = '%PDF-1.4\n';
const offsets = [0];
objects.forEach((object, index) => {
  offsets.push(Buffer.byteLength(pdf));
  pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
});
const xref = Buffer.byteLength(pdf);
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
  .slice(1)
  .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
  .join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
await writeFile(new URL('synthetic-approval.pdf', output), pdf);
await writeFile(new URL('synthetic-annexure.png', output), png);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultNavigationTimeout(120000);
const errors = [];
const checks = [];
page.on('pageerror', (error) => errors.push(error.message));
const check = async (name, action) => {
  await action();
  checks.push(name);
  console.log(`PASS ${name}`);
};
const choose = async (scope, label, value) => {
  await scope.getByRole('combobox', { name: new RegExp(`^${label}`) }).click();
  await page.getByRole('option', { name: value, exact: true }).click();
};
const base = 'http://127.0.0.1:4324/';
const name = `Synthetic Approval ${Date.now()}`;
const savedRow = () => page.getByRole('row').filter({ hasText: name });
try {
  await page.goto(base);
  await expect
    .poll(
      async () => {
        try {
          return (await page.request.get(`${base}fixture/health`)).status();
        } catch {
          return 0;
        }
      },
      { timeout: 120000 }
    )
    .toBe(200);
  await check('create with grouped PDF/image attachments and local preview', async () => {
    await page.getByRole('button', { name: 'Add Document', exact: true }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Add School Document', exact: true });
    await dialog.getByRole('textbox', { name: 'Document name' }).fill(name);
    await choose(dialog, 'Category', 'Government Approval');
    await dialog
      .getByRole('textbox', { name: 'Notes', exact: true })
      .fill('Synthetic browser acceptance record.');
    await dialog
      .locator('input[type=file]')
      .setInputFiles({
        name: 'unsupported.html',
        mimeType: 'text/html',
        buffer: Buffer.from('unsupported'),
      });
    await expect(
      dialog.getByText('Select a PDF, JPG, JPEG or PNG file.', { exact: true })
    ).toBeVisible();
    await dialog.locator('input[type=file]').setInputFiles([
      { name: 'approval.pdf', mimeType: 'application/pdf', buffer: Buffer.from(pdf) },
      { name: 'annexure.png', mimeType: 'image/png', buffer: png },
    ]);
    await expect(dialog.getByText(/2 of 5 files selected/)).toBeVisible();
    const previewButton = dialog.getByRole('button', { name: 'Preview approval.pdf', exact: true });
    await previewButton.scrollIntoViewIfNeeded();
    await previewButton.focus();
    await previewButton.click();
    const preview = page.getByRole('dialog', { name: 'approval.pdf', exact: true });
    await expect(
      preview.getByRole('img', { name: 'approval.pdf, page 1', exact: true })
    ).toBeVisible();
    await preview.getByRole('button', { name: 'Next Page', exact: true }).click();
    await expect(
      preview.getByRole('img', { name: 'approval.pdf, page 2', exact: true })
    ).toBeVisible();
    await preview.getByRole('button', { name: 'Zoom In', exact: true }).click();
    await preview.getByRole('button', { name: 'Fit Width', exact: true }).click();
    await preview.getByRole('button', { name: 'Previous Page', exact: true }).click();
    await expect(
      preview.getByRole('img', { name: 'approval.pdf, page 1', exact: true })
    ).toBeVisible();
    await preview.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(dialog.getByRole('textbox', { name: 'Document name' })).toHaveValue(name);
    expect((await page.request.post(`${base}fixture/fail-save`)).ok()).toBe(true);
    await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(dialog.getByText(/request could not be completed/)).toBeVisible();
    await expect(dialog.getByText('approval.pdf', { exact: true })).toBeVisible();
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    await page.route(
      '**/api/institute-setup/school-documents',
      async (route) => {
        await gate;
        await route.continue();
      },
      { times: 1 }
    );
    await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeDisabled();
    await expect(dialog.getByRole('button', { name: 'close', exact: true })).toBeDisabled();
    release();
    await expect(dialog).not.toBeVisible();
    await expect(savedRow()).toBeVisible();
    await page.reload();
    await expect(savedRow()).toBeVisible();
  });
  await check('saved preview retry, image preview, and authenticated download', async () => {
    await savedRow().getByRole('button', { name: 'View', exact: true }).click();
    const view = page.getByRole('dialog', { name: 'School Document', exact: true });
    expect((await page.request.post(`${base}fixture/fail-preview`)).ok()).toBe(true);
    await view.getByRole('button', { name: 'Preview approval.pdf', exact: true }).click();
    const preview = page.getByRole('dialog', { name: 'approval.pdf', exact: true });
    await preview.getByRole('button', { name: 'Retry Preview', exact: true }).click();
    await expect(
      preview.getByRole('img', { name: 'approval.pdf, page 1', exact: true })
    ).toBeVisible();
    await preview.getByRole('button', { name: 'close', exact: true }).click();
    await expect(
      view.getByRole('button', { name: 'Preview approval.pdf', exact: true })
    ).toBeFocused();
    await view.getByRole('button', { name: 'Preview annexure.png', exact: true }).click();
    const image = page.getByRole('dialog', { name: 'annexure.png', exact: true });
    await expect(image.getByRole('img', { name: 'annexure.png', exact: true })).toBeVisible();
    await image.getByRole('button', { name: 'close', exact: true }).click();
    const downloaded = page.waitForEvent('download');
    await view.getByRole('button', { name: 'Download approval.pdf', exact: true }).click();
    const file = await downloaded;
    expect(file.suggestedFilename()).toBe('approval.pdf');
    await file.saveAs(fileURLToPath(new URL('downloaded-approval.pdf', output)));
    await view.getByRole('button', { name: 'Close', exact: true }).click();
  });
  await check('editing removes and adds files atomically and preserves list context', async () => {
    await savedRow().getByRole('button', { name: 'Edit', exact: true }).click();
    const edit = page.getByRole('dialog', { name: 'Edit School Document', exact: true });
    await edit.getByRole('button', { name: 'Remove annexure.png', exact: true }).click();
    await edit
      .locator('input[type=file]')
      .setInputFiles({ name: 'replacement.png', mimeType: 'image/png', buffer: png });
    await edit
      .getByRole('textbox', { name: 'Notes', exact: true })
      .fill('Replaced the synthetic annexure.');
    await edit.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(edit).not.toBeVisible();
    await page.reload();
    await savedRow().getByRole('button', { name: 'View', exact: true }).click();
    const view = page.getByRole('dialog', { name: 'School Document', exact: true });
    await expect(view.getByText('replacement.png', { exact: true })).toBeVisible();
    await expect(view.getByText('annexure.png', { exact: true })).toHaveCount(0);
    await view.getByRole('button', { name: 'Close', exact: true }).click();
    await page
      .getByRole('textbox', { name: 'Search documents', exact: true })
      .fill('no matching document xyz');
    await expect(
      page.getByText('No results found for “no matching document xyz”', { exact: true })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Clear Filters', exact: true }).click();
    await expect(savedRow()).toBeVisible();
  });
  await check(
    'dirty close uses standard confirmation and keeps the draft until discarded',
    async () => {
      await page.getByRole('button', { name: 'Add Document', exact: true }).first().click();
      const dialog = page.getByRole('dialog', { name: 'Add School Document', exact: true });
      await dialog.getByRole('textbox', { name: 'Document name' }).fill('Unsaved approval');
      await page.keyboard.press('Escape');
      const confirmation = page.getByRole('dialog', {
        name: 'Discard Document Changes?',
        exact: true,
      });
      await confirmation.getByRole('button', { name: 'Keep Editing', exact: true }).click();
      await expect(dialog.getByRole('textbox', { name: 'Document name' })).toHaveValue(
        'Unsaved approval'
      );
      await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
      await confirmation.getByRole('button', { name: 'Discard Changes', exact: true }).click();
      await expect(dialog).not.toBeVisible();
    }
  );
  await check(
    'phone/tablet/desktop layouts and both themes have contained document scrolling',
    async () => {
      for (const dark of [false, true]) {
        if (dark) await page.getByRole('button', { name: 'Switch Theme', exact: true }).click();
        for (const width of [390, 768, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
          ).toBe(true);
          await page.screenshot({
            path: fileURLToPath(new URL(`list-${dark ? 'dark' : 'light'}-${width}.png`, output)),
          });
        }
      }
    }
  );
  await check('read-only and denied access states expose only permitted actions', async () => {
    await page.goto(`${base}?access=view`);
    await expect(savedRow()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Document', exact: true })).toHaveCount(0);
    await expect(savedRow().getByRole('button', { name: 'Edit', exact: true })).toHaveCount(0);
    await savedRow().getByRole('button', { name: 'View', exact: true }).click();
    const view = page.getByRole('dialog', { name: 'School Document', exact: true });
    await expect(
      view.getByRole('button', { name: 'Download approval.pdf', exact: true })
    ).toBeEnabled();
    await view.getByRole('button', { name: 'Close', exact: true }).click();
    await page.goto(`${base}?access=none`);
    await expect(
      page.getByText('You do not have permission to view School Documents.')
    ).toBeVisible();
  });
  await check('deletion confirms the named record and persists after reload', async () => {
    await page.goto(base);
    await savedRow()
      .getByRole('button', { name: `More actions for ${name}`, exact: true })
      .click();
    await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
    const confirmation = page.getByRole('dialog', { name: 'Delete School Document?', exact: true });
    await expect(confirmation.getByText(name, { exact: true })).toBeVisible();
    await confirmation.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(confirmation).not.toBeVisible();
    await page.reload();
    await expect(savedRow()).toHaveCount(0);
  });
  expect(errors).toEqual([]);
  await writeFile(
    new URL('browser-checks.json', output),
    JSON.stringify({ checks, errors }, null, 2)
  );
} catch (error) {
  await page.screenshot({ path: fileURLToPath(new URL('failure.png', output)) });
  await writeFile(
    new URL('failure.txt', output),
    `${error.stack}\n\nPage errors: ${JSON.stringify(errors)}\n\n${await page.locator('body').innerText()}`
  );
  throw error;
} finally {
  await browser.close();
}
