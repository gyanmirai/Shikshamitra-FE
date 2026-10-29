import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  await request.post('/fixture/state');
});

test('overview navigation retains the selected month', async ({ page }) => {
  await page.goto('/hr/payroll?month=2026-09');
  await expect(page.getByRole('link', { name: 'Open payroll workbench' }).first()).toHaveAttribute(
    'href',
    /month=2026-09/
  );
  await page.getByRole('link', { name: 'Open payslips', exact: true }).click();
  await expect(page).toHaveURL(/month=2026-09/);
  await expect(page.getByRole('group', { name: 'Pay period' })).toContainText('2026');
  await expect(page.getByRole('group', { name: 'Pay period' })).toContainText('September');
  await page.reload();
  await expect(page.getByRole('group', { name: 'Pay period' })).toContainText('September');
  await page.getByRole('link', { name: 'Payroll Management', exact: true }).click();
  await expect(page).toHaveURL(/\/hr\/payroll\?month=2026-09/);
  await page.goBack();
  await expect(page.getByRole('group', { name: 'Pay period' })).toContainText('September');
});

test('refresh reads the same preview without starting another calculation', async ({ page }) => {
  const starts: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().endsWith('/api/payroll/run/previews'))
      starts.push(request.url());
  });
  await page.goto('/hr/payroll?month=2026-09&previewRunId=run-1');
  await expect(page.getByText('ESI_WAGE_CLASSIFICATION_REQUIRED')).toHaveCount(0);
  await page.getByRole('button', { name: 'Refresh status' }).click();
  await expect(page.getByRole('button', { name: 'Refresh status' })).toBeEnabled();
  expect(starts).toHaveLength(0);
  await expect(page).toHaveURL(/previewRunId=run-1/);
});

test('blockers explain the action and hide unknown internal codes', async ({ page }) => {
  await page.goto('/hr/payroll?month=2026-09&previewRunId=run-1');
  await expect(
    page.getByText(/Review how earning components count toward ESIC wages/)
  ).toBeVisible();
  await expect(page.getByText('NEW_UNKNOWN_BLOCKER')).toHaveCount(0);
  await expect(
    page.getByText(/Open the payroll workbench to review the affected staff/)
  ).toBeVisible();
});

test('status refresh can recover from a read error without recalculating', async ({ page }) => {
  const starts: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().endsWith('/api/payroll/run/previews'))
      starts.push(request.url());
  });
  await page.goto('/hr/payroll?month=2026-09&previewRunId=run-1');
  await expect(
    page.getByText(/Review how earning components count toward ESIC wages/)
  ).toBeVisible();
  await page.route('**/api/payroll/run/previews/run-1', (route) =>
    route.fulfill({ status: 503, json: { message: 'Synthetic read outage' } })
  );
  await page.getByRole('button', { name: 'Refresh status' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Could not load payroll readiness' })
  ).toBeVisible();
  await page.unroute('**/api/payroll/run/previews/run-1');
  await page.getByRole('button', { name: 'Refresh status' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Could not load payroll readiness' })
  ).toHaveCount(0);
  expect(starts).toHaveLength(0);
  await expect(page).toHaveURL(/previewRunId=run-1/);
});

[390, 768, 1440].forEach((width) => {
  ['light', 'dark'].forEach((theme) => {
    test(`overview guidance remains usable at ${width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto(`/hr/payroll?month=2026-09&previewRunId=run-1&theme=${theme}`);
      await expect(
        page.getByText(/Review how earning components count toward ESIC wages/)
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'Refresh status' })).toBeEnabled();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBe(true);
      await page
        .getByRole('group', { name: 'Payroll month' })
        .getByRole('spinbutton', { name: 'Month', exact: true })
        .press('ArrowDown');
      await expect(page).toHaveURL(/month=2026-08/);
      await expect(page.getByRole('link', { name: 'Open payslips', exact: true })).toHaveAttribute(
        'href',
        /month=2026-08/
      );
    });
  });
});
