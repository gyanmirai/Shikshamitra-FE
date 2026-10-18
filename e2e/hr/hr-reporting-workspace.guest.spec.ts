/* eslint-disable no-await-in-loop, no-restricted-syntax */
import path from 'node:path';
// Browser steps and file preparation must execute sequentially in this acceptance workflow.
import { mkdir, writeFile } from 'node:fs/promises';
import { test, expect, type Page } from '@playwright/test';

const base = process.env.E2E_BASE_URL || 'http://localhost:3049';
const api = process.env.E2E_API_URL || process.env.NEXT_PUBLIC_API_URL || '';
const school = process.env.E2E_TENANT || 'DDVS';
const output = path.join(process.cwd(), '.artifacts', 'reporting-e2e');

test.use({ storageState: { cookies: [], origins: [] } });
test.setTimeout(240_000);

async function signIn(page: Page) {
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
  await page.goto(`${base}/hr/reports`);
  const skip = page.getByRole('button', { name: 'Skip', exact: true });
  if (await skip.isVisible()) await skip.click();
  await expect(page.getByRole('textbox', { name: 'Search report templates' })).toBeVisible({ timeout: 90_000 });
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
  await expect(page.getByRole('button', { name: 'Download Excel' })).toBeVisible();
  return new URL(page.url()).searchParams.get('run');
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
    .getByRole('button', { name: 'Actions for Staff in/out register', exact: true })
    .click();
  await page.getByRole('menuitem', { name: 'Customize a copy' }).click();
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
  await page.getByRole('button', { name: 'Generate', exact: true }).click();
  expect(await page.getByLabel('Template name').count()).toBe(0);
  const september = await chooseMonthAndGenerate(page, '2026-09');
  for (const [label, extension] of [
    ['Excel', 'xlsx'],
    ['PDF', 'pdf'],
  ]) {
    const completed = page.waitForEvent('download', { timeout: 90_000 });
    await page.getByRole('button', { name: `Download ${label}`, exact: true }).click();
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
  await page.getByRole('link', { name: 'HR reports', exact: true }).click();
  await page.getByRole('tab', { name: 'Generated reports', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Open report' }).first()).toBeVisible();
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
  const generate = page.getByRole('button', { name: 'Generate', exact: true });
  await expect(generate).toBeInViewport();
  const horizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1
  );
  expect(horizontalOverflow).toBe(false);
  await mkdir(output, { recursive: true });
  await page.screenshot({ path: path.join(output, 'library-mobile.png'), fullPage: true });
});

test('monthly register produces readable captured Excel and PDF sections @critical', async ({
  page,
}) => {
  await signIn(page);
  await page
    .getByRole('textbox', { name: 'Search report templates' })
    .fill('Monthly attendance register');
  await page.getByRole('button', { name: 'Generate', exact: true }).click();
  await chooseMonthAndGenerate(page, '2026-09');
  for (const [label, extension] of [
    ['Excel', 'xlsx'],
    ['PDF', 'pdf'],
  ]) {
    const completed = page.waitForEvent('download', { timeout: 90_000 });
    await page.getByRole('button', { name: `Download ${label}`, exact: true }).click();
    await (await completed).saveAs(path.join(output, `monthly-attendance-september.${extension}`));
  }
});
