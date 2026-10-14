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
    payroll?: {
      savedStaffCount?: number;
      reviewedCount?: number;
      lockedCount?: number;
      pendingCount?: number;
    };
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

  await page.route('**/api/host/session-context**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accountMode: 'tenant',
        tenantId: 'hr-dashboard-test-tenant',
        setupCompleted: true,
        canManageSetup: false,
        canViewTenants: false,
        canCreateTenants: false,
        canUpdateTenants: false,
        canManageTenantStatus: false,
      }),
    })
  );

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
          ...options.payroll,
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

async function secondaryCardsAlign(page: Page, width: number) {
  const attendance = await page
    .getByRole('region', { name: 'Seven-day staff attendance' })
    .boundingBox();
  const payroll = await page.getByRole('region', { name: 'Payroll progress' }).boundingBox();
  if (width >= 1200) {
    expect(Math.abs(attendance!.y - payroll!.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(attendance!.height - payroll!.height)).toBeLessThanOrEqual(1);
  } else {
    expect(payroll!.y).toBeGreaterThanOrEqual(attendance!.y + attendance!.height);
  }
}

test.describe('HR module overview dashboard', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const width of [390, 1440]) {
    test(`minimal attendance and compact header at ${width}px @critical @accessibility`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await mockDashboard(page);
      await page.goto('/hr/dashboard?date=2026-10-01');
      const attendance = page.getByRole('region', { name: 'Seven-day staff attendance' });
      await expect(attendance.getByText('/ 126 staff present', { exact: true })).toBeVisible();
      await expect(attendance.getByRole('button')).toHaveCount(0);
      const summary = attendance.locator('dl');
      await expect(summary).toContainText('Absent:18');
      await expect(summary).toContainText('Not marked:18');
      await expect(summary).toContainText('Needs setup:18');
      await expect(attendance.getByText(/Needs review: 18 staff/)).toBeVisible();
      await expect(
        attendance.getByRole('list', { name: 'Daily present staff counts' }).getByRole('listitem')
      ).toHaveCount(7);
      await expect(attendance.locator('.highcharts-series')).toHaveCount(1);
      const header = await page.getByTestId('hr-dashboard-header').boundingBox();
      const modules = await page.getByTestId('hr-module-overview').boundingBox();
      expect(modules!.y - header!.y - header!.height).toBeLessThanOrEqual(8);
      if (width >= 1200) expect(header!.height).toBeLessThanOrEqual(82);
      await secondaryCardsAlign(page, width);
      await noOverflow(page);
      const accessibility = await new AxeBuilder({ page })
        .include('[data-testid="hr-dashboard-shell"]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(accessibility.violations).toEqual([]);
    });
  }

  test('payroll guidance distinguishes saved record states and unavailable data @critical', async ({
    page,
  }) => {
    await mockDashboard(page);
    await page.goto('/hr/dashboard');
    const payroll = page.getByRole('region', { name: 'Payroll progress' });
    await expect(
      payroll.getByText('18 staff members awaiting review.', { exact: true })
    ).toBeVisible();
    await expect(payroll.getByText('Review pending', { exact: true })).toBeVisible();
    for (const scenario of [
      {
        savedStaffCount: 1,
        reviewedCount: 0,
        lockedCount: 0,
        pendingCount: 1,
        message: '1 staff member awaiting review.',
      },
      {
        savedStaffCount: 10,
        reviewedCount: 5,
        lockedCount: 5,
        pendingCount: 0,
        message: '5 reviewed records remain unlocked.',
      },
      {
        savedStaffCount: 10,
        reviewedCount: 0,
        lockedCount: 10,
        pendingCount: 0,
        message: 'All saved records are locked.',
      },
      {
        savedStaffCount: 123456,
        reviewedCount: 0,
        lockedCount: 0,
        pendingCount: 123456,
        message: '1,23,456 staff members awaiting review.',
      },
    ]) {
      const { message, ...payrollCounts } = scenario;
      await mockDashboard(page, { payroll: payrollCounts });
      await page.reload();
      await expect(payroll.getByText(message, { exact: true })).toBeVisible();
      await noOverflow(page);
    }
    await mockDashboard(page, { failSections: true });
    await page.reload();
    await expect(
      payroll.getByText('Payroll progress is unavailable. Refresh to retry.')
    ).toBeVisible();
    await expect(
      payroll.getByText(/awaiting review|All saved records are locked|remain unlocked/)
    ).toHaveCount(0);
    await expect(page.getByText('Awaiting decision', { exact: true })).toHaveCount(0);
    await expect(page.getByText('1 overdue', { exact: true })).toHaveCount(0);
    await mockDashboard(page, { empty: true });
    await page.reload();
    await expect(
      payroll.getByText('No saved payroll records for this month.', { exact: true })
    ).toBeVisible();
    await expect(page.getByText('Awaiting decision', { exact: true })).toHaveCount(0);
    await expect(page.getByText('1 overdue', { exact: true })).toHaveCount(0);
  });

  for (const width of [390, 768, 1440]) {
    for (const mode of ['light', 'dark']) {
      test(`${mode} slow loading at ${width}px retains content geometry @visual @accessibility`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 1000 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.addInitScript((themeMode) => {
          localStorage.setItem('theme-mode', themeMode);
          localStorage.setItem('app-settings', JSON.stringify({ colorScheme: themeMode }));
        }, mode);
        await mockDashboard(page);
        let release!: () => void;
        const pendingResponse = new Promise<void>((resolve) => {
          release = resolve;
        });
        await page.route('**/api/hr/dashboard/overview?**', async (route) => {
          await pendingResponse;
          await route.fallback();
        });
        try {
          await page.goto('/hr/dashboard');
          await expect(page.getByRole('status')).toHaveText('Loading dashboard…');
          await expect(page.getByRole('button', { name: 'Refresh HR dashboard' })).toHaveText(
            'Loading…'
          );
          await expect(
            page.getByRole('progressbar', { name: 'Loading dashboard data' })
          ).toBeVisible();
          await expect(page.getByTestId('hr-module-overview').getByRole('link')).toHaveCount(0);
          await expect(page.getByTestId('attendance-skeleton')).toHaveAttribute(
            'aria-hidden',
            'true'
          );
          await expect(page.getByTestId('payroll-skeleton')).toHaveAttribute('aria-hidden', 'true');
          const regions = page.getByTestId('hr-dashboard-shell').getByRole('region');
          for (const region of await regions.all())
            await expect(region).toHaveAttribute('aria-busy', 'true');
          const loadingHeights = await Promise.all(
            (await regions.all()).map((region) =>
              region.evaluate((element) => element.getBoundingClientRect().height)
            )
          );
          const skeletons = page.getByTestId('hr-dashboard-shell').locator('.MuiSkeleton-root');
          expect(
            await skeletons.evaluateAll((elements) =>
              elements.every(
                (element) =>
                  getComputedStyle(element).animationName === 'none' &&
                  getComputedStyle(element, '::after').animationName === 'none'
              )
            )
          ).toBe(true);
          await noOverflow(page);
          await secondaryCardsAlign(page, width);
          const accessibility = await new AxeBuilder({ page })
            .include('[data-testid="hr-dashboard-shell"]')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze();
          expect(accessibility.violations).toEqual([]);
          await page.screenshot({
            path: `.artifacts/hr-loading-${mode}-${width}.png`,
            fullPage: true,
          });
          release();
          await expect(
            page.getByRole('region', { name: 'Workforce' }).getByText('126', { exact: true })
          ).toBeVisible();
          for (const region of await regions.all())
            await expect(region).toHaveAttribute('aria-busy', 'false');
          const loadedHeights = await Promise.all(
            (await regions.all()).map((region) =>
              region.evaluate((element) => element.getBoundingClientRect().height)
            )
          );
          loadedHeights.forEach((height, index) =>
            expect(
              Math.abs(height - loadingHeights[index]),
              `region ${index}: loading ${loadingHeights[index]}, loaded ${height}`
            ).toBeLessThanOrEqual(index === 5 ? 44 : 32)
          );
          await expect(page.getByTestId('attendance-skeleton')).toHaveCount(0);
          await expect(page.getByTestId('payroll-skeleton')).toHaveCount(0);
          await secondaryCardsAlign(page, width);
          await noOverflow(page);
        } finally {
          release();
        }
      });
    }
  }

  test('background refresh retains loaded summaries without skeletons @critical', async ({
    page,
  }) => {
    await mockDashboard(page);
    await page.goto('/hr/dashboard');
    const workforce = page.getByRole('region', { name: 'Workforce' });
    await expect(workforce.getByText('126', { exact: true })).toBeVisible();
    let release!: () => void;
    const pendingResponse = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route('**/api/hr/dashboard/overview?**', async (route) => {
      await pendingResponse;
      await route.fallback();
    });
    try {
      await page.getByRole('button', { name: 'Refresh HR dashboard' }).click();
      await expect(page.getByRole('button', { name: 'Refresh HR dashboard' })).toHaveText(
        'Refreshing…'
      );
      await expect(
        page.getByRole('progressbar', { name: 'Refreshing dashboard data' })
      ).toBeVisible();
      await expect(workforce.getByText('126', { exact: true })).toBeVisible();
      await expect(page.getByTestId('hr-dashboard-shell').locator('.MuiSkeleton-root')).toHaveCount(
        0
      );
      release();
      await expect(page.getByRole('button', { name: 'Refresh HR dashboard' })).toBeEnabled();
    } finally {
      release();
    }
  });

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
        await expect(modules.getByRole('link')).toHaveCount(0);
        await expect(modules.getByRole('button')).toHaveCount(0);
        await secondaryCardsAlign(page, width);
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
    await page.getByLabel('Attendance date', { exact: true }).fill('2026-09-30');
    await expect(page).toHaveURL(/date=2026-09-30/);
    await expect(workforce.getByText('126', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByLabel('Attendance date', { exact: true })).toHaveValue('2026-09-30');
    await page.getByLabel('Attendance date', { exact: true }).fill('2026-10-01');
    await expect(page).toHaveURL(/date=2026-10-01/);
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

  test('standard breadcrumbs and read-only overview have no workflow actions @critical', async ({
    page,
  }) => {
    await mockDashboard(page);
    await page.goto('/hr/dashboard');
    const shell = page.getByTestId('hr-dashboard-shell');
    await expect(shell.getByRole('heading', { level: 1, name: 'HR Dashboard' })).toBeVisible();
    await expect(shell.locator('[data-layout="inline"]')).toBeVisible();
    const breadcrumbs = shell.getByRole('navigation');
    await expect(breadcrumbs.getByRole('link', { name: 'HR/Staff', exact: true })).toHaveAttribute(
      'href',
      '/hr/dashboard'
    );
    await expect(breadcrumbs.getByText('HR Dashboard', { exact: true })).toBeVisible();
    await expect(breadcrumbs.getByRole('link', { name: 'HR Dashboard', exact: true })).toHaveCount(
      0
    );
    await expect(shell.getByText('Quick actions', { exact: true })).toHaveCount(0);
    for (const label of [
      'Open Staff Directory',
      'Review Requests',
      'Open Onboarding',
      'Open Appraisals',
      'Open Attendance',
      'Mark Attendance',
      'Open Payroll',
      'Add Staff',
      'HR Reports',
    ]) {
      await expect(shell.getByRole('link', { name: label, exact: true })).toHaveCount(0);
      await expect(shell.getByRole('button', { name: label, exact: true })).toHaveCount(0);
    }
    await expect(shell.getByRole('button', { name: 'Refresh HR dashboard' })).toBeVisible();
    await expect(shell.getByLabel('Attendance date', { exact: true })).toBeVisible();
    await expect(
      shell.getByRole('region', { name: 'Seven-day staff attendance' }).getByRole('button')
    ).toHaveCount(0);
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

  test('attendance trend is accessible without extra controls @accessibility', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mockDashboard(page);
    await page.goto('/hr/dashboard?date=2026-10-01');
    const trend = page.getByRole('list', { name: 'Daily present staff counts' });
    await expect(trend.getByRole('listitem')).toHaveCount(7);
    await expect(trend.getByRole('listitem').last()).toHaveText(
      '1 Oct 2026: 18 of 126 staff present'
    );
    const date = page.getByLabel('Attendance date', { exact: true });
    await date.focus();
    await expect(date).toBeFocused();
    await noOverflow(page);
  });
});
