/* eslint-disable import/no-extraneous-dependencies */
import { test, expect, type Page } from '@playwright/test';

async function mockWorkspace(page: Page, catalogueDelay = 0) {
  const requests: string[] = [];
  await page.addInitScript(() => localStorage.setItem('onboarding_completed', 'true'));
  await page.route('**/api/**', async (route) => {
    const { pathname } = new URL(route.request().url());
    requests.push(pathname);
    let body: unknown = { items: [], totalCount: 0 };
    if (pathname.endsWith('/auth/session'))
      body = {
        accessToken: 'local-navigation-fixture',
        expires: '2099-01-01T00:00:00Z',
        profile: { sub: 'navigation-reviewer', name: 'Navigation Reviewer', role: 'admin' },
      };
    else if (pathname.endsWith('/host/session-context'))
      body = {
        accountMode: 'tenant',
        tenantId: 'navigation-school',
        setupCompleted: true,
        canManageSetup: false,
        canViewTenants: false,
        canCreateTenants: false,
        canUpdateTenants: false,
        canManageTenantStatus: false,
      };
    else if (pathname.includes('permission-management'))
      body = {
        groups: [
          {
            name: 'Navigation test',
            permissions: [
              'ShikshaMitra.Module.HR',
              'ShikshaMitra.Module.HR.Dashboard',
              'HR.Dashboard.View',
              'ShikshaMitra.Module.HR.Reports',
              'HR.Reports.View',
              'HR.Reports.Build',
              'HR.Employee.EmployeeList.View',
            ].map((name) => ({ name, isGranted: true })),
          },
        ],
      };
    else if (pathname.includes('user-scope-hierarchy'))
      body = { isAdmin: true, accessibleHierarchy: [] };
    else if (pathname.endsWith('/hr/reports/catalogue')) {
      await new Promise((resolve) => setTimeout(resolve, catalogueDelay));
      body = [
        {
          id: 'employees',
          label: 'Staff',
          category: 'Staff',
          fields: [],
          layouts: ['detail'],
          parameters: [],
          requiredParameters: [],
          summaryFunctions: [],
        },
      ];
    } else if (pathname.endsWith('/hr/reports/workspace-options')) {
      body = {
        staff: [],
        staffGroups: [],
        departments: [],
        academicYears: [],
        sections: [],
        cycles: [],
      };
    } else if (pathname.endsWith('/hr/reports/library'))
      body = [
        {
          id: 'staff-list',
          name: 'Staff list',
          description: 'Staff in your scope',
          category: 'Staff',
          isBuiltIn: true,
          visibility: 'organization',
          status: 'Published',
          revision: 1,
          publishedRevision: 1,
          canEdit: false,
          definition: {
            version: 2,
            dataSource: 'employees',
            layout: 'detail',
            columns: [],
            filters: { match: 'all', conditions: [], groups: [] },
            sorts: [],
            groups: [],
            summaries: [],
            parameters: [],
            defaultPeriod: 'thisMonth',
            dateField: '',
            paperSize: 'A4',
            orientation: 'portrait',
          },
        },
      ];
    else if (pathname.endsWith('/hr/reports/runs')) body = { items: [], hasMore: false };
    else if (pathname.endsWith('/hr/reports/runs/run-1'))
      body = {
        id: 'run-1',
        name: 'Captured staff list',
        templateId: 'staff-list',
        revision: 1,
        dataSource: 'employees',
        status: 'Queued',
        capturedAt: '2026-10-20T05:00:00Z',
        expiresAt: '2026-10-27T05:00:00Z',
        rowCount: 0,
        isExpired: false,
        parameters: { period: 'thisMonth', employeeIds: [], departments: [], includeDrafts: false },
        columns: [],
        totals: {},
        warnings: [],
        excelReady: false,
        pdfReady: false,
        excelStatus: '',
        pdfStatus: '',
      };
    else if (pathname.endsWith('/hr/dashboard/overview'))
      body = {
        date: '2026-10-20',
        asOfDate: '2026-10-20',
        generatedAt: '2026-10-20T05:00:00Z',
        scopeLabel: 'Staff in your assigned scope',
        capabilities: {},
        workforceState: 'Available',
        leaveState: 'Forbidden',
        attendanceState: 'Forbidden',
        payrollState: 'Forbidden',
        onboardingState: 'Forbidden',
        appraisalState: 'Forbidden',
        workforce: { activeStaff: 33, teaching: 20, nonTeaching: 13, joinedThisMonth: 1 },
      };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
  return requests;
}

test('template library opens without waiting for the design catalogue', async ({ page }) => {
  const requests = await mockWorkspace(page, 5000);
  await page.goto('/hr/reports');
  await expect(page.getByRole('heading', { name: 'HR reports', exact: true })).toBeVisible();
  const start = Date.now();
  await expect(page.getByRole('textbox', { name: 'Search report templates' })).toBeVisible({
    timeout: 2000,
  });
  await expect(page.getByText('Staff list', { exact: true })).toBeVisible();
  expect(requests.filter((url) => url.endsWith('/catalogue'))).toHaveLength(0);
  await test
    .info()
    .attach('library-ready-ms', { body: String(Date.now() - start), contentType: 'text/plain' });
});

test('history deep link does not wait for templates or the design catalogue', async ({ page }) => {
  const requests = await mockWorkspace(page, 5000);
  await page.goto('/hr/reports?tab=generated');
  await expect(page.getByRole('tab', { name: 'Generated reports', exact: true })).toBeVisible({
    timeout: 2000,
  });
  await expect.poll(() => requests.some((url) => url.endsWith('/hr/reports/runs'))).toBe(true);
  expect(requests.filter((url) => /\/(library|catalogue)$/.test(url))).toHaveLength(0);
});

test('HR and Reports stay in the application shell during repeat navigation', async ({ page }) => {
  await mockWorkspace(page);
  await page.goto('/hr/dashboard');
  await expect(page.getByRole('heading', { name: 'HR Dashboard', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Reports', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Search report templates' })).toBeVisible();
  await page.locator('a[href="/hr/dashboard"], a[href="/hr/dashboard/"]').first().click();
  await expect(page.getByRole('heading', { name: 'HR Dashboard', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Refresh HR dashboard' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Dashboard refreshed.' })).toBeVisible();
});

test('generation loads the template, catalogue and options when needed', async ({ page }) => {
  const requests = await mockWorkspace(page);
  await page.goto('/hr/reports?mode=generate&template=staff-list');
  await expect(page.getByRole('button', { name: 'Generate report', exact: true })).toBeVisible();
  await expect.poll(() => requests.some((url) => url.endsWith('/workspace-options'))).toBe(true);
  expect(requests.filter((url) => url.endsWith('/catalogue'))).toHaveLength(1);
  expect(requests.filter((url) => url.endsWith('/library'))).toHaveLength(1);
});

test('captured result deep link loads independently of templates and catalogue', async ({
  page,
}) => {
  const requests = await mockWorkspace(page, 5000);
  await page.goto('/hr/reports?mode=result&run=run-1');
  await expect(page.getByText('Captured staff list', { exact: true })).toBeVisible();
  await expect(page.getByText('Queued', { exact: true })).toBeVisible();
  expect(requests.filter((url) => /\/(library|catalogue)$/.test(url))).toHaveLength(0);
});
