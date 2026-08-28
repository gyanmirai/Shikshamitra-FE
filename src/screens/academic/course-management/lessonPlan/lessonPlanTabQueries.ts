export type LessonPlanTabValue =
  'dailyTimeline' | 'lessonList' | 'teacherDiary' | 'reviewQueue' | 'weeklyPlanner';

export type LessonPlanTabQueryState = {
  timeline: boolean;
  lessonPlans: boolean;
  teacherDiaries: boolean;
};

export const getLessonPlanTabQueryState = (
  activeTab: LessonPlanTabValue
): LessonPlanTabQueryState => ({
  timeline: activeTab === 'dailyTimeline',
  lessonPlans: activeTab !== 'dailyTimeline',
  teacherDiaries: activeTab === 'teacherDiary',
});
