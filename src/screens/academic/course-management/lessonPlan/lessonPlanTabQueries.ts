export type LessonPlanTabValue =
  'dailyTimeline' | 'lessonList' | 'teacherDiary' | 'reviewQueue' | 'weeklyPlanner';

export type LessonPlanTabQueryState = {
  timeline: boolean;
  lessonPlans: boolean;
  teacherDiaries: boolean;
};

export type LessonPlanQueryContext = {
  academicYearId?: string;
  academicMediumId?: string;
  teacherId?: string;
  canReviewSubmissions: boolean;
};

export type LessonPlanListQuery = {
  academicYearId?: string;
  academicMediumId?: string;
  teacherId?: string;
  maxResultCount: number;
};

export const getLessonPlanTabQueryState = (
  activeTab: LessonPlanTabValue
): LessonPlanTabQueryState => ({
  timeline: activeTab === 'dailyTimeline',
  lessonPlans: activeTab !== 'dailyTimeline',
  teacherDiaries: activeTab === 'teacherDiary',
});

export const getLessonPlanListQuery = (
  activeTab: LessonPlanTabValue,
  context: LessonPlanQueryContext
): LessonPlanListQuery => ({
  academicYearId: context.academicYearId,
  // A reporting manager's queue spans every medium containing their reportees.
  // Applying the manager's current header context would hide submissions made
  // under another board/medium even though the hierarchy grants access to them.
  academicMediumId: activeTab === 'reviewQueue' ? undefined : context.academicMediumId,
  teacherId:
    !context.canReviewSubmissions && context.teacherId ? context.teacherId : undefined,
  maxResultCount: 1000,
});

export const shouldSkipLessonPlanListQuery = (
  activeTab: LessonPlanTabValue,
  context: Pick<LessonPlanQueryContext, 'academicYearId' | 'academicMediumId'>
): boolean =>
  !context.academicYearId ||
  (activeTab !== 'reviewQueue' && !context.academicMediumId) ||
  !getLessonPlanTabQueryState(activeTab).lessonPlans;
