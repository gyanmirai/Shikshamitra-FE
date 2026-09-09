import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export type LessonPlanProgressContext = {
  academicYearId: string;
  standardId: string;
  divisionId: string;
  subjectId: string;
  chapterId: string;
};

export const lessonPlanProgressApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getLessonPlanChapterProgress: builder.query<
      { minimumCompletionPercentage: number },
      LessonPlanProgressContext
    >({
      query: (params) => ({
        url: '/academic/curriculum/lesson-plans/chapter-progress',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.lessonPlan, academicType.teacherDiary, academicType.chapter],
    }),
  }),
});

export const { useGetLessonPlanChapterProgressQuery } = lessonPlanProgressApi;
