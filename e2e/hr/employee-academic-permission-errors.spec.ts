import { test, expect, type Page } from '@playwright/test';

import { gotoEmployeeList } from './employee/employee-page';

test.use({ storageState: { cookies: [], origins: [] } });

async function openAcademicPermission(page: Page) {
  await gotoEmployeeList(page);
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes('/api/employees?') &&
        new URL(response.url()).searchParams.get('search') === 'Dharmik Jinjala'
    ),
    page.getByRole('textbox', { name: 'Search table' }).fill('Dharmik Jinjala'),
  ]);
  await page
    .getByRole('row')
    .filter({ hasText: 'Dharmik Jinjala' })
    .getByRole('button', { name: 'Edit', exact: true })
    .click();
  await page.getByRole('button', { name: 'Step 8: Academic Permission', exact: true }).click();
  const warning = page.getByRole('dialog', { name: 'Alert', exact: true });
  if (await warning.isVisible()) {
    await warning.getByRole('button', { name: 'Yes', exact: true }).click();
  }
  await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeEnabled();
}

test.beforeEach(async ({ baseURL, page }) => {
  expect(['localhost', '127.0.0.1']).toContain(new URL(baseURL!).hostname);
  const password = process.env.E2E_ADMIN_PASSWORD || process.env.E2E_PASSWORD;
  if (!password) throw new Error('Set E2E_ADMIN_PASSWORD for the local administrator.');
  await page.goto('/login');
  await page.getByLabel(/school code/i).fill(process.env.E2E_TENANT || 'DDVS');
  await page.getByLabel(/email.*username/i).fill(process.env.E2E_ADMIN_EMAIL || 'admin-ddvs');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
});

test('academic permission failure shows one actionable toast and preserves the draft @critical', async ({
  page,
}) => {
  let submitted = 0;
  await page.route('**/employees/*/academic-permission', async (route) => {
    submitted += 1;
    await route.fulfill({
      status: 400,
      contentType: 'application/problem+json',
      body: JSON.stringify({
        status: 400,
        errorCode: 'UserScope:InvalidReferences',
        detail: 'One or more business rules were violated.',
      }),
    });
  });
  await openAcademicPermission(page);
  const board = page.getByRole('checkbox').first();
  await board.check();
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  const errors = page.getByRole('alert').filter({ hasText: 'Reload the academic hierarchy' });
  await expect(errors).toHaveCount(1);
  await expect(errors).toContainText('Reload the academic hierarchy');
  await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeEnabled();
  await expect(errors).toHaveCount(1);
  await expect(board).toBeChecked();
  expect(submitted).toBe(1);
});

test('switching academic year replaces an edited selection with the new year scope @critical', async ({
  page,
}) => {
  let initialYear: string | null = null;
  await page.route('**/employees/*/academic-permission?*', async (route) => {
    const requestUrl = new URL(route.request().url());
    const year = requestUrl.searchParams.get('academicYearId');
    if (!year) {
      await route.continue();
      return;
    }
    initialYear ??= year;
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        accessibleHierarchy: [
          {
            academicYearId: year,
            hasFullBoardAccess: year !== initialYear,
            boards: [],
          },
        ],
      }),
    });
  });
  await openAcademicPermission(page);
  await page.getByRole('checkbox').first().check();
  const yearPicker = page.getByRole('combobox', { name: 'Academic Year', exact: true });
  const oldYear = await yearPicker.inputValue();
  await yearPicker.click();
  await page.getByRole('option').filter({ hasNotText: oldYear }).first().click();
  await page
    .getByRole('dialog', { name: 'Change Academic Year, Board and Medium' })
    .getByRole('button', { name: 'OK', exact: true })
    .click();
  await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeEnabled();
  await expect(page.getByRole('checkbox').first()).toBeChecked();
  await expect(page.getByRole('checkbox').last()).toBeChecked();
});
