import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  await request.post('/fixture/state');
});

test('opens saved and empty months without generating payroll', async ({ page }) => {
  const starts: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().endsWith('/api/payroll/run/previews'))
      starts.push(request.url());
  });
  await page.goto('/hr/payroll?month=2026-09');
  await expect(page.getByText(/Review how earning components count toward ESIC wages/)).toBeVisible();
  await page.goto('/hr/payroll?month=2026-08');
  await expect(page.getByText(/No payroll has been generated for this month/)).toBeVisible();
  expect(starts).toHaveLength(0);
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

test('the register keeps payroll checks and server criteria in their standard controls', async ({
  page,
}) => {
  await page.goto('/hr/payroll/run-payroll?month=2026-09&previewRunId=run-1');
  const register = page.getByRole('region', { name: 'Payroll Register' });
  await expect(register.getByRole('columnheader', { name: /Net pay/ })).toBeVisible();
  await expect(register.getByRole('columnheader', { name: 'Full-month gross' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'View registrations' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Payroll checks', exact: true }).click();
  const checks = page.getByRole('dialog', { name: 'Payroll Checks' });
  await expect(checks.getByRole('button', { name: 'View registrations' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(checks).toHaveCount(0);

  await register.getByRole('button', { name: 'Filter Status' }).click();
  await page.getByRole('combobox', { name: /^Status/ }).click();
  await page.getByRole('option', { name: 'Reviewed', exact: true }).click();
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page).toHaveURL(/registerState=REVIEWED/);
  await expect(page.getByRole('dialog', { name: 'Filter Status' })).toHaveCount(0);
  await expect(register).toHaveAttribute('aria-busy', 'false');
  await register.getByRole('button', { name: 'Filter Issues' }).click();
  const issueFilter = page.getByRole('dialog', { name: 'Filter Issues' });
  await expect(issueFilter).toBeVisible();
  await issueFilter.getByRole('combobox', { name: /^Issues/ }).click();
  await page.getByRole('option', { name: 'Blocking issues', exact: true }).click();
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page).toHaveURL(/registerIssue=CRITICAL/);
  await expect(issueFilter).toHaveCount(0);
  await expect(register).toHaveAttribute('aria-busy', 'false');

  const sorted = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname === '/api/payroll/run/register' && url.searchParams.get('sort') === 'netPay';
  });
  await register.getByRole('button', { name: 'Sort by Net pay' }).click();
  const criteria = new URL((await sorted).url()).searchParams;
  expect(criteria.get('reviewState')).toBe('REVIEWED');
  expect(criteria.get('issueClass')).toBe('CRITICAL');
  expect(criteria.get('page')).toBe('0');
  await register.getByRole('button', { name: 'Clear (2)', exact: true }).click();
  await expect(page).not.toHaveURL(/registerState=|registerIssue=/);
  await expect(page).toHaveURL(/registerSort=netPay/);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: 'Payroll checks', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('HR sends only ready rows and the principal confirms the exact batch', async ({ page }) => {
  const clean = { employeeId: 'staff-1', employeeName: 'Ready Staff', employeeIdentifier: 'S1', payableDays: 22,
    totalEarnings: 10500, totalDeduction: 500, netPay: 10000, grossSalary: 10500, reviewStatus: 'REVIEWED', issueCodes: [] };
  const blocked = { ...clean, employeeId: 'staff-2', employeeName: 'Blocked Staff', employeeIdentifier: 'S2',
    issueCodes: ['NO_WORKING_DAYS'] };
  let state: 'Pending' | 'Finalized' | null = null;
  let submission: Record<string, unknown> | undefined;
  let confirmation: Record<string, unknown> | undefined;
  const batch = () => ({
    id: 'batch-1', state, version: state === 'Pending' ? 1 : 2, staffCount: 1, netPay: 10000,
    submitterId: 'hr', approverId: 'principal', selfFinalization: false, isStale: false,
    allowedActions: state === 'Pending' && page.url().includes('actor=principal') ? ['finalize', 'return'] : [],
  });
  await page.route('**/api/payroll/run/approval-settings', (route) => route.fulfill({
    json: { mode: 'Active', version: 2, approverId: 'principal', allowSelfFinalization: false },
  }));
  await page.route('**/api/payroll/run/register?*', (route) => route.fulfill({ json: {
    previewRunId: 'run-1', isCurrent: true, isGenerated: false, totalCount: 2, currentPage: 0, pageSize: 25,
    items: [{ ...clean, isSubmitted: state === 'Pending', isLocked: state === 'Finalized' }, blocked],
    readiness: { month: '2026-09', employeeCount: 2, snapshotCount: 2, lockedCount: state === 'Finalized' ? 1 : 0,
      reviewedCount: 2, canPreview: true, blockingIssues: [], missingAttendanceCount: 0,
      missingSalaryStructureCount: 0, policyConfigurationIssueCount: 0 },
  } }));
  await page.route('**/api/payroll/run/submissions**', async (route) => {
    const request = route.request();
    if (request.method() === 'POST' && request.url().endsWith('/finalize')) {
      confirmation = request.postDataJSON();
      state = 'Finalized';
      return route.fulfill({ json: batch() });
    }
    if (request.method() === 'POST') {
      submission = request.postDataJSON();
      state = 'Pending';
      return route.fulfill({ json: batch() });
    }
    if (request.url().endsWith('/batch-1')) return route.fulfill({ json: { submission: batch(), items: [clean] } });
    return route.fulfill({ json: state ? [batch()] : [] });
  });
  await page.goto('/hr/payroll/run-payroll?month=2026-09&actor=hr');
  await page.getByRole('checkbox', { name: 'Select payroll for Ready Staff' }).check();
  await page.getByRole('checkbox', { name: 'Select payroll for Blocked Staff' }).check();
  await expect(page.getByRole('button', { name: 'Review sheet Excel' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Review sheet PDF' })).toBeVisible();
  await page.getByRole('button', { name: 'Send for approval' }).click();
  await page.getByRole('button', { name: 'Confirm and send' }).click();
  await expect(page.getByText('Batch sent for approval.')).toBeVisible();
  expect(submission).toMatchObject({ employeeIds: ['staff-1'], expectedSettingsVersion: 2, selfFinalize: false });
  expect(submission?.commandKey).toBeTruthy();
  await expect(page.getByRole('button', { name: 'Finalize batch' })).toHaveCount(0);

  await page.goto('/hr/payroll/run-payroll?month=2026-09&actor=principal');
  await page.getByRole('button', { name: 'Approval batches (1 pending)' }).click();
  await expect(page.getByRole('table', { name: 'Staff in payroll approval batch' }).getByText(/Ready Staff/)).toBeVisible();
  await expect(page.getByRole('table', { name: 'Staff in payroll approval batch' }).getByText(/Blocked Staff/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Finalize batch' }).click();
  await page.getByRole('button', { name: 'Confirm finalization' }).click();
  await expect(page.getByText('1 staff finalized.')).toBeVisible();
  expect(confirmation).toMatchObject({ expectedVersion: 1 });
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.getByText('Partially finalized', { exact: true })).toBeVisible();
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
