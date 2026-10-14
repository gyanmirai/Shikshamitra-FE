import type {
  OperationalOverview,
  DashboardSectionState,
} from 'src/redux/hr/hrOperationalDashboardApi';

import { it, expect, describe } from 'vitest';

import {
  indiaToday,
  attendanceHref,
  formatUpdatedAt,
  previousSchoolDay,
  getPayrollGuidance,
  parseDashboardState,
  getModulePriorityCue,
  obsoleteDashboardKeys,
} from './operational-dashboard-state';

describe('HR module overview context', () => {
  it('converts complete timestamps to the correct IST date and time', () => {
    expect(indiaToday(new Date('2026-10-01T19:00:00Z'))).toBe('2026-10-02');
    expect(formatUpdatedAt('2026-10-01T22:45:00Z')).toBe('2 Oct 2026, 4:15 am');
  });
  it('moves across calendar month, year and leap-day boundaries', () => {
    expect(previousSchoolDay('2026-10-01')).toBe('2026-09-30');
    expect(previousSchoolDay('2026-01-01')).toBe('2025-12-31');
    expect(previousSchoolDay('2024-03-01')).toBe('2024-02-29');
  });
  it('preserves attendance date without applying obsolete staff filters', () => {
    expect(
      parseDashboardState(
        new URLSearchParams('date=2026-10-01&stage=stage-1&search=Patel&page=3&trendView=counts'),
        '2026-10-05'
      )
    ).toEqual({ date: '2026-10-01' });
    expect(obsoleteDashboardKeys).toEqual(
      expect.arrayContaining(['stage', 'search', 'page', 'trendView'])
    );
    expect(obsoleteDashboardKeys).not.toContain('date');
  });
  it('rejects future, impossible and malformed attendance dates', () => {
    ['2099-01-01', '2026-02-30', 'tomorrow'].forEach((date) =>
      expect(parseDashboardState(new URLSearchParams({ date }), '2026-10-05').date).toBe(
        '2026-10-05'
      )
    );
  });
  it('retains the existing employee attendance link format', () => {
    expect(attendanceHref('staff/1', '2026-10-01')).toContain(
      'employeeId=staff%2F1&startDate=2026-10-01&endDate=2026-10-01'
    );
  });
});

describe('dashboard priority and payroll guidance', () => {
  const payroll: NonNullable<OperationalOverview['payroll']> = {
    month: '2026-10',
    savedStaffCount: 10,
    reviewedCount: 5,
    lockedCount: 3,
    pendingCount: 2,
  };
  it('distinguishes pending work from overdue work without warnings for zero', () => {
    expect(getModulePriorityCue('leave', 'Available', 2)).toEqual({
      label: 'Awaiting decision',
      color: 'info',
    });
    expect(getModulePriorityCue('appraisal', 'Available', 2)).toEqual({
      label: '2 overdue',
      color: 'warning',
    });
    expect(getModulePriorityCue('leave', 'Available', 0)).toBeNull();
    expect(getModulePriorityCue('appraisal', 'Available', 0)).toBeNull();
    expect(getModulePriorityCue('appraisal', 'Available', undefined)).toBeNull();
  });
  it.each([undefined, 'Failed', 'Forbidden', 'Unavailable'] as (
    DashboardSectionState | undefined
  )[])('does not imply work or completion when state is %s', (state) => {
    expect(getModulePriorityCue('leave', state, 5)).toBeNull();
    expect(getModulePriorityCue('appraisal', state, 5)).toBeNull();
    expect(getPayrollGuidance(state, payroll)).toBeNull();
  });
  it('explains absent records and missing payloads honestly', () => {
    expect(getPayrollGuidance('Available', null)).toBeNull();
    expect(
      getPayrollGuidance('Available', {
        ...payroll,
        savedStaffCount: 0,
        reviewedCount: 0,
        lockedCount: 0,
        pendingCount: 0,
      })?.message
    ).toBe('No saved payroll records for this month.');
  });
  it('prioritises pending reviews and formats singular, plural and large counts', () => {
    expect(getPayrollGuidance('Available', payroll)).toEqual({
      message: '2 staff members awaiting review.',
      color: 'info',
    });
    expect(getPayrollGuidance('Available', { ...payroll, pendingCount: 1 })?.message).toBe(
      '1 staff member awaiting review.'
    );
    expect(
      getPayrollGuidance('Available', { ...payroll, savedStaffCount: 123456, pendingCount: 123456 })
        ?.message
    ).toBe('1,23,456 staff members awaiting review.');
  });
  it('distinguishes locked records from reviewed records that remain unlocked', () => {
    expect(
      getPayrollGuidance('Available', {
        ...payroll,
        lockedCount: 10,
        reviewedCount: 0,
        pendingCount: 0,
      })?.message
    ).toBe('All saved records are locked.');
    expect(
      getPayrollGuidance('Available', {
        ...payroll,
        lockedCount: 5,
        reviewedCount: 5,
        pendingCount: 0,
      })?.message
    ).toBe('5 reviewed records remain unlocked.');
    expect(
      getPayrollGuidance('Available', {
        ...payroll,
        lockedCount: 9,
        reviewedCount: 1,
        pendingCount: 0,
      })?.message
    ).toBe('1 reviewed record remains unlocked.');
  });
});
