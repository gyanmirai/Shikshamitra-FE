import { test, expect } from '@playwright/test';

async function selectStaff(page: import('@playwright/test').Page, name = 'Synthetic Employee A') {
  const lookup = page.getByRole('button', { name: 'Find by employee', exact: true });
  if (await lookup.isVisible()) await lookup.click();
  const staff = page.getByRole('combobox', { name: 'Staff member' });
  await staff.fill('Synthetic');
  await page.getByRole('option', { name, exact: true }).click();
}

test('browse issued periods, search by staff code, and open a saved payslip', async ({ page }) => {
  await page.goto('/?month=2026-09');
  await expect(page.getByRole('link', { name: 'Settings' })).toHaveAttribute(
    'href',
    '/hr/payroll/setting/payslip-statement-settings'
  );
  const table = page.getByRole('table', { name: 'Issued payslips table' });
  await expect(table.getByText('Synthetic Employee B')).toBeVisible();
  await expect(table.getByText('Synthetic Employee A')).toHaveCount(0);
  await page.getByRole('button', { name: 'Show all periods' }).click();
  await expect(table.getByText('Synthetic Employee A')).toBeVisible();
  await page.getByRole('textbox', { name: 'Search table' }).fill('PAY-002');
  await expect(table.getByText('Synthetic Employee A')).toHaveCount(0);
  await page
    .getByRole('button', { name: 'View payslip for Synthetic Employee B, Sep 2026' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Synthetic Employee B · Sep 2026' })
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Payslip PDF viewer' }).locator('canvas')
  ).toHaveCount(2);
  await page.getByRole('button', { name: 'Back to payslips' }).click();
  await expect(page.getByRole('textbox', { name: 'Search table' })).toHaveValue('PAY-002');
});

test('filter an employee statement from its shared table', async ({ page }) => {
  await page.goto('/?view=statement&month=2026-10');
  const workspace = page.getByTestId('hr-employee-statement');
  await expect(workspace.getByRole('combobox', { name: 'Staff member' })).toBeVisible();
  await expect(workspace.getByLabel('From month')).toBeVisible();
  await expect(workspace.getByLabel('To month')).toBeVisible();
  await expect(
    page.getByText('Choose a staff member and a valid pay period to preview a statement.')
  ).toBeVisible();
  await selectStaff(page);
  const preview = page.getByRole('table', { name: 'Employee salary statement Preview table' });
  await expect(workspace.getByText('Period totals', { exact: true })).toBeVisible();
  await expect(preview.getByText('May 2026', { exact: true })).toBeVisible();
  await expect(preview.getByText(/₹\s*2,050\.00/).first()).toBeVisible();
  await workspace.getByRole('button', { name: 'Last 3 months' }).click();
  await expect(preview.getByText('Aug 2026', { exact: true })).toBeVisible();
  await expect(preview.getByText('May 2026', { exact: true })).toHaveCount(0);
  await workspace.getByRole('textbox', { name: 'Search table' }).fill('2026-09');
  await expect(workspace.getByText('Displayed row totals', { exact: true })).toBeVisible();
  await expect(preview.getByText('Sep 2026', { exact: true })).toBeVisible();
  await expect(preview.getByText('Aug 2026', { exact: true })).toHaveCount(0);
  await workspace.getByText('Document options', { exact: true }).click();
  await expect(workspace.getByRole('button', { name: 'Use school column preset' })).toBeVisible();
});

test('school payroll register groups its controls and filters the issued rows in the shared table', async ({
  page,
}) => {
  await page.goto('/?view=register&month=2026-10');
  const workspace = page.getByTestId('hr-school-payroll-register');
  const table = workspace.getByRole('table', { name: 'School payroll register Preview table' });
  await expect(workspace.getByRole('group', { name: 'Payroll month' })).toBeVisible();
  await expect(workspace.getByRole('combobox', { name: 'Document columns' })).toBeVisible();
  await expect(workspace.getByRole('button', { name: 'Refresh preview' })).toBeEnabled();
  await expect(workspace.getByRole('button', { name: 'Columns', exact: true })).toBeVisible();
  await expect(workspace.getByText('Payroll totals', { exact: true })).toBeVisible();
  await expect(table.getByText('Oct 2026', { exact: true })).toHaveCount(2);
  await expect(table.getByText('Issued', { exact: true })).toHaveCount(2);
  await expect(table.getByText(/₹\s*54,500\.00/)).toBeVisible();

  await workspace.getByRole('button', { name: 'Report notes (1)' }).click();
  await expect(page.getByRole('dialog', { name: 'Report notes' })).toContainText('2 of 2 staff finalized.');
  await page.getByRole('button', { name: 'Close report notes' }).click();
  await workspace.getByRole('textbox', { name: 'Search table' }).fill('PAY-002');
  await expect(table.getByText('Synthetic Employee A')).toHaveCount(0);
  await expect(table.getByText('Synthetic Employee B')).toBeVisible();
  await expect(workspace.getByText('Displayed row totals', { exact: true })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(workspace.getByRole('button', { name: 'Refresh preview' })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

[
  [390, 844],
  [768, 1024],
  [1440, 900],
].forEach(([width, height]) => {
  ['light', 'dark'].forEach((theme) => {
    test(`readable PDF, grouped controls and reachable history at ${width}px ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/?theme=${theme}`);
      await selectStaff(page);
      const viewer = page.getByRole('region', { name: 'Payslip PDF viewer' });
      await expect(viewer.locator('canvas')).toHaveCount(2);
      await expect(page.getByRole('combobox', { name: 'PDF zoom' })).toContainText('Fit width');
      const actions = page.getByRole('group', { name: 'Payslip actions' });
      await expect(actions.getByRole('button')).toHaveText([
        'Print',
        'Download',
        'Resend',
        'Record payment',
        'Replace document details',
        'Correct payroll',
      ]);
      await expect(actions.getByRole('button', { name: 'Print', exact: true })).toBeEnabled();
      await viewer.scrollIntoViewIfNeeded();
      const before = await actions.boundingBox();
      await viewer.focus();
      await viewer.press('End');
      await expect.poll(() => viewer.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
      expect(await actions.boundingBox()).toEqual(before);
      await page.getByRole('combobox', { name: 'PDF zoom' }).click();
      await page.getByRole('option', { name: '150%', exact: true }).click();
      await viewer.focus();
      await viewer.press('Home');
      await viewer.press('End');
      await expect.poll(() => viewer.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
      await page.getByRole('button', { name: 'Document versions' }).click();
      await page.getByRole('button', { name: 'View', exact: true }).last().click();
      await expect(viewer.locator('canvas')).toHaveCount(2);
      await expect(actions.getByRole('button', { name: 'Record payment' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Delivery history' })).toBeVisible();
      await page.getByRole('button', { name: 'Delivery history' }).click();
      await expect(page.getByText(/Accepted by email provider/)).toBeVisible();
      await selectStaff(page, 'Synthetic Employee B');
      await expect(viewer.locator('canvas')).toHaveCount(2);
      await expect(actions.getByRole('button', { name: 'Print', exact: true })).toBeEnabled();
      await expect(page.getByRole('combobox', { name: 'PDF zoom' })).toContainText('Fit width');
      await expect.poll(() => viewer.evaluate((el) => el.scrollTop)).toBe(0);
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <= window.innerWidth &&
            document.body.scrollWidth <= window.innerWidth &&
            document.body.scrollHeight <= window.innerHeight
        )
      ).toBe(true);
      await page.screenshot({
        path: `.artifacts/salary-documents/${width}-${theme}.png`,
        fullPage: true,
      });
    });
  });
});

test('keeps controls available through PDF loading, failure and retry', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/payslip-documents/*/pdf', async (route) => {
    await pending;
    await route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
  });
  await page.goto('/');
  await selectStaff(page);
  await expect(page.getByLabel('Loading payslip', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Print', exact: true })).toBeDisabled();
  await expect(page.getByRole('combobox', { name: 'Staff member' })).toBeEnabled();
  release();
  await expect(page.getByText('The payslip PDF could not be loaded.')).toBeVisible();
  await page.unroute('**/payslip-documents/*/pdf');
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(
    page.getByRole('region', { name: 'Payslip PDF viewer' }).locator('canvas')
  ).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Print', exact: true })).toBeEnabled();
});
