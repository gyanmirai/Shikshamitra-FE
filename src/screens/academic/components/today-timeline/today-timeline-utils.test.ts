import { it, expect, describe } from 'vitest';

import { getLessonPlanState, getTodayTimelineStatus } from './today-timeline-utils';

describe('today timeline helpers', () => {
  it('derives live lecture state from 12-hour timetable values', () => {
    expect(
      getTodayTimelineStatus(
        { startTime: '09:00 AM', endTime: '09:45 AM' },
        new Date(2026, 8, 21, 9, 20)
      )
    ).toBe('ongoing');
    expect(
      getTodayTimelineStatus(
        { startTime: '09:00 AM', endTime: '09:45 AM' },
        new Date(2026, 8, 21, 10, 0)
      )
    ).toBe('completed');
  });

  it('shows whether the timetable period has a usable plan', () => {
    expect(getLessonPlanState({ lessonPlan: null } as never).label).toBe('Plan needed');
    expect(getLessonPlanState({ lessonPlan: { status: 2 } } as never).label).toBe('Plan approved');
  });
});
