/* eslint-disable import/no-extraneous-dependencies */
import { test, expect } from '@playwright/test';

import { testIds, profileTabs } from './selectors';
import { gotoEmployeeList, openFirstRowProfile, expectNoRuntimeErrors } from './employee-page';

test.describe('HR Employee profile', () => {
  test('opens profile and renders every profile tab without runtime errors', async ({ page }) => {
    const assertNoErrors = await expectNoRuntimeErrors(page);

    await gotoEmployeeList(page);
    const dashboardResponsePromise = page.waitForResponse(
      (response) =>
        /\/api\/employees\/[^/]+\/dashboard(?:\?|$)/.test(response.url()) &&
        response.request().method() === 'GET'
    );
    await openFirstRowProfile(page);
    const dashboardResponse = await dashboardResponsePromise;
    expect(dashboardResponse.ok()).toBeTruthy();

    await expect(page.getByTestId(testIds.profileHeader)).toBeVisible();
    await expect(page.getByText(/Employee Code/i)).toBeVisible();
    await expect(page.getByText(/Role/i)).toBeVisible();
    await expect(page.getByText(/Organization/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Attendance Calendar' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Upcoming Holidays' })).toBeVisible();
    await expect(page.getByText('Attendance Trend', { exact: true })).toBeVisible();

    const profileUrl = new URL(page.url());
    profileUrl.searchParams.set('tab', 'attendance');
    await page.goto(profileUrl.toString());
    await expect(page.getByRole('tab', { name: 'Attendance' })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await profileTabs.reduce(async (previous, tab) => {
      await previous;
      await page.getByRole('tab', { name: tab }).click();
      await expect(page.getByRole('tab', { name: tab })).toHaveAttribute('aria-selected', 'true');
    }, Promise.resolve());

    await page.getByRole('button', { name: /back/i }).click();
    await expect(page.getByTestId(testIds.employeeListFilters)).toBeVisible();

    await assertNoErrors();
  });
});
