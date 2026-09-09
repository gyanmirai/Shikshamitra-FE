import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const subjectAssignmentsApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all subject assignments - academicMediumId passed in query params
    getSubjectAssignments: builder.query({
      query: ({ standardId, page, pageSize, status = 1, teacherSearch }) => ({
        url: `/academics/curriculum/${standardId}/subject-assignments`,
        method: 'GET',
        params: {
          page,
          pageSize,
          ...(teacherSearch ? { teacherSearch } : {}),
          ...(status === 'all' ? { includeArchived: true } : { status }),
        },
      }),
      providesTags: [academicType.subjectAssignment],
    }),

    // Get one assignment - academicMediumId also optional in query param
    getSubjectAssignmentById: builder.query({
      query: ({ assignmentId }) => ({
        url: `/academics/curriculum/subject-assignments/${assignmentId}`,
        method: 'GET',
      }),
      providesTags: [academicType.subjectAssignment],
    }),

    // Create assignment
    addSubjectAssignment: builder.mutation({
      query: ({ body }) => ({
        url: `/academics/curriculum/subject-assignments`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.subjectAssignment],
    }),

    // Update assignment
    updateSubjectAssignment: builder.mutation({
      query: ({ assignmentId, body }) => ({
        url: `/academics/curriculum/subject-assignments/${assignmentId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [
        academicType.subjectAssignment,
        academicType.timetableManagement,
        academicType.lessonPlan,
      ],
    }),

    // Delete assignment
    deleteSubjectAssignment: builder.mutation({
      query: ({
        assignmentId,
        force = true,
        permanent = true,
      }: {
        assignmentId: string;
        force?: boolean;
        permanent?: boolean;
      }) => ({
        url: `/academics/curriculum/subject-assignments/${assignmentId}`,
        method: 'DELETE',
        params: {
          ...(force ? { force: true } : {}),
          ...(permanent ? { permanent: true } : {}),
        },
      }),
      invalidatesTags: [academicType.subjectAssignment],
    }),

    // Publish assignment
    publishSubjectAssignment: builder.mutation({
      query: ({ assignmentId, status }) => ({
        url: `/academics/curriculum/subject-assignments/${assignmentId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: [academicType.subjectAssignment],
    }),

    // Upload Curriculum File
    uploadCurriculumFile: builder.mutation({
      query: (body) => ({
        url: `/files`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.curriculumFile],
    }),

    // Get Curriculum File By Name
    getCurriculumFileByName: builder.mutation<Blob, string>({
      query: (fileName) => ({
        url: `/files/${encodeURIComponent(fileName)}`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Get subject assignment documents
    getSubjectAssignmentDocuments: builder.query({
      query: ({ subjectAssignmentId, subjectId }) => ({
        url: `/subject-assignments/${subjectAssignmentId}/subjects/${subjectId}/documents`,
        method: 'GET',
      }),
      providesTags: [academicType.curriculumFile],
    }),
    // Get core-elective subjects by academicMediumId
    getCoreElectiveSubjects: builder.query({
      query: ({ academicMediumId }) => ({
        url: `/academics/curriculum/${academicMediumId}/core-elective-subjects`,
        method: 'GET',
      }),
      providesTags: [academicType.subjectAssignment],
    }),

    // Get KPI summary cards for a class
    getSubjectKpi: builder.query({
      query: ({ classId }) => ({
        url: `/academics/curriculum/${classId}/subject-kpi`,
        method: 'GET',
      }),
      providesTags: [academicType.subjectAssignment],
    }),

    // Get publish readiness report for a class
    getPublishReadiness: builder.query({
      query: ({ classId }) => ({
        url: `/academics/curriculum/${classId}/publish-readiness`,
        method: 'GET',
      }),
      providesTags: [academicType.subjectAssignment],
    }),

    // Get setup health for a single assignment
    getSetupHealth: builder.query({
      query: ({ assignmentId }) => ({
        url: `/academics/curriculum/subject-assignments/${assignmentId}/setup-health`,
        method: 'GET',
      }),
      providesTags: [academicType.subjectAssignment],
    }),

    // Get teacher workload
    getTeacherWorkload: builder.query({
      query: ({ teacherId }) => ({
        url: `/academics/curriculum/teachers/${teacherId}/workload`,
        method: 'GET',
      }),
    }),

    // Archive assignment (safe alternative to delete)
    archiveSubjectAssignment: builder.mutation({
      query: ({ assignmentId }) => ({
        url: `/academics/curriculum/subject-assignments/${assignmentId}/archive`,
        method: 'POST',
      }),
      invalidatesTags: [academicType.subjectAssignment],
    }),

    // Restore archived assignment back to draft
    restoreSubjectAssignment: builder.mutation({
      query: ({ assignmentId }) => ({
        url: `/academics/curriculum/subject-assignments/${assignmentId}/restore`,
        method: 'POST',
      }),
      invalidatesTags: [academicType.subjectAssignment],
    }),

    // Copy subject assignments to target classes
    copySubjectAssignments: builder.mutation({
      query: (body) => ({
        url: `/academics/curriculum/subject-assignments/copy`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.subjectAssignment],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetSubjectAssignmentsQuery,
  useGetSubjectAssignmentByIdQuery,
  useAddSubjectAssignmentMutation,
  useUpdateSubjectAssignmentMutation,
  useDeleteSubjectAssignmentMutation,
  usePublishSubjectAssignmentMutation,
  useUploadCurriculumFileMutation,
  useGetCurriculumFileByNameMutation,
  useGetSubjectAssignmentDocumentsQuery,
  useGetCoreElectiveSubjectsQuery,
  useGetSubjectKpiQuery,
  useGetPublishReadinessQuery,
  useGetSetupHealthQuery,
  useGetTeacherWorkloadQuery,
  useArchiveSubjectAssignmentMutation,
  useRestoreSubjectAssignmentMutation,
  useCopySubjectAssignmentsMutation,
} = subjectAssignmentsApi;
