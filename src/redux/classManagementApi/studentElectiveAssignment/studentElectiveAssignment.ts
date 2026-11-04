import { academicType, classManagementType } from 'src/redux/tagTypes';

import { classManagementApi } from '../classManagementApi';

import type { ElectiveCorrectionReview, ElectiveCorrectionRequest } from './electiveCorrectionTypes';

export const studentElectiveAssignmentApi = classManagementApi.injectEndpoints({
  endpoints: (builder) => ({
    previewLockedElectiveCorrection: builder.mutation<ElectiveCorrectionReview, ElectiveCorrectionRequest>({
      query: (body) => ({ url: 'class-management/student-elective-assignments/corrections/preview', method: 'POST', body }),
    }),
    confirmLockedElectiveCorrection: builder.mutation<void, ElectiveCorrectionRequest & { reviewToken: string }>({
      query: (body) => ({ url: 'class-management/student-elective-assignments/corrections/confirm', method: 'POST', body }),
      invalidatesTags: [classManagementType.studentElectiveAssignment, academicType.timetableManagement],
    }),
    getStudentElectiveSelectionCounts: builder.query<Array<{
      electiveGroupId: string; divisionId: string; subjectId: string; count: number;
    }>, { academicMediumId: string; classId: string; divisionIds: string[]; electiveGroupIds: string[] }>({
      query: (body) => ({ url: 'class-management/student-elective-assignments/selection-counts', method: 'POST', body }),
      providesTags: [classManagementType.studentElectiveAssignment],
    }),
    getStudentElectiveAssignments: builder.query({
      query: (params) => ({
        url: 'class-management/student-elective-assignments',
        method: 'GET',
        params,
      }),
      transformResponse: (response: any, _meta, args) => args.includeSelectableSubjects === false
        ? { ...response, records: (response.records ?? []).map((row: any) => ({
          ...row, selectableSubjects: response.subjectOptions ?? row.selectableSubjects ?? [],
        })) } : response,
      providesTags: [classManagementType.studentElectiveAssignment],
    }),

    updateStudentElectiveAssignments: builder.mutation({
      query: (body) => ({
        url: 'class-management/student-elective-assignments',
        method: 'PUT',
        body,
      }),
      invalidatesTags: [classManagementType.studentElectiveAssignment, academicType.timetableManagement],
    }),

    lockStudentElectiveAssignments: builder.mutation({
      query: (body) => ({
        url: 'class-management/student-elective-assignments/lock',
        method: 'POST',
        body,
      }),
      invalidatesTags: [classManagementType.studentElectiveAssignment, academicType.timetableManagement],
    }),
  }),
  overrideExisting: false,
});

export const {
  usePreviewLockedElectiveCorrectionMutation,
  useConfirmLockedElectiveCorrectionMutation,
  useLazyGetStudentElectiveSelectionCountsQuery,
  useGetStudentElectiveAssignmentsQuery,
  useLazyGetStudentElectiveAssignmentsQuery,
  useUpdateStudentElectiveAssignmentsMutation,
  useLockStudentElectiveAssignmentsMutation,
} = studentElectiveAssignmentApi;
