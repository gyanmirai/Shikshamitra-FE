/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-restricted-syntax, no-await-in-loop -- Follow sequential sidebar navigation in one browser session. */
import { test, expect } from '@playwright/test';

const policyPages = [
  'Work Calendars',
  'Attendance Policies',
  'Leave Policies',
  'Payroll Policies',
  'Policy Assignments',
];

test('uses sidebar navigation and one global academic year across policy pages', async ({
  page,
}) => {
  await page.goto('/hr/calendars');
  const academicYear = page.getByRole('combobox', { name: /Academic year/i });
  await expect(academicYear).toBeVisible();
  await expect(academicYear).not.toHaveValue('');
  const year = await academicYear.inputValue();
  for (const name of policyPages) {
    await page.getByRole('link', { name, exact: true }).press('Enter');
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    await expect(page.getByRole('tablist')).toHaveCount(0);
    await expect(page.getByText(/^Academic year:/)).toHaveCount(0);
    await expect(academicYear).toHaveValue(year);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
  }
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Payroll Policies', exact: true })).toBeVisible();
  await page.goto('/hr/effective-preview');
  await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();
});

test('keeps mobile policy identity and status columns from overlapping', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of [
    'calendars',
    'attendance',
    'leave-policies',
    'payrollPolicies',
    'assignments',
  ]) {
    await page.goto(`/hr/${path}`);
    const header = page.locator('.MuiTableHead-root');
    await expect(header.locator('th[id$="-column-status"]')).toBeVisible();
    const geometry = await header.evaluate((head) => {
      const name = head.querySelector('th')!.getBoundingClientRect();
      const status = head.querySelector('th[id$="-column-status"]')!.getBoundingClientRect();
      return { nameRight: name.right, statusLeft: status.left };
    });
    expect(geometry.nameRight).toBeLessThanOrEqual(geometry.statusLeft + 1);
    const identity = header.locator('th').first();
    const initialLeft = (await identity.boundingBox())!.x;
    await page
      .locator('.MuiTableContainer-root .simplebar-content-wrapper')
      .evaluate((container) => {
        container.scrollLeft = 200;
      });
    await expect
      .poll(async () => (await identity.boundingBox())!.x)
      .toBeLessThan(initialLeft - 100);
  }
});

test('uses staff labels in the mobile directory and HR menu', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/hr/employee');
  await expect(page.getByRole('heading', { name: 'Staff Directory', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add Staff', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Open HR navigation', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'HR navigation' })).toBeVisible();
  await page.getByRole('button', { name: 'Staff', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Staff Directory', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Staff Onboarding', exact: true })).toBeVisible();
});

test('keeps expanded settlement rows and the leave-policy table reachable on mobile', async ({
  page,
}) => {
  const run = {
    id: 'layout-review-run',
    academicYearId: 'layout-review-year',
    status: 'Draft',
    totalItems: 20,
    blockedItems: 0,
    totalCarriedDays: 20,
    totalEncashedDays: 0,
    totalForfeitedDays: 0,
    totalEncashmentAmount: 0,
    items: Array.from({ length: 20 }, (_, index) => ({
      id: `layout-review-item-${index}`,
      runId: 'layout-review-run',
      employeeId: `layout-review-staff-${index}`,
      employeeName: `Layout Review Staff ${index + 1}`,
      status: 'Draft',
      issueCodes: [],
      accruedDays: 12,
      unusedDays: 1,
      carriedDays: 1,
      amount: 0,
    })),
  };
  await page.route('**/api/leave-management/year-end-settlements**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        new URL(route.request().url()).pathname.endsWith(`/${run.id}`) ? run : [run]
      ),
    })
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/hr/leave-policies');
  await expect(page.getByRole('heading', { name: 'Leave Policies', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Show settlement details' }).click();
  const lastVisibleStaff = page.getByText('Layout Review Staff 10', { exact: true });
  await lastVisibleStaff.scrollIntoViewIfNeeded();
  await expect(lastVisibleStaff).toBeInViewport();
  await expect(page.getByTestId('hr-leave-policies-workspace')).toBeInViewport();
  await page.getByRole('button', { name: 'Hide settlement details' }).click();
  await expect(page.getByTestId('hr-leave-policies-workspace')).toBeInViewport();
});
