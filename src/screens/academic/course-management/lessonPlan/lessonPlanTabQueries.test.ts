import { it, expect, describe } from 'vitest';

import { getLessonPlanTabQueryState } from './lessonPlanTabQueries';

describe('getLessonPlanTabQueryState', () => {
  it.each([
    ['dailyTimeline', { timeline: true, lessonPlans: false, teacherDiaries: false }],
    ['lessonList', { timeline: false, lessonPlans: true, teacherDiaries: false }],
    ['teacherDiary', { timeline: false, lessonPlans: true, teacherDiaries: true }],
    ['reviewQueue', { timeline: false, lessonPlans: true, teacherDiaries: false }],
    ['weeklyPlanner', { timeline: false, lessonPlans: true, teacherDiaries: false }],
  ] as const)('enables only the data required by the %s tab', (activeTab, expected) => {
    expect(getLessonPlanTabQueryState(activeTab)).toEqual(expected);
  });
});
