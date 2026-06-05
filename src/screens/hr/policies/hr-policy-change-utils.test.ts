import type {
  PayrollPolicy,
  AttendancePolicy,
  WorkCalendarPolicy,
} from 'src/redux/hr/hr-policy-api';

import { it, expect, describe } from 'vitest';

import {
  isPayrollPolicyUnchanged,
  filterPoliciesByArchiveView,
  isAttendancePolicyUnchanged,
  isWorkCalendarPolicyUnchanged,
} from './hr-policy-change-utils';

const baseCalendar: WorkCalendarPolicy = {
  id: 'calendar-1',
  academicYearId: 'year-1',
  name: 'Standard Calendar',
  status: 'active',
  effectiveFrom: '2026-04-01T00:00:00',
  effectiveTo: '2027-03-31T00:00:00',
  weeklyOffPattern: 'saturday_sunday',
  customWeeklyOffs: [6, 0],
  holidaySyncMode: 'snapshot',
  holidays: [
    {
      id: 'holiday-1',
      academicYearId: 'year-1',
      date: '2026-05-10T00:00:00',
      fromDate: '2026-05-10T00:00:00',
      toDate: '2026-05-10T00:00:00',
      holidayName: 'Holiday',
      source: 'manual',
      isIncluded: true,
      notes: '',
    },
  ],
  version: 1,
};

const basePayroll: PayrollPolicy = {
  id: 'payroll-1',
  academicYearId: 'year-1',
  workCalendarPolicyId: 'calendar-1',
  name: 'Standard Payroll',
  status: 'active',
  isDefault: true,
  dayCalculationType: 'working-days',
  manualDays: null,
  manualMonthDays: [],
  saturdayWorkPolicy: 'full-day',
  holidayOverrides: [],
  version: 1,
};

const baseAttendance: AttendancePolicy = {
  id: 'attendance-1',
  academicYearId: 'year-1',
  workCalendarPolicyId: 'calendar-1',
  name: 'Standard Attendance',
  status: 'active',
  isDefault: true,
  captureMode: 'integrated',
  fullDayThresholdPercentage: 75,
  halfDayThresholdPercentage: 50,
  absentThresholdPercentage: 0,
  missingPunchBehavior: 'requires_review',
  manualCorrectionAllowed: true,
  graceTime: 0,
  maxLateAllowedPerMonth: 0,
  penaltyType: 'none',
  penaltyCountThreshold: 0,
  earlyExitEnabled: false,
  earlyExitGraceTime: 0,
  overtimeEnabled: false,
  overtimeRate: null,
  minOvertimeMinutes: null,
  holidayWorkBehavior: 'paid',
  sandwichRuleEnabled: false,
  payrollPreviewEnabled: true,
  version: 1,
};

describe('hr policy change utilities', () => {
  it('hides archived policies from current view and shows them in archived view', () => {
    const rows = [
      { id: 'draft', status: 'draft' as const },
      { id: 'active', status: 'active' as const },
      { id: 'archived', status: 'archived' as const },
    ];

    expect(filterPoliciesByArchiveView(rows, 'current').map((item) => item.id)).toEqual([
      'draft',
      'active',
    ]);
    expect(filterPoliciesByArchiveView(rows, 'archived').map((item) => item.id)).toEqual([
      'archived',
    ]);
  });

  it('detects unchanged work calendar payloads with normalized dates and holiday order', () => {
    expect(
      isWorkCalendarPolicyUnchanged(baseCalendar, {
        academicYearId: 'year-1',
        name: 'Standard Calendar',
        status: 'active',
        effectiveFrom: '2026-04-01',
        effectiveTo: '2027-03-31',
        weeklyOffPattern: 'saturday_sunday',
        customWeeklyOffs: [0, 6],
        holidaySyncMode: 'snapshot',
        holidays: baseCalendar.holidays,
      })
    ).toBe(true);

    expect(
      isWorkCalendarPolicyUnchanged(baseCalendar, {
        academicYearId: 'year-1',
        name: 'Changed Calendar',
      })
    ).toBe(false);
  });

  it('detects unchanged payroll payloads', () => {
    expect(
      isPayrollPolicyUnchanged(basePayroll, {
        academicYearId: 'year-1',
        workCalendarPolicyId: 'calendar-1',
        name: 'Standard Payroll',
        status: 'active',
        isDefault: true,
        dayCalculationType: 'working-days',
        manualDays: null,
        manualMonthDays: [],
        saturdayWorkPolicy: 'full-day',
        holidayOverrides: [],
      })
    ).toBe(true);

    expect(isPayrollPolicyUnchanged(basePayroll, { ...basePayroll, isDefault: false })).toBe(false);
  });

  it('detects unchanged attendance payloads with normalized null values', () => {
    expect(
      isAttendancePolicyUnchanged(baseAttendance, {
        academicYearId: 'year-1',
        workCalendarPolicyId: 'calendar-1',
        name: 'Standard Attendance',
        status: 'active',
        isDefault: true,
        captureMode: 'integrated',
        fullDayThresholdPercentage: 75,
        halfDayThresholdPercentage: 50,
        absentThresholdPercentage: 0,
        missingPunchBehavior: 'requires_review',
        manualCorrectionAllowed: true,
        graceTime: 0,
        maxLateAllowedPerMonth: 0,
        penaltyType: 'none',
        penaltyCountThreshold: 0,
        earlyExitEnabled: false,
        earlyExitGraceTime: 0,
        overtimeEnabled: false,
        overtimeRate: '',
        minOvertimeMinutes: null,
        holidayWorkBehavior: 'paid',
        sandwichRuleEnabled: false,
        payrollPreviewEnabled: true,
      })
    ).toBe(true);

    expect(
      isAttendancePolicyUnchanged(baseAttendance, {
        ...baseAttendance,
        graceTime: 5,
      })
    ).toBe(false);

    expect(
      isAttendancePolicyUnchanged(baseAttendance, {
        ...baseAttendance,
        captureMode: 'manual_status',
      })
    ).toBe(false);
  });

  it('detects unchanged attendance payloads with backend advanced rule values', () => {
    const advancedAttendance: AttendancePolicy = {
      ...baseAttendance,
      penaltyType: 'deduct_half_day',
      penaltyCountThreshold: 2,
      earlyExitEnabled: true,
      earlyExitGraceTime: 5,
      overtimeEnabled: true,
      overtimeRate: '1.5x',
      minOvertimeMinutes: 30,
      holidayWorkBehavior: 'ot_payout',
      sandwichRuleEnabled: true,
    };

    expect(
      isAttendancePolicyUnchanged(advancedAttendance, {
        ...advancedAttendance,
        penaltyType: 'deduct_half_day',
        overtimeRate: '1.5x',
        holidayWorkBehavior: 'ot_payout',
      })
    ).toBe(true);
  });

  it('treats enabled overtime without a stored rate as fixed rate for comparison', () => {
    const enabledWithoutRate: AttendancePolicy = {
      ...baseAttendance,
      overtimeEnabled: true,
      overtimeRate: null,
    };

    expect(
      isAttendancePolicyUnchanged(enabledWithoutRate, {
        ...enabledWithoutRate,
        overtimeRate: 'flat',
      })
    ).toBe(true);
  });
});
