import { useGetLessonPlansQuery } from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-api';

const SUBMITTED_LESSON_PLAN_STATUS = 1;

type Options = {
  academicYearId?: string;
  enabled: boolean;
};

export function usePendingReviewCount({ academicYearId, enabled }: Options) {
  const { pendingReviewCount } = useGetLessonPlansQuery(
    {
      academicYearId,
      status: SUBMITTED_LESSON_PLAN_STATUS,
      maxResultCount: 1,
    },
    {
      skip: !enabled || !academicYearId,
      selectFromResult: ({ data }) => ({
        pendingReviewCount: Number(data?.totalCount ?? 0),
      }),
    }
  );

  return pendingReviewCount;
}
