/* eslint-disable no-await-in-loop, no-restricted-syntax -- Browser interactions must run in order to preserve focus and form state. */
import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

import {
  login,
  prepare,
  openGuide,
  fixtureApi,
  expectHealthy,
} from './academic-module-setup.helpers';

test.describe(
  'Lecture slot UI consistency',
  {
    tag: [
      '@module-academic',
      '@submodule-timetable',
      '@regression',
      '@responsive',
      '@accessibility',
    ],
  },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await request.post(`${fixtureApi}/fixture/reset`, { data: { visited: true } });
      await prepare(page, request);
      await login(page);
    });

    for (const theme of ['light', 'dark']) {
      for (const viewport of [
        { width: 1440, height: 900 },
        { width: 768, height: 1024 },
        { width: 390, height: 844 },
      ]) {
        test(`all slots, validation and actions work at ${viewport.width} in ${theme}`, async ({
          page,
          request,
        }) => {
          await prepare(page, request, theme);
          await page.setViewportSize(viewport);
          await openGuide(page, 'stage=timetable&setting=lecture-slots');
          await page.getByRole('button', { name: 'Lecture Slot', exact: true }).click();
          await page.getByRole('combobox', { name: 'Class', exact: false }).click();
          await page.getByRole('option', { name: 'Class 6', exact: true }).click();
          const add = page.getByRole('button', {
            name: 'Increase slots for Class 6 slot group 1',
            exact: true,
          });
          const dayGroup = page.getByRole('group', { name: 'Active Days (required)', exact: true });
          await expect(
            dayGroup.getByRole('button', { name: 'Increase slots', exact: false })
          ).toHaveCount(0);
          await expect(
            page
              .getByRole('group', { name: 'Time slots', exact: true })
              .getByRole('button', { name: 'Increase slots', exact: false })
          ).toBeVisible();
          const counter = page.getByRole('group', {
            name: 'Slots per day for Class 6 slot group 1 (required)',
            exact: true,
          });
          await page.getByRole('button', { name: 'Submit lecture slots', exact: true }).click();
          await expect(counter).toBeFocused({ timeout: 3000 });
          const schedule = dayGroup.getByRole('combobox', { name: 'Schedule', exact: true });
          await expect(schedule).toHaveText('Mon–Sat');
          await schedule.click();
          await page.getByRole('option', { name: 'Mon–Fri', exact: true }).click();
          await expect(
            dayGroup.getByRole('button', { name: 'Sat: inactive', exact: true })
          ).toHaveAttribute('aria-pressed', 'false');
          await schedule.click();
          await page.getByRole('option', { name: 'Mon–Sat', exact: true }).click();
          for (let count = 0; count < 7; count += 1) await add.click();
          await expect(
            page.getByRole('table', { name: 'Time slots table' }).getByRole('row')
          ).toHaveCount(8);
          await expect(page.getByRole('group', { name: 'Start time', exact: true })).toHaveCount(7);
          await expect(
            page.getByRole('button', { name: 'Filter column', exact: false })
          ).toHaveCount(0);
          const tableContainer = page
            .getByRole('table', { name: 'Time slots table' })
            .locator('xpath=ancestor::*[contains(@class,"MuiTableContainer-root")][1]');
          expect(
            await tableContainer.evaluate((element) => getComputedStyle(element).maxHeight)
          ).toBe('none');
          for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
            await dayGroup.getByRole('button', { name: `${day}: active`, exact: true }).click();
          await expect(schedule).toHaveText('Custom');
          const submit = page.getByRole('button', { name: 'Submit lecture slots', exact: true });
          await page.getByRole('button', { name: /^Slot Group #1(?: Needs attention)?$/ }).click();
          await submit.click();
          await expect(dayGroup).toHaveAccessibleDescription('Select at least one active day');
          await expect(dayGroup).toBeFocused();
          const accessibility = await new AxeBuilder({ page })
            .include('[data-testid="lecture-slot-form-body"]')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();
          expect(
            accessibility.violations.map(({ id, nodes }) => ({
              id,
              nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
            }))
          ).toEqual([]);
          await schedule.click();
          await page.getByRole('option', { name: 'Mon–Sat', exact: true }).click();
          await expect(dayGroup).not.toHaveAttribute('aria-describedby');
          await page.getByRole('button', { name: 'Add slot group', exact: true }).click();
          const remove = page.getByRole('button', { name: 'Remove slot group 2', exact: true });
          expect(
            await remove.evaluate((element) => element.parentElement?.closest('button'))
          ).toBeNull();
          await remove.press('Enter');
          await expect(page.getByText('Slot Configurations (1)', { exact: true })).toBeVisible();
          await page.screenshot({
            path: `.artifacts/lecture-slot-ui/${viewport.width}-${theme}.png`,
          });
          await page.getByRole('button', { name: 'Cancel', exact: true }).click();
          await page.getByRole('button', { name: 'Keep editing', exact: true }).click();
          await expect(submit).toBeVisible();
          await expectHealthy(page);
        });
      }
    }

    test('standalone form keeps the footer reachable, locks saving and retains failed drafts', async ({
      page,
    }) => {
      await page.goto('/academic/timetableSettings/lectureSlots');
      await page.getByRole('button', { name: 'Lecture Slot', exact: true }).click();
      await page.getByRole('combobox', { name: 'Class', exact: false }).click();
      await page.getByRole('option', { name: 'Class 6', exact: true }).click();
      await page
        .getByRole('button', { name: 'Increase slots for Class 6 slot group 1', exact: true })
        .click();
      await page
        .getByRole('button', { name: 'Increase slots for Class 6 slot group 1', exact: true })
        .click();
      await page
        .getByRole('button', { name: 'Increase slots for Class 6 slot group 1', exact: true })
        .click();
      const submit = page.getByRole('button', { name: 'Submit lecture slots', exact: true });
      const body = page.getByTestId('lecture-slot-form-body');
      const bodyBox = await body.boundingBox();
      const footerBox = await submit.locator('..').boundingBox();
      expect(Math.abs(footerBox!.y - (bodyBox!.y + bodyBox!.height))).toBeLessThan(4);
      await page.screenshot({ path: '.artifacts/lecture-slot-ui/standalone-clean.png' });
      let release: () => void = () => {};
      const pending = new Promise<void>((resolve) => {
        release = resolve;
      });
      await page.route('**/api/academics/timetable/settings/lecture-slots', async (route) => {
        if (route.request().method() !== 'POST') {
          await route.continue();
          return;
        }
        await pending;
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'Synthetic save failure' } }),
        });
      });
      await submit.click();
      await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeDisabled();
      await expect(page.getByRole('button', { name: 'Mon: active', exact: true })).toBeDisabled();
      await expect(submit).toBeDisabled();
      release();
      await expect(submit).toBeEnabled();
      await expect(page.getByRole('group', { name: 'Start time', exact: true })).toHaveCount(3);
      await page.screenshot({ path: '.artifacts/lecture-slot-ui/standalone.png' });
      await expectHealthy(page);
    });
  }
);
