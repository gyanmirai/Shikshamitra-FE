/* eslint-disable no-restricted-syntax, no-await-in-loop */
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  expect((await request.post('/fixture/reset')).ok()).toBe(true);
});

async function fillRule(page: import('@playwright/test').Page) {
  const dialog = page.getByRole('dialog', { name: 'Create PF Rule', exact: true });
  await dialog.getByRole('textbox', { name: /^Name/ }).fill('Standard Provident Fund');
  await dialog.getByRole('textbox', { name: /^Code/ }).fill('STD_PF');
  await dialog.getByRole('textbox', { name: /^Staff percentage/ }).fill('12.5');
  await dialog.getByRole('textbox', { name: /^Employer percentage/ }).fill('0');
  await dialog.getByRole('textbox', { name: 'Wage ceiling', exact: true }).fill('15000.25');
  return dialog;
}

test('creates and edits a rule while preserving decimal and zero values', async ({ page }) => {
  await page.goto('/?scenario=pf-page');
  await page.getByRole('button', { name: 'Add PF rule', exact: true }).first().click();
  const dialog = await fillRule(page);
  await expect(dialog.getByRole('heading', { name: 'Rule Details' })).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Contribution Rules' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('cell', { name: '12.5%', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: '0%', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Active', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Edit Standard Provident Fund', exact: true }).click();
  const edit = page.getByRole('dialog', { name: 'Edit PF Rule', exact: true });
  await expect(edit.getByRole('textbox', { name: /^Employer percentage/ })).toHaveValue('0%');
  await expect(edit.getByRole('textbox', { name: 'Wage ceiling', exact: true })).toHaveValue(
    /15,000\.25/
  );
  await edit.getByRole('textbox', { name: /^Staff percentage/ }).fill('13.25');
  await edit.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(edit).toHaveCount(0);
  await expect(page.getByRole('cell', { name: '13.25%', exact: true })).toBeVisible();
  await page.screenshot({ path: '.artifacts/pf-page/populated.png' });
  // Permissions affect the header, empty-state action, coverage setup, and each row action.
  await page.goto('/?scenario=pf-view-only');
  await expect(
    page.getByRole('cell', { name: 'Standard Provident Fund', exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('button', {
      name: /Add PF rule|Edit Standard|Delete Standard|Set up PF coverage/,
    })
  ).toHaveCount(0);
});

test('retains failed drafts, locks saving controls, and supports safe discard', async ({
  page,
}) => {
  await page.goto('/?scenario=pf-page');
  await page.getByRole('button', { name: 'Add PF rule', exact: true }).first().click();
  const dialog = await fillRule(page);
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/payroll/pf-rules?*', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    await pending;
    return route.fulfill({ status: 400, json: { detail: 'Synthetic PF rule save failure.' } });
  });
  await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'close', exact: true })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  release();
  await expect(dialog.getByRole('alert')).toContainText('Synthetic PF rule save failure.');
  await expect(dialog.getByRole('textbox', { name: /^Name/ })).toHaveValue(
    'Standard Provident Fund'
  );
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  const confirmation = page.getByRole('dialog', { name: 'Discard Changes?', exact: true });
  await confirmation.getByRole('button', { name: 'Keep editing', exact: true }).click();
  await expect(dialog.getByRole('textbox', { name: /^Name/ })).toHaveValue(
    'Standard Provident Fund'
  );
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await confirmation.getByRole('button', { name: 'Discard changes', exact: true }).click();
  await expect(dialog).toHaveCount(0);
});

for (const theme of ['light', 'dark']) {
  for (const width of [390, 768, 1440]) {
    test(`PF workspace and form at ${width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/?scenario=pf-page&theme=${theme}`);
      await expect(page.getByRole('heading', { name: 'PF Rule', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Columns', exact: true })).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBe(true);
      await page.screenshot({ path: `.artifacts/pf-page/page-${theme}-${width}.png` });
      await page.getByRole('button', { name: 'Add PF rule', exact: true }).first().click();
      const dialog = page.getByRole('dialog', { name: 'Create PF Rule', exact: true });
      await expect(dialog.getByRole('heading', { name: 'Rule Details', exact: true })).toBeInViewport();
      await expect(dialog.getByRole('button', { name: 'Submit', exact: true })).toBeInViewport();
      await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeInViewport();
      await expect(
        dialog.getByRole('button', { name: 'Create PF Rule information', exact: true })
      ).toBeVisible();
      await page.screenshot({ path: `.artifacts/pf-page/form-${theme}-${width}.png` });
      await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
      await expect(dialog.getByRole('textbox', { name: /^Name/ })).toBeFocused();
      await expect(dialog.getByText('Name is required', { exact: true })).toBeVisible();
    });
  }
}
