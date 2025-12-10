import { academicApi } from '../../academicApi';

export const subjectAssignmentsApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all subject assignments - academicMediumId passed in query params
    getSubjectAssignments: builder.query({
      query: ({ academicMediumId }) => ({
        url: `/subject-assignments`,
        method: 'GET',
        params: { academicMediumId }, // ✔ QUERY param
      }),
      providesTags: ['SubjectAssignment'],
    }),

    // Get one assignment - academicMediumId also optional in query param
    getSubjectAssignmentById: builder.query({
      query: ({ assignmentId, academicMediumId }) => ({
        url: `/subject-assignments/${assignmentId}`,
        method: 'GET',
        params: academicMediumId ? { academicMediumId } : undefined, // Optional param
      }),
      providesTags: ['SubjectAssignment'],
    }),

    // Create assignment
    addSubjectAssignment: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: `/subject-assignments`,
        method: 'POST',
        params: { academicMediumId }, // QUERY param again
        data: body,
      }),
      invalidatesTags: ['SubjectAssignment'],
    }),

    // Update assignment
    updateSubjectAssignment: builder.mutation({
      query: ({ assignmentId, academicMediumId, body }) => ({
        url: `/subject-assignments/${assignmentId}`,
        method: 'PUT',
        params: { academicMediumId }, // passing query again
        data: body,
      }),
      invalidatesTags: ['SubjectAssignment'],
    }),

    // Delete assignment
    deleteSubjectAssignment: builder.mutation({
      query: ({ assignmentId, academicMediumId }) => ({
        url: `/subject-assignments/${assignmentId}`,
        method: 'DELETE',
        params: { academicMediumId }, // passed in query
      }),
      invalidatesTags: ['SubjectAssignment'],
    }),

    // Publish assignment
    publishSubjectAssignment: builder.mutation({
      query: ({ assignmentId, academicMediumId }) => ({
        url: `/subject-assignments/${assignmentId}/publish`,
        method: 'PATCH',
        params: { academicMediumId }, // query param
      }),
      invalidatesTags: ['SubjectAssignment'],
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
} = subjectAssignmentsApi;
