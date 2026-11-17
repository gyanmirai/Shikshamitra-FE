import { api } from 'src/redux/service';
import { studentType, studentOnboardingType, studentAdmissionsCrmType } from 'src/redux/tagTypes';

import type { StudentSetupState, StudentSetupScope, StudentSetupProgress, StudentSetupVisitResult, StudentSetupVisitStatus } from './types';

export const studentSetupApi = api.enhanceEndpoints({ addTagTypes: ['StudentSetupGuide', 'StudentSetupVisit'] }).injectEndpoints({
  endpoints: (builder) => ({
    studentSetupVisitStatus: builder.query<StudentSetupVisitStatus, string>({
      query: () => '/student/setup/visit-status',
      providesTags: ['StudentSetupVisit'],
    }),
    recordStudentSetupVisit: builder.mutation<StudentSetupVisitResult, { settingKey?: string }>({
      query: (body) => ({ url: '/student/setup/visit', method: 'POST', body }),
      invalidatesTags: (_result, error) => error ? [] : ['StudentSetupVisit'],
    }),
    studentSetupState: builder.query<StudentSetupState, StudentSetupScope>({
      query: ({ academicYearId, academicMediumId, standardId }) => ({
        url: `/student/setup/${academicYearId}`, params: { academicMediumId, standardId },
      }),
      providesTags: (_result, _error, { academicYearId }) => ['StudentSetupGuide', studentAdmissionsCrmType.admissionCycle,
        studentAdmissionsCrmType.admissionOffering, studentAdmissionsCrmType.admissionForm,
        studentAdmissionsCrmType.admissionWorkflow, studentAdmissionsCrmType.configuration,
        studentOnboardingType.onboardingSettings, studentType.student,
        { type: studentType.student, id: 'HOUSE-MANAGEMENT' },
        { type: studentOnboardingType.onboardingSettings, id: 'SCOPES' },
        { type: studentType.student, id: 'RECORDS-SETTINGS-school' },
        { type: studentType.student, id: `RECORDS-SETTINGS-${academicYearId}` }],
    }),
    saveStudentSetupProgress: builder.mutation<StudentSetupState, { scope: StudentSetupScope; progress: StudentSetupProgress }>({
      query: ({ scope, progress }) => ({
        url: `/student/setup/${scope.academicYearId}/progress`, method: 'PUT', body: progress,
      }),
      async onQueryStarted({ scope }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.academicYearId === scope.academicYearId) {
            dispatch(studentSetupApi.util.upsertQueryData('studentSetupState', scope, data));
          }
        } catch { /* Preserve the last server state; the guide owns retry and conflict recovery. */ }
      },
    }),
  }),
});

export const { useStudentSetupVisitStatusQuery, useRecordStudentSetupVisitMutation,
  useStudentSetupStateQuery, useSaveStudentSetupProgressMutation } = studentSetupApi;
