/* eslint-disable import/no-extraneous-dependencies */
import type { EmployeeDashboardData } from 'src/redux/hr/employeeApi';

import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

const employeeId = process.env.E2E_EMPLOYEE_ID || '3a2402e9-1c31-ff06-ba10-3be801c4a75d';
const profileUrl = `/hr/employee?employee=${employeeId}`;
const dashboardUrl = /\/api\/employees\/[^/]+\/dashboard(?:\?|$)/;
const dashboard: EmployeeDashboardData = {
  employeeId,
  date: '2026-10-20',
  academicYearName: '2026-2027',
  todayStatus: 'NotMarked',
  attendancePercentage: null,
  recordedAttendanceDays: 0,
  leaveBalanceDays: 20,
  hasUnlimitedLeave: true,
  isLeaveBalanceAvailable: true,
  pendingLeaveRequests: 0,
  attendanceDays: [
    { date: '2026-10-19', status: 'Absent', remarks: 'Recorded by attendance office' },
  ],
  attendanceTrend: [
    { month: '2026-09', present: 0, halfDay: 0, absent: 0, halfDayLeave: 0, fullDayLeave: 0 },
    { month: '2026-10', present: 0, halfDay: 0, absent: 0, halfDayLeave: 0, fullDayLeave: 0 },
  ],
  holidays: [
    {
      name: 'School celebration with a long holiday name that wraps without losing its meaning',
      fromDate: '2026-10-19',
      toDate: '2026-10-21',
    },
    { name: 'Winter break', fromDate: '2026-12-20', toDate: '2027-01-02' },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('onboarding_completed', 'true'));
});

test('keeps the compact overview accessible across responsive sizes', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  const requests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
  await page.route(dashboardUrl, (route) => route.fulfill({ json: dashboard }));
  await page.goto(profileUrl);
  const metrics = page.getByTestId('staff-dashboard-metrics');
  await expect(metrics).toBeVisible();
  await expect(metrics.locator(':scope > *')).toHaveCount(4);
  await expect(metrics.getByText('20', { exact: true })).toBeVisible();
  await expect(metrics.getByText('Not available', { exact: true })).toBeVisible();
  await expect(page.getByText('No attendance records yet.')).toBeVisible();
  await expect(page.getByText('Today', { exact: true })).toBeVisible();
  await expect(page.locator('.highcharts-container')).toHaveCount(0);
  const day = page.getByRole('gridcell', {
    name: /19 October 2026: Absent: Recorded by attendance office/,
  });
  await day.focus();
  await expect(day).toBeFocused();
  await expect(page.getByRole('tooltip')).toHaveText('Absent: Recorded by attendance office');
  await page.getByRole('button', { name: 'Previous month', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Previous month', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Next month', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Next month', exact: true })).toBeDisabled();
  await page.getByRole('tab', { name: 'Dashboard', exact: true }).focus();
  await page.mouse.move(1, 1);
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  await [350, 390, 768, 1024, 1440, 2235].reduce(async (previous, width) => {
    await previous;
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    expect(
      await page.locator('body').evaluate((el) => el.scrollWidth - el.clientWidth)
    ).toBeLessThanOrEqual(1);
    const columns = await metrics.evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length
    );
    expect(columns).toBe(width < 360 ? 1 : width < 900 ? 2 : 4);
    await page.screenshot({ path: testInfo.outputPath(`dashboard-${width}.png`), fullPage: true });
  }, Promise.resolve());
  expect(requests.filter((url) => dashboardUrl.test(url))).toHaveLength(1);
  expect(requests.filter((url) => /\/api\/employees\/me(?:\?|$)/.test(url))).toHaveLength(0);
  expect(
    requests.filter((url) => /mockIssuedBooks|work-experience|qualifications/.test(url))
  ).toHaveLength(0);
  expect(errors).toEqual([]);
  const accessibility = await new AxeBuilder({ page })
    .include('[data-testid=staff-profile-dashboard]')
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(accessibility.violations).toEqual([]);
});

test('shows loading, initial failure and a working retry without replacing the profile shell', async ({
  page,
}) => {
  let fail = true;
  await page.route(dashboardUrl, async (route) => {
    if (fail) {
      await route.fulfill({
        status: 500,
        json: { error: { message: 'Dashboard temporarily unavailable' } },
      });
      return;
    }
    await route.fulfill({
      json: {
        ...dashboard,
        attendancePercentage: 0,
        isLeaveBalanceAvailable: false,
        leaveBalanceDays: null,
      },
    });
  });
  await page.goto(profileUrl);
  await expect(
    page.getByRole('alert').filter({ hasText: 'Staff dashboard data could not be loaded' })
  ).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Dashboard', exact: true })).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByText('0%', { exact: true })).toBeVisible();
  await expect(page.getByText('No active leave policy', { exact: true })).toBeVisible();
});

test('renders a populated monthly chart with an accessible data alternative', async ({ page }) => {
  await page.route(dashboardUrl, (route) =>
    route.fulfill({
      json: {
        ...dashboard,
        attendanceTrend: [
          { ...dashboard.attendanceTrend[1], present: 12, halfDay: 1, absent: 2, fullDayLeave: 3 },
        ],
        recordedAttendanceDays: 15,
        attendancePercentage: 83.3,
      },
    })
  );
  await page.goto(profileUrl);
  await expect(page.locator('.highcharts-container')).toBeVisible({ timeout: 60000 });
  await expect(page.getByText('No attendance records yet.')).toHaveCount(0);
  await page.getByText('View monthly attendance data', { exact: true }).click();
  await expect(page.getByRole('table', { name: 'Monthly attendance data' })).toContainText('12');
});

test('keeps dark mode and reduced motion usable', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.addInitScript(() => {
    localStorage.setItem('theme-mode', 'dark');
    localStorage.setItem('app-settings', JSON.stringify({ colorScheme: 'dark' }));
  });
  await page.route(dashboardUrl, (route) => route.fulfill({ json: dashboard }));
  await page.goto(profileUrl);
  await expect(page.getByTestId('staff-dashboard-metrics')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Attendance calendar', exact: true })
  ).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-mui-color-scheme', 'dark');
  const accessibility = await new AxeBuilder({ page })
    .include('[data-testid=staff-profile-dashboard]')
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('dashboard-dark.png'), fullPage: true });
});
