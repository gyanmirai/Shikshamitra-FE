/* eslint-disable import/no-extraneous-dependencies */
import { expect, test } from '@playwright/test';

const policyTabs = [
  'Work Calendars',
  'Attendance Policies',
  'Leave Policies',
  'Payroll Policies',
  'Policy Assignments',
];

test('keeps five setup tabs, academic year and keyboard navigation', async ({ page }) => {
  await page.goto('/hr/calendars');
  await expect(page.getByRole('heading', { name: 'Policies & Rules', exact: true })).toBeVisible();
  await expect(page.getByRole('tab')).toHaveText(policyTabs);
  const year = await page.getByText(/^Academic year:/).innerText();
  await page.getByRole('tab', { name: 'Work Calendars', exact: true }).press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/hr\/attendance$/);
  await expect(page.getByRole('tab', { name: 'Attendance Policies', exact: true })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  await expect(page.getByText(/^Academic year:/)).toHaveText(year);
  await expect(page.getByRole('tab', { name: /Policy Impact|Holiday Impact/ })).toHaveCount(0);
  await page.goto('/hr/effective-preview');
  await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();
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
