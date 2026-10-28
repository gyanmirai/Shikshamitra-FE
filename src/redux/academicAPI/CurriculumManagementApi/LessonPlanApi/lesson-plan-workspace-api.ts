import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';
import { lessonWorkspaceUrl } from './lesson-plan-workspace-contracts';

import type { LessonWorkspacePage, LessonWorkspaceInput } from './lesson-plan-workspace-contracts';

export const lessonPlanWorkspaceApi = academicApi.injectEndpoints({
  endpoints: builder => ({
    getLessonPlanWorkspace: builder.query<LessonWorkspacePage, LessonWorkspaceInput>({
      query: input => ({ url: lessonWorkspaceUrl(input), method: 'GET' }),
      providesTags: [academicType.lessonPlan, academicType.teacherDiary],
    }),
  }),
});

export const { useGetLessonPlanWorkspaceQuery, useLazyGetLessonPlanWorkspaceQuery } = lessonPlanWorkspaceApi;
