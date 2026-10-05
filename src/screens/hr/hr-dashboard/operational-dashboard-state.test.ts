import { it, expect, describe } from 'vitest';

import {
  indiaToday,
  attendanceHref,
  formatUpdatedAt,
  previousSchoolDay,
  parseDashboardState,
} from './operational-dashboard-state';

describe('operational dashboard URL state', () => {
  it('uses IST when the UTC date is still the previous day', () => {
    expect(indiaToday(new Date('2026-10-01T19:00:00Z'))).toBe('2026-10-02');
    expect(formatUpdatedAt('2026-10-01T22:45:00Z')).toBe('2 Oct 2026, 4:15 am');
  });

  it('moves to the previous calendar day across month and year boundaries', () => {
    expect(previousSchoolDay('2026-10-01')).toBe('2026-09-30');
    expect(previousSchoolDay('2026-01-01')).toBe('2025-12-31');
    expect(previousSchoolDay('2024-03-01')).toBe('2024-02-29');
  });

  it('supports the counts view while preserving old dashboard URLs', () => {
    expect(parseDashboardState(new URLSearchParams()).trendView).toBe('chart');
    expect(parseDashboardState(new URLSearchParams('trendView=counts')).trendView).toBe('counts');
    expect(parseDashboardState(new URLSearchParams('trendView=unknown')).trendView).toBe('chart');
  });

  it('preserves staff filters, page, search and sort on reload', () => {
    const state = parseDashboardState(
      new URLSearchParams(
        'date=2026-10-01&group=teaching&stage=stage-1&department=Science&shift=shift-1&status=NotMarked&page=3&pageSize=50&search=Patel&sort=name+desc'
      ),
      '2026-10-02'
    );
    expect(state).toMatchObject({
      date: '2026-10-01',
      group: 'teaching',
      stage: 'stage-1',
      department: 'Science',
      shift: 'shift-1',
      status: 'NotMarked',
      page: 3,
      pageSize: 50,
      search: 'Patel',
      sorting: 'name desc',
    });
  });

  it('rejects future, impossible and malformed dates and unsafe paging or statuses', () => {
    ['2099-01-01', '2026-02-30', 'tomorrow'].forEach((date) => {
      expect(parseDashboardState(new URLSearchParams({ date }), '2026-10-02').date).toBe(
        '2026-10-02'
      );
    });
    expect(
      parseDashboardState(
        new URLSearchParams('page=-1&pageSize=1000&status=Late&sort=salary'),
        '2026-10-02'
      )
    ).toMatchObject({ page: 1, pageSize: 25, status: '', sorting: 'name' });
  });

  it('encodes attendance links and carries the selected date', () => {
    expect(attendanceHref('staff/1', '2026-10-01')).toContain(
      'employeeId=staff%2F1&startDate=2026-10-01&endDate=2026-10-01'
    );
  });
});
