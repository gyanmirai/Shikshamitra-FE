/* eslint-disable import/no-extraneous-dependencies */
import { test, expect, type Page } from '@playwright/test';

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

const approvedLeaveDayResponse = {
  ...dayResponse,
  totalCount: 1,
  items: [
    {
      employeeId: 'employee-on-leave',
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
      source: 'approved_leave',
      warnings: [],
      errors: [],
    },
  ],
};

async function gotoManualAttendance(page: Page) {
  await page.goto('/hr/manual-attendance', { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await expect(page.getByRole('heading', { name: /Mark Attendance/i })).toBeVisible({
    timeout: 120_000,
  });
}

test.describe('HR manual attendance shift time automation', () => {
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
    await gotoManualAttendance(page);
    await expect(page.getByRole('button', { name: /Apply Shift Time/i })).toHaveCount(0);
    await expect(page.getByText('Present Employee')).toBeVisible({ timeout: 60_000 });

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

  test('restores an approved-leave row when Reset discards an unsaved override', async ({
    page,
  }) => {
    await page.route('**/api/hr/attendance/take-attendance/day?**', async (route) => {
      await route.fulfill({ status: 200, json: approvedLeaveDayResponse });
    });

    await gotoManualAttendance(page);
    await expect(page.getByText('Approved Leave Employee')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText('On Leave')).toBeVisible();

    await page.getByTestId('manual-attendance-employee-on-leave-present').click();
    await expect(page.getByText('No remarks needed')).toBeVisible();

    await page.getByRole('button', { name: /^Reset$/ }).click();
    await page.getByRole('button', { name: /Yes, Reset/i }).click();

    await expect(page.getByText('On Leave')).toBeVisible();
    await expect(page.getByText('No remarks needed')).toHaveCount(0);
  });

  test('preserves a manually edited half-day time across status toggles', async ({ page }) => {
    await page.route('**/api/hr/attendance/take-attendance/day?**', async (route) => {
      await route.fulfill({
        status: 200,
        json: { ...dayResponse, totalCount: 1, items: [dayResponse.items[0]] },
      });
    });

    await gotoManualAttendance(page);
    await expect(page.getByText('Present Employee')).toBeVisible({ timeout: 60_000 });

    await page.getByTestId('manual-attendance-employee-present-half-day').click();
    await page.getByTestId('manual-attendance-employee-present-timeOut-edit').click();
    await page.getByTestId('manual-attendance-employee-present-timeOut-input').fill('12:01');
    await page.getByTestId('manual-attendance-employee-present-timeOut-save').click();
    await expect(page.getByText('12:01')).toBeVisible();

    await page.getByTestId('manual-attendance-employee-present-present').click();
    await expect(page.getByText('17:00')).toBeVisible();
    await page.getByTestId('manual-attendance-employee-present-half-day').click();
    await expect(page.getByText('12:01')).toBeVisible();
  });

  test('clears shift-derived times when a row is moved back to pending', async ({ page }) => {
    await page.route('**/api/hr/attendance/take-attendance/day?**', async (route) => {
      await route.fulfill({ status: 200, json: dayResponse });
    });

    await gotoManualAttendance(page);
    await expect(page.getByText('Present Employee')).toBeVisible({ timeout: 60_000 });

    await page.getByTestId('manual-attendance-employee-present-present').click();
    await expect(page.getByText('09:00')).toBeVisible();
    await expect(page.getByText('17:00')).toBeVisible();

    await page.getByTestId('manual-attendance-employee-present-pending').click();
    await expect(page.getByText('09:00')).toHaveCount(0);
    await expect(page.getByText('17:00')).toHaveCount(0);
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

    await gotoManualAttendance(page);
    await expect(page.getByText('Present Employee')).toBeVisible({ timeout: 60_000 });

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

    await gotoManualAttendance(page);
    await expect(page.getByText('Invalid Shift Employee')).toBeVisible({ timeout: 60_000 });

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
