import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  await request.get('/fixture/reset');
});

test('Role sorts and filters the entire directory and toggles through Columns', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const table = page.getByRole('table', { name: 'User Management table' });
  await expect(table.getByText('QA User 01', { exact: true })).toBeVisible();
  await expect(table.locator('thead th')).toHaveText([
    'Full Name',
    'Role',
    'Email',
    'Mobile No.',
    'Actions',
  ]);
  await expect(table.getByText('No role assigned')).toBeVisible();
  await page.getByRole('button', { name: 'Sort by Role', exact: true }).click();
  await expect(table.locator('tbody tr').first()).toContainText('Admin');
  await page.getByRole('button', { name: 'Sort by Role', exact: true }).click();
  await expect(table.locator('tbody tr').first()).toContainText('QA User 01');
  await page.getByRole('button', { name: 'Filter Role', exact: true }).click();
  await page.getByRole('combobox', { name: 'Filter Type *', exact: true }).click();
  await page.getByRole('option', { name: 'Contains', exact: true }).click();
  await page.getByRole('textbox', { name: 'Role *', exact: true }).fill('teacher');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(table.getByText('QA User 12', { exact: true })).toBeVisible();
  await expect(table.getByText('HR Manager', { exact: true })).toBeVisible();
  await expect(table.getByText('QA User 01', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear (1)', exact: true }).click();
  await page.getByRole('button', { name: 'Columns', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Role', exact: true }).uncheck();
  await expect(table.getByRole('columnheader', { name: /Role/ })).toHaveCount(0);
  await page.getByRole('checkbox', { name: 'Role', exact: true }).check();
  await page.keyboard.press('Escape');
  await expect(table.getByRole('columnheader', { name: /Role/ })).toBeVisible();
});

[1440, 390].forEach((width) => {
  test(`role pills wrap and controls remain accessible at ${width}px in both themes`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page
      .getByRole('textbox', { name: 'Search users by name, email, or mobile number' })
      .fill('QA User 12');
    await expect(page.getByText('Teacher', { exact: true })).toBeVisible();
    await page.getByText('Teacher', { exact: true }).scrollIntoViewIfNeeded();
    if (width === 390) {
      await page.locator('.MuiTableContainer-root').evaluate((element) => {
        element.scrollLeft = 220;
      });
      await expect(page.getByText('Teacher', { exact: true })).toBeInViewport();
    }
    const checkTheme = async (theme: string) => {
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBe(true);
      const result = await new AxeBuilder({ page })
        .include('main')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      expect(result.violations).toEqual([]);
      await page.screenshot({ path: test.info().outputPath(`roles-${width}-${theme}.png`) });
    };
    await checkTheme('light');
    await page.getByRole('button', { name: 'Switch theme' }).click();
    await checkTheme('dark');
  });
});

test('list errors retry and an empty directory retains its table controls', async ({
  page,
  request,
}) => {
  await request.get('/fixture/control?fail=true');
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('alert')).toContainText('Synthetic user list unavailable');
  await request.get('/fixture/control?empty=true');
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByText('No users are available.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Columns', exact: true })).toBeVisible();
});
