/* eslint-disable import/no-extraneous-dependencies -- Playwright tests use the test runner. */
import { test, expect } from '@playwright/test';

['light', 'dark'].forEach((theme) => {
  test(`Academic permission filtering and route guards in ${theme} theme`, async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('protected-content')).toContainText('/academic/calendarManagement');
    if (theme === 'dark') await page.getByRole('button', { name: 'Use dark theme' }).click();

    const navigation = page.getByRole('complementary', { name: 'Academic modules' });
    await expect(navigation.getByRole('link', { name: 'Calendar Management', exact: true })).toBeVisible();
    await expect(navigation.getByRole('button', { name: 'Curriculum', exact: true })).toHaveCount(0);
    await expect(navigation.getByRole('button', { name: 'Examination', exact: true })).toHaveCount(0);
    await expect(navigation.getByRole('link', { name: 'Audit Logs', exact: true })).toHaveCount(0);
    await expect(navigation.getByRole('link', { name: 'Dashboard', exact: true })).toHaveCount(0);
    await expect(page.getByTestId('academic-landing')).toContainText('/academic/calendarManagement');

    await page.getByRole('button', { name: 'Open denied audit route' }).click();
    await expect(page.getByText('No permission', { exact: true })).toBeVisible();
    await expect(page.getByTestId('protected-content')).toHaveCount(0);
    await page.getByRole('button', { name: 'Calendar access', exact: true }).click();
    await expect(page.getByTestId('protected-content')).toBeVisible();

    await page.getByRole('button', { name: 'Revoke View', exact: true }).click();
    await expect(page.getByText('No permission', { exact: true })).toBeVisible();
    await expect(navigation.getByRole('link')).toHaveCount(0);
    await expect(page.getByTestId('academic-landing')).toContainText('Hidden');

    await page.getByRole('button', { name: 'Reload permissions', exact: true }).click();
    await expect(page.getByTestId('permission-status')).toHaveText('Loading permissions');
    await expect(page.getByTestId('protected-content')).toHaveCount(0);
    await expect(page.getByText('No permission', { exact: true })).toHaveCount(0);
    await expect(page.getByTestId('protected-content')).toContainText('/academic/calendarManagement');

    await page.getByRole('button', { name: 'Seating access', exact: true }).click();
    await expect(page.getByTestId('protected-content')).toContainText('/academic/seatallocation/exam-123/setup');
    await expect(navigation.getByRole('link', { name: 'Seating Plan', exact: true })).toBeVisible();
    await expect(navigation.getByRole('link', { name: 'Calendar Management', exact: true })).toHaveCount(0);
    await expect(page.getByTestId('academic-landing')).toContainText('/academic/seatallocation');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `.artifacts/academic-permission-navigation/${test.info().project.name}-${theme}.png`, fullPage: true });

    await page.getByRole('button', { name: 'Revoke View', exact: true }).click();
    await expect(page.getByText('No permission', { exact: true })).toBeVisible();
    await expect(page.getByTestId('protected-content')).toHaveCount(0);
  });
});
