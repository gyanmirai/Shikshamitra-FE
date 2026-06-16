/* eslint-disable import/no-extraneous-dependencies */
import { test, expect, type Page } from '@playwright/test';

import { employeeApiRequest } from './employee/employee-api';

const reportsE2EEnabled = process.env.E2E_HR_REPORTS === '1';

type ApiResponse = Awaited<ReturnType<typeof employeeApiRequest>>;

async function expectOk(response: ApiResponse, label: string) {
  const details = response.ok() ? '' : await response.text();
  expect(response.ok(), `${label}: ${response.status()} ${details}`).toBe(true);
}

async function getJson(page: Page, path: string) {
  const response = await employeeApiRequest(page, path);
  await expectOk(response, `GET ${path}`);
  return response.json();
}

async function postJson(page: Page, path: string, body: unknown) {
  const response = await employeeApiRequest(page, path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  await expectOk(response, `POST ${path}`);
  return response.json();
}

async function login(page: Page, email: string, password: string) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('School Code').fill(process.env.E2E_TENANT || 'DDVS');
  await page.getByLabel('Email / Username').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /Sign In/i }).click();
  await expect
    .poll(
      async () =>
        page.evaluate(async () => {
          const response = await fetch('/api/auth/session');
          if (!response.ok) return false;
          const session = await response.json();
          return Boolean(session?.accessToken);
        }),
      { timeout: 60_000 }
    )
    .toBe(true);
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 30_000 });
}

async function openEmployeeReportBuilder(page: Page) {
  await page.goto('/hr/reports', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('hr-reports-center')).toBeVisible({ timeout: 60_000 });
  await page.getByTestId('hr-reports-generate-button').click();
  await expect(page.getByPlaceholder('Search categories...')).toBeVisible();
  await page
    .getByText(/^Employee$/)
    .first()
    .click();
  await page
    .getByText(/New Employee Report/i)
    .first()
    .click();
  await expect(page.getByTestId('hr-report-builder')).toBeVisible();
}

async function openSavedTemplateFromLanding(page: Page, templateId: string, reportName: string) {
  await page.goto('/hr/reports', { waitUntil: 'domcontentloaded' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('hr-reports-center')).toBeVisible({ timeout: 60_000 });
  await page.getByTestId('hr-reports-tab-templates').click();
  await page.getByPlaceholder('Search...').first().fill(reportName);
  const templateRow = page.locator(`[data-row-id="template-${templateId}"]`);
  await expect(templateRow).toContainText(reportName, { timeout: 60_000 });
  await templateRow.getByTestId('hr-report-template-open-button').click();
  await expect(page.getByTestId('hr-report-builder')).toBeVisible();
  await expect(page.getByLabel('Report Name')).toHaveValue(reportName);
}

function currentMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthText = String(month).padStart(2, '0');
  const lastDay = new Date(year, month, 0).getDate();

  return {
    month: `${year}-${monthText}`,
    fromDate: `${year}-${monthText}-01`,
    toDate: `${year}-${monthText}-${String(lastDay).padStart(2, '0')}`,
  };
}

test.describe('HR Reports enterprise E2E', () => {
  test.skip(!reportsE2EEnabled, 'Set E2E_HR_REPORTS=1 against a seeded local backend.');

  test('covers payroll monthly and attendance chart report sources', async ({ page }) => {
    test.setTimeout(180_000);

    await page.goto('/hr/reports', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('hr-reports-center')).toBeVisible({ timeout: 60_000 });

    const sources = await getJson(page, '/hr/reports/sources');
    const sourceIds = sources.sources.map((source: any) => source.id);
    expect(sourceIds).toEqual(
      expect.arrayContaining([
        'employee',
        'payroll',
        'attendance',
        'leave',
        'policies',
        'performance',
      ])
    );

    const monthRange = currentMonthRange();

    const payrollRequest = {
      reportType: `E2E Payroll Monthly ${Date.now()}`,
      dataSource: 'payroll',
      format: 'excel',
      page: 1,
      pageSize: 10,
      columns: ['month', 'employeeCode', 'employeeName', 'grossSalary', 'totalDeduction', 'netPay'],
      summaries: [{ field: 'netPay', function: 'sum' }],
      filters: { month: monthRange.month },
    };

    const payrollPreview = await postJson(page, '/hr/reports/preview', payrollRequest);
    expect(payrollPreview.dataSource).toBe('payroll');
    expect(payrollPreview.columns.map((column: any) => column.id)).toEqual(
      expect.arrayContaining(['month', 'employeeCode', 'netPay'])
    );
    expect(typeof payrollPreview.totalCount).toBe('number');

    const attendanceRequest = {
      reportType: `E2E Attendance Chart ${Date.now()}`,
      dataSource: 'attendance',
      format: 'excel',
      page: 1,
      pageSize: 10,
      columns: [
        'attendanceDate',
        'employeeCode',
        'employeeName',
        'department',
        'status',
        'hoursWorked',
      ],
      groups: ['status'],
      chart: {
        type: 'donut',
        categoryField: 'status',
        function: 'count',
      },
      filters: {
        dateField: 'attendanceDate',
        fromDate: monthRange.fromDate,
        toDate: monthRange.toDate,
      },
    };

    const attendancePreview = await postJson(page, '/hr/reports/preview', attendanceRequest);
    expect(attendancePreview.dataSource).toBe('attendance');
    expect(attendancePreview.columns.map((column: any) => column.id)).toContain('status');
    expect(attendancePreview.chart?.type).toBe('donut');
  });

  test('covers leave, policies, and performance analytics sources', async ({ page }) => {
    test.setTimeout(180_000);

    await page.goto('/hr/reports', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('hr-reports-center')).toBeVisible({ timeout: 60_000 });

    const sourceRequests = [
      {
        source: 'leave',
        group: 'status',
        expectedColumns: ['rowCount', 'status', 'sum_approvedUnits'],
        request: {
          reportType: `E2E Leave Analytics ${Date.now()}`,
          dataSource: 'leave',
          format: 'excel',
          page: 1,
          pageSize: 10,
          groups: ['status'],
          summaries: [{ field: 'approvedUnits', function: 'sum' }],
          chart: {
            type: 'bar',
            categoryField: 'status',
            valueField: 'approvedUnits',
            function: 'sum',
          },
          filters: {},
        },
      },
      {
        source: 'policies',
        group: 'recordType',
        expectedColumns: ['rowCount', 'recordType'],
        request: {
          reportType: `E2E Policy Analytics ${Date.now()}`,
          dataSource: 'policies',
          format: 'excel',
          page: 1,
          pageSize: 10,
          groups: ['recordType'],
          chart: {
            type: 'donut',
            categoryField: 'recordType',
            function: 'count',
          },
          filters: {},
        },
      },
      {
        source: 'performance',
        group: 'department',
        expectedColumns: ['rowCount', 'department', 'avg_finalScore'],
        request: {
          reportType: `E2E Performance Analytics ${Date.now()}`,
          dataSource: 'performance',
          format: 'excel',
          page: 1,
          pageSize: 10,
          groups: ['department'],
          summaries: [{ field: 'finalScore', function: 'avg' }],
          chart: {
            type: 'line',
            categoryField: 'department',
            valueField: 'finalScore',
            function: 'avg',
          },
          filters: {},
        },
      },
    ];

    await Promise.all(
      sourceRequests.map(async (item) => {
        const preview = await postJson(page, '/hr/reports/preview', item.request);
        expect(preview.dataSource).toBe(item.source);
        expect(preview.columns.map((column: any) => column.id)).toEqual(
          expect.arrayContaining(item.expectedColumns)
        );
        expect(preview.columns.map((column: any) => column.id)).toContain(item.group);
        expect(preview.queryWarnings ?? []).not.toEqual(
          expect.arrayContaining([expect.stringMatching(/after source projection/i)])
        );
        expect(preview.chart?.points).toBeDefined();
      })
    );
  });

  test('builds, previews, exports, schedules, and downloads an employee report', async ({
    page,
  }) => {
    test.setTimeout(240_000);

    await openEmployeeReportBuilder(page);

    await page.getByLabel('Chart Type').click();
    await page.getByRole('option', { name: /^Bar$/ }).click();
    await page.getByLabel('Chart Category').click();
    await page.getByRole('option', { name: /Department/i }).click();
    await page.getByTestId('hr-report-preview-button').click();
    await expect(page.getByText(/rows - Employee/i)).toBeVisible({ timeout: 60_000 });

    const reportName = `E2E Employee Report ${Date.now()}`;
    const request = {
      reportType: reportName,
      dataSource: 'employee',
      format: 'excel',
      page: 1,
      pageSize: 25,
      columns: ['employeeCode', 'employeeName', 'department', 'email'],
      groups: ['department'],
      chart: {
        type: 'bar',
        categoryField: 'department',
        function: 'count',
      },
      filters: {},
    };

    const preview = await postJson(page, '/hr/reports/preview', request);
    expect(preview.dataSource).toBe('employee');
    expect(preview.columns.map((column: any) => column.id)).toContain('department');
    expect(preview.chart?.type).toBe('bar');

    const template = await postJson(page, '/hr/reports/templates', {
      name: reportName,
      category: 'Employee',
      dataSource: 'employee',
      visibility: 'private',
      status: 'Draft',
      definition: request,
    });
    expect(template.id).toBeTruthy();

    await page.goto('/hr/reports', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('hr-reports-center')).toBeVisible({ timeout: 60_000 });
    await page.getByTestId('hr-reports-tab-templates').click();
    await page.getByPlaceholder('Search...').first().fill(reportName);
    const runTemplateRow = page.locator(`[data-row-id="template-${template.id}"]`);
    await expect(runTemplateRow).toContainText(reportName, { timeout: 60_000 });
    const templateRunResponsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/hr/reports/exports') &&
        response.request().method() === 'POST' &&
        response.ok(),
      { timeout: 60_000 }
    );
    const templateRunRequestPromise = page.waitForRequest(
      (exportRequest) =>
        exportRequest.url().endsWith('/api/hr/reports/exports') &&
        exportRequest.method() === 'POST',
      { timeout: 60_000 }
    );
    await runTemplateRow.getByTestId('hr-report-template-run-button').click();
    const runTemplateDialog = page.getByRole('dialog', { name: /Run report/i });
    await expect(runTemplateDialog).toBeVisible();
    await expect(runTemplateDialog.getByText(reportName)).toBeVisible();
    await runTemplateDialog.getByTestId('hr-report-run-template-submit-button').click();
    const templateRunRequest = await templateRunRequestPromise;
    const templateRunPayload = templateRunRequest.postDataJSON();
    expect(templateRunPayload.sourceAction).toBe('manualExport');
    expect(templateRunPayload.parentJobId).toBeUndefined();
    const templateRunResponse = await templateRunResponsePromise;
    const templateRunJob = await templateRunResponse.json();
    expect(templateRunJob.jobId).toBeTruthy();
    await expect(page.getByTestId('hr-reports-center')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('hr-reports-tab-exports')).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(page.locator(`[data-row-id="${templateRunJob.jobId}"]`)).toContainText(
      /Queued|Running|Completed/,
      { timeout: 60_000 }
    );

    await openSavedTemplateFromLanding(page, template.id, reportName);

    const uiScheduleName = `${reportName} Weekly`;
    await page.getByTestId('hr-report-schedule-button').click();
    const scheduleDialog = page.getByRole('dialog', { name: /Schedule report/i });
    await expect(scheduleDialog).toBeVisible();
    await scheduleDialog.getByLabel('Schedule Name').fill(uiScheduleName);
    await scheduleDialog.getByLabel('Frequency').click();
    await page.getByRole('option', { name: /^Weekly$/ }).click();
    await scheduleDialog.getByLabel('Delivery').click();
    await page.getByRole('option', { name: /In-app \+ email/i }).click();
    await scheduleDialog.getByLabel('First Run').fill('2026-07-01T09:30');
    await expect(scheduleDialog.getByText('Next 3 runs')).toBeVisible();
    await expect(scheduleDialog.getByText('01 Jul 2026, 09:30 AM')).toBeVisible();
    await scheduleDialog.getByTestId('hr-report-schedule-submit-button').click();
    await expect(scheduleDialog).toBeHidden({ timeout: 60_000 });

    await expect
      .poll(
        async () => {
          const schedules = await getJson(page, '/hr/reports/schedules');
          return schedules.items.some((item: any) => item.name === uiScheduleName);
        },
        { timeout: 60_000, intervals: [1_000, 2_000, 3_000] }
      )
      .toBe(true);
    const scheduleList = await getJson(page, '/hr/reports/schedules');
    const schedule = scheduleList.items.find((item: any) => item.name === uiScheduleName);
    expect(schedule).toBeTruthy();
    expect(schedule.status).toBe('Active');

    const exportCreateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/hr/reports/exports') &&
        response.request().method() === 'POST' &&
        response.ok(),
      { timeout: 60_000 }
    );
    await page.getByTestId('hr-report-export-excel-button').click();

    const exportCreateResponse = await exportCreateResponsePromise;
    const exportJob = await exportCreateResponse.json();
    expect(exportJob.jobId).toBeTruthy();

    await expect(page.getByTestId('hr-reports-center')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('hr-reports-tab-exports')).toHaveAttribute(
      'aria-selected',
      'true'
    );

    const exportHistoryRow = page.locator(`[data-row-id="${exportJob.jobId}"]`);
    await expect(exportHistoryRow).toContainText(/Queued|Running|Completed/, {
      timeout: 60_000,
    });
    await expect
      .poll(
        async () => {
          const jobs = await getJson(page, '/hr/reports/exports');
          const job = jobs.find((item: any) => item.id === exportJob.jobId);
          return job?.status;
        },
        { timeout: 120_000, intervals: [2_000, 3_000, 5_000] }
      )
      .toBe('Completed');
    await expect(exportHistoryRow).toContainText('Completed', { timeout: 60_000 });
    await exportHistoryRow.getByTestId('hr-report-export-details-button').click();
    await expect(page.getByText(`Generated from template: ${reportName}`)).toBeVisible();
    await expect(page.getByText('Request Snapshot')).toBeVisible();
    await page.getByRole('button', { name: /^Close$/ }).click();

    const historyDownloadResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/hr/reports/exports/${exportJob.jobId}/download`) &&
        response.ok(),
      { timeout: 60_000 }
    );
    await expect(exportHistoryRow.getByTestId('hr-report-export-download-button')).toBeEnabled();
    await exportHistoryRow.getByTestId('hr-report-export-download-button').click();
    const historyDownloadResponse = await historyDownloadResponsePromise;
    expect((await historyDownloadResponse.body()).byteLength).toBeGreaterThan(0);

    await page.getByTestId('hr-reports-tab-schedules').click();
    const scheduleRow = page.locator(`[data-row-id="${schedule.id}"]`);
    await expect(scheduleRow).toContainText(uiScheduleName, { timeout: 60_000 });

    const pauseScheduleResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/hr/reports/schedules/${schedule.id}/pause`) && response.ok(),
      { timeout: 60_000 }
    );
    await scheduleRow.getByTestId('hr-report-schedule-toggle-button').click();
    const paused = await pauseScheduleResponsePromise;
    expect((await paused.json()).status).toBe('Paused');
    await expect(scheduleRow).toContainText('Paused', { timeout: 60_000 });

    const resumeScheduleResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/hr/reports/schedules/${schedule.id}/resume`) && response.ok(),
      { timeout: 60_000 }
    );
    await scheduleRow.getByTestId('hr-report-schedule-toggle-button').click();
    const resumed = await resumeScheduleResponsePromise;
    expect((await resumed.json()).status).toBe('Active');
    await expect(scheduleRow).toContainText('Active', { timeout: 60_000 });

    const runScheduleResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/hr/reports/schedules/${schedule.id}/run-now`) &&
        response.ok(),
      { timeout: 60_000 }
    );
    await scheduleRow.getByTestId('hr-report-schedule-run-now-button').click();
    const run = await (await runScheduleResponsePromise).json();
    expect(run.jobId).toBeTruthy();
    await expect(page.getByTestId('hr-reports-tab-exports')).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(page.locator(`[data-row-id="${run.jobId}"]`)).toContainText(
      /Queued|Running|Completed/,
      { timeout: 60_000 }
    );
    const scheduleRunRow = page.locator(`[data-row-id="${run.jobId}"]`);
    await scheduleRunRow.getByTestId('hr-report-export-details-button').click();
    await expect(page.getByText('Scheduled run')).toBeVisible();
    await page.getByRole('button', { name: /^Close$/ }).click();

    await page.getByTestId('hr-reports-tab-schedules').click();
    const deleteScheduleResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/hr/reports/schedules/${schedule.id}`) &&
        response.request().method() === 'DELETE' &&
        response.ok(),
      { timeout: 60_000 }
    );
    await scheduleRow.getByTestId('hr-report-schedule-delete-button').click();
    await expect(page.getByText('Delete report schedule?')).toBeVisible();
    await page.getByRole('button', { name: /Delete Schedule/i }).click();
    await deleteScheduleResponsePromise;
    await expect(page.getByText('Delete report schedule?')).toBeHidden({ timeout: 60_000 });

    await page.getByTestId('hr-reports-tab-templates').click();
    await page.getByPlaceholder('Search...').first().fill(reportName);
    const templateRow = page.locator(`[data-row-id="template-${template.id}"]`);
    await expect(templateRow).toContainText(reportName, { timeout: 60_000 });
    const deleteTemplateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/hr/reports/templates/${template.id}`) &&
        response.request().method() === 'DELETE' &&
        response.ok(),
      { timeout: 60_000 }
    );
    await templateRow.getByTestId('hr-report-template-delete-button').click();
    await expect(page.getByText('Delete report template?')).toBeVisible();
    await page.getByRole('button', { name: /Delete Template/i }).click();
    await deleteTemplateResponsePromise;
    await expect(page.getByText('Delete report template?')).toBeHidden({ timeout: 60_000 });
  });

  test('lower-permission user cannot export or schedule reports', async ({ browser }) => {
    test.setTimeout(120_000);

    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const limitedPage = await context.newPage();

    await login(
      limitedPage,
      process.env.E2E_LIMITED_EMAIL || 'teacher-demo-1@ddvs.com',
      process.env.E2E_LIMITED_PASSWORD || 'Temp@123'
    );

    const request = {
      reportType: 'Limited User HR Report Probe',
      dataSource: 'employee',
      format: 'excel',
      page: 1,
      pageSize: 5,
      filters: {},
    };

    const exportResponse = await employeeApiRequest(limitedPage, '/hr/reports/exports', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    expect([401, 403]).toContain(exportResponse.status());

    const scheduleResponse = await employeeApiRequest(limitedPage, '/hr/reports/schedules', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Limited User Forbidden Schedule',
        frequency: 'monthly',
        deliveryMode: 'inApp',
        recipientUserIds: [],
        definition: request,
      }),
    });
    expect([401, 403]).toContain(scheduleResponse.status());

    await context.close();
  });
});
