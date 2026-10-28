import { api } from '../service';
import { academicType } from '../tagTypes';

import type {
  AcademicSetupScope, AcademicSetupState, AcademicSetupProgress,
  AcademicSetupVisitStatus, AcademicSetupVisitResult,
} from './types';

export const academicSetupApi = api.enhanceEndpoints({ addTagTypes: ['AcademicSetup', 'AcademicSetupVisit'] })
  .injectEndpoints({
    endpoints: (builder) => ({
      academicSetupVisitStatus: builder.query<AcademicSetupVisitStatus, string>({
        query: () => '/academics/setup/visit-status',
        providesTags: ['AcademicSetupVisit'],
      }),
      recordAcademicSetupVisit: builder.mutation<AcademicSetupVisitResult, { settingKey?: string }>({
        query: (body) => ({ url: '/academics/setup/visit', method: 'POST', body }),
        invalidatesTags: ['AcademicSetupVisit'],
      }),
      academicSetupState: builder.query<AcademicSetupState, AcademicSetupScope>({
        query: ({ academicYearId, academicMediumId, standardId }) => ({
          url: `/academics/setup/${academicYearId}`, params: { academicMediumId, standardId },
        }),
        providesTags: ['AcademicSetup', academicType.subject, academicType.electiveGroup,
          academicType.weeklyLectureSlot, academicType.lectureSlot, academicType.homeworkType,
          academicType.assignmentType, academicType.assessmentRubric, academicType.gradeScaling,
          academicType.examinationType],
      }),
      saveAcademicSetupProgress: builder.mutation<AcademicSetupState, { scope: AcademicSetupScope; progress: AcademicSetupProgress }>({
        query: ({ scope, progress }) => ({
          url: `/academics/setup/${scope.academicYearId}/progress`, method: 'PUT', body: progress,
        }),
        async onQueryStarted({ scope }, { dispatch, queryFulfilled }) {
          try {
            const { data } = await queryFulfilled;
            dispatch(academicSetupApi.util.upsertQueryData('academicSetupState', scope, data));
          } catch { /* The caller retains the current draft and reports the failed save. */ }
        },
      }),
    }),
  });

export const {
  useAcademicSetupVisitStatusQuery, useRecordAcademicSetupVisitMutation,
  useAcademicSetupStateQuery, useSaveAcademicSetupProgressMutation,
} = academicSetupApi;
