import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  await request.post('/fixture/reset');
});

test('table layout, filtering, sorting and utilities stay usable in both themes', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const table = page.getByRole('table', { name: 'Role Management table' });
  await expect(table.getByRole('button', { name: 'Edit QA Role 01', exact: true })).toBeVisible();
  const heading = page.getByRole('columnheader', { name: 'Actions', exact: true });
  await expect(heading).toBeVisible();
  const widths = await table
    .locator('thead th')
    .evaluateAll((cells) => cells.map((cell) => cell.getBoundingClientRect().width));
  expect(widths[1]).toBeLessThanOrEqual(160);
  expect(await heading.locator('button').count()).toBe(0);
  const addBounds = await page.getByRole('button', { name: 'Add Role', exact: true }).boundingBox();
  const tableBounds = await table.boundingBox();
  expect(
    Math.abs(addBounds!.x + addBounds!.width - tableBounds!.x - tableBounds!.width)
  ).toBeLessThan(20);
  await page.screenshot({ path: test.info().outputPath('role-management-light.png') });
  await page.getByRole('button', { name: 'More actions for QA Role 01', exact: true }).click();
  await expect(
    page.getByRole('menuitem', { name: 'Set Module Visibility', exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('menuitem', { name: 'Module Permission', exact: true })
  ).toBeVisible();
  await page.getByRole('menuitem', { name: 'Set Module Visibility', exact: true }).click();
  const visibility = page.getByRole('dialog', {
    name: 'Set Visibility for QA Role 01',
    exact: true,
  });
  await expect(visibility).toBeVisible();
  await visibility.getByRole('button', { name: 'close', exact: true }).click();
  await page.getByRole('button', { name: 'More actions for QA Role 01', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Module Permission', exact: true }).click();
  const permissions = page.getByRole('dialog', { name: 'Permissions of QA Role 01', exact: true });
  await expect(permissions).toBeVisible();
  await permissions.getByRole('button', { name: 'close', exact: true }).click();
  const search = page.getByRole('textbox', { name: 'Search roles by name' });
  await search.fill('QA Role 18');
  await expect(table.getByText('QA Role 18', { exact: true })).toBeVisible();
  await expect(table.getByText('QA Role 01', { exact: true })).toHaveCount(0);
  await search.fill('no matching role');
  await expect(page.getByText('No roles have been added yet.')).toHaveCount(0);
  await search.fill('');
  await page.getByRole('button', { name: 'Sort by Role', exact: true }).click();
  await page.getByRole('button', { name: 'Filter Role', exact: true }).click();
  await page.getByRole('combobox', { name: 'Filter Type *', exact: true }).click();
  await page.getByRole('option', { name: 'Equals', exact: true }).click();
  await page.getByRole('textbox', { name: 'Role *', exact: true }).fill('QA Role 18');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(table.getByText('QA Role 18', { exact: true })).toBeVisible();
  await expect(table.getByText('QA Role 01', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear (1)', exact: true }).click();
  await page.getByRole('button', { name: 'Columns', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Role', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  await expect(page.getByRole('menuitem', { name: /excel/i })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('menuitem', { name: /excel/i }).click();
  expect((await download).suggestedFilename()).toMatch(/\.xlsx$/);
  await page.getByRole('button', { name: 'Go to next page' }).click();
  await expect(table.getByText('QA Role 18', { exact: true })).toBeVisible();
  await page.getByRole('switch', { name: 'Dense', exact: true }).click();
  await page.getByRole('button', { name: 'Full screen', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  const checkTheme = async (theme: 'light' | 'dark') => {
    if (theme === 'dark') await page.getByRole('button', { name: 'Switch theme' }).click();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    const violations = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(violations.violations).toEqual([]);
    await page.screenshot({ path: test.info().outputPath(`role-management-${theme}-checked.png`) });
  };
  await checkTheme('light');
  await checkTheme('dark');
});

test('list failure retries, true empty state and read-only actions are distinct', async ({
  page,
  request,
}) => {
  await request.post('/fixture/control', { data: { failRead: true } });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('alert')).toContainText('Synthetic role list unavailable');
  await expect(page.getByRole('button', { name: 'Add Role', exact: true })).toBeVisible();
  await request.post('/fixture/control', { data: { failRead: false, empty: true } });
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByText('No roles have been added yet.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add Role', exact: true })).toHaveCount(2);
  await page.goto('/?readonly', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('No roles have been added yet.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add Role', exact: true })).toHaveCount(0);
  await request.post('/fixture/reset');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText('QA Role 01', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Edit QA|Delete QA|More actions for/ })
  ).toHaveCount(0);
});
