/* eslint-disable import/no-extraneous-dependencies */
import { test, expect } from '@playwright/test';

import { employeeColumns, testIds } from './selectors';
import {
  table,
  firstDataRow,
  searchEmployee,
  gotoEmployeeList,
  openFirstRowProfile,
  expectNoRuntimeErrors,
} from './employee-page';

test.describe('HR Staff list', () => {
  test('loads list, columns, search, pagination, and profile query state', async ({ page }) => {
    const assertNoErrors = await expectNoRuntimeErrors(page);

    await gotoEmployeeList(page);

    await Promise.all(
      employeeColumns.map((column) =>
        expect(table(page).getByRole('columnheader', { name: column })).toBeVisible()
      )
    );

    await firstDataRow(page);
    await expect(table(page).getByText('Rows per page')).toBeVisible();

    const firstEmployeeName = (await table(page).locator('tbody tr').first().innerText())
      .split('\n')
      .find((part) => part.includes('('));

    if (firstEmployeeName) {
      await searchEmployee(
        page,
        firstEmployeeName
          .replace(/\(.*\)/, '')
          .trim()
          .slice(0, 8)
      );
      await firstDataRow(page);
    }

    await openFirstRowProfile(page);
    await expect(page.getByTestId(testIds.profileHeader)).toBeVisible();

    await assertNoErrors();
  });

  test('supports no-data search state', async ({ page }) => {
    await gotoEmployeeList(page);
    await searchEmployee(page, `NO_MATCH_${Date.now()}`);

    await expect(table(page).getByText(/No results found for/)).toBeVisible();
    await table(page).getByRole('button', { name: 'Clear search', exact: true }).click();
    await firstDataRow(page);
  });
});
