/* eslint-disable import/no-extraneous-dependencies */
import { test, expect, type Page } from '@playwright/test';

async function mockPayrollSearch(page: Page, statusFilter: string | null) {
  const requests: URL[] = [];
  const year = { id: '11111111-1111-1111-1111-111111111111', name: '2026-27' };
  await page.addInitScript((academicYear) => {
    localStorage.setItem(
      'persist:root',
      JSON.stringify({
        globalState: JSON.stringify({
          currentYear: academicYear,
          currentBoard: {},
          currentMedium: {},
        }),
        _persist: JSON.stringify({ version: -1, rehydrated: true }),
      })
    );
    localStorage.setItem('onboarding_completed', 'true');
  }, year);
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    let body: unknown = { items: [], totalCount: 0 };
    if (url.pathname.endsWith('/auth/session'))
      body = {
        accessToken: 'local-payroll-search-fixture',
        expires: '2099-01-01T00:00:00Z',
        profile: { sub: 'search-reviewer', name: 'Search Reviewer', role: 'admin' },
      };
    else if (url.pathname.endsWith('/host/session-context'))
      body = {
        accountMode: 'tenant',
        tenantId: year.id,
        setupCompleted: true,
        canManageSetup: false,
        canViewTenants: false,
        canCreateTenants: false,
        canUpdateTenants: false,
        canManageTenantStatus: false,
      };
    else if (url.pathname.includes('permission-management'))
      body = {
        groups: [
          {
            name: 'Payroll search test',
            permissions: [
              'ShikshaMitra.Module.HR',
              'ShikshaMitra.Module.HR.Payroll',
              'HR.PayrollManagement.PayrollStructure',
              'HR.PayrollManagement.PayrollStructure.View',
              'HR.PayrollManagement.GenerateSalarySlip',
              'HR.PayrollManagement.GenerateSalarySlip.View',
              'HR.Employee.EmployeeList.View',
            ].map((name) => ({ name, isGranted: true })),
          },
        ],
      };
    else if (url.pathname.includes('academic-year')) body = { items: [year], totalCount: 1 };
    else if (url.pathname.includes('user-scope-hierarchy'))
      body = { isAdmin: true, accessibleHierarchy: [] };
    else if (/\/employees(?:\/options)?$/.test(url.pathname)) {
      requests.push(url);
      const currentPage = Number(url.searchParams.get('page'));
      const pageSize = Number(url.searchParams.get('pageSize'));
      const search = url.searchParams.get('search') || '';
      const totalCount = search ? 1 : 600;
      const items = Array.from({ length: search ? 1 : pageSize }, (_, index) => ({
        id: `staff-${(currentPage - 1) * pageSize + index + 1}`,
        fullName: search
          ? 'Payroll Second Match'
          : `Payroll Staff ${String((currentPage - 1) * pageSize + index + 1).padStart(3, '0')}`,
        status: statusFilter ? 0 : 1,
      }));
      body = {
        items,
        totalCount,
        currentPage,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        hasMore: currentPage * pageSize < totalCount,
      };
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
  return requests;
}

[
  { path: '/hr/payroll/structure', label: 'Staff', pageSize: 25, status: 'Active' },
  { path: '/hr/payroll/payslip-generation', label: 'Staff member', pageSize: 10, status: null },
].forEach((pickerConfig) => {
  test(`${pickerConfig.label} search uses small pages and reaches staff beyond the first page`, async ({
    page,
  }) => {
    const requests = await mockPayrollSearch(page, pickerConfig.status);
    await page.goto(pickerConfig.path);
    const picker = page.getByRole('combobox', { name: pickerConfig.label, exact: true });
    await picker.click();
    await expect(
      page.getByRole('option', { name: 'Payroll Staff 001', exact: true })
    ).toBeVisible();
    expect(requests[0].pathname).toBe('/api/employees/options');
    expect(requests[0].searchParams.get('pageSize')).toBe(String(pickerConfig.pageSize));
    expect(requests[0].searchParams.get('status')).toBe(pickerConfig.status);
    await page.getByRole('listbox').evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await expect(
      page.getByRole('option', {
        name: `Payroll Staff ${String(pickerConfig.pageSize + 1).padStart(3, '0')}`,
        exact: true,
      })
    ).toBeAttached();
    expect(requests.some((request) => request.searchParams.get('page') === '2')).toBe(true);
    await picker.fill('Payroll first');
    await picker.fill('Payroll second');
    await expect(
      page.getByRole('option', { name: 'Payroll Second Match', exact: true })
    ).toBeVisible();
    expect(requests.filter((request) => request.searchParams.get('search'))).toHaveLength(1);
    expect(requests.at(-1)?.searchParams.get('search')).toBe('Payroll second');
    await page.screenshot({ path: test.info().outputPath('staff-search.png'), fullPage: true });
  });
});

test('payslip search discards an older response when input becomes too short', async ({ page }) => {
  await mockPayrollSearch(page, null);
  let releaseResponse!: () => void;
  const responseGate = new Promise<void>((resolve) => {
    releaseResponse = resolve;
  });
  let notifyStarted!: () => void;
  const started = new Promise<void>((resolve) => {
    notifyStarted = resolve;
  });
  await page.route('**/api/employees/options**', async (route) => {
    if (new URL(route.request().url()).searchParams.get('search') !== 'Older')
      return route.fallback();
    notifyStarted();
    await responseGate;
    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        items: [{ id: 'older-staff', fullName: 'Older response staff', status: 1 }],
        hasMore: false,
      }),
    });
  });
  await page.goto('/hr/payroll/payslip-generation');
  const picker = page.getByRole('combobox', { name: 'Staff member', exact: true });
  await picker.fill('Older');
  await started;
  await picker.fill('x');
  releaseResponse();
  await expect(page.getByText('Type at least 2 characters to search...')).toBeVisible();
  await expect(page.getByRole('option', { name: 'Older response staff' })).toHaveCount(0);
});

test('payroll staff can retry a failed next page without losing existing options', async ({
  page,
}) => {
  await mockPayrollSearch(page, 'Active');
  let failed = false;
  await page.route('**/api/employees/options**', async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get('page') !== '2' || failed) return route.fallback();
    failed = true;
    return route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: { message: 'Temporary list failure' } }),
    });
  });
  await page.goto('/hr/payroll/structure');
  await page.getByRole('combobox', { name: 'Staff', exact: true }).click();
  await expect(page.getByRole('option', { name: 'Payroll Staff 001', exact: true })).toBeVisible();
  await page.getByRole('listbox').evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(page.getByRole('option', { name: 'Payroll Staff 001', exact: true })).toBeAttached();
  await page.getByRole('button', { name: 'Retry results', exact: true }).click();
  await expect(page.getByRole('option', { name: 'Payroll Staff 026', exact: true })).toBeAttached();
});
