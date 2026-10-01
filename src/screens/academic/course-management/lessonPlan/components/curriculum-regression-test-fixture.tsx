import dayjs from 'dayjs';
import { useState } from 'react';
import { useGetLessonPlanTimelineQuery } from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-api';

import DailyTimelineTab from './DailyTimelineTab';
import SubmitDiaryModal from './SubmitDiaryModal';
import LessonDiaryDetailsDrawer from './LessonDiaryDetailsDrawer';

import type { LessonPlanRow } from '../lessonPlanData';

export const curriculumTimeline = {
  date: '2026-09-30',
  teacherId: 'teacher-one',
  slots: [
    {
      timetableSlotId: 'slot-one',
      periodName: 'Period 1',
      startTime: '12:30',
      endTime: '13:00',
      standardId: 'class-ten',
      standardName: 'Class 10',
      divisionId: 'division-a',
      divisionName: 'A',
      subjectId: 'social-science',
      subjectName: 'Social Science',
      lessonPlan: {
        id: 'plan-one',
        teacherId: 'teacher-one',
        plannedDate: '2026-09-30',
        topic: 'Describe the topic planned for this lesson',
        chapterName: 'The Rise of Nationalism in Europe',
        learningObjective: 'Explain the origins of nationalism',
        resourcesRequired: 'Textbook and map',
        teachingMethod: 'ExplanationBoardWork',
        status: 2,
        diaryStatus: 0,
        teacherDiaryId: null,
        plannedCompletionPercentage: 100,
        actualCompletionPercentage: 0,
      },
      isTimetableSlotOnly: false,
      isPlanCreationBlocked: false,
    },
  ],
};

// Use the production query and components so regression tests and browser
// smoke checks exercise the same numeric API payload and navigation path.
export function CurriculumRegressionTestFixture() {
  const [selectedDate, setSelectedDate] = useState(dayjs('2026-09-30'));
  const [detailPlan, setDetailPlan] = useState<LessonPlanRow | null>(null);
  const [diaryPlan, setDiaryPlan] = useState<LessonPlanRow | null>(null);
  const query = useGetLessonPlanTimelineQuery({ date: selectedDate.format('YYYY-MM-DD') });

  return (
    <>
      <DailyTimelineTab
        selectedDate={selectedDate}
        onChangeDate={setSelectedDate}
        slots={query.data?.slots ?? []}
        isLoading={query.isLoading || query.isFetching}
        hasError={query.isError}
        onRetry={() => query.refetch()}
        onAddLesson={() => {}}
        onEditLesson={() => {}}
        onViewDetails={setDetailPlan}
        onSubmitDiary={setDiaryPlan}
        onSubmitPlan={() => {}}
      />
      <LessonDiaryDetailsDrawer
        open={Boolean(detailPlan)}
        plan={detailPlan}
        onClose={() => setDetailPlan(null)}
      />
      {diaryPlan && (
        <SubmitDiaryModal
          open
          plan={diaryPlan}
          onClose={() => setDiaryPlan(null)}
          onSave={() => {}}
        />
      )}
    </>
  );
}
