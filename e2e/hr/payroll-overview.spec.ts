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

test('opening a saved workbench reads the register once without calculating', async ({ page }) => {
  const registerReads: string[] = [];
  const calculations: string[] = [];
  page.on('request', (request) => {
    const { pathname } = new URL(request.url());
    if (request.method() === 'GET' && pathname === '/api/payroll/run/register')
      registerReads.push(request.url());
    if (request.method() === 'POST' && pathname === '/api/payroll/run/previews')
      calculations.push(request.url());
  });
  const discovered = page.waitForResponse((response) =>
    new URL(response.url()).pathname === '/api/payroll/run/previews/run-1'
  );
  await page.goto('/hr/payroll/run-payroll?month=2026-09');
  await discovered;
  const register = page.getByRole('region', { name: 'Payroll Register' });
  await expect(register.getByText('Asha Rao')).toBeVisible();
  await expect(register).toHaveAttribute('aria-busy', 'false');
  expect(registerReads).toHaveLength(1);
  expect(calculations).toHaveLength(0);
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

test('aligns review actions with the register heading and keeps recalculation on the right', async ({
  page,
}) => {
  await page.goto('/hr/payroll/run-payroll?month=2026-09&previewRunId=run-1&actor=auditor');
  const register = page.getByRole('region', { name: 'Payroll Register' });
  const reviewActions = register.getByRole('group', { name: 'Review and lock selected payroll rows' });
  await expect(reviewActions).toHaveCount(0);
  await register.getByRole('checkbox', { name: 'Select payroll for Asha Rao' }).check();
  await expect(reviewActions.getByRole('button', { name: 'Lock Reviewed' })).toBeVisible();

  const heading = (await register.getByText('Payroll Register', { exact: true }).boundingBox())!;
  const review = (await reviewActions.boundingBox())!;
  expect(review.x).toBeGreaterThan(heading.x + heading.width);
  expect(review.y).toBeLessThan(heading.y + heading.height);
  const checks = (await page.getByRole('button', { name: 'Payroll checks' }).boundingBox())!;
  const activity = (await page.getByRole('button', { name: 'Payroll activity' }).boundingBox())!;
  const recalculate = (await page.getByRole('button', { name: 'Recalculate payroll' }).boundingBox())!;
  expect(activity.x - (checks.x + checks.width)).toBeGreaterThanOrEqual(0);
  expect(activity.x - (checks.x + checks.width)).toBeLessThanOrEqual(16);
  expect(recalculate.x - (activity.x + activity.width)).toBeGreaterThanOrEqual(0);
  expect(recalculate.x - (activity.x + activity.width)).toBeLessThanOrEqual(16);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(reviewActions).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Payroll checks' })).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Payroll activity' })).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Recalculate payroll' })).toBeInViewport();
});

test('approval settings are separate and recovery returns to the selected month', async ({ page }) => {
  let settings = {
    mode: 'Paused',
    version: 3,
    approverId: 'principal',
    allowSelfFinalization: false,
  };
  await page.route('**/api/payroll/run/approval-settings', (route) => {
    if (route.request().method() === 'PUT') {
      expect(route.request().postDataJSON()).toMatchObject({
        approverId: 'admin',
        expectedVersion: 4,
        reason: 'Use the backup approver',
      });
      settings = { ...settings, approverId: 'admin', version: 5 };
    }
    return route.fulfill({ json: settings });
  });
  await page.route('**/api/payroll/run/approval-settings/approvers?*', (route) =>
    route.fulfill({ json: [
      { id: 'principal', name: 'Test Principal' },
      { id: 'admin', name: 'Backup Admin' },
    ] })
  );
  await page.route('**/api/payroll/run/approval-settings/resume', (route) => {
    expect(route.request().postDataJSON()).toMatchObject({
      expectedVersion: 3,
      reason: 'Resume synthetic payroll',
    });
    settings = { ...settings, mode: 'Active', version: 4 };
    return route.fulfill({ json: settings });
  });
  await page.route('**/api/payroll/run/submissions?*', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/payroll/run/submissions', (route) => route.fulfill({
    status: 400,
    json: { errorCode: 'PAYROLL_APPROVER_UNAVAILABLE' },
  }));
  await page.goto('/hr/payroll/run-payroll?month=2026-09&actor=hr');
  await expect(page.getByText(/Payroll approval is paused/)).toBeVisible();
  await expect(page.getByText(/Contact your payroll administrator/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open approval settings' })).toHaveCount(0);
  await page.goto('/hr/payroll/setting/approval-workflow?returnMonth=2026-09');
  await expect(page.getByText(/You do not have access to manage/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save settings' })).toHaveCount(0);

  await page.goto('/hr/payroll/setting?actor=manager');
  await page.getByRole('link', { name: 'Open approval workflow' }).click();
  await expect(page.getByRole('heading', { name: 'Approval Workflow', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to Run Payroll' })).toHaveCount(0);
  await page.goto('/hr/payroll/run-payroll?month=2026-09');
  const recovery = page.getByRole('link', { name: 'Open approval settings' });
  await expect(recovery).toHaveAttribute('href', '/hr/payroll/setting/approval-workflow?returnMonth=2026-09');
  await recovery.click();
  await expect(page.getByRole('button', { name: 'Resume workflow' })).toBeDisabled();
  await page.getByRole('textbox', { name: /Reason for change/ }).fill('Resume synthetic payroll');
  await page.getByRole('button', { name: 'Resume workflow' }).click();
  await expect(page.getByText('Approval workflow updated.')).toBeVisible();
  const approver = page.getByRole('combobox', { name: /Designated principal or admin/ });
  await approver.fill('Backup');
  await page.getByRole('option', { name: 'Backup Admin', exact: true }).click();
  await expect(page.getByText(/Pending batches stay assigned/)).toBeVisible();
  await page.getByRole('textbox', { name: /Reason for change/ }).fill('Use the backup approver');
  await page.getByRole('button', { name: 'Save settings' }).click();
  await expect(page.getByText('Approval workflow updated.')).toBeVisible();
  await page.getByRole('link', { name: 'Back to Run Payroll' }).click();
  await expect(page).toHaveURL(/\/hr\/payroll\/run-payroll\?month=2026-09/);
  await expect(page.getByRole('button', { name: 'Approval batches' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open approval settings' })).toHaveCount(0);
  await page.getByRole('checkbox', { name: 'Select payroll for Asha Rao' }).check();
  await page.getByRole('button', { name: 'Send for approval', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm and send' }).click();
  const sendDialog = page.getByRole('dialog', { name: 'Send payroll for approval' });
  await expect(sendDialog.getByText(/needs payroll lock permission/)).toBeVisible();
  await expect(sendDialog.getByRole('link', { name: 'Open approval settings' })).toHaveAttribute(
    'href',
    '/hr/payroll/setting/approval-workflow?returnMonth=2026-09'
  );
});

test('missing attendance blocks payroll review and is skipped by select all', async ({ page }) => {
  let allAttendanceMissing = false;
  await page.route('**/api/payroll/run/register?*', async (route) => {
    const response = await route.fetch();
    const result = await response.json();
    result.items = result.items.map((row: { employeeName: string; issueCodes: string[] }) => ({
      ...row,
      reviewStatus: 'PENDING',
      issueCodes: allAttendanceMissing || row.employeeName === 'Vikram Shah'
        ? ['NO_ATTENDANCE']
        : row.issueCodes,
    }));
    await route.fulfill({ response, json: result });
  });
  await page.route('**/api/payroll/run/reviews', (route) =>
    route.fulfill({ json: { employeesProcessed: 1, message: 'Marked 1 payroll row as reviewed.' } })
  );
  await page.goto('/hr/payroll/run-payroll?month=2026-09&actor=hr');
  const blocked = page.getByRole('checkbox', { name: 'Select payroll for Vikram Shah' });
  const eligible = page.getByRole('checkbox', { name: 'Select payroll for Asha Rao' });
  await expect(blocked).toBeDisabled();
  const attendance = page.getByText('Attendance missing', { exact: true });
  await expect(attendance).toBeVisible();
  expect(await attendance.evaluate((element) => element.closest('[title]'))).toBeNull();
  await page.getByRole('checkbox', { name: /Select all .*payroll rows on this page/ }).check();
  await expect(blocked).not.toBeChecked();
  await expect(eligible).toBeChecked();
  const review = page.waitForRequest((request) =>
    request.method() === 'POST' && new URL(request.url()).pathname === '/api/payroll/run/reviews'
  );
  await page.getByRole('button', { name: 'Mark Reviewed', exact: true }).click();
  expect((await review).postDataJSON().employeeIds).toEqual(['fixture-staff-1']);

  allAttendanceMissing = true;
  await page.reload();
  await expect(attendance).toHaveCount(2);
  await expect(page.getByRole('checkbox', { name: /Select all .*payroll rows on this page/ }))
    .toBeDisabled();
  await expect(page.getByText(/Record attendance and recalculate payroll before reviewing/))
    .toHaveCount(0);
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

test('routes section payroll for review and requires an HR override after return', async ({ page }) => {
  const workbench = '/hr/payroll/run-payroll?month=2026-09&previewRunId=run-1';
  await page.goto('/hr/payroll/setting/approval-workflow?actor=manager');
  await page.getByRole('button', { name: 'Add section' }).click();
  await page.getByRole('combobox', { name: /School section/ }).click();
  await page.getByRole('option', { name: 'Primary', exact: true }).click();
  await page.getByRole('combobox', { name: /Review role/ }).click();
  await page.getByRole('option', { name: 'Primary principal', exact: true }).click();
  await expect(page.getByText('Eligible reviewers: Test Section Principal')).toBeVisible();
  await page.getByRole('textbox', { name: /Reason for change/ }).fill('Enable the synthetic workflow');
  await page.getByRole('button', { name: 'Save section review' }).click();
  await expect(page.getByText('Section review active', { exact: true })).toBeVisible();

  await page.goto(`${workbench}&actor=section-hr`);
  await page.getByRole('checkbox', { name: 'Select payroll for Asha Rao' }).check();
  await page.getByRole('button', { name: 'Send for section review' }).click();
  await page.getByRole('button', { name: 'Confirm and send' }).click();
  await expect(page.getByText('Sent 1 batch for section review.')).toBeVisible();
  await page.reload();
  await page.getByRole('checkbox', { name: 'Select payroll for Asha Rao' }).check();
  await expect(page.getByRole('button', { name: 'Lock Reviewed', exact: true })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Unmark', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Send for section review' })).toHaveCount(0);
  await expect(page.getByText('Awaiting section review', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Lock Reviewed', exact: true }).click();
  const pendingLock = page.getByRole('dialog', { name: 'Lock Reviewed Payroll Rows' });
  await expect(pendingLock.getByRole('textbox', { name: /Section review override reason/ })).toHaveAttribute('required');
  await expect(pendingLock.getByRole('button', { name: 'Lock reviewed payroll', exact: true })).toBeDisabled();

  // A replacement preview still has the old section claim, but needs a fresh HR review.
  const registerUrl = '**/api/payroll/run/register?*';
  await page.route(registerUrl, async (route) => {
    const response = await route.fetch();
    const result = await response.json();
    result.items = result.items.map((item: { employeeId: string }) =>
      item.employeeId === 'fixture-staff-1' ? { ...item, reviewStatus: 'PENDING' } : item
    );
    await route.fulfill({ response, json: result });
  });
  await page.reload();
  await page.getByRole('checkbox', { name: 'Select payroll for Asha Rao' }).check();
  await expect(page.getByRole('button', { name: 'Mark Reviewed', exact: true })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Lock Reviewed', exact: true })).toBeDisabled();
  await page.unroute(registerUrl);

  await page.goto(`${workbench}&actor=section-reviewer`);
  await page.getByRole('button', { name: /Section review batches/ }).click();
  const reviewerBatch = page.getByRole('dialog', { name: 'Section Review Batches' });
  await expect(reviewerBatch.getByText('Asha Rao (PAY-001)')).toBeVisible();
  await expect(reviewerBatch.getByRole('button', { name: 'Mark section reviewed' })).toBeVisible();
  await expect(reviewerBatch.getByRole('button', { name: 'Finalize batch' })).toHaveCount(0);
  await reviewerBatch.getByRole('button', { name: 'Return to HR' }).click();
  const returnBatch = page.getByRole('dialog', { name: 'Return to HR' });
  await expect(returnBatch.getByRole('button', { name: 'Return to HR' })).toBeDisabled();
  await returnBatch.getByRole('textbox', { name: /Reason/ }).fill('Confirm payable days.');
  await returnBatch.getByRole('button', { name: 'Return to HR' }).click();
  await expect(reviewerBatch.getByText('Confirm payable days.')).toBeVisible();

  await page.goto(`${workbench}&actor=section-hr`);
  await page.getByRole('checkbox', { name: 'Select payroll for Asha Rao' }).check();
  await page.getByRole('button', { name: 'Lock Reviewed', exact: true }).click();
  const lock = page.getByRole('dialog', { name: 'Lock Reviewed Payroll Rows' });
  const confirmLock = lock.getByRole('button', { name: 'Lock reviewed payroll', exact: true });
  await confirmLock.click();
  await expect(lock.getByRole('textbox', { name: /Section review override reason/ })).toHaveAttribute('required');
  await expect(confirmLock).toBeDisabled();
  await lock.getByRole('textbox', { name: /Section review override reason/ }).fill('Approved exception');
  const recorded = page.waitForRequest((request) =>
    request.method() === 'POST' && new URL(request.url()).pathname === '/api/payroll/run'
  );
  await confirmLock.click();
  expect((await recorded).postDataJSON()).toMatchObject({
    employeeIds: ['fixture-staff-1'],
    sectionReviewOverrideReason: 'Approved exception',
  });
  await expect(lock).toHaveCount(0);
  await expect(page.getByRole('row', { name: /Asha Rao/ })).toContainText('Finalized');
});
