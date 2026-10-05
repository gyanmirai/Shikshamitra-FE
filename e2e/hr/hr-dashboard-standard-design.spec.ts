/* eslint-disable import/no-extraneous-dependencies, no-await-in-loop, no-restricted-syntax */
import { test, expect, type Page } from '@playwright/test';

const dashboardPermission = 'HR.Dashboard.View';
const modulePermission = 'ShikshaMitra.Module.HR';
const fullPermissions = [
  modulePermission,
  'ShikshaMitra.Module.HR.Dashboard',
  dashboardPermission,
  'HR.Employee.EmployeeList.View',
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
  } = {}
) {
  const permissions = options.permissions || fullPermissions;
  const has = (name: string) => permissions.includes(name);
  const population = options.empty
    ? []
    : options.normal
      ? allStaff.map((row, i) => ({ ...row, status: statuses[i % 5], reviewFlags: [] }))
      : allStaff;
  const scopedRows = (url: URL) =>
    population.filter(
      (row) =>
        (!url.searchParams.has('isTeaching') ||
          row.isTeaching === (url.searchParams.get('isTeaching') === 'true')) &&
        (!url.searchParams.get('educationMediumStageId') ||
          row.stages.some(
            (stage) => stage.id === url.searchParams.get('educationMediumStageId')
          )) &&
        (!url.searchParams.get('department') ||
          row.department === url.searchParams.get('department')) &&
        (!url.searchParams.get('shiftId') || url.searchParams.get('shiftId') === 'shift-1')
    );

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
    const rows = scopedRows(url);
    const summary = { ...counts(rows), date: url.searchParams.get('date') };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        date: url.searchParams.get('date'),
        generatedAt: '2026-10-02T10:00:00Z',
        scopeLabel: 'Staff in your assigned scope',
        capabilities: {
          canViewAttendance: has('HR.AttendanceAndLeave.Dashboard.View'),
          canViewStaff: has('HR.AttendanceAndLeave.AttendanceTracking.View'),
          canViewEmployees: has('HR.Employee.EmployeeList.View'),
          canMarkAttendance: has('HR.AttendanceAndLeave.MarkAttendance.Add'),
          canViewLeave: has('HR.LeaveManagement.LeaveCenter.View'),
          canViewPayroll: has('HR.PayrollManagement.Dashboard.View'),
          canOpenPayroll: has('HR.PayrollManagement.RunPayroll.View'),
        },
        attendanceState: has('HR.AttendanceAndLeave.Dashboard.View') ? 'Available' : 'Forbidden',
        workforceState: has('HR.Employee.EmployeeList.View') ? 'Available' : 'Forbidden',
        leaveState: has('HR.LeaveManagement.LeaveCenter.View') ? 'Available' : 'Forbidden',
        payrollState: has('HR.PayrollManagement.Dashboard.View') ? 'Available' : 'Forbidden',
        summary: has('HR.AttendanceAndLeave.Dashboard.View') ? summary : null,
        trend: has('HR.AttendanceAndLeave.Dashboard.View')
          ? Array.from({ length: 7 }, (_, i) => {
              const day = new Date(`${url.searchParams.get('date')}T00:00:00Z`);
              day.setUTCDate(day.getUTCDate() - 6 + i);
              return { ...summary, date: day.toISOString().slice(0, 10) };
            })
          : null,
        filters: {
          departments: ['Science', 'Administration'],
          stages: allStaff[0].stages,
          shifts: [{ id: 'shift-1', name: 'Morning' }],
        },
        attention: has('HR.AttendanceAndLeave.Dashboard.View')
          ? [
              {
                kind: options.attentionReview ? 'NeedsReview' : 'NotMarked',
                title: options.attentionReview
                  ? 'Attendance records need review'
                  : 'Staff attendance is not marked',
                count: options.attentionReview ? summary.needsReview : summary.notMarked,
                action: options.attentionReview ? 'Review' : 'NotMarked',
              },
            ]
          : [],
        payroll: has('HR.PayrollManagement.Dashboard.View')
          ? {
              month: '2026-10',
              savedStaffCount: 126,
              reviewedCount: 80,
              lockedCount: 20,
              pendingCount: 26,
              lastUpdatedAt: options.savedPayrollAt,
            }
          : null,
      }),
    });
  });
  await page.route('**/api/hr/dashboard/staff?**', async (route) => {
    const url = new URL(route.request().url());
    const search = (url.searchParams.get('search') || '').toLowerCase();
    const status = url.searchParams.get('status');
    const rows = scopedRows(url).filter(
      (row) =>
        (!status || (status === 'Review' ? row.reviewFlags.length > 0 : row.status === status)) &&
        (!search ||
          row.name.toLowerCase().includes(search) ||
          row.employeeCode.toLowerCase().includes(search))
    );
    const sorting = url.searchParams.get('sorting') || 'name';
    rows.sort((a, b) => {
      const key = sorting.startsWith('status') ? 'status' : 'name';
      const order = a[key].localeCompare(b[key]) || a.employeeId.localeCompare(b.employeeId);
      return sorting.endsWith('desc') ? -order : order;
    });
    const skip = Number(url.searchParams.get('skipCount') || 0);
    const size = Number(url.searchParams.get('maxResultCount') || 25);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        date: url.searchParams.get('date'),
        generatedAt: '2026-10-02T10:00:00Z',
        totalCount: rows.length,
        items: rows.slice(skip, skip + size),
      }),
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

test.describe('HR staff-first dashboard', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test('attention shortcut retains an already selected review status @critical', async ({
    page,
  }) => {
    await mockDashboard(page, { attentionReview: true });
    await page.goto('/hr/dashboard?date=2026-10-01&status=Review');
    const shortcut = page
      .getByRole('region', { name: 'Needs attention' })
      .getByRole('button', { name: /View staff|staff need review/ });
    await shortcut.click();
    await page.waitForTimeout(1000); // Allow the client-side URL replacement to settle.
    await expect(page).toHaveURL(/status=Review/);
    await shortcut.click();
    await expect(page).toHaveURL(/status=Review/);
    await expect(page.getByRole('heading', { name: 'Staff overview', exact: true })).toBeFocused();
    await expect(
      page.getByRole('region', { name: 'Staff overview' }).getByText(/18 matching staff/)
    ).toBeVisible();
  });
  test('saved payroll timestamp uses the IST calendar date @critical', async ({ page }) => {
    await mockDashboard(page, { savedPayrollAt: '2026-10-01T22:45:00Z' });
    await page.goto('/hr/dashboard?date=2026-10-01');
    await expect(
      page
        .getByRole('region', { name: 'Payroll cycle' })
        .getByText(/Saved 2 Oct 2026.*4:15 am.*IST/)
    ).toBeVisible();
  });
  test('drawer commits all filters, discards drafts, resets locally and restores focus', async ({
    page,
  }) => {
    await mockDashboard(page);
    await page.goto(
      '/hr/dashboard?date=2026-10-01&page=2&pageSize=50&sort=name+desc&trendView=counts'
    );
    const filters = page.getByRole('button', { name: /^Filters/ });
    const drawer = page.getByRole('dialog', { name: 'Staff filters' });
    await filters.click();
    await drawer.getByRole('combobox', { name: 'Department', exact: true }).click();
    await page.getByRole('option', { name: 'Science', exact: true }).click();
    await drawer.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(filters).toBeFocused();
    expect(new URL(page.url()).searchParams.has('department')).toBe(false);
    await filters.click();
    await expect(drawer.getByRole('combobox', { name: 'Department', exact: true })).toHaveText(
      'All departments'
    );
    for (const [label, selection] of [
      ['Staff group', 'Teaching'],
      ['Medium / stage', 'GSEB Gujarati Primary'],
      ['Department', 'Science'],
      ['Shift', 'Morning'],
    ]) {
      await drawer.getByRole('combobox', { name: label, exact: true }).click();
      await page.getByRole('option', { name: selection, exact: true }).click();
    }
    await drawer.getByRole('button', { name: 'Apply filters', exact: true }).click();
    await expect(page).toHaveURL(/shift=shift-1/);
    await expect(page.getByRole('button', { name: 'Filters, 4 applied' })).toBeVisible();
    expect(new URL(page.url()).searchParams.has('page')).toBe(false);
    await expect(
      page.getByRole('button', { name: 'Staff in scope: 84', exact: true })
    ).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Filters, 4 applied' })).toBeVisible();
    await filters.click();
    await drawer.getByRole('button', { name: 'Reset selections' }).click();
    await expect(drawer.getByRole('combobox', { name: 'Department', exact: true })).toHaveText(
      'All departments'
    );
    await drawer.press('Escape');
    await expect(filters).toBeFocused();
    await expect(page.getByRole('button', { name: 'Filters, 4 applied' })).toBeVisible();
    const chip = page.getByRole('button', { name: 'Remove Department: Science', exact: true });
    await chip.focus();
    await chip.press('Delete');
    await expect(page.getByRole('button', { name: 'Filters, 3 applied' })).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Staff in scope: 126', exact: true })
    ).toBeVisible();
    const url = new URL(page.url());
    expect(url.searchParams.get('date')).toBe('2026-10-01');
    expect(url.searchParams.get('sort')).toBe('name desc');
    expect(url.searchParams.get('pageSize')).toBe('50');
    expect(url.searchParams.get('trendView')).toBe('counts');
  });

  test('flags unavailable selections and never silently widens staff scope', async ({ page }) => {
    await mockDashboard(page);
    const unavailableStage = 'd9d90810-7214-4489-87e4-60c9ae9b8b70';
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/hr/dashboard?date=2026-10-01&stage=${unavailableStage}`);
    await expect(
      page.getByRole('button', { name: `Remove Medium / stage: Unavailable: ${unavailableStage}` })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Staff in scope: 0', exact: true })
    ).toBeVisible();
    await page.getByRole('button', { name: /^Filters/ }).click();
    const drawer = page.getByRole('dialog', { name: 'Staff filters' });
    await expect(drawer.getByRole('combobox', { name: 'Medium / stage', exact: true })).toHaveText(
      `Unavailable: ${unavailableStage}`
    );
    await expect.poll(async () => Math.round((await drawer.boundingBox())!.x)).toBe(0);
    expect(Math.round((await drawer.boundingBox())!.width)).toBe(390);
    await page.screenshot({ path: '.artifacts/hr-dashboard-review/unavailable-filter-390.png' });
    await drawer.getByRole('button', { name: 'Apply filters' }).click();
    await expect(page).toHaveURL(new RegExp(`stage=${unavailableStage}`));
    await expect(
      page.getByRole('button', { name: 'Staff in scope: 0', exact: true })
    ).toBeVisible();
  });

  test('date shortcuts preserve selections and chart counts use the whole overview', async ({
    page,
  }) => {
    await mockDashboard(page);
    await page.goto(
      '/hr/dashboard?date=2026-10-01&page=2&pageSize=25&sort=name+desc&search=Staff&status=Present'
    );
    await page.getByRole('button', { name: 'Previous day', exact: true }).click();
    await expect(page).toHaveURL(/date=2026-09-30/);
    let url = new URL(page.url());
    expect(url.searchParams.has('page')).toBe(false);
    expect(url.searchParams.get('search')).toBe('Staff');
    expect(url.searchParams.get('status')).toBe('Present');
    const trend = page.getByRole('region', { name: 'Seven-day staff attendance' });
    await expect(
      trend.getByRole('button', { name: /View 30 Sept 2026:.*126 total staff/ })
    ).toHaveAttribute('aria-pressed', 'true');
    await trend.getByRole('button', { name: /View .*126 total staff/ }).first().press('Tab');
    await expect(page.getByRole('tooltip')).toContainText('126 total staff');
    await trend.getByRole('button', { name: 'Counts', exact: true }).click();
    await expect(page).toHaveURL(/trendView=counts/);
    const table = trend.getByRole('table', { name: 'Seven-day attendance counts', exact: true });
    await expect(table.getByRole('columnheader')).toHaveCount(9);
    await expect(table.getByRole('row')).toHaveCount(8);
    const selected = table
      .getByRole('row')
      .filter({ has: page.getByRole('button', { name: 'View 30 Sept 2026', exact: true }) });
    expect(await selected.getByRole('cell').allTextContents()).toEqual([
      '18',
      '18',
      '18',
      '18',
      '18',
      '18',
      '18',
      '126',
    ]);
    await page.reload();
    await expect(table).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.getByRole('button', { name: 'Today', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Today', exact: true })).toBeDisabled();
    url = new URL(page.url());
    expect(url.searchParams.get('search')).toBe('Staff');
    expect(url.searchParams.get('sort')).toBe('name desc');
    expect(url.searchParams.get('trendView')).toBe('counts');
  });

  test('assigned stages prioritize the selected stage and expand without new reads', async ({
    page,
  }) => {
    await mockDashboard(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/hr/dashboard?date=2026-10-01&stage=stage-3');
    const row = page
      .getByRole('row')
      .filter({ hasText: 'Asha Nayanben Patel with a sufficiently long staff name' });
    await expect(row.getByText('GSEB Gujarati Secondary', { exact: true })).toBeVisible();
    const stages = row.getByRole('button', { name: /Show 2 more stages for Asha/ });
    await stages.click();
    await expect(page.getByText('Assigned stages', { exact: true })).toBeVisible();
    await expect(
      page.getByText('CBSE English Higher Secondary with a long assignment name', { exact: true })
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(stages).toBeFocused();
    await row.getByRole('button', { name: /Attendance details for Asha/ }).click();
    await expect(row.getByText('Source: Manual')).toBeVisible();
    await expect(row.getByText(/In: Not recorded/)).toBeVisible();
  });

  test('mobile starts with a visible staff name and status and supports keyboard sorting @accessibility', async ({
    page,
  }) => {
    await mockDashboard(page, { normal: true });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/hr/dashboard?date=2026-10-01');
    const region = page.getByRole('region', { name: 'Staff overview' });
    const details = region.getByRole('button', { name: /Staff details for Asha/ });
    await expect(details).toBeVisible();
    const box = await details.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeLessThanOrEqual(844);
    await expect(details.getByText('Present', { exact: true })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Needs attention' })).toHaveCount(0);
    await page.screenshot({ path: '.artifacts/hr-dashboard-review/mobile-initial-390.png' });
    await region.getByRole('button', { name: /^Sort staff:/ }).click();
    await page.getByRole('menuitem', { name: 'Name Z to A', exact: true }).press('Enter');
    await expect(page).toHaveURL(/sort=name\+desc/);
    await page.getByRole('button', { name: /^Filters/ }).click();
    const drawer = page.getByRole('dialog', { name: 'Staff filters' });
    expect(Math.round((await drawer.boundingBox())!.width)).toBe(390);
    await drawer.press('Escape');
    await expect(page.getByRole('button', { name: /^Filters/ })).toBeFocused();
    await expectNoHorizontalOverflow(page);
  });
  test('prioritizes staff across responsive layouts and themes @visual @accessibility', async ({
    page,
  }) => {
    await mockDashboard(page);
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/hr/dashboard?date=2026-10-01');
      await expect(page.getByRole('heading', { level: 1, name: 'HR Dashboard' })).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Staff in scope: 126', exact: true })
      ).toBeVisible();
      const region = page.getByRole('region', { name: 'Staff overview' });
      await expect(
        region
          .getByText('Asha Nayanben Patel with a sufficiently long staff name', { exact: true })
          .filter({ visible: true })
      ).toBeVisible();
      await expectNoHorizontalOverflow(page);
      if (viewport.width < 900) {
        await region
          .getByRole('button', {
            name: 'Staff details for Asha Nayanben Patel with a sufficiently long staff name',
          })
          .click();
        await expect(region.getByRole('link', { name: /View attendance for Asha/ })).toBeVisible();
      }
      await page.screenshot({
        path: `.artifacts/hr-dashboard-review/current-${viewport.width}.png`,
        fullPage: true,
      });
      await page.getByRole('region', { name: 'Payroll cycle' }).scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `.artifacts/hr-dashboard-review/secondary-${viewport.width}.png`,
      });
    }
    await page.getByRole('button', { name: 'settings', exact: true }).click();
    await page.getByRole('button', { name: /Dark mode/ }).click();
    await page.keyboard.press('Escape');
    await expect(page.locator('html')).toHaveAttribute('data-mui-color-scheme', 'dark');
    await page.screenshot({
      path: '.artifacts/hr-dashboard-review/current-dark.png',
      fullPage: true,
    });
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await page.getByRole('heading', { name: 'HR Dashboard', level: 1 }).scrollIntoViewIfNeeded();
      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: `.artifacts/hr-dashboard-review/current-dark-${viewport.width}.png`,
        fullPage: true,
      });
      await page.getByRole('region', { name: 'Payroll cycle' }).scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `.artifacts/hr-dashboard-review/secondary-dark-${viewport.width}.png`,
      });
    }
  });

  test('pages beyond 100 staff and preserves server pagination on reload', async ({ page }) => {
    await mockDashboard(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/hr/dashboard?date=2026-10-01&page=6');
    const region = page.getByRole('region', { name: 'Staff overview' });
    await expect(region.getByText('126 matching staff', { exact: false })).toBeVisible();
    await expect(
      region.getByText('Staff Member 125', { exact: true }).filter({ visible: true })
    ).toBeVisible();
    await expect(region.getByText(/126–126 of 126/).filter({ visible: true })).toBeVisible();
    await region
      .getByRole('button', { name: 'Go to previous page' })
      .filter({ visible: true })
      .click();
    await expect(page).toHaveURL(/page=5/);
    await page.reload();
    await expect(region.getByText(/101–125 of 126/).filter({ visible: true })).toBeVisible();
  });

  test('drops displayed records when dashboard read access is revoked', async ({ page }) => {
    await mockDashboard(page);
    await page.goto('/hr/dashboard?date=2026-10-01');
    await expect(
      page.getByRole('button', { name: 'Staff in scope: 126', exact: true })
    ).toBeVisible();
    await page.route('**/api/hr/dashboard/overview?**', (route) =>
      route.fulfill({ status: 403, contentType: 'application/json', body: '{}' })
    );
    await page.getByRole('button', { name: 'Refresh HR dashboard' }).click();
    await expect(
      page.getByText('Dashboard access has changed. Reload to update your access.')
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Staff in scope: 126', exact: true })
    ).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Staff overview' })).toHaveCount(0);
  });

  test('filters staff and preserves URL state using read-only refresh @critical', async ({
    page,
  }) => {
    await mockDashboard(page);
    const writes: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/hr/dashboard/') && request.method() !== 'GET')
        writes.push(request.method());
    });
    await page.goto('/hr/dashboard?date=2026-10-01');
    await page.getByRole('button', { name: 'Absent: 18', exact: true }).click();
    await expect(page).toHaveURL(/status=Absent/);
    const region = page.getByRole('region', { name: 'Staff overview' });
    await expect(region.getByText(/18 matching staff/)).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Absent: 18', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await page.getByRole('button', { name: 'Refresh HR dashboard' }).click();
    await expect(page.getByRole('button', { name: 'Refresh HR dashboard' })).toBeEnabled();
    expect(writes).toEqual([]);
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await region.getByRole('textbox', { name: 'Search staff name or code' }).fill('EMP-001');
    await expect(region.getByText(/1 matching staff/)).toBeVisible();
    await expect(region.getByRole('link', { name: /View attendance for Asha/ })).toHaveAttribute(
      'href',
      /employeeId=.+startDate=2026-10-01&endDate=2026-10-01/
    );
  });

  test('hides unauthorized data even for an admin role @permission', async ({ page }) => {
    await mockDashboard(page, {
      permissions: [modulePermission, 'ShikshaMitra.Module.HR.Dashboard', dashboardPermission],
    });
    await page.goto('/hr/dashboard?date=2026-10-01');
    await expect(
      page.getByText('Attendance summary is not included in your current access.')
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Staff in scope: 126', exact: true })
    ).toHaveCount(0);
    await expect(
      page.getByText('Staff attendance details require Attendance Tracking access.')
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Mark attendance', exact: true })).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Payroll cycle' })).toHaveCount(0);
  });

  test('denies an admin without dashboard read permission @permission', async ({ page }) => {
    await mockDashboard(page, {
      permissions: [modulePermission, 'ShikshaMitra.Module.HR.Dashboard'],
    });
    await page.goto('/hr/dashboard?date=2026-10-01');
    await expect(page.getByText('Your account does not have HR dashboard access.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Refresh HR dashboard' })).toHaveCount(0);
  });

  test('shows explicit read failure and keeps the header @critical', async ({ page }) => {
    await mockDashboard(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route('**/api/hr/dashboard/overview?**', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' })
    );
    await page.goto('/hr/dashboard?date=2026-10-01');
    await expect(page.getByText('The dashboard could not be loaded.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'HR Dashboard', level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Staff in scope:/ })).toHaveCount(0);
    await expect(page.getByText('Unavailable', { exact: true })).toHaveCount(6);
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: '.artifacts/hr-dashboard-review/mobile-unavailable-390.png' });
  });

  test('retains timestamped stale data after a failed keyboard refresh', async ({ page }) => {
    await mockDashboard(page);
    await page.goto('/hr/dashboard?date=2026-10-01');
    await expect(
      page.getByRole('button', { name: 'Staff in scope: 126', exact: true })
    ).toBeVisible();
    await page.route('**/api/hr/dashboard/overview?**', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' })
    );
    const refresh = page.getByRole('button', { name: 'Refresh HR dashboard' });
    await refresh.focus();
    await expect(refresh).toBeFocused();
    await refresh.press('Enter');
    await expect(
      page.getByText('The dashboard could not refresh. Displayed data may be stale.')
    ).toBeVisible();
    await expect(page.getByText(/Stale data · Updated/)).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Staff in scope: 126', exact: true })
    ).toBeVisible();
  });

  test('shows a real empty staff population', async ({ page }) => {
    await mockDashboard(page, { empty: true });
    await page.goto('/hr/dashboard?date=2026-10-01');
    await expect(
      page.getByRole('button', { name: 'Staff in scope: 0', exact: true })
    ).toBeVisible();
    await expect(page.getByText('No staff match these filters.').first()).toBeVisible();
  });
});
