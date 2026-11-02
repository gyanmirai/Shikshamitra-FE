import { test, expect } from '@playwright/test';

test.describe(
  'Division home room propagation',
  { tag: ['@module-academic', '@submodule-timetable', '@regression'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await request.post('/api/fixture/reset');
      await page.goto('/');
      await expect(page.getByText('Division home room: B101', { exact: true })).toBeVisible();
    });

    test('updates new lectures while preserving saved overrides and reopening the builder', async ({
      page,
    }) => {
      const rows = page.getByRole('table', { name: 'Draft room assignments' });
      await page.getByRole('button', { name: 'Edit Division A', exact: true }).click();
      await page.getByRole('combobox', { name: 'Room (optional)' }).click();
      await page.getByRole('option', { name: /B2222/ }).click();
      await page.getByRole('button', { name: 'Submit', exact: true }).click();
      await page.getByRole('button', { name: 'Confirm', exact: true }).click();
      await expect(page.getByText('Division home room: B2222', { exact: true })).toBeVisible();
      const periods = page.getByTestId('board').locator('div[draggable="true"]');
      await expect(periods).toHaveCount(4);
      await page.getByRole('listitem').filter({ hasText: 'Pt' }).dragTo(periods.nth(2));
      await expect(rows.getByRole('row').filter({ hasText: '15:00' })).toContainText('B2222');
      await expect(rows.getByRole('row').filter({ hasText: '14:00' })).toContainText('Science Lab');
      await expect(rows.getByRole('row').filter({ hasText: '14:30' })).toContainText('B101');
      await page.getByRole('button', { name: 'Close timetable', exact: true }).click();
      await page.getByRole('button', { name: 'Open timetable', exact: true }).click();
      await page.getByRole('button', { name: 'Schedule Pt in next empty slot' }).click();
      await expect(rows.getByRole('row').filter({ hasText: '15:30' })).toContainText('B2222');
      await page.screenshot({
        path: '.artifacts/timetable-room-sync/browser-passed.png',
        fullPage: true,
      });
    });
  }
);
