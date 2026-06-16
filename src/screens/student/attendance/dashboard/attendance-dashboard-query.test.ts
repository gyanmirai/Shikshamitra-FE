import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import {
  buildAttendanceHistoryQuery,
  buildAttendanceSummaryQuery,
} from './attendance-dashboard-query';

describe('student attendance dashboard query helpers', () => {
  it('builds the selected month date range for the summary request', () => {
    expect(buildAttendanceSummaryQuery(dayjs('2026-02-15'))).toEqual({
      startDate: '2026-02-01',
      endDate: '2026-02-28',
    });
  });

  it('builds paged attendance history query params', () => {
    expect(
      buildAttendanceHistoryQuery({
        studentId: 'student-1',
        startDate: dayjs('2026-06-01'),
        endDate: dayjs('2026-06-30'),
        skipCount: 20,
        maxResultCount: 10,
        sorting: 'date asc',
      })
    ).toEqual({
      studentId: 'student-1',
      startDate: '2026-06-01',
      endDate: '2026-06-30',
      skipCount: 20,
      maxResultCount: 10,
      sorting: 'date asc',
    });
  });
});
