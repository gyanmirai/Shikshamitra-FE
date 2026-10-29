/* eslint-disable import/extensions -- Vite and Playwright share the executable .mjs fixture. */
import type { Page } from '@playwright/test';

import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

import { visibilityNames } from '../fixtures/permission-bulk/catalogue.mjs';

test.beforeEach(async ({ page, request }) => {
  await request.post('/fixture/reset');
  await page.route(/https:\/\/[^/]*iconify[^/]*\//, (route) =>
    route.fulfill({ json: { icons: {} } })
  );
  await page.goto('/', { waitUntil: 'domcontentloaded' });
});

const controls = (page: Page, scope: string) =>
  page.getByRole('group', { name: `${scope} visibility`, exact: true });

async function openVisibility(page: Page, target: string) {
  await page.getByRole('button', { name: `${target} Set Module Visibility`, exact: true }).click();
  await expect(controls(page, 'All modules')).toBeVisible();
  await page.getByRole('button', { name: 'HR/Staff', exact: true }).click();
  await expect(controls(page, 'HR/Staff')).toBeVisible();
}

async function save(page: Page) {
  await page.getByRole('button', { name: 'Review changes', exact: true }).click();
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}

['Role HOD', 'User'].forEach((target) => {
  const user = target === 'User';
  test(`${target} visibility bulk updates filtered module rows and saves exact visibility changes`, async ({
    page,
    request,
  }) => {
    await openVisibility(page, target);
    const review = page.getByRole('button', { name: 'Review changes', exact: true });
    await expect(review).toBeDisabled();
    await page.getByRole('textbox', { name: 'Search permissions' }).fill('Payroll');
    await controls(page, 'HR/Staff')
      .getByRole('button', { name: /^Revoke all/ })
      .click();
    await expect(review).toBeEnabled();
    await page.getByRole('textbox', { name: 'Search permissions' }).clear();
    const editor = page.getByRole('group', {
      name: 'Attendance Management Visible editor',
      exact: true,
    });
    await expect(
      editor.getByRole('radio', { name: user ? 'Deny' : 'Revoke', exact: true })
    ).toBeChecked();
    await page.getByRole('button', { name: 'Academics', exact: true }).click();
    await expect(
      controls(page, 'Academics').getByRole('button', { name: /^Revoke all/ })
    ).toBeEnabled();
    await page.getByRole('button', { name: 'HR/Staff', exact: true }).click();
    await save(page);
    const expectedNames = visibilityNames.filter((name: string) =>
      name.startsWith('ShikshaMitra.Module.HR')
    );
    const expected = (state: string) =>
      expectedNames.map((name: string) => ({
        name,
        ...(user ? { state } : { isGranted: state === 'allow' }),
      }));
    let writes = await (await request.get('/fixture/writes')).json();
    expect(writes).toHaveLength(1);
    expect(writes[0].permissions).toEqual(
      expect.arrayContaining(expected(user ? 'deny' : 'inherit'))
    );
    expect(writes[0].permissions).toHaveLength(expectedNames.length);
    await openVisibility(page, target);
    await expect(
      editor.getByRole('radio', { name: user ? 'Deny' : 'Revoke', exact: true })
    ).toBeChecked();
    await controls(page, 'HR/Staff')
      .getByRole('button', { name: /^Grant all/ })
      .click();
    await save(page);
    writes = await (await request.get('/fixture/writes')).json();
    expect(writes).toHaveLength(2);
    expect(writes[1].permissions).toEqual(expect.arrayContaining(expected('allow')));
    expect(writes[1].permissions).toHaveLength(expectedNames.length);
  });

  test(`${target} all-module visibility bulk restores drafts and remains readable in both themes`, async ({
    page,
    request,
  }, testInfo) => {
    await openVisibility(page, target);
    const global = controls(page, 'All modules');
    const revoke = global.getByRole('button', { name: /^Revoke all/ });
    await revoke.focus();
    await expect(revoke).toBeFocused();
    await revoke.press('Enter');
    expect(
      (
        await new AxeBuilder({ page })
          .include('[role="dialog"]')
          .withTags(['wcag2a', 'wcag2aa'])
          .analyze()
      ).violations
    ).toEqual([]);
    const review = page.getByRole('button', { name: 'Review changes', exact: true });
    await expect(review).toBeEnabled();
    await review.click();
    const dialog = page.getByRole('dialog', { name: 'Review permission changes', exact: true });
    await expect(dialog).toContainText(`${visibilityNames.length} permission changes`);
    await dialog.getByRole('button', { name: 'Back to editing', exact: true }).click();
    await global.getByRole('button', { name: user ? /^Follow role/ : /^Grant all/ }).click();
    await expect(review).toBeDisabled();
    await ['light', 'dark'].reduce(async (previous, theme) => {
      await previous;
      if (theme === 'dark') {
        await page.getByRole('button', { name: 'Cancel', exact: true }).click();
        await page.getByRole('button', { name: 'Use dark theme', exact: true }).click();
        await openVisibility(page, target);
      }
      await expect(global).toBeInViewport();
      await expect(controls(page, 'HR/Staff')).toBeInViewport();
      await expect(review).toBeInViewport();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBe(true);
      const audit = await new AxeBuilder({ page })
        .include('[role="dialog"]')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      expect(audit.violations).toEqual([]);
      await page.screenshot({
        path: testInfo.outputPath(`${user ? 'user' : 'role'}-visibility-${theme}.png`),
      });
    }, Promise.resolve());
    expect(await (await request.get('/fixture/writes')).json()).toEqual([]);
  });
});
