import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const subjectAssignmentsApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all subject assignments - academicMediumId passed in query params
    getSubjectAssignments: builder.query({
      query: ({ academicMediumId, standardId }) => ({
        url: `/academics/curriculum/${standardId}/subject-assignments`,
        method: 'GET',
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
      invalidatesTags: [academicType.subjectAssignment],
    }),

    // Delete assignment
    deleteSubjectAssignment: builder.mutation({
      query: ({ assignmentId }) => ({
        url: `/academics/curriculum/subject-assignments/${assignmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [academicType.subjectAssignment],
    }),

    // Publish assignment
    publishSubjectAssignment: builder.mutation({
      query: ({ assignmentId, status }) => ({
        url: `/academics/curriculum/subject-assignments/${assignmentId}/status`,
        method: 'PATCH',
        data: { status },
      }),
      invalidatesTags: [academicType.subjectAssignment],
    }),

    // Upload Curriculum File
    uploadCurriculumFile: builder.mutation({
      query: (body) => ({
        url: `/academics/curriculum/files`,
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: [academicType.curriculumFile],
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
  useGetSubjectAssignmentDocumentsQuery,
  useGetCoreElectiveSubjectsQuery,
} = subjectAssignmentsApi;
