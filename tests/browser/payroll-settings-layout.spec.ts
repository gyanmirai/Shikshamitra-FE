/* eslint-disable no-restricted-syntax */
import { test, expect } from '@playwright/test';

const screens = [
  ['earnings', 'Earning Component', 'Add earning'],
  ['deductions', 'Deduction Component', 'Add deduction'],
  ['professional-tax', 'Professional tax', 'Add tax range'],
  ['salary-templates', 'Salary Templates', 'Create Template'],
  ['salary-template-editor', 'Create Salary Template', ''],
  ['statutory-schemes', 'Statutory Schemes', ''],
  ['payslip-settings', 'Payslip & statement settings', ''],
] as const;

for (const theme of ['light', 'dark']) {
  for (const [surface, title, action] of screens) {
    for (const width of [390, 768, 1440]) {
      test(`${surface} layout at ${width}px in ${theme}`, async ({ page }, info) => {
        await page.setViewportSize({
          width,
          height: width === 390 ? 844 : width === 768 ? 1024 : 900,
        });
        await page.goto(`/?surface=${surface}&theme=${theme}`);
        await expect(page.getByRole('heading', { name: title, exact: true })).toBeInViewport();
        if (action) {
          const button = page.getByRole('button', { name: action, exact: true }).first();
          await expect(button).toBeInViewport();
          const alignment = await button.evaluate((element) => ({
            right: element.getBoundingClientRect().right,
            headerRight: element.closest('[data-layout]')!.getBoundingClientRect().right,
          }));
          expect(Math.abs(alignment.headerRight - alignment.right - 8)).toBeLessThan(1);
        }
        if (['earnings', 'deductions', 'professional-tax', 'salary-templates'].includes(surface)) {
          await expect(page.locator('tbody tr').first()).toContainText(/Synthetic|IN-GJ/);
          await expect(page.getByRole('combobox', { name: 'Rows per page:' })).toBeInViewport();
        } else if (surface === 'salary-template-editor') {
          await expect(
            page.getByRole('region', { name: 'Salary template configuration' })
          ).toBeVisible();
          await expect(page.getByLabel('Template name', { exact: false })).toBeVisible();
        } else if (surface === 'statutory-schemes') {
          await expect(
            page.getByRole('switch', { name: 'Calculate ESIC in ShikshaMitra' })
          ).toBeVisible();
        } else {
          await expect(page.getByRole('heading', { name: 'School Branding' })).toBeVisible();
          await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeInViewport();
        }
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
        ).toBe(true);
        expect(
          await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight)
        ).toBe(true);
        await page.screenshot({ path: info.outputPath(`${surface}-${theme}-${width}.png`) });
        if (['earnings', 'deductions', 'professional-tax'].includes(surface)) {
          await page.getByRole('button', { name: action, exact: true }).first().click();
          const dialog = page.getByRole('dialog');
          await expect(dialog).toBeVisible();
          const section = dialog.locator('section').first();
          await expect(section.getByRole('button', { name: /information$/ })).toBeVisible();
          await expect(section.getByRole('heading')).toHaveCSS('font-size', '16px');
          await expect(
            dialog.getByRole('button', { name: 'Submit', exact: true })
          ).toBeInViewport();
          const padding = await section.evaluate((element) =>
            Number.parseFloat(getComputedStyle(element).paddingLeft)
          );
          expect(padding).toBeGreaterThanOrEqual(12);
          expect(padding).toBeLessThanOrEqual(16);
          await page.screenshot({ path: info.outputPath(`${surface}-form-${theme}-${width}.png`) });
        }
      });
    }
  }
}

for (const width of [390, 768, 1440]) {
  for (const theme of ['light', 'dark']) {
    test(`ESIC policy drawers retain context and guard unsaved changes at ${width}px in ${theme}`, async ({
      page,
    }, info) => {
      await page.setViewportSize({
        width,
        height: width === 390 ? 844 : width === 768 ? 1024 : 900,
      });
      await page.goto(`/?surface=statutory-schemes&view=policies&theme=${theme}`);
      const create = page.getByRole('button', { name: 'Create policy', exact: true });
      await expect(page.getByRole('button', { name: 'View Synthetic ESIC Policy' })).toBeVisible();
      await create.click();
      const editor = page.getByRole('dialog', { name: 'Create ESIC Policy', exact: true });
      await expect(editor).toBeVisible();
      await expect(editor).toHaveCSS('transform', 'none');
      const bounds = await editor.boundingBox();
      expect(Math.abs(bounds!.x + bounds!.width - width)).toBeLessThan(1);
      if (width === 390) expect(bounds!.x).toBe(0);
      await expect(editor.getByRole('button', { name: 'Submit', exact: true })).toBeInViewport();
      await expect(
        editor.getByRole('button', { name: 'Policy Details information' })
      ).toBeVisible();
      await editor.getByLabel('Policy name', { exact: false }).fill('Unsaved synthetic policy');
      await editor.getByRole('button', { name: 'Cancel', exact: true }).click();
      await page.getByRole('button', { name: 'Keep editing', exact: true }).click();
      await expect(editor.getByLabel('Policy name', { exact: false })).toHaveValue(
        'Unsaved synthetic policy'
      );
      await page.screenshot({ path: info.outputPath(`esi-policy-${theme}-${width}.png`) });
      await editor.getByRole('button', { name: 'close', exact: true }).click();
      await page.getByRole('button', { name: 'Discard changes', exact: true }).click();
      await expect(editor).toHaveCount(0);
      await page.getByRole('button', { name: 'View Synthetic ESIC Policy' }).click();
      const view = page.getByRole('dialog', { name: 'Synthetic ESIC Policy', exact: true });
      await expect(view.getByRole('heading', { name: 'Version 1' })).toBeVisible();
      await view.getByRole('button', { name: 'Close', exact: true }).click();
      await expect(view).toBeHidden();
      await page.getByRole('button', { name: 'New version of Synthetic ESIC Policy' }).click();
      const version = page.getByRole('dialog', { name: 'New ESIC Policy Version' });
      await expect(version.getByLabel('Policy code', { exact: false })).toBeDisabled();
      await expect(version.getByLabel('Policy name', { exact: false })).toHaveValue(
        'Synthetic ESIC Policy'
      );
      await version.getByRole('button', { name: 'Cancel', exact: true }).click();
      await expect(version).toHaveCount(0);
    });
  }
}

test('ESIC policy submission locks the drawer and keeps the draft after a failed request', async ({
  page,
}) => {
  await page.goto('/?surface=statutory-schemes&view=policies');
  await page.getByRole('button', { name: 'Create policy', exact: true }).click();
  const editor = page.getByRole('dialog', { name: 'Create ESIC Policy', exact: true });
  await editor.getByLabel('Policy name', { exact: false }).fill('Synthetic Draft');
  await editor.getByLabel('Policy code', { exact: false }).fill('SYN_DRAFT');
  await editor.getByLabel('Source URL', { exact: false }).fill('https://example.com/policy');
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let submitted: Record<string, unknown> | undefined;
  await page.route('**/api/payroll/statutory-schemes/esi/policies', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    submitted = route.request().postDataJSON();
    await pending;
    return route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({ error: { message: 'Synthetic conflict. Retry your draft.' } }),
    });
  });
  await editor.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(editor.getByRole('button', { name: 'close', exact: true })).toBeDisabled();
  await expect(editor.getByRole('button', { name: 'Cancel', exact: true })).toBeDisabled();
  await expect(editor.getByLabel('Policy name', { exact: false })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(editor).toBeVisible();
  release();
  await expect(editor.getByRole('alert')).toContainText('Synthetic conflict');
  await expect(editor.getByLabel('Policy name', { exact: false })).toHaveValue('Synthetic Draft');
  expect(submitted).toMatchObject({
    name: 'Synthetic Draft',
    code: 'SYN_DRAFT',
    employeePercentage: 0.75,
    employerPercentage: 3.25,
  });
  expect(submitted?.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/);
});

test('Professional Tax retains validation and numeric payloads in the aligned form', async ({
  page,
}) => {
  await page.goto('/?surface=professional-tax');
  await page.getByRole('button', { name: 'Add tax range', exact: true }).click();
  const form = page.getByRole('dialog', { name: 'Add Tax Range', exact: true });
  await form.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(form.getByText('From salary is required')).toBeVisible();
  await expect(form.getByText('Tax amount is required')).toBeVisible();
  await form.getByLabel('From salary', { exact: false }).fill('12000.25');
  await form.getByLabel('Tax amount', { exact: false }).fill('200.5');
  await form.getByRole('switch', { name: 'Deduct in employment cessation month' }).uncheck();
  let submitted: Record<string, unknown> | undefined;
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/payroll/professional-taxes', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    submitted = route.request().postDataJSON();
    await pending;
    return route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({ error: { message: 'Synthetic tax conflict. Retry your draft.' } }),
    });
  });
  await form.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(form.getByRole('button', { name: 'close', exact: true })).toBeDisabled();
  await expect(form.getByRole('button', { name: 'Cancel', exact: true })).toBeDisabled();
  await expect(form.getByLabel('From salary', { exact: false })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(form).toBeVisible();
  release();
  await expect
    .poll(() => submitted)
    .toMatchObject({
      jurisdictionCode: 'IN-GJ',
      fromSalary: 12000.25,
      toSalary: null,
      taxAmount: 200.5,
      isActive: true,
      deductInCessationMonth: false,
    });
  await expect(form).toBeVisible();
  await expect(form.getByRole('alert')).toContainText('Synthetic tax conflict');
  await expect(form.getByLabel('From salary', { exact: false })).toHaveValue('₹ 12,000.25');
  await form.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Edit Tax Range' })).toBeVisible();
  const edit = page.getByRole('dialog', { name: 'Edit Tax Range' });
  let updated: Record<string, unknown> | undefined;
  let updateAttempts = 0;
  await page.route('**/api/payroll/professional-taxes/tax-1', async (route) => {
    updated = route.request().postDataJSON();
    updateAttempts += 1;
    return route.fulfill({
      status: updateAttempts === 1 ? 409 : 200,
      contentType: 'application/json',
      body: '{}',
    });
  });
  await edit.getByLabel('Tax amount', { exact: false }).fill('350.75');
  await edit.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(edit.getByRole('alert')).toBeVisible();
  await expect(edit.getByLabel('Tax amount', { exact: false })).toHaveValue('₹ 350.75');
  expect(updated).toMatchObject({
    fromSalary: 12000,
    toSalary: null,
    taxAmount: 350.75,
    effectiveFrom: '2026-04-01',
  });
  await edit.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(edit).toBeHidden();
});
