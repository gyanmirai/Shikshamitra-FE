/* eslint-disable import/no-extraneous-dependencies */
import { test, expect, type Page, type Route } from '@playwright/test';

const academicYear = {
  id: 'year-manual-attendance-e2e',
  name: '2026-27',
  startDate: '2026-06-01T00:00:00Z',
  endDate: '2027-05-31T23:59:59Z',
};

const authEmployee = {
  id: 'employee-manual-attendance-auth',
  fullName: 'Manual Attendance HR User',
  employeeCode: 'EMP-MA-AUTH',
  status: 0,
  employeeStatusType: 0,
};

const grantedPermissions = [
  'ShikshaMitra.Module.HR',
  'ShikshaMitra.Module.HR.AttendanceManagement',
  'HR.AttendanceAndLeave.MarkAttendance',
];

const dayResponse = {
  totalCount: 3,
  date: '2026-06-10',
  isDayLocked: false,
  isHoliday: false,
  captureMode: 'integrated',
  items: [
    {
      employeeId: 'employee-present',
      fullName: 'Present Employee',
      employeeCode: 'EMP-PRESENT',
      department: 'HR',
      dateIso: '2026-06-10T00:00:00Z',
      inTime: null,
      outTime: null,
      shiftStartTime: '09:00:00',
      shiftEndTime: '17:00:00',
      captureMode: 'manual_with_time',
      status: 0,
      warnings: [],
      errors: [],
    },
    {
      employeeId: 'employee-half-day',
      fullName: 'Half Day Employee',
      employeeCode: 'EMP-HALF',
      department: 'HR',
      dateIso: '2026-06-10T00:00:00Z',
      inTime: null,
      outTime: null,
      shiftStartTime: '08:30:00',
      shiftEndTime: '16:30:00',
      captureMode: 'integrated',
      status: 0,
      warnings: [],
      errors: [],
    },
    {
      employeeId: 'employee-absent',
      fullName: 'Absent Employee',
      employeeCode: 'EMP-ABSENT',
      department: 'HR',
      dateIso: '2026-06-10T00:00:00Z',
      inTime: null,
      outTime: null,
      shiftStartTime: '10:00:00',
      shiftEndTime: '18:00:00',
      captureMode: 'manual_with_time',
      status: 0,
      warnings: [],
      errors: [],
    },
  ],
};

const invalidShiftDayResponse = {
  ...dayResponse,
  totalCount: 1,
  items: [
    {
      employeeId: 'employee-invalid-shift',
      fullName: 'Invalid Shift Employee',
      employeeCode: 'EMP-BAD-SHIFT',
      department: 'HR',
      dateIso: '2026-06-10T00:00:00Z',
      inTime: null,
      outTime: null,
      shiftStartTime: '25:00:00',
      shiftEndTime: '26:00:00',
      captureMode: 'manual_with_time',
      status: 0,
      warnings: [],
      errors: [],
    },
  ],
};

const manualLateTimeDayResponse = {
  ...dayResponse,
  totalCount: 1,
  items: [
    {
      employeeId: 'employee-late-manual',
      fullName: 'Late Manual Employee',
      employeeCode: 'EMP-LATE',
      department: 'HR',
      dateIso: '2026-06-10T00:00:00Z',
      inTime: '2026-06-10T08:00:00Z',
      outTime: '2026-06-10T15:30:00Z',
      shiftStartTime: '07:00:00',
      shiftEndTime: '15:00:00',
      captureMode: 'manual_with_time',
      status: 0,
      warnings: [],
      errors: [],
    },
  ],
};

const approvedLeaveDayResponse = {
  ...dayResponse,
  totalCount: 1,
  items: [
    {
      employeeId: 'employee-approved-leave',
      fullName: 'Approved Leave Employee',
      employeeCode: 'EMP-LEAVE',
      department: 'HR',
      dateIso: '2026-06-10T00:00:00Z',
      inTime: null,
      outTime: null,
      shiftStartTime: '09:00:00',
      shiftEndTime: '17:00:00',
      captureMode: 'manual_with_time',
      status: 4,
      isApprovedLeave: true,
      approvedLeaveId: 'leave-1',
      approvedLeaveKind: 'FullDay',
      approvedLeaveLabel: 'On Leave',
      warnings: [],
      errors: [],
    },
  ],
};

async function fulfillJson(route: Route, json: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(json),
  });
}

async function seedAuthenticatedHrState(page: Page) {
  await page.addInitScript(
    ({ year, employee, permissions }) => {
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
              sub: 'manual-attendance-user-e2e',
              name: 'Manual Attendance HR User',
              role: 'hr-manager',
            },
            isAuthenticated: true,
            loading: false,
            permissionsInitialized: true,
            employee,
            permissions,
            mainModuleVisibility: [false, false, false, false, true],
          }),
          _persist: JSON.stringify({ version: -1, rehydrated: true }),
        })
      );
      window.localStorage.setItem('onboarding_completed', 'true');
    },
    {
      year: academicYear,
      employee: authEmployee,
      permissions: grantedPermissions.map((name) => ({ name, isGranted: true })),
    }
  );
}

async function installAuthRoutes(page: Page) {
  await page.route('**/api/auth/session**', (route) =>
    fulfillJson(route, {
      accessToken: 'manual-attendance-token-e2e',
      expires: '2099-01-01T00:00:00.000Z',
      profile: {
        sub: 'manual-attendance-user-e2e',
        name: 'Manual Attendance HR User',
        role: 'hr-manager',
      },
    })
  );
  await page.route('**/api/employees/me**', (route) => fulfillJson(route, authEmployee));
  await page.route('**/api/app/academic-year?**', (route) =>
    fulfillJson(route, { items: [academicYear], totalCount: 1 })
  );
  await page.route('**/api/app/education-board**', (route) =>
    fulfillJson(route, { items: [], totalCount: 0 })
  );
  await page.route('**/api/app/academic-organization-options**', (route) =>
    fulfillJson(route, { items: [], totalCount: 0 })
  );
  await page.route('**/api/app/user-scope/user-scope-hierarchy**', (route) =>
    fulfillJson(route, { isAdmin: true, accessibleHierarchy: [] })
  );
  await page.route('**/permission-management/permissions?**', (route) =>
    fulfillJson(route, {
      groups: [
        {
          name: 'HR E2E',
          permissions: grantedPermissions.map((name) => ({ name, isGranted: true })),
        },
      ],
    })
  );
}

test.describe('HR manual attendance shift time automation', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthenticatedHrState(page);
    await installAuthRoutes(page);
  });

  test('fills shift-derived times when marking manual attendance before save', async ({ page }) => {
    let savedPayload: any = null;

    await page.route('**/api/hr/attendance/take-attendance/day/save', async (route) => {
      savedPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        json: { upsertedCount: savedPayload?.entries?.length ?? 0 },
      });
    });

    await page.route('**/api/hr/attendance/take-attendance/day?**', async (route) => {
      await route.fulfill({ status: 200, json: dayResponse });
    });

    await page.goto('/hr/manual-attendance', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Mark Attendance/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Apply Shift Time/i })).toHaveCount(0);
    await expect(page.getByText('Present Employee')).toBeVisible();

    await page.getByTestId('manual-attendance-employee-present-present').click();
    await page.getByTestId('manual-attendance-employee-half-day-half-day').click();
    await page.getByTestId('manual-attendance-employee-absent-absent').click();

    await expect(page.getByText('09:00')).toBeVisible();
    await expect(page.getByText('17:00')).toBeVisible();
    await expect(page.getByText('08:30')).toBeVisible();
    await expect(page.getByText('12:30')).toBeVisible();
    await expect(page.getByText('00:00').first()).toBeVisible();

    await page.getByRole('button', { name: /^Save$/i }).click();

    await expect.poll(() => savedPayload).toBeTruthy();
    expect(savedPayload.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          employeeId: 'employee-present',
          statusWire: 'PRESENT',
          inTime: '09:00:00',
          outTime: '17:00:00',
        }),
        expect.objectContaining({
          employeeId: 'employee-half-day',
          statusWire: 'HALF_DAY',
          inTime: '08:30:00',
          outTime: '12:30:00',
        }),
        expect.objectContaining({
          employeeId: 'employee-absent',
          statusWire: 'ABSENT',
          inTime: '00:00:00',
          outTime: '00:00:00',
        }),
      ])
    );
    await expect(
      page.getByText('Shift start and end time are required for Present or Half Day')
    ).toHaveCount(0);
  });

  test('clears shift-derived times when a row is moved back to pending', async ({ page }) => {
    await page.route('**/api/hr/attendance/take-attendance/day?**', async (route) => {
      await route.fulfill({ status: 200, json: dayResponse });
    });

    await page.goto('/hr/manual-attendance', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Present Employee')).toBeVisible();

    await page.getByTestId('manual-attendance-employee-present-present').click();
    await expect(page.getByText('09:00')).toBeVisible();
    await expect(page.getByText('17:00')).toBeVisible();

    await page.getByTestId('manual-attendance-employee-present-pending').click();
    await expect(page.getByText('09:00')).toHaveCount(0);
    await expect(page.getByText('17:00')).toHaveCount(0);
  });

  test('preserves manually entered late times when marking a row present', async ({ page }) => {
    let savedPayload: any = null;

    await page.route('**/api/hr/attendance/take-attendance/day/save', async (route) => {
      savedPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        json: { upsertedCount: savedPayload?.entries?.length ?? 0 },
      });
    });

    await page.route('**/api/hr/attendance/take-attendance/day?**', async (route) => {
      await route.fulfill({ status: 200, json: manualLateTimeDayResponse });
    });

    await page.goto('/hr/manual-attendance', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Late Manual Employee')).toBeVisible();

    await page.getByTestId('manual-attendance-employee-late-manual-present').click();
    await page.getByRole('button', { name: /^Save$/i }).click();

    await expect.poll(() => savedPayload).toBeTruthy();
    expect(savedPayload.entries).toEqual([
      expect.objectContaining({
        employeeId: 'employee-late-manual',
        statusWire: 'PRESENT',
        inTime: '08:00:00',
        outTime: '15:30:00',
      }),
    ]);
  });

  test('keeps approved leave rows locked and out of save payloads', async ({ page }) => {
    let saveCalled = false;

    await page.route('**/api/hr/attendance/take-attendance/day/save', async (route) => {
      saveCalled = true;
      await route.fulfill({ status: 200, json: { upsertedCount: 0 } });
    });

    await page.route('**/api/hr/attendance/take-attendance/day?**', async (route) => {
      await route.fulfill({ status: 200, json: approvedLeaveDayResponse });
    });

    await page.goto('/hr/manual-attendance', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Approved Leave Employee')).toBeVisible();

    await expect(
      page.getByTestId('manual-attendance-employee-approved-leave-present')
    ).toBeDisabled();
    await expect(
      page.getByTestId('manual-attendance-employee-approved-leave-absent')
    ).toBeDisabled();

    await expect(page.getByRole('button', { name: /^Save$/i })).toBeDisabled();
    expect(saveCalled).toBe(false);
  });

  test('fills full shift times when marking all rows present', async ({ page }) => {
    let savedPayload: any = null;

    await page.route('**/api/hr/attendance/take-attendance/day/save', async (route) => {
      savedPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        json: { upsertedCount: savedPayload?.entries?.length ?? 0 },
      });
    });

    await page.route('**/api/hr/attendance/take-attendance/day?**', async (route) => {
      await route.fulfill({ status: 200, json: dayResponse });
    });

    await page.goto('/hr/manual-attendance', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Present Employee')).toBeVisible();

    await page.getByTestId('manual-attendance-mark-all-present').click();

    await expect(page.getByText('09:00')).toBeVisible();
    await expect(page.getByText('17:00')).toBeVisible();
    await expect(page.getByText('08:30')).toBeVisible();
    await expect(page.getByText('16:30')).toBeVisible();
    await expect(page.getByText('10:00')).toBeVisible();
    await expect(page.getByText('18:00')).toBeVisible();

    await page.getByRole('button', { name: /^Save$/i }).click();

    await expect.poll(() => savedPayload).toBeTruthy();
    expect(savedPayload.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          employeeId: 'employee-present',
          statusWire: 'PRESENT',
          inTime: '09:00:00',
          outTime: '17:00:00',
        }),
        expect.objectContaining({
          employeeId: 'employee-half-day',
          statusWire: 'PRESENT',
          inTime: '08:30:00',
          outTime: '16:30:00',
        }),
        expect.objectContaining({
          employeeId: 'employee-absent',
          statusWire: 'PRESENT',
          inTime: '10:00:00',
          outTime: '18:00:00',
        }),
      ])
    );
  });

  test('blocks save when present is selected for an invalid shift clock value', async ({
    page,
  }) => {
    let saveCalled = false;

    await page.route('**/api/hr/attendance/take-attendance/day/save', async (route) => {
      saveCalled = true;
      await route.fulfill({ status: 200, json: { upsertedCount: 1 } });
    });

    await page.route('**/api/hr/attendance/take-attendance/day?**', async (route) => {
      await route.fulfill({ status: 200, json: invalidShiftDayResponse });
    });

    await page.goto('/hr/manual-attendance', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Invalid Shift Employee')).toBeVisible();

    await page.getByTestId('manual-attendance-employee-invalid-shift-present').click();
    await expect(page.getByText('25:00')).toHaveCount(0);
    await expect(page.getByText('26:00')).toHaveCount(0);

    await page.getByRole('button', { name: /^Save$/i }).click();
    await expect(
      page.getByText('Shift start and end time are required for Present or Half Day')
    ).toBeVisible();
    expect(saveCalled).toBe(false);
  });
});
