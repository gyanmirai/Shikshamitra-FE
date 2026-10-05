/* eslint-disable import/no-extraneous-dependencies, no-await-in-loop, no-restricted-syntax */
import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';

const dashboardPermission = 'HR.Dashboard.View';
const modulePermission = 'ShikshaMitra.Module.HR';
const fullPermissions = [
  modulePermission,
  'ShikshaMitra.Module.HR.Dashboard',
  dashboardPermission,
  'HR.Employee.EmployeeList.View',
  'HR.Employee.EmployeeList.Add',
  'HR.Employee.EmployeeOnboarding.View',
  'HR.PerformanceManagement.View',
  'HR.Reports.View',
  'HR.AttendanceAndLeave.Dashboard.View',
  'HR.AttendanceAndLeave.AttendanceTracking.View',
  'HR.AttendanceAndLeave.MarkAttendance.View',
  'HR.AttendanceAndLeave.MarkAttendance.Add',
  'HR.LeaveManagement.LeaveCenter.View',
  'HR.PayrollManagement.Dashboard.View',
  'HR.PayrollManagement.RunPayroll.View',
];
const statuses = [
  'Present',
  'Absent',
  'OnLeave',
  'HalfDay',
  'NotMarked',
  'NotScheduled',
  'NeedsSetup',
];
const allStaff = Array.from({ length: 126 }, (_, i) => ({
  employeeId: `00000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`,
  name:
    i === 0
      ? 'Asha Nayanben Patel with a sufficiently long staff name'
      : `Staff Member ${String(i).padStart(3, '0')}`,
  employeeCode: `EMP-${String(i + 1).padStart(3, '0')}`,
  isTeaching: i % 3 !== 0,
  department: i % 3 !== 0 ? 'Science' : 'Administration',
  stages:
    i === 0
      ? [
          { id: 'stage-3', name: 'GSEB Gujarati Secondary' },
          { id: 'stage-1', name: 'GSEB Gujarati Primary' },
          { id: 'stage-2', name: 'CBSE English Higher Secondary with a long assignment name' },
        ]
      : [{ id: 'stage-1', name: 'GSEB Gujarati Primary' }],
  shiftName: 'Morning',
  status: statuses[i % statuses.length],
  approvedLeaveCoverage: i % 7 === 2 ? 'FullDay' : null,
  source: 'Manual',
  timeIn: null,
  timeOut: null,
  reviewFlags:
    i % 7 === 6
      ? [
          {
            code: 'CalendarNeedsConfiguration',
            message: 'Attendance calendar needs configuration.',
          },
        ]
      : [],
}));
const counts = (rows: typeof allStaff) => ({
  date: '2026-10-01',
  staffCount: rows.length,
  present: rows.filter((r) => r.status === 'Present').length,
  absent: rows.filter((r) => r.status === 'Absent').length,
  onLeave: rows.filter((r) => r.status === 'OnLeave').length,
  halfDay: rows.filter((r) => r.status === 'HalfDay').length,
  notMarked: rows.filter((r) => r.status === 'NotMarked').length,
  notScheduled: rows.filter((r) => r.status === 'NotScheduled').length,
  needsSetup: rows.filter((r) => r.status === 'NeedsSetup').length,
  needsReview: rows.filter((r) => r.reviewFlags.length).length,
});
const academicYear = {
  id: 'hr-dashboard-year-e2e',
  name: '2026-27',
  startDate: '2026-06-01T00:00:00Z',
  endDate: '2027-05-31T23:59:59Z',
};

const authenticatedEmployee = {
  id: 'hr-dashboard-admin-e2e',
  fullName: 'HR Dashboard Admin',
  employeeCode: 'EMP-HR-001',
  status: 0,
  employeeStatusType: 0,
};

async function mockDashboard(
  page: Page,
  options: {
    permissions?: string[];
    empty?: boolean;
    attentionReview?: boolean;
    savedPayrollAt?: string;
    normal?: boolean;
    onboardingUnavailable?: boolean;
    failSections?: boolean;
  } = {}
) {
  const permissions = options.permissions || fullPermissions;
  const has = (name: string) => permissions.includes(name);
  const population = options.empty
    ? []
    : options.normal
      ? allStaff.map((row, i) => ({ ...row, status: statuses[i % 5], reviewFlags: [] }))
      : allStaff;
  await page.addInitScript(
    ({ year, employee, grantedPermissions }) => {
      window.localStorage.setItem(
        'persist:root',
        JSON.stringify({
          globalState: JSON.stringify({
            currentYear: year,
            currentBoard: {},
            currentMedium: {},
          }),
          auth: JSON.stringify({
            user: {
              sub: 'hr-dashboard-admin-e2e',
              name: 'HR Dashboard Admin',
              role: 'admin',
            },
            isAuthenticated: true,
            loading: false,
            permissionsInitialized: true,
            employee,
            permissions: grantedPermissions.map((name) => ({ name, isGranted: true })),
            mainModuleVisibility: [false, false, false, false, true],
          }),
          _persist: JSON.stringify({ version: -1, rehydrated: true }),
        })
      );
      window.localStorage.setItem('onboarding_completed', 'true');
    },
    { year: academicYear, employee: authenticatedEmployee, grantedPermissions: permissions }
  );

  await page.route('**/api/auth/session**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'hr-dashboard-e2e-token',
        expires: '2099-01-01T00:00:00.000Z',
        profile: {
          sub: 'hr-dashboard-admin-e2e',
          name: 'HR Dashboard Admin',
          role: 'admin',
        },
      }),
    });
  });

  await page.route('**/api/abp/application-configuration**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        currentUser: {
          isAuthenticated: true,
          id: 'hr-dashboard-admin-e2e',
          userName: 'hr-dashboard-admin-e2e',
          name: 'HR Dashboard Admin',
          roles: ['admin'],
        },
        auth: {
          grantedPolicies: Object.fromEntries(permissions.map((name) => [name, true])),
        },
      }),
    });
  });

  await page.route('**/api/employees/me**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(authenticatedEmployee),
    });
  });

  await page.route('**/api/app/education-board**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [], totalCount: 0 }),
    });
  });

  await page.route('**/api/app/academic-organization-options**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [], totalCount: 0 }),
    });
  });

  await page.route('**/api/app/user-scope/user-scope-hierarchy**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ isAdmin: true, accessibleHierarchy: [] }),
    });
  });

  await page.route('**/api/app/academic-year**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [academicYear], totalCount: 1 }),
    });
  });

  await page.route('**/permission-management/permissions?**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        groups: [
          {
            name: 'HR dashboard test permissions',
            permissions: permissions.map((name) => ({ name, isGranted: true })),
          },
        ],
      }),
    });
  });

  await page.route('**/api/hr/dashboard/overview?**', async (route) => {
    const url = new URL(route.request().url());
    const summary = { ...counts(population), date: url.searchParams.get('date') };
    const availability = (permission: string) =>
      has(permission) ? (options.failSections ? 'Failed' : 'Available') : 'Forbidden';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        date: summary.date,
        asOfDate: '2026-10-05',
        generatedAt: '2026-10-05T05:50:00Z',
        scopeLabel: 'Staff in your assigned scope',
        capabilities: {
          canViewAttendance: has('HR.AttendanceAndLeave.Dashboard.View'),
          canViewStaff: has('HR.AttendanceAndLeave.AttendanceTracking.View'),
          canViewEmployees: has('HR.Employee.EmployeeList.View'),
          canAddEmployees: has('HR.Employee.EmployeeList.Add'),
          canMarkAttendance: has('HR.AttendanceAndLeave.MarkAttendance.Add'),
          canViewLeave: has('HR.LeaveManagement.LeaveCenter.View'),
          canViewPayroll: has('HR.PayrollManagement.Dashboard.View'),
          canOpenPayroll: has('HR.PayrollManagement.RunPayroll.View'),
          canViewOnboarding: has('HR.Employee.EmployeeOnboarding.View'),
          canOpenOnboarding:
            has('HR.Employee.EmployeeOnboarding.View') && !options.onboardingUnavailable,
          canViewAppraisals: has('HR.PerformanceManagement.View'),
        },
        workforceState: availability('HR.Employee.EmployeeList.View'),
        leaveState: availability('HR.LeaveManagement.LeaveCenter.View'),
        onboardingState: options.onboardingUnavailable
          ? 'Unavailable'
          : availability('HR.Employee.EmployeeOnboarding.View'),
        appraisalState: availability('HR.PerformanceManagement.View'),
        attendanceState: availability('HR.AttendanceAndLeave.Dashboard.View'),
        payrollState: availability('HR.PayrollManagement.Dashboard.View'),
        onboardingUnavailableReason: options.onboardingUnavailable
          ? 'Onboarding summary requires school-wide HR access.'
          : null,
        workforce: {
          activeStaff: population.length,
          teaching: population.filter((r) => r.isTeaching).length,
          nonTeaching: population.filter((r) => !r.isTeaching).length,
          joinedThisMonth: options.empty ? 0 : 2,
        },
        leave: { pendingRequests: options.empty ? 0 : 6 },
        onboarding: options.onboardingUnavailable
          ? null
          : { readyCount: options.empty ? 0 : 3, inProgressCount: options.empty ? 0 : 8 },
        appraisal: {
          pendingCount: options.empty ? 0 : 4,
          overdueCount: options.empty ? 0 : 1,
          nextDeadline: options.empty ? null : '2026-10-06',
        },
        summary,
        trend: Array.from({ length: 7 }, (_, i) => {
          const day = new Date(`${summary.date}T00:00:00Z`);
          day.setUTCDate(day.getUTCDate() - 6 + i);
          return { ...summary, date: day.toISOString().slice(0, 10) };
        }),
        payroll: {
          month: '2026-10',
          savedStaffCount: options.empty ? 0 : 126,
          reviewedCount: options.empty ? 0 : 88,
          lockedCount: options.empty ? 0 : 20,
          pendingCount: options.empty ? 0 : 18,
          lastUpdatedAt: options.savedPayrollAt || '2026-10-01T22:45:00Z',
        },
      }),
    });
  });
}

async function noOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
      )
    )
    .toBe(true);
}

test.describe('HR module overview dashboard', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const width of [390, 768, 1366, 1440]) {
    for (const mode of ['light', 'dark']) {
      test(`${mode} layout at ${width}px @visual @accessibility`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.addInitScript((themeMode) => {
          localStorage.setItem('theme-mode', themeMode);
          localStorage.setItem('app-settings', JSON.stringify({ colorScheme: themeMode }));
        }, mode);
        await mockDashboard(page);
        const staffRequests: string[] = [];
        page.on('request', (request) => {
          if (request.url().includes('/hr/dashboard/staff')) staffRequests.push(request.url());
        });
        await page.goto('/hr/dashboard');
        await expect(page.locator('html')).toHaveAttribute('data-mui-color-scheme', mode);
        for (const title of ['Workforce', 'Leave approvals', 'Onboarding', 'Appraisals'])
          await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
        await expect(
          page.getByRole('heading', { name: 'Staff overview', exact: true })
        ).toHaveCount(0);
        await expect(page.getByRole('table')).toHaveCount(0);
        await expect(
          page.getByRole('region', { name: 'Workforce' }).getByText('126', { exact: true })
        ).toBeVisible();
        const modules = page.getByTestId('hr-module-overview').getByRole('region');
        const moduleBounds = await Promise.all(
          (await modules.all()).map((module) => module.boundingBox())
        );
        const rowPositions = new Set(moduleBounds.map((bounds) => Math.round(bounds!.y)));
        expect(rowPositions.size).toBe(width >= 1200 ? 1 : width >= 600 ? 2 : 4);
        for (const module of await modules.all()) {
          expect(await module.evaluate((element) => getComputedStyle(element).boxShadow)).toBe(
            'none'
          );
        }
        for (const action of await modules.getByRole('link').all()) {
          const bounds = await action.boundingBox();
          expect(Math.round(bounds!.height)).toBe(30);
          await expect(action).toHaveClass(/MuiButton-outlined/);
        }
        if (width >= 1200) {
          const payrollBounds = await page
            .getByRole('region', { name: 'Payroll progress' })
            .boundingBox();
          expect(payrollBounds!.y + payrollBounds!.height).toBeLessThan(844);
        }
        await expect(
          page
            .getByRole('region', { name: 'Payroll progress' })
            .getByText(/Saved 2 Oct 2026.*4:15 am.*IST/)
        ).toBeVisible();
        await noOverflow(page);
        await expect
          .poll(async () => {
            const bounds = await page
              .locator('[aria-label="Seven-day staff attendance"] .highcharts-root')
              .boundingBox();
            return Math.round(bounds?.height || 0);
          })
          .toBe(210);
        expect(staffRequests).toEqual([]);
        const accessibility = await new AxeBuilder({ page })
          .include('[data-testid="hr-dashboard-shell"]')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();
        expect(accessibility.violations).toEqual([]);
        if (width === 390) {
          const leave = await page.getByRole('region', { name: 'Leave approvals' }).boundingBox();
          expect(leave!.y).toBeLessThan(844);
        }
        await page.screenshot({
          path: `.artifacts/hr-module-${mode}-${width}.png`,
          fullPage: true,
        });
      });
    }
  }

  test('date controls preserve current modules and URL reload @critical', async ({ page }) => {
    await mockDashboard(page);
    await page.goto('/hr/dashboard?date=2026-10-01');
    const workforce = page.getByRole('region', { name: 'Workforce' });
    await expect(workforce.getByText('126', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Previous attendance day' }).click();
    await expect(page).toHaveURL(/date=2026-09-30/);
    await expect(workforce.getByText('126', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByLabel('Attendance date', { exact: true })).toHaveValue('2026-09-30');
    await page.getByRole('button', { name: 'Today', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Today', exact: true })).toBeDisabled();
    await expect(workforce.getByText('126', { exact: true })).toBeVisible();
  });

  test('retired table filters are explained and removed without changing date', async ({
    page,
  }) => {
    await mockDashboard(page);
    await page.goto(
      '/hr/dashboard?date=2026-10-01&stage=stage-1&search=Patel&page=3&trendView=counts'
    );
    await expect(page.getByText(/Staff filters are no longer used/)).toBeVisible();
    await expect.poll(() => new URL(page.url()).search).toBe('?date=2026-10-01');
    await expect(page.getByRole('button', { name: /^Filters/ })).toHaveCount(0);
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(page.getByText(/Staff filters are no longer used/)).toHaveCount(0);
  });

  test('module actions use existing workflow links @critical', async ({ page }) => {
    await mockDashboard(page);
    await page.goto('/hr/dashboard');
    await expect(page.getByRole('link', { name: 'Open Staff Directory' })).toHaveAttribute(
      'href',
      '/hr/employee'
    );
    await expect(page.getByRole('link', { name: 'Review Requests' })).toHaveAttribute(
      'href',
      '/hr/leave-approvals'
    );
    await expect(page.getByRole('link', { name: 'Open Appraisals' })).toHaveAttribute(
      'href',
      '/hr/professional-management/reviews?cycleId=all'
    );
    await expect(page.getByRole('link', { name: 'Open Payroll' })).toHaveAttribute(
      'href',
      '/hr/payroll/run-payroll?month=2026-10'
    );
    await expect(page.getByRole('link', { name: 'Add Staff' })).toHaveAttribute(
      'href',
      '/hr/employee?mode=form'
    );
  });

  test('partial permissions and restricted onboarding remain honest @permission', async ({
    page,
  }) => {
    await mockDashboard(page, {
      permissions: [
        modulePermission,
        'ShikshaMitra.Module.HR.Dashboard',
        dashboardPermission,
        'HR.Employee.EmployeeList.View',
        'HR.Employee.EmployeeOnboarding.View',
      ],
      onboardingUnavailable: true,
    });
    await page.goto('/hr/dashboard');
    await expect(
      page.getByRole('region', { name: 'Onboarding' }).getByText('Unavailable', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText('Onboarding summary requires school-wide HR access.')
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open Onboarding' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Leave approvals', exact: true })).toHaveCount(
      0
    );
    await expect(page.getByRole('heading', { name: 'Appraisals', exact: true })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Add Staff' })).toHaveCount(0);
  });

  test('refresh failure preserves stale data and performs reads only @critical', async ({
    page,
  }) => {
    await mockDashboard(page);
    await page.goto('/hr/dashboard');
    await expect(
      page.getByRole('region', { name: 'Workforce' }).getByText('126', { exact: true })
    ).toBeVisible();
    const writes: string[] = [];
    page.on('request', (request) => {
      if (request.method() !== 'GET' && request.url().includes('/api/hr/'))
        writes.push(request.url());
    });
    await page.route('**/api/hr/dashboard/overview?**', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' })
    );
    await page.getByRole('button', { name: 'Refresh HR dashboard' }).click();
    await expect(page.getByText(/Stale · Updated/)).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Workforce' }).getByText('126', { exact: true })
    ).toBeVisible();
    expect(writes).toEqual([]);
    await page.route('**/api/hr/dashboard/overview?**', (route) =>
      route.fulfill({ status: 403, contentType: 'application/json', body: '{}' })
    );
    await page.getByRole('button', { name: 'Refresh HR dashboard' }).click();
    await expect(
      page.getByText('You do not have permission to view the HR dashboard.')
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Workforce', exact: true })).toHaveCount(0);
  });

  test('empty and failed sections do not substitute zero for unavailable', async ({ page }) => {
    await mockDashboard(page, { failSections: true });
    await page.goto('/hr/dashboard');
    await expect(
      page.getByRole('region', { name: 'Workforce' }).getByText('Unavailable', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Workforce' }).getByText('0', { exact: true })
    ).toHaveCount(0);
    await mockDashboard(page, { empty: true });
    await page.reload();
    await expect(
      page.getByRole('region', { name: 'Workforce' }).getByText('0', { exact: true }).first()
    ).toBeVisible();
    await expect(page.getByText('No saved payroll records for this month.')).toBeVisible();
  });

  test('chart counts are keyboard reachable with reduced motion @accessibility', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mockDashboard(page);
    await page.goto('/hr/dashboard?date=2026-10-01');
    const day = page.getByRole('button', { name: /^1 Oct 2026:.*126 total staff$/ });
    await day.focus();
    await expect(day).toBeFocused();
    await expect(day).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('tooltip')).toBeVisible();
    await noOverflow(page);
  });
});
