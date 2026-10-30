import { test, expect } from '@playwright/test';

import { login, prepare, fixtureApi, expectHealthy } from './academic-module-setup.helpers';

test.describe('Academic calendar preview', { tag: ['@module-academic', '@submodule-dashboard'] }, () => {
  ([['admin', 1440, 'light'], ['student', 390, 'dark']] as const).forEach(([role, width, theme]) => {
    test(`${role} sees five events without recurring weekends at ${width}`, async ({ page, request }, testInfo) => {
      await request.post(`${fixtureApi}/fixture/reset`, {
        data: { visited: true, insights: { populated: true, role } },
      });
      await page.setViewportSize({ width, height: 900 });
      await prepare(page, request, theme);
      await login(page);
      let weekendsOnly = false;
      await page.route('**/api/academic/dashboard/insights*', async (route) => {
        const response = await route.fetch();
        const data = await response.json();
        const calendar = data.sections.find((entry: { key: string }) => entry.key === 'calendar');
        calendar.status = 'ready';
        calendar.items = [{ id: 'weekend', label: 'Sunday Weekend', detail: 'Holiday', date: '2026-11-01T00:00:00Z' },
          ...(!weekendsOnly ? Array.from({ length: 7 }, (_, index) => ({
            id: `event-${index}`, label: index === 0 ? 'Weekend Science Fair' : `School event ${index}`,
            detail: index === 1 ? 'Holiday' : 'Event', date: `2026-11-${String(index + 1).padStart(2, '0')}T00:00:00Z`,
          })) : [])];
        await route.fulfill({ response, json: data });
      });
      await page.goto('/academic/dashboard');
      const calendar = page.locator(`main section[aria-label="${role === 'student' ? 'Holidays & Events' : 'Academic Calendar'}"]`);
      const events = calendar.getByRole('list', { name: 'Calendar events' });
      await expect(events.getByRole('listitem')).toHaveCount(5);
      await expect(calendar.getByText('Sunday Weekend', { exact: true })).toHaveCount(0);
      await expect(calendar.getByText('Weekend Science Fair', { exact: true })).toBeVisible();
      await expect(calendar.getByText('School event 4', { exact: true })).toBeVisible();
      await expect(calendar.getByText('School event 5', { exact: true })).toHaveCount(0);
      await calendar.scrollIntoViewIfNeeded();
      await expectHealthy(page);
      await page.screenshot({ path: testInfo.outputPath(`calendar-${role}.png`) });
      weekendsOnly = true;
      await page.getByRole('button', { name: 'Refresh', exact: true }).click();
      await expect(calendar.getByText('No upcoming events to display.')).toBeVisible();
      await expect(calendar.getByRole('listitem')).toHaveCount(0);
    });
  });
});
