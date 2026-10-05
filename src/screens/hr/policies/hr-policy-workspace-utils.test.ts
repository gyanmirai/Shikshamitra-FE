import type { WorkCalendarPolicy, WorkCalendarHoliday } from 'src/redux/hr/hr-policy-api';

import { it, expect, describe } from 'vitest';

import { WEEKLY_RULE_OPTIONS } from './hr-policy-workspace.constants';
import {
  formatRange,
  getErrorMessage,
  getAcademicYearMonthRanges,
  isSaturdayWorkingForCalendar,
  buildPayrollBasisPreviewRows,
  selectSingleActiveDefaultPolicy,
  getAssignmentFormValidationError,
  assignmentMatchesLeavePolicyFilter,
  getEffectiveAssignmentLeavePolicyId,
  getHolidayAcademicYearValidationError,
} from './hr-policy-workspace-utils';

describe('HR policy workspace date-only academic year handling', () => {
  const academicYearStart = '2026-06-01T00:00:00Z';
  const academicYearEnd = '2027-05-31T00:00:00Z';
  const makeCalendar = (overrides: Partial<WorkCalendarPolicy> = {}): WorkCalendarPolicy => ({
    id: 'calendar-1',
    academicYearId: 'ay-2026-2027',
    name: 'Test Calendar',
    status: 'active',
    effectiveFrom: academicYearStart,
    effectiveTo: academicYearEnd,
    weeklyOffPattern: 'saturday_sunday',
    customWeeklyOffs: [],
    holidaySyncMode: 'snapshot',
    holidays: [],
    version: 1,
    ...overrides,
  });

  it('preserves the policy name in a restore collision message', () => {
    expect(
      getErrorMessage(
        {
          data: {
            error: {
              code: 'ShikshaMitra:LeavePolicyNameAlreadyExists',
              message: 'A leave policy with this name already exists.',
              data: { policyName: 'Restored Draft' },
            },
          },
        },
        'Failed to restore leave policy'
      )
    ).toBe('A non-archived policy named "Restored Draft" already exists for this academic year.');
  });

  it('builds month ranges from academic-year date parts instead of timezone-shifted instants', () => {
    const ranges = getAcademicYearMonthRanges(academicYearStart, academicYearEnd);

    expect(ranges).toHaveLength(12);
    expect(ranges[0].monthStart.format('MMM YYYY')).toBe('Jun 2026');
    expect(ranges[0].fromDate.format('YYYY-MM-DD')).toBe('2026-06-01');
    expect(ranges[0].toDate.format('YYYY-MM-DD')).toBe('2026-06-30');
    expect(ranges[0].toDate.diff(ranges[0].fromDate, 'day') + 1).toBe(30);
    expect(ranges.at(-1)?.monthStart.format('MMM YYYY')).toBe('May 2027');
  });

  it('formats academic-year ranges as business dates for UTC-midnight API values', () => {
    expect(formatRange(academicYearStart, academicYearEnd)).toBe('01 Jun 2026 - 31 May 2027');
  });

  it('formats open-ended ranges as having no end date', () => {
    expect(formatRange(academicYearStart, null)).toBe('01 Jun 2026 - No end date');
  });

  it('does not include May 2026 in the standard payroll basis preview', () => {
    const rows = buildPayrollBasisPreviewRows({
      academicYearStart,
      academicYearEnd,
      calendar: makeCalendar(),
      dayCalculationType: 'working-days',
      saturdayWorkPolicy: 'full-day',
      manualMonthDays: {},
    });

    expect(rows.map((row) => row.monthKey)).not.toContain('2026-05');
    expect(rows[0]).toMatchObject({
      monthKey: '2026-06',
      monthLabel: 'Jun 2026',
      calendarDays: 30,
      basisDays: 22,
    });
    expect(rows.at(-1)?.monthKey).toBe('2027-05');
  });

  it('detects whether the selected work calendar has Saturday as a working day', () => {
    const calendar = makeCalendar();

    expect(isSaturdayWorkingForCalendar(calendar)).toBe(false);
    expect(isSaturdayWorkingForCalendar({ ...calendar, weeklyOffPattern: 'sunday' })).toBe(true);
    expect(
      isSaturdayWorkingForCalendar({
        ...calendar,
        weeklyOffPattern: 'custom',
        customWeeklyOffs: [6],
      })
    ).toBe(false);
  });

  it('ignores Saturday payroll policy when Saturday is already off in the work calendar', () => {
    const rows = buildPayrollBasisPreviewRows({
      academicYearStart: '2026-06-01',
      academicYearEnd: '2026-06-30',
      calendar: makeCalendar(),
      dayCalculationType: 'working-days',
      saturdayWorkPolicy: 'full-day',
      manualMonthDays: {},
    });

    expect(rows[0]).toMatchObject({
      saturdayCount: 4,
      saturdayUnits: 0,
      basisDays: 22,
    });
  });

  it('applies Saturday payroll policy when Saturday is a working calendar day', () => {
    const rows = buildPayrollBasisPreviewRows({
      academicYearStart: '2026-06-01',
      academicYearEnd: '2026-06-30',
      calendar: makeCalendar({ weeklyOffPattern: 'sunday' }),
      dayCalculationType: 'working-days',
      saturdayWorkPolicy: 'half-day',
      manualMonthDays: {},
    });

    expect(rows[0]).toMatchObject({
      saturdayCount: 4,
      saturdayUnits: 2,
      basisDays: 24,
    });
  });

  it('excludes full-month work-calendar holidays from working-days payroll basis preview', () => {
    const rows = buildPayrollBasisPreviewRows({
      academicYearStart: '2026-05-01',
      academicYearEnd: '2026-05-31',
      calendar: makeCalendar({
        holidays: [
          {
            academicYearId: 'ay-2025-2026',
            date: '2026-05-01',
            fromDate: '2026-05-01',
            toDate: '2026-05-31',
            holidayName: 'Summer Vacation',
            source: 'central_calendar',
            isIncluded: true,
          },
        ],
      }),
      dayCalculationType: 'working-days',
      saturdayWorkPolicy: 'full-day',
      manualMonthDays: {},
    });

    expect(rows[0]).toMatchObject({
      monthKey: '2026-05',
      workingUnits: 0,
      holidayUnitsExcluded: 21,
      basisDays: 0,
    });
  });

  it('uses the literal date portion even when an offset would shift the instant', () => {
    const rows = getAcademicYearMonthRanges(
      '2026-06-01T00:00:00+05:30',
      '2027-05-31T00:00:00+05:30'
    );

    expect(rows[0].monthStart.format('YYYY-MM')).toBe('2026-06');
    expect(rows.at(-1)?.monthStart.format('YYYY-MM')).toBe('2027-05');
  });

  it('allows holidays through the academic-year end business date', () => {
    const holidays: WorkCalendarHoliday[] = [
      {
        academicYearId: 'ay-2026-2027',
        date: '2027-04-30',
        fromDate: '2027-04-30',
        toDate: '2027-05-31',
        holidayName: 'Summer Vacation',
        source: 'manual',
        isIncluded: true,
      },
    ];

    expect(
      getHolidayAcademicYearValidationError(holidays, academicYearStart, academicYearEnd)
    ).toBe('');
  });

  it('returns a specific message when a holiday leaves the selected academic year', () => {
    const holidays: WorkCalendarHoliday[] = [
      {
        academicYearId: 'ay-2026-2027',
        date: '2027-05-31',
        fromDate: '2027-05-31',
        toDate: '2027-06-01',
        holidayName: 'Bridge Holiday',
        source: 'manual',
        isIncluded: true,
      },
    ];

    expect(
      getHolidayAcademicYearValidationError(holidays, academicYearStart, academicYearEnd)
    ).toBe(
      'Bridge Holiday must stay inside the selected academic year (01 Jun 2026 - 31 May 2027).'
    );
  });

  it('offers only weekly rules accepted by the backend work-calendar contract', () => {
    expect(WEEKLY_RULE_OPTIONS.map((option) => option.value)).toEqual([
      'saturday_sunday',
      'sunday',
      'custom',
    ]);
  });

  it('validates assignment date ranges and priority before save', () => {
    const form = {
      targetType: 'employee' as const,
      targetKey: 'employee-1',
      targetDisplayName: 'Staff One',
      payrollPolicyId: 'payroll-1',
      attendancePolicyId: 'attendance-1',
      leavePolicyId: 'leave-1',
      effectiveFrom: '2026-06-01',
      effectiveTo: '2026-06-30',
      priority: '100',
      assignmentReason: '',
      isActive: true,
    };

    expect(getAssignmentFormValidationError(form)).toBe('');
    expect(
      getAssignmentFormValidationError({
        ...form,
        effectiveTo: '2026-05-31',
      })
    ).toBe('Effective to must be on or after effective from.');
    expect(
      getAssignmentFormValidationError({
        ...form,
        effectiveFrom: 'not-a-date',
      })
    ).toBe('Effective from must be a valid date.');
    expect(
      getAssignmentFormValidationError({
        ...form,
        effectiveTo: 'not-a-date',
      })
    ).toBe('Effective to must be a valid date.');
    expect(
      getAssignmentFormValidationError({
        ...form,
        priority: '1001',
      })
    ).toBe('Priority must be between -1000 and 1000.');
  });

  it('selects only one active default policy for assignment prefill', () => {
    const policies = [
      { id: 'draft-default', status: 'draft', isDefault: true },
      { id: 'active-default', status: 'active', isDefault: true },
      { id: 'active-non-default', status: 'active', isDefault: false },
    ];

    expect(selectSingleActiveDefaultPolicy(policies)?.id).toBe('active-default');
    expect(
      selectSingleActiveDefaultPolicy([
        { id: 'active-non-default', status: 'active', isDefault: false },
      ])
    ).toBeUndefined();
    expect(
      selectSingleActiveDefaultPolicy([
        { id: 'first-default', status: 'active', isDefault: true },
        { id: 'second-default', status: 'active', isDefault: true },
      ])
    ).toBeUndefined();
    expect(
      selectSingleActiveDefaultPolicy([
        { id: 'uppercase-default', status: 'Active', isDefault: true },
      ])?.id
    ).toBe('uppercase-default');
  });

  it('matches legacy null leave assignments through a single default policy for filters', () => {
    const legacyAssignment = { leavePolicyId: null };
    const explicitAssignment = { leavePolicyId: 'leave-explicit' };

    expect(getEffectiveAssignmentLeavePolicyId(legacyAssignment, 'leave-default')).toBe(
      'leave-default'
    );
    expect(
      assignmentMatchesLeavePolicyFilter(legacyAssignment, 'leave-default', 'leave-default')
    ).toBe(true);
    expect(
      assignmentMatchesLeavePolicyFilter(legacyAssignment, 'leave-other', 'leave-default')
    ).toBe(false);
    expect(
      assignmentMatchesLeavePolicyFilter(explicitAssignment, 'leave-explicit', 'leave-default')
    ).toBe(true);
    expect(assignmentMatchesLeavePolicyFilter(legacyAssignment, 'leave-default')).toBe(false);
  });
});
