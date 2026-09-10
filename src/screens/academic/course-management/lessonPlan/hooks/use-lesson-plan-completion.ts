import type { LessonPlanProgressContext } from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-progress-api';

import { skipToken } from '@reduxjs/toolkit/query';
import { useGetLessonPlanChapterProgressQuery } from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-progress-api';

export function useLessonPlanCompletion(
  open: boolean,
  context: Partial<LessonPlanProgressContext>,
  target: number
) {
  const { academicYearId, standardId, divisionId, subjectId, chapterId } = context;
  const args =
    open && academicYearId && standardId && divisionId && subjectId && chapterId
      ? { academicYearId, standardId, divisionId, subjectId, chapterId }
      : skipToken;
  const { currentData, isFetching, isError, refetch } = useGetLessonPlanChapterProgressQuery(args, {
    refetchOnMountOrArgChange: true,
  });
  // currentData belongs to these exact context arguments. A previous chapter's
  // cached response must never become the next chapter's minimum.
  const minimum = currentData?.minimumCompletionPercentage ?? 0;
  const ready = args !== skipToken && !!currentData && !isFetching && !isError;
  return {
    minimum,
    target: Math.min(100, Math.max(minimum, Number.isFinite(target) ? target : minimum)),
    ready,
    loading: args !== skipToken && !isError && (!currentData || isFetching),
    error: isError ? 'Unable to load recorded chapter progress. Please retry.' : '',
    retry: refetch,
  };
}
