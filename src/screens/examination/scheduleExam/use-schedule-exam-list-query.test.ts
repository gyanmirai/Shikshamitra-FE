import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';

import {
  SCHEDULE_EXAM_LIST_QUERY_OPTIONS,
  buildScheduleExamListQueryParams,
  SCHEDULE_EXAM_STATUS_REFRESH_INTERVAL_MS,
} from './use-schedule-exam-list-query';

describe('schedule exam list refresh options', () => {
  it('periodically revalidates server-derived statuses while the page is focused', () => {
    expect(SCHEDULE_EXAM_STATUS_REFRESH_INTERVAL_MS).toBe(60_000);
    expect(SCHEDULE_EXAM_LIST_QUERY_OPTIONS).toEqual({
      pollingInterval: 60_000,
      skipPollingIfUnfocused: true,
    });
  });
});

describe('schedule exam list date range', () => {
  it.each([
    examScheduledStatus.Pending,
    examScheduledStatus.Published,
    examScheduledStatus.Ongoing,
    examScheduledStatus.Completed,
  ])('includes the visible date range for status %s', (activeStatus) => {
    const params = buildScheduleExamListQueryParams({
      activeStatus,
      selectedClass: 'all',
      dateRange: [dayjs('2026-09-13'), dayjs('2026-09-19')],
      page: 1,
      pageSize: 10,
    });

    expect(params.StartDate).toBeDefined();
    expect(params.EndDate).toBeDefined();
  });
});
