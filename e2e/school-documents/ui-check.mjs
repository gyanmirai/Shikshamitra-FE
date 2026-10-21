import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const base = 'http://127.0.0.1:4324/';
const output = new URL('../../.artifacts/school-documents/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
const checks = [];
page.on('pageerror', (error) => errors.push(error.message));
const check = async (name, action) => {
  await action();
  checks.push(name);
  console.log(`PASS ${name}`);
};
const name = `Synthetic UI check ${Date.now()}`;
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aRZkAAAAASUVORK5CYII=',
  'base64'
);
const created = await page.request.post(`${base}api/institute-setup/school-documents`, {
  multipart: {
    name,
    category: '0',
    notes: 'Disposable UI validation record.',
    files: { name: 'approval.png', mimeType: 'image/png', buffer: png },
  },
});
expect(created.ok()).toBe(true);
const document = await created.json();
const row = () => page.getByRole('row').filter({ hasText: name });
const card = () => page.getByTestId('school-documents');
try {
  await page.goto(base);
  await expect(row()).toBeVisible();
  await check('Columns, Fullscreen, density, and contextual adaptive row actions', async () => {
    await card().getByRole('button', { name: 'Columns', exact: true }).click();
    await expect(page.getByRole('checkbox', { name: 'Uploaded By', exact: true })).toBeVisible();
    await page.getByRole('checkbox', { name: 'Uploaded By', exact: true }).uncheck();
    await expect(
      card().getByRole('columnheader', { name: 'Uploaded By', exact: true })
    ).toHaveCount(0);
    await page.getByRole('checkbox', { name: 'Uploaded By', exact: true }).check();
    await page.keyboard.press('Escape');
    await card().getByRole('button', { name: 'Full screen', exact: true }).click();
    await page.getByRole('button', { name: 'Exit full screen', exact: true }).click();
    await card().getByRole('switch', { name: 'Dense', exact: true }).uncheck();
    await card().getByRole('switch', { name: 'Dense', exact: true }).check();
    await expect(row().getByRole('button', { name: `View ${name}`, exact: true })).toBeVisible();
    await expect(row().getByRole('button', { name: `Edit ${name}`, exact: true })).toBeVisible();
    await expect(row().getByRole('button', { name: 'Delete', exact: true })).toHaveCount(0);
    await row()
      .getByRole('button', { name: `More actions for ${name}`, exact: true })
      .click();
    await expect(page.getByRole('menuitem', { name: 'Delete', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
  });
  await check(
    'category header filter, selector, URL, chips, and search stay synchronized',
    async () => {
      await page.getByRole('combobox', { name: /^Category/ }).click();
      await page.getByRole('option', { name: 'Board Affiliation', exact: true }).click();
      await expect(row()).toHaveCount(0);
      await expect(page).toHaveURL(/category=2/);
      await card().getByRole('button', { name: 'Filter Category', exact: true }).click();
      await page.getByRole('combobox', { name: 'Category *', exact: true }).click();
      await page.getByRole('option', { name: 'Government Approval', exact: true }).click();
      await page.getByRole('button', { name: 'Apply', exact: true }).click();
      await expect(row()).toBeVisible();
      await expect(page).toHaveURL(/category=0/);
      await expect(page.getByRole('combobox', { name: /^Category/ })).toHaveText(
        'Government Approval'
      );
      await page.getByRole('textbox', { name: 'Search documents', exact: true }).fill(name);
      await expect(page).toHaveURL(/search=/);
      await card()
        .getByRole('button', { name: 'Category → Equals → Government Approval', exact: true })
        .press('Delete');
      await expect(page).not.toHaveURL(/category=/);
      await expect(
        page.getByRole('textbox', { name: 'Search documents', exact: true })
      ).toHaveValue(name);
      await page.getByRole('button', { name: 'Clear Filters', exact: true }).click();
      await expect(page).not.toHaveURL(/search=/);
    }
  );
  await check('error and retry preserve the table, filters, toolbar, and header', async () => {
    await page.route(
      '**/api/institute-setup/school-documents?*',
      (route) =>
        route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Synthetic list failure.' }),
        }),
      { times: 1 }
    );
    await page.reload();
    await expect(card().getByRole('button', { name: 'Retry', exact: true })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'School Documents', exact: true })
    ).toBeVisible();
    await expect(page.getByRole('combobox', { name: /^Category/ })).toBeVisible();
    await expect(card().getByRole('button', { name: 'Columns', exact: true })).toBeVisible();
    await card().getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(row()).toBeVisible();
  });
  await check(
    'both themes at phone, tablet, and desktop sizes contain scrolling and pin Actions',
    async () => {
      for (const dark of [false, true]) {
        if (dark) await page.getByRole('button', { name: 'Switch Theme', exact: true }).click();
        for (const [width, height] of [
          [390, 844],
          [768, 1024],
          [1440, 900],
        ]) {
          await page.setViewportSize({ width, height });
          expect(
            await page.evaluate(
              () =>
                document.documentElement.scrollWidth <= innerWidth &&
                document.documentElement.scrollHeight <= innerHeight
            )
          ).toBe(true);
          const layout = await card().evaluate((element) => ({
            bottom: element.getBoundingClientRect().bottom,
            viewport: innerHeight,
          }));
          expect(layout.viewport - layout.bottom).toBeLessThanOrEqual(25);
          if (width >= 768) {
            const density = await card()
              .getByRole('switch', { name: 'Dense', exact: true })
              .boundingBox();
            const pagination = await card()
              .getByRole('button', { name: 'Go to next page', exact: true })
              .boundingBox();
            expect(
              Math.abs(density.y + density.height / 2 - (pagination.y + pagination.height / 2))
            ).toBeLessThan(2);
          }
          const actions = row().locator('td').last();
          expect(await actions.evaluate((element) => getComputedStyle(element).position)).toBe(
            'sticky'
          );
          await expect(
            row().getByRole('button', { name: `More actions for ${name}`, exact: true })
          ).toBeInViewport();
          await page.screenshot({
            path: fileURLToPath(new URL(`ui-${dark ? 'dark' : 'light'}-${width}.png`, output)),
          });
        }
      }
    }
  );
  await check('read-only and denied access preserve the permitted list actions', async () => {
    await page.goto(`${base}?access=view`);
    await expect(row()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Document', exact: true })).toHaveCount(0);
    await expect(row().getByRole('button', { name: `Edit ${name}`, exact: true })).toHaveCount(0);
    await expect(row().getByRole('button')).toHaveCount(1);
    await row()
      .getByRole('button', { name: `View ${name}`, exact: true })
      .click();
    const view = page.getByRole('dialog', { name: 'School Document', exact: true });
    await expect(view.getByText(name, { exact: true })).toBeVisible();
    await expect(
      view.getByRole('button', { name: 'Download approval.png', exact: true })
    ).toBeEnabled();
    await view.getByRole('button', { name: 'Close', exact: true }).click();
    await page.goto(`${base}?access=none`);
    await expect(
      page.getByText('You do not have permission to view School Documents.', { exact: true })
    ).toBeVisible();
    await expect(card()).toHaveCount(0);
  });
  expect(errors).toEqual([]);
  await writeFile(new URL('ui-checks.json', output), JSON.stringify({ checks, errors }, null, 2));
} catch (error) {
  await page.screenshot({ path: fileURLToPath(new URL('ui-failure.png', output)) });
  throw error;
} finally {
  await page.request.delete(`${base}api/institute-setup/school-documents/${document.id}`);
  await browser.close();
}
