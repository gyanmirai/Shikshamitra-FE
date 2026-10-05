/* eslint-disable import/no-extraneous-dependencies, no-await-in-loop, no-restricted-syntax */
import { test, expect, type Page } from '@playwright/test';

const dashboardPermission = 'ShikshaMitra.Module.HR.Dashboard';
const modulePermission = 'ShikshaMitra.Module.HR';

const fullPermissions = [
  modulePermission,
  dashboardPermission,
  'HR.Employee.EmployeeList',
  'HR.Employee.EmployeeOnboarding',
  'HR.AttendanceAndLeave.Dashboard',
  'HR.LeaveManagement.LeaveCenter',
  'HR.PayrollManagement.RunPayroll',
  'HR.PayrollManagement.PayrollStructure',
  'ShikshaMitra.Module.HR.Reports',
];

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

const summary = {
  date: '2026-08-23',
  month: '2026-08',
  range: 7,
  workforce: {
    totalActiveStaff: 126,
    teachingStaff: 82,
    nonTeachingStaff: 44,
    newJoinersThisMonth: 2,
    inactiveStaff: 5,
    recentEmployees: [
      {
        id: 'employee-1',
        name: 'Asha Patel',
        employeeIdentifier: 'EMP-001',
        roleName: 'Teacher',
        department: 'Science',
        isTeaching: true,
        dateOfJoining: '2026-08-11',
      },
    ],
    newJoiners: [
      {
        id: 'employee-2',
        name: 'Ravi Shah',
        employeeIdentifier: 'EMP-002',
        roleName: 'Accountant',
        department: 'Finance',
        isTeaching: false,
        dateOfJoining: '2026-08-18',
      },
    ],
  },
  attendanceToday: {
    present: 116,
    absent: 4,
    halfDay: 2,
    missingAttendance: 3,
    lateOrException: 1,
    attendanceRate: 92.1,
  },
  attendanceTrend: [
    { date: '2026-08-17', present: 112, absent: 7, leave: 4 },
    { date: '2026-08-18', present: 114, absent: 5, leave: 4 },
    { date: '2026-08-19', present: 115, absent: 4, leave: 4 },
    { date: '2026-08-20', present: 113, absent: 6, leave: 4 },
    { date: '2026-08-21', present: 116, absent: 4, leave: 3 },
    { date: '2026-08-22', present: 114, absent: 6, leave: 4 },
    { date: '2026-08-23', present: 116, absent: 4, leave: 3 },
  ],
  leave: {
    pending: 1,
    approved: 12,
    rejected: 2,
    leaveTypeSummary: [{ leaveType: 'Casual Leave', count: 1 }],
    recentPendingRequests: [
      {
        id: 'leave-1',
        publicId: 101,
        employeeId: 'employee-1',
        employeeName: 'Asha Patel',
        employeeIdentifier: 'EMP-001',
        paidType: 'Paid Leave',
        leaveType: 'Casual Leave',
        startDate: '2026-08-25',
        endDate: '2026-08-26',
        totalDays: 2,
        status: 'Pending',
        submittedAt: '2026-08-22T10:00:00+05:30',
      },
    ],
  },
  payroll: {
    month: 'August 2026',
    canPreview: true,
    canLock: false,
    employeeCount: 126,
    reviewedCount: 88,
    lockedCount: 10,
    pendingCount: 28,
    missingAttendanceCount: 3,
    missingSalaryStructureCount: 2,
    policyConfigurationIssueCount: 1,
    blockingIssues: ['Three staff records have missing attendance.'],
    recommendedActions: ['Review pending staff payroll records.'],
  },
  celebrations: {
    today: [
      {
        employeeId: 'employee-1',
        employeeName: 'Asha Patel',
        employeeIdentifier: 'EMP-001',
        type: 'Birthday',
        date: '2026-08-23',
      },
    ],
    upcoming: [],
  },
  insights: [
    {
      severity: 'critical',
      title: 'Leave requests need review',
      summary: 'One recent leave request is waiting for a decision.',
      source: 'leave.pending',
      actionLabel: 'Review Leave',
      actionHref: '/hr/leave-approvals',
    },
  ],
};

const preview = (status: string, payload: unknown, overrides: Record<string, unknown> = {}) => ({
  dashboardKey: 'Main',
  scopeKey: 'tenant',
  status,
  payloadJson: JSON.stringify(payload),
  payloadVersion: 1,
  isStale: false,
  lastRefreshedAt: '2026-08-23T09:30:00+05:30',
  lastSuccessfulRefreshAt: '2026-08-23T09:30:00+05:30',
  nextScheduledRefreshAt: '2026-08-24T07:00:00+05:30',
  ...overrides,
});

async function mockDashboard(
  page: Page,
  options: { permissions?: string[]; dashboardPreview?: ReturnType<typeof preview> } = {}
) {
  const permissions = options.permissions || fullPermissions;
  const dashboardPreview = options.dashboardPreview || preview('Ready', summary);

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

  await page.route('**/api/hr/dashboard/previews/Main', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(dashboardPreview),
    });
  });
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
      )
    )
    .toBe(true);
}

test.describe('HR dashboard standard design', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('renders populated data responsively in light and dark themes @visual @accessibility', async ({
    page,
  }) => {
    await mockDashboard(page);

    for (const viewport of [
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/hr/dashboard', { waitUntil: 'domcontentloaded' });
      const dashboard = page.getByTestId('hr-dashboard-shell');
      const heading = dashboard.getByRole('heading', { level: 1, name: 'HR Dashboard' });
      const breadcrumbs = dashboard.getByRole('navigation');

      await expect(page.getByRole('heading', { level: 1, name: 'HR Dashboard' })).toBeVisible();
      await expect(page.getByRole('heading', { level: 2, name: 'Action Center' })).toBeVisible();
      await expect(page.getByRole('heading', { level: 2, name: 'People Updates' })).toBeVisible();
      await expect(dashboard.locator('[data-layout="inline"]')).toBeVisible();
      await expect(dashboard.getByRole('link', { name: 'HR/Staff' })).toHaveAttribute(
        'href',
        /\/hr\/dashboard\/?$/
      );
      await expect(breadcrumbs.getByText('HR Dashboard')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Active Staff: 126' })).toHaveAttribute(
        'href',
        /\/hr\/staff\/?$/
      );
      await expect(dashboard.getByRole('link', { name: 'Onboard Staff' })).toHaveCount(0);
      await expect(dashboard.getByRole('link', { name: 'Reports' })).toHaveCount(0);
      await expect(dashboard.getByRole('separator')).toHaveCount(0);
      await expect(dashboard.getByText("7-day trend and today's attendance status")).toBeVisible();

      const metricPositions = await dashboard
        .locator('[data-testid^="summary-metric-"]')
        .evaluateAll((elements) =>
          elements.map((element) => {
            const bounds = element.getBoundingClientRect();
            return { x: bounds.x, y: bounds.y };
          })
        );
      expect(metricPositions).toHaveLength(4);
      if (viewport.width < 900) {
        expect(Math.abs(metricPositions[0].y - metricPositions[1].y)).toBeLessThan(2);
        expect(metricPositions[2].y).toBeGreaterThan(metricPositions[0].y);
        expect(Math.abs(metricPositions[2].y - metricPositions[3].y)).toBeLessThan(2);
      } else {
        expect(
          Math.max(...metricPositions.map(({ y }) => y)) -
            Math.min(...metricPositions.map(({ y }) => y))
        ).toBeLessThan(2);
      }
      await expectNoHorizontalOverflow(page);
    }

    await page.getByRole('button', { name: 'settings' }).click();
    await page.getByRole('button', { name: /Dark mode/i }).click();
    await expect(page.locator('html')).toHaveAttribute('data-mui-color-scheme', 'dark');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { level: 1, name: 'HR Dashboard' })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    const controls = page
      .getByTestId('hr-dashboard-shell')
      .locator('button:visible, a:visible')
      .filter({ hasNot: page.locator('[aria-hidden="true"]') });
    const targetSizes = await controls.evaluateAll((elements) =>
      elements
        .filter((element) => !element.closest('[role="img"]'))
        .map((element) => {
          const bounds = element.getBoundingClientRect();
          return { name: element.textContent?.trim(), width: bounds.width, height: bounds.height };
        })
    );
    const undersizedTargets = targetSizes.filter(
      (target) => target.width < 44 || target.height < 44
    );
    expect(undersizedTargets, JSON.stringify(undersizedTargets)).toEqual([]);
  });

  test('shows the empty snapshot without replacing the page header', async ({ page }) => {
    await mockDashboard(page, { dashboardPreview: preview('Empty', {}) });
    await page.goto('/hr/dashboard', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1, name: 'HR Dashboard' })).toBeVisible();
    await expect(page.getByText(/Preparing first HR dashboard snapshot/i)).toBeVisible();
    await expect(page.getByText(/first saved HR dashboard snapshot/i)).toBeVisible();
  });

  test('keeps critical leave actions behind explicit confirmation @critical', async ({ page }) => {
    await mockDashboard(page);
    await page.goto('/hr/dashboard', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Leave requests need review')).toBeVisible();
    await page.getByRole('button', { name: 'Reject leave for Asha Patel' }).click();
    const dialog = page.getByRole('dialog', { name: 'Reject Leave Request' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Reject' }).click();
    await expect(
      dialog.getByText('Remarks are required to reject the leave request.')
    ).toBeVisible();
  });

  test('keeps metrics readable and removes unauthorized actions @permission', async ({ page }) => {
    await mockDashboard(page, { permissions: [modulePermission, dashboardPermission] });
    await page.goto('/hr/dashboard', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Active Staff', { exact: true })).toBeVisible();
    await expect(page.getByText('126').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Active Staff: 126' })).toHaveCount(0);
    const dashboard = page.getByTestId('hr-dashboard-shell');
    await expect(dashboard.getByRole('link', { name: 'Onboard Staff' })).toHaveCount(0);
    await expect(dashboard.getByRole('link', { name: 'Reports' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Approve leave for/i })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Run Payroll' })).toHaveCount(0);
  });
});
