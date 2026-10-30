import { test, expect } from '@playwright/test';

import { login, expectHealthy } from './academic-module-setup.helpers';

const fixtureApi = 'http://127.0.0.1:4477';
test.describe(
  'Weekly Lectures class capacity',
  { tag: ['@module-academic', '@submodule-timetable', '@regression'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await request.post('http://127.0.0.1:4479/fixture/reset', { data: { setupCompleted: true } });
      await request.post(`${fixtureApi}/fixture/reset`);
      const selection = await (await request.get(`${fixtureApi}/fixture/context`)).json();
      await page.addInitScript((context) => {
        localStorage.setItem('onboarding_completed', 'true');
        localStorage.setItem(
          'persist:root',
          JSON.stringify({
            globalState: JSON.stringify({
              currentYear: context.year,
              currentBoard: context.board,
              currentMedium: context.medium,
            }),
            _persist: JSON.stringify({ version: -1, rehydrated: true }),
          })
        );
      }, selection);
      await login(page);
    });

    test('saved Std 4 slots load published subjects and allow a weekly target to be saved', async ({
      page,
      request,
    }) => {
      await page.goto('/academic/timetableSettings/lectureSlots');
      const row = page.getByRole('row').filter({ hasText: 'Std 4' });
      await expect(row).toContainText('39/week');
      await page.goto('/academic/timetableSettings/weeklyLectures');
      await page.getByRole('button', { name: /Weekly Lecture$/ }).click();
      const dialog = page.getByRole('dialog', { name: 'Add Weekly Lectures', exact: true });
      await expect(dialog.getByRole('combobox', { name: 'Class *', exact: true })).toContainText(
        'Std 4'
      );
      await expect(
        dialog.getByText('Weekly lectures not configured yet.', { exact: true })
      ).toBeVisible();
      await expect(dialog.getByText(/Lecture Slots are not configured/)).toHaveCount(0);
      await expect(dialog.getByText('Mathematics', { exact: true })).toBeVisible();
      await dialog.getByRole('spinbutton', { name: 'Weekly lectures' }).fill('6');
      await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
      await expect(dialog).toHaveCount(0);
      await expect
        .poll(
          async () =>
            (await (await request.get(`${fixtureApi}/fixture/snapshot`)).json()).weekly[0]
              ?.subjects[0]?.weeklyLectures
        )
        .toBe(6);
      await expectHealthy(page);
      await page.screenshot({
        path: '.artifacts/timetable-weekly-slots/saved.png',
        fullPage: true,
      });
    });

    test('class changes show the exact missing context and distinguish unpublished subjects', async ({
      page,
    }) => {
      await page.goto('/academic/timetableSettings/weeklyLectures');
      await page.getByRole('button', { name: /Weekly Lecture$/ }).click();
      const dialog = page.getByRole('dialog', { name: 'Add Weekly Lectures', exact: true });
      await expect(dialog.getByText('Mathematics', { exact: true })).toBeVisible();
      await dialog.getByRole('combobox', { name: 'Class *', exact: true }).click();
      await page.getByRole('option', { name: 'Std 5', exact: true }).click();
      await expect(
        dialog.getByText(
          /Lecture Slots are not configured for Std 5 \/ 2026-2027 \/ GSEB \/ English/
        )
      ).toBeVisible();
      await expect(dialog.getByText(/No published subject assignments were found/)).toBeVisible();
      await expect(dialog.getByText('Mathematics', { exact: true })).toHaveCount(0);
      await dialog.getByRole('combobox', { name: 'Class *', exact: true }).click();
      await page.getByRole('option', { name: 'Std 4', exact: true }).click();
      await expect(dialog.getByText('Mathematics', { exact: true })).toBeVisible();
      await expect(dialog.getByText(/Lecture Slots are not configured/)).toHaveCount(0);
      await expectHealthy(page);
      await page.screenshot({
        path: '.artifacts/timetable-weekly-slots/configured.png',
        fullPage: true,
      });
    });
  }
);
