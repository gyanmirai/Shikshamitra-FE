/* eslint-disable no-restricted-syntax */
import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';

for (const width of [390, 768, 1440]) {
  test(`server criteria, page reset and full filtered export at ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : width === 768 ? 1024 : 900 });
    await page.goto('/');
    await page.getByRole('button', { name: 'server', exact: true }).click();
    await expect(page.locator('tbody tr')).toHaveCount(10);
    await page.getByRole('button', { name: /next page/i }).click();
    await expect(page.locator('tbody tr').first()).toContainText('Synthetic staff 10');
    await page.getByRole('button', { name: 'Filter Status', exact: true }).click();
    await page.getByRole('combobox', { name: 'Status *', exact: true }).click();
    await page.getByRole('option', { name: 'Pending', exact: true }).click();
    const request = page.waitForRequest(
      (r) =>
        r.url().includes('/synthetic-hr/list?') &&
        new URL(r.url()).searchParams.get('status') === '0'
    );
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
    expect(new URL((await request).url()).searchParams.get('page')).toBe('1');
    await expect(page.locator('tbody tr').first()).toContainText('Synthetic staff 00');
    await expect(page.getByText('1–10 of 15')).toBeVisible();
    await expect(page.getByRole('button', { name: /Sort by/ })).toHaveCount(0);
    const exportRequest = page.waitForRequest(
      (r) => r.url().endsWith('/synthetic-hr/exports') && r.method() === 'POST'
    );
    await page.getByRole('button', { name: 'Export', exact: true }).click();
    const download = page.waitForEvent('download');
    await page.getByRole('menuitem', { name: /Excel/ }).click();
    const body = (await exportRequest).postDataJSON();
    expect(body.query).toMatchObject({ status: '0', search: '', page: 1 });
    expect(body.columns.map((column: { id: string }) => column.id)).toEqual([
      'candidate',
      'status',
    ]);
    const workbook = XLSX.readFile((await (await download).path())!);
    const exported = XLSX.utils.sheet_to_json(workbook.Sheets.Data, { header: 1 }) as unknown[][];
    expect(exported).toHaveLength(16);
    expect(exported.slice(1).every((row) => row[1] === 0)).toBe(true);
    await page.getByRole('button', { name: 'Filter Candidate', exact: true }).click();
    await page.getByRole('combobox', { name: 'Filter Type *', exact: true }).click();
    await expect(page.getByRole('option')).toHaveCount(1);
    await expect(page.getByRole('option', { name: 'Contains', exact: true })).toBeVisible();
    await page.getByRole('option', { name: 'Contains', exact: true }).click();
    await page.getByRole('textbox', { name: 'Candidate *', exact: true }).fill('28');
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.locator('tbody tr')).toContainText('Synthetic staff 28');
    await page.getByRole('button', { name: 'Clear (2)', exact: true }).click();
    await expect(page.getByText('1–10 of 30')).toBeVisible();
    await page.screenshot({ path: info.outputPath('server-criteria.png'), fullPage: true });
  });
  test(`policy preview sort/filter/export and states at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : width === 768 ? 1024 : 900 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Sort by Priority', exact: true }).click();
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toContainText('Beta synthetic');
    await page.getByRole('button', { name: 'Filter Priority', exact: true }).click();
    await page.getByRole('combobox', { name: 'Filter Type *', exact: true }).click();
    await page.getByRole('option', { name: 'Less Than', exact: true }).click();
    await page.getByRole('spinbutton').fill('3');
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect(rows).toHaveCount(2);
    await page.getByRole('button', { name: 'Export', exact: true }).click();
    const download = page.waitForEvent('download');
    await page.getByRole('menuitem', { name: /Excel/ }).click();
    const file = await download;
    const workbook = XLSX.readFile((await file.path())!);
    expect(XLSX.utils.sheet_to_json(workbook.Sheets.Data, { header: 1 })).toEqual([
      ['Staff', 'Priority'],
      ['Beta synthetic', 0.5],
      ['Alpha synthetic', 2],
    ]);
    await page.screenshot({ path: info.outputPath('filtered.png'), fullPage: true });
    await page.getByRole('button', { name: 'loading', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Export', exact: true })).toBeDisabled();
    await page.screenshot({ path: info.outputPath('loading.png'), fullPage: true });
    await page.getByRole('button', { name: 'error', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('could not be loaded');
    await page.screenshot({ path: info.outputPath('error.png'), fullPage: true });
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(rows).toHaveCount(2);
    await page.getByRole('button', { name: 'empty', exact: true }).click();
    await expect(
      page.getByText(/No results|No records|No policy preview records/).first()
    ).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true);
    await page.screenshot({ path: info.outputPath('light.png'), fullPage: true });
    await page.getByRole('button', { name: 'Toggle theme', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-mui-color-scheme', 'dark');
    await page.screenshot({ path: info.outputPath('dark.png'), fullPage: true });
    await page.getByRole('button', { name: 'Calendar grid', exact: true }).click();
    const calendar = page.getByRole('table', {
      name: 'Work calendar holiday configuration',
      exact: true,
    });
    await expect(calendar.getByText('Synthetic central holiday')).toBeVisible();
    await calendar.getByRole('button', { name: 'Remove from this calendar', exact: true }).click();
    await expect(
      calendar.getByRole('button', { name: 'Restore to calendar', exact: true })
    ).toBeVisible();
    await calendar.getByRole('button', { name: 'Restore to calendar', exact: true }).click();
    await page.screenshot({ path: info.outputPath('calendar-grid.png'), fullPage: true });
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.getByRole('button', { name: 'Payroll grid', exact: true }).click();
    const payroll = page.getByRole('table', { name: 'Payroll basis configuration', exact: true });
    const days = payroll.getByRole('spinbutton', { name: /Payroll basis days for/ }).first();
    await days.fill('23');
    await expect(days).toHaveValue('23');
    await expect(payroll.getByRole('button', { name: /Sort by/ })).toHaveCount(0);
    await page.screenshot({ path: info.outputPath('payroll-grid.png'), fullPage: true });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true);
  });
}
