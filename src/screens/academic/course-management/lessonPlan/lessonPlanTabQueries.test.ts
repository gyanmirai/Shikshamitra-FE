import { it, expect, describe } from 'vitest';

import {
  getLessonPlanListQuery,
  getLessonPlanTabQueryState,
  shouldSkipLessonPlanListQuery,
} from './lessonPlanTabQueries';

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

  it('does not restrict the reporting-manager review queue to the selected academic medium', () => {
    expect(
      getLessonPlanListQuery('reviewQueue', {
        academicYearId: 'year-2026',
        academicMediumId: 'gseb-gujarati',
        teacherId: 'manager-employee',
        canReviewSubmissions: true,
      })
    ).toEqual({
      academicYearId: 'year-2026',
      academicMediumId: undefined,
      teacherId: undefined,
      maxResultCount: 1000,
    });
  });

  it('keeps the selected academic medium for ordinary lesson-plan tabs', () => {
    expect(
      getLessonPlanListQuery('lessonList', {
        academicYearId: 'year-2026',
        academicMediumId: 'gseb-gujarati',
        teacherId: 'teacher-employee',
        canReviewSubmissions: false,
      })
    ).toEqual({
      academicYearId: 'year-2026',
      academicMediumId: 'gseb-gujarati',
      teacherId: 'teacher-employee',
      maxResultCount: 1000,
    });
  });

  it('allows review queue loading before a medium is selected when the year is available', () => {
    expect(
      shouldSkipLessonPlanListQuery('reviewQueue', {
        academicYearId: 'year-2026',
        academicMediumId: undefined,
      })
    ).toBe(false);
    expect(
      shouldSkipLessonPlanListQuery('lessonList', {
        academicYearId: 'year-2026',
        academicMediumId: undefined,
      })
    ).toBe(true);
  });
});
