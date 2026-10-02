import { it, expect, describe } from 'vitest';

import { attendanceTableQueryUrl, readAttendanceTableQuery } from './attendance-url-state';

describe('Daily Attendance URL state', () => {
  it('restores search, page and sorting without losing academic context', () => {
    const state = {
      page: 2,
      rowsPerPage: 25,
      searchTerm: 'Meera & family',
      sorts: [{ column: 'name', direction: 'desc' as const }],
      filters: [],
    };
    const url = attendanceTableQueryUrl(
      '/student/attendance/take-attendance',
      'date=2026-09-30&class=class&division=a',
      state
    );
    expect(new URLSearchParams(url.split('?')[1]).get('class')).toBe('class');
    expect(readAttendanceTableQuery(url.split('?')[1])).toEqual(state);
  });
  it('rejects invalid pagination and unknown sort columns from deep links', () => {
    expect(readAttendanceTableQuery('page=-1&size=999999&sorts=not-json')).toEqual({
      page: 0,
      rowsPerPage: 25,
      searchTerm: '',
      sorts: [],
      filters: [],
    });
    expect(
      readAttendanceTableQuery(
        'sorts=%5B%7B%22column%22%3A%22unknown%22%2C%22direction%22%3A%22asc%22%7D%5D'
      ).sorts
    ).toEqual([]);
  });
});
