import { test, expect } from '@playwright/test';

import {
  login,
  prepare,
  openGuide,
  fixtureApi,
  expectHealthy,
} from './academic-module-setup.helpers';

test.describe(
  'Timetable settings feedback',
  { tag: ['@module-academic', '@submodule-setup', '@regression'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await request.post(`${fixtureApi}/fixture/reset`, { data: {} });
      await prepare(page, request);
      await login(page);
    });

    test('prerequisite order, create dialog and slow save feedback', async ({ page, request }) => {
      await openGuide(page, 'stage=timetable');
      const tabs = page.getByRole('tablist', { name: 'Settings in this step' });
      await expect(tabs.getByRole('tab').first()).toHaveText('Lecture Slots');
      await expect(page.getByRole('tab', { name: 'Lecture Slots', exact: true })).toHaveAttribute(
        'aria-selected',
        'true'
      );
      await expect(page.getByRole('button', { name: 'Lecture Slot', exact: true })).toBeVisible();
      await request.post(`${fixtureApi}/fixture/failure`, { data: { saveDelay: 1500 } });
      await page.getByRole('tab', { name: 'Weekly Lectures', exact: true }).click();
      await expect(
        page.getByRole('progressbar', { name: 'Switching setup setting' })
      ).toBeVisible();
      const create = page.getByRole('button', { name: 'Weekly Lecture', exact: true });
      await expect(create).toBeVisible();
      await create.click();
      await expect(page.getByRole('dialog', { name: 'Add Weekly Lectures' })).toBeVisible();
      page.once('dialog', (dialog) => dialog.accept());
      await page.getByRole('button', { name: 'Cancel', exact: true }).click();
      await expect(page.getByRole('dialog', { name: 'Add Weekly Lectures' })).toHaveCount(0);
      await expectHealthy(page);
    });

    [
      ['weekly-lectures', 'Weekly Lectures', 'weekly-lecture-slots', 'Loading weekly lectures'],
      ['lecture-slots', 'Lecture Slots', 'lecture-slots', 'Loading lecture slots'],
    ].forEach(([setting, title, endpoint, loading]) => {
      test(`${title} initial load, failure, retry and cached tab refetch`, async ({ page }) => {
        const pattern = `**/api/academics/timetable/settings/${endpoint}?*`;
        let fail = true;
        await page.route(pattern, async (route) => {
          await new Promise((resolve) => setTimeout(resolve, 1600));
          if (fail)
            await route.fulfill({
              status: 500,
              json: { error: { message: `${title} unavailable` } },
            });
          else await route.continue();
        });
        await openGuide(page, `stage=timetable&setting=${setting}`);
        await expect(page.getByRole('progressbar', { name: loading, exact: true })).toBeVisible();
        const table = page.locator(
          `[id="customizable-table-card-${setting === 'weekly-lectures' ? 'weekly-lectures' : 'lecture-slots'}-setting-table"]`
        );
        await expect(table.getByRole('button', { name: 'Retry', exact: true })).toBeVisible();
        fail = false;
        await table.getByRole('button', { name: 'Retry', exact: true }).click();
        await expect(page.getByRole('progressbar', { name: loading, exact: true })).toBeVisible();
        await expect(table.getByRole('button', { name: 'Retry', exact: true })).toHaveCount(0);
        await expect(page.getByRole('progressbar', { name: loading, exact: true })).toHaveCount(0);
        const other = title === 'Weekly Lectures' ? 'Lecture Slots' : 'Weekly Lectures';
        await page.getByRole('tab', { name: other, exact: true }).click();
        await expect(page.getByRole('tab', { name: other, exact: true })).toHaveAttribute(
          'aria-selected',
          'true'
        );
        await expect(
          page.getByRole('button', {
            name: title === 'Weekly Lectures' ? 'Lecture Slot' : 'Weekly Lecture',
            exact: true,
          })
        ).toBeVisible();
        await page.getByRole('tab', { name: title, exact: true }).click();
        await expect(page.getByRole('progressbar', { name: loading, exact: true })).toBeVisible();
        await expect(page.getByRole('progressbar', { name: loading, exact: true })).toHaveCount(0);
        await page.screenshot({
          path: `.artifacts/timetable-settings-feedback/${setting}.png`,
          fullPage: true,
        });
        await expectHealthy(page);
      });
    });

    test('dark phone keeps the weekly creation action and both tabs reachable', async ({
      page,
      request,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await prepare(page, request, 'dark');
      await openGuide(page, 'stage=timetable&setting=weekly-lectures');
      await expect(page.getByRole('button', { name: 'Weekly Lecture', exact: true })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Lecture Slots', exact: true })).toBeVisible();
      await expectHealthy(page);
      await page.screenshot({
        path: '.artifacts/timetable-settings-feedback/dark-phone.png',
        fullPage: true,
      });
    });
  }
);
