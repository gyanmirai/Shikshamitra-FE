/* eslint-disable no-restricted-syntax */
import * as XLSX from 'xlsx';
import { test, expect } from '@playwright/test';

for (const width of [390, 768, 1440]) {
  test(`directory exposes every data-column sort/filter and real enum controls at ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.getByRole('button', { name: 'directory', exact: true }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows')).toHaveText('1\u201325 of 125');
    const labels = [
      'Name',
      'Role',
      'DOB',
      'Gender',
      'DOJ',
      'Email',
      'Mobile',
      'Group',
      'Shift',
      'Organization',
      'Status',
    ];
    const ids = [
      'fullName',
      'roleValue',
      'dob',
      'genderValue',
      'doi',
      'email',
      'mobileNo',
      'isTeaching',
      'shiftName',
      'organization',
      'statusValue',
    ];
    /* eslint-disable no-await-in-loop -- Each click and response changes the same page's sort state. */
    for (let index = 0; index < labels.length; index += 1) {
      const button = page.getByRole('button', { name: `Sort by ${labels[index]}`, exact: true });
      await expect(button.locator('[data-testid="UnfoldMoreIcon"]')).toBeVisible();
      await expect(
        page.getByRole('button', { name: `Filter ${labels[index]}`, exact: true })
      ).toBeVisible();
      for (const direction of ['asc', 'desc']) {
        const response = page.waitForResponse(
          (value) =>
            value.url().endsWith('/synthetic-hr/table-query') &&
            value
              .request()
              .postDataJSON()
              .criteria.sorts.some(
                (sort: any) => sort.column === ids[index] && sort.direction === direction
              )
        );
        await button.click();
        await response;
        await expect(
          button.locator(
            direction === 'asc'
              ? '[data-testid="ArrowUpwardIcon"]'
              : '[data-testid="ArrowDownwardIcon"]'
          )
        ).toBeVisible();
      }
      await button.click();
    }
    /* eslint-enable no-await-in-loop */
    await expect(page.getByRole('button', { name: 'Sort by Actions', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Filter Actions', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Filter Group', exact: true }).click();
    await page.getByRole('combobox', { name: 'Group *', exact: true }).click();
    await page.getByRole('option', { name: 'Non-teaching', exact: true }).click();
    const filtered = page.waitForRequest(
      (request) =>
        request.url().endsWith('/synthetic-hr/table-query') &&
        request.postDataJSON().criteria.filters.length > 0
    );
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
    expect((await filtered).postDataJSON().criteria.filters).toEqual([
      { column: 'isTeaching', type: 'equals', value: false },
    ]);
    await expect(page.locator('.MuiTablePagination-displayedRows')).toHaveText('1\u201325 of 62');
    await page.getByRole('button', { name: 'Filter Status', exact: true }).click();
    await page.getByRole('combobox', { name: 'Status *', exact: true }).click();
    await page.getByRole('option', { name: 'Upcoming', exact: true }).click();
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows')).toHaveText('1\u201321 of 21');
    const directoryDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export', exact: true }).click();
    await page.getByRole('menuitem', { name: /Excel/ }).click();
    const workbook = XLSX.readFile((await (await directoryDownload).path())!);
    const exported = XLSX.utils.sheet_to_json<any[]>(workbook.Sheets[workbook.SheetNames[0]], {
      header: 1,
    });
    expect(exported).toHaveLength(22);
    expect(exported[0]).toHaveLength(11);
    expect(exported[0]).not.toContain('Actions');
    expect(JSON.stringify(exported)).toContain('SYN-0003');
    await page.screenshot({
      path: info.outputPath('directory-column-controls.png'),
      fullPage: true,
    });
  });

  test(`I-card off-page identifier filtering preserves selected staff across criteria and pages at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.getByRole('button', { name: 'icard', exact: true }).click();
    await page.getByRole('checkbox', { name: 'Select Staff 000', exact: true }).check();
    await page.getByRole('button', { name: 'Sort by Staff', exact: true }).click();
    const descending = page.waitForResponse(
      (response) =>
        response.url().endsWith('/synthetic-hr/table-query') &&
        response
          .request()
          .postDataJSON()
          .criteria.sorts.some((sort: any) => sort.direction === 'desc')
    );
    await page.getByRole('button', { name: 'Sort by Staff', exact: true }).click();
    await descending;
    await page.getByRole('checkbox', { name: 'Select Staff 124', exact: true }).check();
    await page.getByRole('button', { name: 'Filter Staff', exact: true }).click();
    await page.getByRole('combobox', { name: 'Filter Type *', exact: true }).click();
    await page.getByRole('option', { name: 'Contains', exact: true }).click();
    await page.getByRole('textbox', { name: 'Staff *', exact: true }).fill('SYN-0124');
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows')).toHaveText('1\u20131 of 1');
    await expect(
      page.getByRole('checkbox', { name: 'Select Staff 124', exact: true })
    ).toBeChecked();
    await expect(page.getByLabel('Selected staff IDs', { exact: true })).toContainText('staff-0');
    await expect(page.getByLabel('Selected staff IDs', { exact: true })).toContainText('staff-124');
    await page.getByRole('button', { name: /^Clear \(\d+\)$/ }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows')).toHaveText('1\u201325 of 125');
    await page.getByRole('button', { name: 'Go to next page', exact: true }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows')).toHaveText('26\u201350 of 125');
    await expect(page.getByLabel('Selected staff IDs', { exact: true })).toContainText('staff-124');
    await page.getByRole('button', { name: 'Go to previous page', exact: true }).click();
    await expect(
      page.getByRole('checkbox', { name: 'Select Staff 124', exact: true })
    ).toBeChecked();
  });

  test(`Register criteria/export keep editor and save context at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.getByRole('button', { name: 'register', exact: true }).click();
    await page.getByRole('button', { name: 'Filter Exceptions', exact: true }).click();
    await page.getByRole('combobox', { name: 'Filter Type *', exact: true }).click();
    await page.getByRole('option', { name: 'Contains', exact: true }).click();
    await page.getByRole('textbox', { name: 'Exceptions *', exact: true }).fill('Locked');
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect(page.locator('.MuiTablePagination-displayedRows')).toHaveText('1\u201325 of 42');
    await page.getByRole('button', { name: 'Open adjustment', exact: true }).click();
    await expect(page.getByLabel('Adjustment context', { exact: true })).toHaveText('Staff 000');
    await expect(page.getByRole('button', { name: 'Sort by Staff', exact: true })).toHaveCount(0);
    await expect(page.getByRole('textbox', { name: 'Search table', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Go to next page', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Cancel adjustment', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Sort by Staff', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Start save', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Search table', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Finish save', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Search table', exact: true })).toBeEnabled();
    await expect(page.locator('.MuiTablePagination-displayedRows')).toHaveText('1\u201325 of 42');
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export', exact: true }).click();
    await page.getByRole('menuitem', { name: /Excel/ }).click();
    const file = await (await download).path();
    const workbook = XLSX.readFile(file!);
    const rows = XLSX.utils.sheet_to_json<any[]>(workbook.Sheets[workbook.SheetNames[0]], {
      header: 1,
    });
    expect(rows).toHaveLength(43);
    expect(JSON.stringify(rows)).not.toContain('Absent');
  });

  test(`nested salary and readable audit columns filter correctly at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.getByRole('button', { name: 'salary', exact: true }).click();
    await page.getByRole('button', { name: 'Sort by Amount', exact: true }).click();
    await expect(page.locator('tbody tr').first()).toContainText('Zulu');
    await page.getByRole('button', { name: 'Filter Amount', exact: true }).click();
    await page.getByRole('combobox', { name: 'Filter Type *', exact: true }).click();
    await page.getByRole('option', { name: 'Greater Than', exact: true }).click();
    await page.getByRole('spinbutton', { name: 'Amount *', exact: true }).fill('3');
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect(page.locator('tbody tr')).toHaveCount(2);
    await page.getByRole('button', { name: 'audit', exact: true }).click();
    await page.getByRole('button', { name: 'Filter Before', exact: true }).click();
    await page.getByRole('combobox', { name: 'Filter Type *', exact: true }).click();
    await page.getByRole('option', { name: 'Contains', exact: true }).click();
    await page.getByRole('textbox', { name: 'Before *', exact: true }).fill('Monday');
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.locator('tbody tr')).toContainText('Monday');
    await page.getByRole('button', { name: /^Clear \(\d+\)$/ }).click();
    await page.getByRole('textbox', { name: 'Search table', exact: true }).fill('3a216aea');
    await expect(
      page.getByText('No results found for \u201c3a216aea\u201d', { exact: true })
    ).toBeVisible();
    await page.getByRole('textbox', { name: 'Search table', exact: true }).fill('Linked record');
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.locator('tbody tr')).toContainText('Linked record');
  });

  test(`import row drafts survive query guards, cancel, discard and in-flight save at ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.getByRole('button', { name: 'import draft', exact: true }).click();
    const row = page.locator('tbody tr').filter({ hasText: 'Import staff 000' });
    await expect(row).toContainText('09:00');
    await row.getByRole('button', { name: 'Mark import absent for import-0', exact: true }).click();
    await expect(row.getByLabel('Current attendance')).toHaveText('Absent');
    await expect(page.getByRole('textbox', { name: 'Search table' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Go to next page' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Sort by Staff', exact: true })).toHaveCount(0);
    let refreshed = page.waitForResponse((response) =>
      response.url().endsWith('/synthetic-hr/typed-list')
    );
    await page.getByRole('button', { name: 'Background row refresh', exact: true }).click();
    await refreshed;
    await expect(row.getByLabel('Current attendance')).toHaveText('Absent');
    await page.getByRole('button', { name: 'Discard import draft', exact: true }).click();
    await page.getByRole('button', { name: 'Keep editing', exact: true }).click();
    await expect(row.getByLabel('Current attendance')).toHaveText('Absent');
    await page.getByRole('button', { name: 'Discard import draft', exact: true }).click();
    await page.getByRole('button', { name: 'Confirm discard import', exact: true }).click();
    await expect(row.getByLabel('Current attendance')).toHaveText('Present');
    await row.getByRole('button', { name: 'Edit import time for import-0', exact: true }).click();
    await page.getByLabel('Import in time', { exact: true }).fill('10:25');
    refreshed = page.waitForResponse((response) =>
      response.url().endsWith('/synthetic-hr/typed-list')
    );
    await page.getByRole('button', { name: 'Background row refresh', exact: true }).click();
    await refreshed;
    await expect(page.getByLabel('Import in time', { exact: true })).toHaveValue('10:25');
    await expect(page.getByRole('textbox', { name: 'Search table' })).toBeDisabled();
    await page.getByRole('button', { name: 'Cancel import time', exact: true }).click();
    await expect(row).toContainText('09:00');
    await expect(page.getByRole('textbox', { name: 'Search table' })).toBeEnabled();
    await row.getByRole('button', { name: 'Edit import time for import-0', exact: true }).click();
    await page.getByLabel('Import in time', { exact: true }).fill('10:25');
    await page.getByRole('button', { name: 'Commit import time', exact: true }).click();
    let releaseSave!: () => Promise<void>;
    await page.route('**/synthetic-hr/save-import-rows', (route) => {
      releaseSave = () => route.continue();
    });
    const saving = page.waitForRequest((request) =>
      request.url().endsWith('/synthetic-hr/save-import-rows')
    );
    await page.getByRole('button', { name: 'Submit import draft', exact: true }).click();
    const payload = (await saving).postDataJSON();
    expect(payload.entries[0]).toMatchObject({
      rowId: 'import-0',
      inTime: '10:25',
      statusWire: 'Present',
    });
    await expect(
      page.getByRole('button', { name: 'Discard import draft', exact: true })
    ).toBeDisabled();
    await expect(
      row.getByRole('button', { name: 'Mark import absent for import-0', exact: true })
    ).toBeDisabled();
    await expect(page.getByRole('textbox', { name: 'Search table' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Go to next page' })).toBeDisabled();
    await releaseSave();
    await expect(page.getByRole('textbox', { name: 'Search table' })).toBeEnabled();
    const query = page.waitForRequest(
      (request) =>
        request.url().endsWith('/synthetic-hr/table-query') &&
        request.postDataJSON().criteria.search === 'Import staff 000'
    );
    await page.getByRole('textbox', { name: 'Search table' }).fill('Import staff 000');
    await query;
    await expect(page.locator('tbody tr')).toHaveCount(1);
    const sortedResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith('/synthetic-hr/table-query') &&
        response
          .request()
          .postDataJSON()
          .criteria.sorts.some((sort: any) => sort.column === 'timeIn')
    );
    await page.getByRole('button', { name: 'Sort by In time', exact: true }).click();
    const savedQuery = await (await sortedResponse).json();
    expect(savedQuery.totalCount).toBe(1);
    expect(savedQuery.items[0]).toMatchObject({ id: 'import-0', timeIn: '10:25', statusCode: 0 });
    await expect(row).toContainText('10:25');
    await expect(row.getByLabel('Current attendance')).toHaveText('Present');
    await page.screenshot({ path: info.outputPath('saved-import-draft.png'), fullPage: true });
  });
  test(`typed global criteria and complete filtered export at ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/');
    await page.getByRole('button', { name: 'operational', exact: true }).click();
    await expect(page.getByText('1–10 of 260')).toBeVisible();
    await page.getByRole('button', { name: 'Go to next page' }).click();
    await expect(page.locator('tbody tr').first()).toContainText('PF rule 010');
    const sorted = page.waitForRequest(
      (request) =>
        request.url().endsWith('/synthetic-hr/table-query') &&
        request.postDataJSON().criteria.sorts.length > 0
    );
    await page.getByRole('button', { name: 'Sort by Wage ceiling', exact: true }).click();
    expect((await sorted).postDataJSON()).toMatchObject({
      offset: 0,
      criteria: { sorts: [{ column: 'wageCeiling', direction: 'asc' }] },
    });
    await expect(page.locator('tbody tr').nth(1)).toContainText('PF rule 020');
    await page.getByRole('button', { name: 'Sort by Wage ceiling', exact: true }).click();
    await expect(page.locator('tbody tr').first()).toContainText('No ceiling');
    await page.getByRole('button', { name: 'Filter Wage ceiling', exact: true }).click();
    await page.getByRole('combobox', { name: 'Filter Type *', exact: true }).click();
    await page.getByRole('option', { name: 'Greater Than', exact: true }).click();
    await page.getByRole('spinbutton', { name: 'Wage ceiling *', exact: true }).fill('8');
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect(page.getByText('1–10 of 38')).toBeVisible();
    await expect(page.locator('tbody tr').first()).toContainText('PF rule 019');
    const outgoing = page.waitForRequest(
      (request) => request.url().endsWith('/synthetic-hr/exports') && request.method() === 'POST'
    );
    await page.getByRole('button', { name: 'Export', exact: true }).click();
    const download = page.waitForEvent('download');
    await page.getByRole('menuitem', { name: /Excel/ }).click();
    const payload = (await outgoing).postDataJSON();
    expect(payload.columns.map((column: { id: string }) => column.id)).toEqual([
      'name',
      'wageCeiling',
      'effectiveFrom',
    ]);
    expect(payload.query.criteria).toMatchObject({
      filters: [{ column: 'wageCeiling', type: 'greaterThan', value: '8' }],
      sorts: [{ column: 'wageCeiling', direction: 'desc' }],
    });
    const workbook = XLSX.readFile((await (await download).path())!);
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets.Data, { header: 1 }) as unknown[][];
    expect(rows).toHaveLength(39);
    expect(rows.slice(1).every((row) => Number(row[1]) > 8)).toBe(true);
    expect(rows[1][0]).toBe('PF rule 019');
    await page.getByRole('button', { name: 'Operational empty', exact: true }).click();
    await expect(page.getByText('No results found', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Clear \(\d+\)$/ })).toBeVisible();
    await page.getByRole('button', { name: 'Operational error', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Retry', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(page.getByText('1–10 of 38')).toBeVisible();
    await page.getByRole('button', { name: 'Operational loading', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Export', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Operational normal', exact: true }).click();
    await expect(page.getByText('1–10 of 38')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width + 1
    );
    await page.screenshot({ path: info.outputPath('typed-table-light.png'), fullPage: true });
    await page.getByRole('button', { name: 'Toggle theme', exact: true }).click();
    await page.screenshot({ path: info.outputPath('typed-table-dark.png'), fullPage: true });
  });
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
