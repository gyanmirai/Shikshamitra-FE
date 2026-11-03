import { test, expect } from '@playwright/test';

import {
  login,
  prepare,
  openGuide,
  fixtureApi,
  expectHealthy,
} from './academic-module-setup.helpers';

test.describe(
  'Lecture slot form scrolling',
  { tag: ['@module-academic', '@submodule-setup', '@regression', '@responsive'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await request.post(`${fixtureApi}/fixture/reset`, { data: { visited: true } });
      await prepare(page, request);
      await login(page);
    });

    [
      { width: 1440, height: 900 },
      { width: 1280, height: 720 },
      { width: 768, height: 1024 },
      { width: 390, height: 844 },
    ]
      .flatMap((viewport) => ['light', 'dark'].map((theme) => ({ ...viewport, theme })))
      .forEach((viewport) => {
        test(`lower fields and actions remain usable at ${viewport.width}x${viewport.height} in ${viewport.theme}`, async ({
          page,
          request,
        }) => {
          await prepare(page, request, viewport.theme);
          await page.setViewportSize(viewport);
          await openGuide(page, 'stage=timetable&setting=lecture-slots');
          await page.getByRole('button', { name: 'Lecture Slot', exact: true }).click();
          const submit = page.getByRole('button', { name: 'Submit lecture slots', exact: true });
          const card = submit.locator('xpath=ancestor::*[contains(@class,"MuiCard-root")][1]');
          await expect
            .poll(() => card.evaluate((element) => getComputedStyle(element).overflowY))
            .toBe('auto');
          await page.getByRole('combobox', { name: 'Class', exact: false }).click();
          await page.getByRole('option', { name: 'Class 6', exact: true }).click();
          await page
            .getByRole('button', { name: 'Increase slots for Class 6 slot group 1', exact: true })
            .click();
          await page
            .getByRole('button', { name: 'Increase slots for Class 6 slot group 1', exact: true })
            .click();
          const endMinutes = page.getByRole('spinbutton', { name: 'Minutes', exact: true }).last();
          await endMinutes.press('ArrowUp');
          await expect(endMinutes).toHaveAttribute('aria-valuenow', '1');
          await page.getByRole('button', { name: 'Add slot group', exact: true }).click();
          await expect(page.getByText('Slot Configurations (2)', { exact: true })).toBeVisible();
          await card.hover();
          await page.mouse.wheel(0, 3000);
          await expect.poll(() => card.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
          await page.mouse.wheel(0, 3000);
          await expect(submit).toBeInViewport();
          await submit.click();
          await expect(page.getByText('Total slots is required', { exact: true })).toBeVisible();
          await page.screenshot({ path: `.artifacts/lecture-slot-scroll/${viewport.width}.png` });
          await page.getByRole('button', { name: 'Cancel', exact: true }).click();
          await page.getByRole('button', { name: 'Discard changes', exact: true }).click();
          await expect(
            page.getByRole('button', { name: 'Lecture Slot', exact: true })
          ).toBeVisible();
          await expect(
            page
              .getByRole('contentinfo')
              .getByRole('button', { name: 'Save progress', exact: true })
          ).toBeInViewport();
          await expectHealthy(page);
        });
      });
  }
);
