import { it, expect, describe } from 'vitest';

import { indiaToday, attendanceHref, parseDashboardState } from './operational-dashboard-state';

describe('operational dashboard URL state', () => {
  it('uses IST when the UTC date is still the previous day', () => {
    expect(indiaToday(new Date('2026-10-01T19:00:00Z'))).toBe('2026-10-02');
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
