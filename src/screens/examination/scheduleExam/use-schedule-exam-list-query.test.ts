import { it, expect, describe } from 'vitest';

import {
  SCHEDULE_EXAM_LIST_QUERY_OPTIONS,
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
