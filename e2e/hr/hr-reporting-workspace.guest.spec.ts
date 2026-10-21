/* eslint-disable no-await-in-loop, no-restricted-syntax */
import path from 'node:path';
import * as XLSX from 'xlsx';
import { test, expect, type Page } from '@playwright/test';
// Browser steps and file preparation must execute sequentially in this acceptance workflow.
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const base = process.env.E2E_BASE_URL || 'http://localhost:3049';
const api = process.env.E2E_API_URL || process.env.NEXT_PUBLIC_API_URL || '';
const school = process.env.E2E_TENANT || 'DDVS';
const output = path.join(process.cwd(), '.artifacts', 'reporting-e2e');

test.use({ storageState: { cookies: [], origins: [] } });
test.setTimeout(240_000);

async function signIn(page: Page) {
  await page.addInitScript(() => localStorage.setItem('onboarding_completed', 'true'));
  expect(['localhost', '127.0.0.1']).toContain(new URL(base).hostname);
  expect(['localhost', '127.0.0.1']).toContain(new URL(api).hostname);
  await page.goto(`${base}/login`);
  await page.getByLabel(/School code/i).fill(school);
  await page.getByLabel(/Email or username/i).fill(process.env.E2E_HR_EMAIL || 'admin-ddvs');
  await page
    .getByLabel('Password', { exact: true })
    .fill(process.env.E2E_HR_PASSWORD || 'Temp@123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 90_000 });
  await page.goto(`${base}/hr/reports/templates`);
  const skip = page.getByRole('button', { name: 'Skip', exact: true });
  if (await skip.isVisible()) await skip.click();
  await expect(page.getByRole('textbox', { name: 'Search report templates' })).toBeVisible({
    timeout: 90_000,
  });
  if (await skip.isVisible()) await skip.click();
}

async function headers(page: Page) {
  const session = await page.evaluate(async () => (await fetch('/api/auth/session')).json());
  expect(session.accessToken).toBeTruthy();
  return { Authorization: `Bearer ${session.accessToken}`, __tenant: school };
}

async function chooseMonthAndGenerate(page: Page, month: string) {
  await page.getByRole('combobox', { name: 'Reporting period' }).click();
  await page.getByRole('option', { name: 'Choose month', exact: true }).click();
  await page.getByLabel('Month', { exact: true }).fill(month);
  await page.getByRole('button', { name: 'Generate report', exact: true }).click();
  await expect(page.getByText('Completed', { exact: true })).toBeVisible({ timeout: 120_000 });
  await expect(page.getByText(new RegExp(`Period: ${month}-01`))).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export', exact: true })).toBeVisible();
  return new URL(page.url()).pathname.split('/').filter(Boolean).at(-1);
}

test('reuse a saved in/out template across months and download fixed Excel/PDF @critical', async ({
  page,
}) => {
  await mkdir(output, { recursive: true });
  await signIn(page);
  await page
    .getByRole('textbox', { name: 'Search report templates' })
    .fill('Staff in/out register');
  await page
    .getByRole('link', { name: 'Customize a copy of Staff in/out register', exact: true })
    .click();
  const name = `Reporting acceptance ${Date.now()}`;
  await page.getByLabel('Template name').fill(name);
  await page.getByRole('link', { name: 'Report templates', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Discard unsaved changes?' })).toBeVisible();
  await page.getByRole('button', { name: 'Keep editing' }).click();
  await page.getByRole('button', { name: 'Move Staff Name up', exact: true }).press('Enter');
  await page.getByRole('button', { name: 'Save template', exact: true }).click();
  await expect(page.getByText('Template saved.', { exact: true })).toBeVisible();
  const auth = await headers(page);
  const library = await page.request.get(`${api}/api/hr/reports/library?edit=true`, {
    headers: auth,
  });
  expect(library.ok()).toBeTruthy();
  const template = (await library.json()).find((item: { name: string }) => item.name === name);
  expect(
    template.definition.columns.slice(0, 3).map((column: { field: string }) => column.field)
  ).toEqual(['attendanceDate', 'employeeName', 'employeeCode']);
  await page.getByRole('link', { name: 'Report templates', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search report templates' }).fill(name);
  await page.goto(`${base}/hr/reports/generate?search=${encodeURIComponent(name)}`);
  await page.getByRole('link', { name: `Choose ${name}`, exact: true }).click();
  expect(await page.getByLabel('Template name').count()).toBe(0);
  const september = await chooseMonthAndGenerate(page, '2026-09');
  for (const [label, extension] of [
    ['Excel', 'xlsx'],
    ['PDF', 'pdf'],
  ]) {
    const completed = page.waitForEvent('download', { timeout: 90_000 });
    await page.getByRole('button', { name: 'Export', exact: true }).click();
    await page.getByRole('menuitem', { name: label, exact: true }).click();
    const download = await completed;
    await download.saveAs(path.join(output, `staff-in-out-september.${extension}`));
  }
  await page.screenshot({ path: path.join(output, 'generated-report.png'), fullPage: true });
  await page.getByRole('button', { name: 'Generate again', exact: true }).click();
  const october = await chooseMonthAndGenerate(page, '2026-10');
  expect(october).not.toBe(september);
  const after = await page.request.get(`${api}/api/hr/reports/library?edit=true`, {
    headers: auth,
  });
  const unchanged = (await after.json()).find((item: { id: string }) => item.id === template.id);
  expect(unchanged.definition).toEqual(template.definition);
  expect(unchanged.revision).toBe(template.revision);
  await writeFile(
    path.join(output, 'acceptance.json'),
    JSON.stringify(
      {
        templateId: template.id,
        revision: template.revision,
        septemberRunId: september,
        octoberRunId: october,
      },
      null,
      2
    )
  );
  await page.goto(`${base}/hr/reports`);
  await expect(page.getByRole('link', { name: /^Open report / }).first()).toBeVisible();
  await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
});

test('all accessible starters execute through the same validated preview pipeline @critical', async ({
  page,
}) => {
  await signIn(page);
  const auth = await headers(page);
  const response = await page.request.get(`${api}/api/hr/reports/library`, { headers: auth });
  expect(response.ok()).toBeTruthy();
  const starters = (await response.json()).filter((item: { isBuiltIn: boolean }) => item.isBuiltIn);
  expect(starters).toHaveLength(20);
  for (const template of starters) {
    const choices = await page.request.get(
      `${api}/api/hr/reports/workspace-options?dataset=${template.definition.dataSource}`,
      { headers: auth }
    );
    expect(choices.ok(), template.name).toBeTruthy();
    const options = await choices.json();
    const result = await page.request.post(`${api}/api/hr/reports/designer-preview`, {
      headers: auth,
      data: {
        definition: template.definition,
        parameters: {
          period: 'month',
          month: '2026-09',
          employeeIds:
            template.definition.dataSource === 'payroll_statement' ? [options.staff[0].id] : [],
          departments: [],
          ...(template.definition.dataSource === 'leave_balances'
            ? { academicYearId: options.academicYears[0].id }
            : {}),
        },
      },
    });
    expect(result.ok(), `${template.name}: ${await result.text()}`).toBeTruthy();
    const preview = await result.json();
    expect(preview.columns.length, template.name).toBeGreaterThan(0);
    expect(preview.totalCount, template.name).toBeGreaterThanOrEqual(preview.rows.length);
  }
});

test('narrow library keeps categories accessible and primary actions visible @accessibility', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page);
  await expect(page.getByRole('combobox', { name: /^Category/ })).toBeVisible();
  await page
    .getByRole('textbox', { name: 'Search report templates' })
    .fill('Staff in/out register');
  await page.goto(`${base}/hr/reports/generate?search=Staff+in%2Fout+register`);
  const generate = page.getByRole('link', { name: 'Staff in/out register', exact: true });
  await expect(generate).toBeInViewport();
  const horizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1
  );
  expect(horizontalOverflow).toBe(false);
  await mkdir(output, { recursive: true });
  await page.screenshot({ path: path.join(output, 'library-mobile.png'), fullPage: true });
  await generate.click();
  await expect(page.getByRole('combobox', { name: /^Reporting period/ })).toBeVisible();
});

test('monthly register produces readable captured Excel and PDF sections @critical', async ({
  page,
}) => {
  await signIn(page);
  await page
    .getByRole('textbox', { name: 'Search report templates' })
    .fill('Monthly attendance register');
  await page.goto(`${base}/hr/reports/generate?search=Monthly+attendance+register`);
  await page.getByRole('link', { name: 'Choose Monthly attendance register', exact: true }).click();
  await chooseMonthAndGenerate(page, '2026-09');
  for (const [label, extension] of [
    ['Excel', 'xlsx'],
    ['PDF', 'pdf'],
  ]) {
    const completed = page.waitForEvent('download', { timeout: 90_000 });
    await page.getByRole('button', { name: 'Export', exact: true }).click();
    await page.getByRole('menuitem', { name: label, exact: true }).click();
    await (await completed).saveAs(path.join(output, `monthly-attendance-september.${extension}`));
  }
});

test('shared HR tables keep utilities and contained scrolling in both themes and three widths @accessibility', async ({
  page,
}) => {
  test.setTimeout(480_000);
  await signIn(page);
  const routes = [
    ['/hr/reports/templates', 'hr-report-template-library'],
    ['/hr/employee', 'employee-table'],
    ['/hr/attendance-tracking', 'hr-attendance-register'],
    ['/hr/leave-approvals', 'leave-approvals-table'],
    ['/hr/payroll/setting/salary-templates', 'salary-template-table'],
    ['/hr/professional-management/cycles', 'performance-cycles'],
    ['/hr/calendars', 'hr-work-calendars'],
  ];
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['light', 'dark']) {
      await page.evaluate((mode) => {
        localStorage.setItem('theme-mode', mode);
        const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
        localStorage.setItem('app-settings', JSON.stringify({ ...settings, colorScheme: mode }));
      }, theme);
      for (const [route, id] of routes) {
        await page.goto(base + route);
        const table = page.getByTestId(id);
        await expect(table, route).toBeVisible({ timeout: 60_000 });
        await expect(table.getByRole('button', { name: 'Columns', exact: true })).toBeVisible();
        await expect(table.getByRole('button', { name: 'Export', exact: true })).toBeEnabled({
          timeout: 60_000,
        });
        await expect(table.getByRole('button', { name: 'Full screen', exact: true })).toBeVisible();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
          `${route} at ${width}`
        ).toBeTruthy();
        await page.screenshot({
          path: path.join(output, `${id}-${width}-${theme}.png`),
          fullPage: true,
        });
      }
    }
  }
});

test('staff directory exports every matching page and excludes action controls @critical', async ({
  page,
}) => {
  await signIn(page);
  await page.goto(`${base}/hr/employee`);
  const table = page.getByTestId('employee-table');
  await expect(table).toBeVisible();
  const auth = await headers(page);
  const expected = await (
    await page.request.get(`${api}/api/employees?page=1&pageSize=1`, { headers: auth })
  ).json();
  expect(expected.totalCount).toBeGreaterThan(10);
  const downloading = page.waitForEvent('download', { timeout: 120_000 });
  await table.getByRole('button', { name: 'Export', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Excel', exact: true }).click();
  const file = path.join(output, 'staff-directory-complete.xlsx');
  await (await downloading).saveAs(file);
  const workbook = XLSX.read(await readFile(file), { cellDates: true });
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets.Report, {
    header: 1,
    range: 4,
  }) as unknown[][];
  expect(rows.length - 1).toBe(expected.totalCount);
  expect(rows[0]).not.toContain('Actions');
  expect(rows[0]).not.toContain('Bank Account Number');
  await table.getByRole('textbox', { name: 'Search table' }).fill('Patel');
  const filtered = await (
    await page.request.get(`${api}/api/employees?page=1&pageSize=1&search=Patel`, { headers: auth })
  ).json();
  await expect(table.getByText(new RegExp(`of ${filtered.totalCount}$`))).toBeVisible();
  const filteredDownload = page.waitForEvent('download', { timeout: 120_000 });
  await table.getByRole('button', { name: 'Export', exact: true }).click();
  await page.getByRole('menuitem', { name: 'PDF', exact: true }).click();
  await (await filteredDownload).saveAs(path.join(output, 'staff-directory-filtered.pdf'));
});

test('report navigation separates daily use and preserves generation chooser context @critical', async ({
  page,
}) => {
  await signIn(page);
  await page.goto(`${base}/hr/reports`);
  await expect(page.getByRole('heading', { name: 'Reports', exact: true })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Templates', exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Generate report', exact: true }).first().click();
  await expect(
    page.getByRole('heading', { name: 'Choose report template', exact: true })
  ).toBeVisible();
  await page.getByRole('combobox', { name: /^Category/ }).click();
  await page.getByRole('option', { name: 'Attendance', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search report templates' }).fill('Staff in/out');
  await expect(page).toHaveURL(/search=Staff/);
  await expect(page.getByRole('link', { name: /Customize a copy/ })).toHaveCount(0);
  await page
    .getByRole('link', { name: 'Choose Staff in/out register', exact: true })
    .press('Enter');
  await expect(page.getByRole('heading', { name: 'Report options', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('combobox', { name: 'Reporting period' })).toBeVisible();
  await page.getByRole('link', { name: 'Choose template', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Search report templates' })).toHaveValue(
    'Staff in/out'
  );
  await expect(page.getByRole('combobox', { name: /^Category/ })).toHaveText('Attendance');
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Report options', exact: true })).toBeVisible();
  await page.goForward();
  await expect(
    page.getByRole('heading', { name: 'Choose report template', exact: true })
  ).toBeVisible();
});

test('reporting pages retain contained tables at three widths and both themes @accessibility', async ({
  page,
}) => {
  await signIn(page);
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const theme of ['light', 'dark']) {
      await page.evaluate((colorScheme) => {
        const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
        localStorage.setItem('app-settings', JSON.stringify({ ...settings, colorScheme }));
        localStorage.setItem('theme-mode', colorScheme);
      }, theme);
      for (const [route, id] of [
        ['/hr/reports', 'hr-generated-report-history'],
        ['/hr/reports/templates', 'hr-report-template-library'],
        ['/hr/reports/generate', 'hr-report-template-chooser'],
      ]) {
        await page.goto(base + route);
        const table = page.getByTestId(id);
        await expect(table).toBeVisible();
        if (id === 'hr-generated-report-history') {
          await expect(table.getByRole('link', { name: /^Open report / }).first()).toBeVisible();
        } else {
          await expect(table.getByText('Attendance not recorded', { exact: true })).toBeVisible();
        }
        await expect(table.getByRole('button', { name: 'Full screen', exact: true })).toBeVisible();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
        ).toBe(true);
        await page.screenshot({
          path: path.join(output, `${id}-${width}-${theme}.png`),
          fullPage: true,
        });
      }
    }
  }
});

test('reporting tables preserve global criteria and export all matching rows', async ({ page }) => {
  test.setTimeout(360_000);
  await signIn(page);
  await page.getByRole('button', { name: 'Sort by Template', exact: true }).click();
  await expect(page).toHaveURL(/sorts=/);
  await page.getByRole('button', { name: 'Filter Category', exact: true }).click();
  await page.getByRole('combobox', { name: 'Category *', exact: true }).click();
  await page.getByRole('option', { name: 'Attendance', exact: true }).click();
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page).toHaveURL(/filters=/);
  await page.reload();
  await expect(page.getByText('Active Filters:', { exact: true })).toBeVisible();
  const auth = await headers(page);
  const history = await page.request.post(`${api}/api/hr/reports/runs/query`, {
    headers: auth,
    data: { take: 100 },
  });
  expect(history.ok()).toBeTruthy();
  const run = (await history.json()).items.find(
    (item: any) =>
      item.status === 'Completed' &&
      !item.isExpired &&
      item.rowCount > 100 &&
      item.columns.some((column: any) => column.id === 'employeeCode') &&
      item.columns.some((column: any) => column.type === 'date')
  );
  expect(run).toBeTruthy();
  const source = await page.request.get(`${api}/api/hr/reports/runs/${run.id}/rows?pageSize=200`, {
    headers: auth,
  });
  const code = String((await source.json()).rows[0].employeeCode);
  const codeColumn = run.columns.find((column: any) => column.id === 'employeeCode');
  const dateColumn = run.columns.find((column: any) => column.type === 'date');
  await page.goto(`${base}/hr/reports/runs/${run.id}`);
  await page.getByRole('button', { name: `Filter ${codeColumn.label}`, exact: true }).click();
  await page.getByRole('combobox', { name: 'Filter Type *', exact: true }).click();
  await page.getByRole('option', { name: 'Equals', exact: true }).click();
  await page.getByRole('textbox', { name: `${codeColumn.label} *`, exact: true }).fill(code);
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page).toHaveURL(/filters=/);
  await page.getByRole('button', { name: `Sort by ${dateColumn.label}`, exact: true }).click();
  await page.getByRole('button', { name: `Sort by ${dateColumn.label}`, exact: true }).click();
  await expect(page).toHaveURL(/sorts=/);
  const state = new URL(page.url()).searchParams;
  const criteria = {
    search: '',
    filters: JSON.parse(state.get('filters')!),
    sorts: JSON.parse(state.get('sorts')!),
  };
  const expectedResponse = await page.request.post(
    `${api}/api/hr/reports/runs/${run.id}/rows/query`,
    { headers: auth, data: { page: 1, pageSize: 200, criteria } }
  );
  expect(expectedResponse.ok()).toBeTruthy();
  const expected = await expectedResponse.json();
  expect(expected.totalCount).toBeGreaterThan(10);
  expect(expected.totalCount).toBeLessThan(run.rowCount);
  await page.getByRole('combobox', { name: /Rows per page/ }).click();
  await page.getByRole('option', { name: '10', exact: true }).click();
  await page.getByRole('button', { name: 'Go to next page' }).click();
  await expect(page).toHaveURL(/page=1/);
  await page.reload();
  await expect(page.getByText('Active Filters:', { exact: true })).toBeVisible();
  await expect(page.getByRole('combobox', { name: /Rows per page/ })).toHaveText('10');
  const downloaded = page.waitForEvent('download', { timeout: 90_000 });
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Excel', exact: true }).click();
  const download = await downloaded;
  const file = path.join(output, 'filtered-complete-report.xlsx');
  await download.saveAs(file);
  const workbook = XLSX.read(await readFile(file), { type: 'buffer', cellDates: true });
  const cells = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[workbook.SheetNames[0]], {
    header: 1,
  });
  const headerIndex = cells.findIndex((row) => row.includes(codeColumn.label));
  expect(headerIndex).toBeGreaterThanOrEqual(0);
  const codeIndex = cells[headerIndex].indexOf(codeColumn.label);
  const dateIndex = cells[headerIndex].indexOf(dateColumn.label);
  const exported = cells.slice(headerIndex + 1).filter((row) => String(row[codeIndex]) === code);
  expect(exported).toHaveLength(expected.totalCount);
  const dates = exported.map((row) => (row[dateIndex] as Date).valueOf());
  expect(dates).toEqual([...dates].sort((a, b) => b - a));
  await page.getByRole('button', { name: 'Full screen', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Exit full screen', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Exit full screen', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole('button', { name: 'Go to previous page', exact: true })
  ).toBeInViewport();
  await page.getByRole('button', { name: 'Go to previous page', exact: true }).click();
  await expect(page).toHaveURL(/page=0/);
  await expect(page.getByRole('cell', { name: code, exact: true }).first()).toBeVisible();
  await page.screenshot({
    path: path.join(output, 'report-table-tools-mobile.png'),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: path.join(output, 'report-table-tools-desktop.png'),
    fullPage: true,
  });
  await page.goto(`${base}/hr/reports`);
  await page.getByRole('textbox', { name: 'Search reports' }).fill(run.name);
  await page.getByRole('button', { name: 'Sort by Rows', exact: true }).click();
  await page.getByRole('button', { name: 'Filter Status', exact: true }).click();
  await page.getByRole('combobox', { name: 'Status *', exact: true }).click();
  await page.getByRole('option', { name: 'Completed', exact: true }).click();
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page).toHaveURL(/filters=/);
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Search reports' })).toHaveValue(run.name);
  await expect(
    page.getByRole('link', { name: `Open report ${run.name}`, exact: true }).first()
  ).toBeVisible();
});
