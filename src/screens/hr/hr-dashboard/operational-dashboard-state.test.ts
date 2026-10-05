import { it, expect, describe } from 'vitest';

import {
  indiaToday,
  attendanceHref,
  formatUpdatedAt,
  previousSchoolDay,
  parseDashboardState,
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
