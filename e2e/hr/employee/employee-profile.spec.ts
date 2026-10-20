/* eslint-disable import/no-extraneous-dependencies */
import { test, expect } from '@playwright/test';

import { testIds, profileTabs } from './selectors';
import { gotoEmployeeList, openFirstRowProfile, expectNoRuntimeErrors } from './employee-page';

test.describe('HR Staff profile', () => {
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
    await expect(page.getByText(/Staff Code/i)).toBeVisible();
    await expect(page.getByText(/Role/i)).toBeVisible();
    await expect(page.getByText(/Organization/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Attendance calendar' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Upcoming holidays' })).toBeVisible();
    await expect(page.getByText('Attendance trend', { exact: true })).toBeVisible();

    const profile = page.getByTestId(testIds.employeeProfile);
    const header = page.getByTestId(testIds.profileHeader);
    const metadataFont = await header
      .getByText(/Staff Code/i)
      .evaluate((element) => getComputedStyle(element).fontSize);
    const dashboardTab = profile.getByRole('tab', { name: 'Dashboard', exact: true });
    expect(await dashboardTab.evaluate((element) => getComputedStyle(element).fontSize)).toBe(
      metadataFont
    );
    expect(
      await dashboardTab.evaluate((element) => element.getBoundingClientRect().height)
    ).toBeGreaterThanOrEqual(48);

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
      const activeTab = profile.getByRole('tab', { name: tab, exact: true });
      const panel = profile.getByRole('tabpanel').first();
      await expect(panel).toHaveAttribute('aria-labelledby', (await activeTab.getAttribute('id'))!);
      await expect(activeTab).toHaveAttribute('aria-controls', (await panel.getAttribute('id'))!);
    }, Promise.resolve());

    await expect(page).toHaveURL(/tab=attendance/);
    await page.reload();
    await expect(page.getByRole('tab', { name: 'Attendance', exact: true })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await page.getByRole('tab', { name: 'Calendar', exact: true }).click();
    await expect(page).toHaveURL(/tab=calendar/);
    await page.goBack();
    await expect(page.getByRole('tab', { name: 'Attendance', exact: true })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await page.goForward();
    await expect(page.getByRole('tab', { name: 'Calendar', exact: true })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await page.getByRole('button', { name: /back/i }).click();
    await expect(page.getByTestId(testIds.employeeListFilters)).toBeVisible();

    await assertNoErrors();
  });

  test('keeps long identity details and loading placeholders contained on narrow screens', async ({
    page,
  }, testInfo) => {
    await gotoEmployeeList(page);
    const profileResponse = page.waitForResponse(
      (response) =>
        /^\/api\/employees\/[^/]+$/.test(new URL(response.url()).pathname) &&
        response.request().method() === 'GET'
    );
    await openFirstRowProfile(page);
    const employeeId = new URL(page.url()).searchParams.get('employee');
    expect(employeeId).toBeTruthy();
    const employee = await (await profileResponse).json();
    const longName = 'Alexandra Krishnamurthy Narayanaswamy School Administrator';
    const organizations = [
      'Higher Secondary English Medium',
      'Pre-Primary Gujarati Medium',
      'Primary English Medium',
      'Secondary Gujarati Medium',
    ];
    let releaseProfile!: () => void;
    const responseGate = new Promise<void>((resolve) => {
      releaseProfile = resolve;
    });

    await page.route(
      (url) => url.pathname === `/api/employees/${employeeId}`,
      async (route) => {
        await responseGate;
        await route.fulfill({
          status: 200,
          json: {
            ...employee,
            fullName: longName,
            employeeIdentifier: null,
            roleName: null,
            organizationNames: organizations,
            status: 0,
            doj: '2099-01-01',
          },
        });
      }
    );

    await page.setViewportSize({ width: 375, height: 900 });
    try {
      await page.reload();
      await expect(page.locator('.MuiSkeleton-root').first()).toBeVisible();
      await expect(page.getByTestId(testIds.profileHeader)).toBeHidden();
      const loadingOverflow = await page
        .getByTestId(testIds.employeePage)
        .evaluate((element) => element.scrollWidth - element.clientWidth);
      expect(loadingOverflow).toBeLessThanOrEqual(1);
      await page.screenshot({ path: testInfo.outputPath('profile-loading-mobile.png') });
    } finally {
      releaseProfile();
    }

    const header = page.getByTestId(testIds.profileHeader);
    await expect(header.getByRole('heading', { name: longName, exact: true })).toBeVisible();
    await expect(header.getByText('Upcoming', { exact: true })).toBeVisible();
    await expect(header.locator('p').filter({ hasText: /Staff Code:/ })).toHaveText('Staff Code:-');
    await expect(header.locator('p').filter({ hasText: /Role:/ })).toHaveText('Role:-');
    await expect(header).toContainText(organizations.join(', '));

    await [1536, 768, 375].reduce(async (previous, width) => {
      await previous;
      await page.setViewportSize({ width, height: 900 });
      const overflow = await header.evaluate(
        (element) => element.scrollWidth - element.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(1);
      const tablist = page.getByRole('tablist', { name: 'Staff profile sections' });
      const bounds = await tablist.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      await page.screenshot({ path: testInfo.outputPath(`profile-header-${width}.png`) });
    }, Promise.resolve());
  });
});
