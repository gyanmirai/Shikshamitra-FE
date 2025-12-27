import { academicApi } from '../../academicApi';

export const assignmentApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET all assignments
    getAssignments: builder.query({
      query: ({ classId, divisionId, subjectId, assignmentDate }) => ({
        url: `app/assignment`,
        method: 'GET',
        params: {
          classId,
          divisionId,
          subjectId,
          assignmentDate,
        },
      }),
      providesTags: ['Assignment'],
    }),

    // GET assignment by id
    getAssignmentById: builder.query({
      query: (assignmentId) => ({
        url: `app/assignment/${assignmentId}`,
        method: 'GET',
      }),
      providesTags: ['Assignment'],
    }),

    // CREATE assignment
    addAssignment: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: `app/assignment?academicMediumId=${academicMediumId}`,
        method: 'POST',
        data: body,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: ['Assignment'],
    }),

    // UPDATE assignment
    updateAssignment: builder.mutation({
      query: ({ assignmentId, body }) => ({
        url: `app/assignment/${assignmentId}`,
        method: 'PUT',
        data: body,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: ['Assignment'],
    }),

    // DELETE assignment
    deleteAssignment: builder.mutation({
      query: (assignmentId) => ({
        url: `app/assignment/${assignmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Assignment'],
    }),

    // PUBLISH assignment
    publishAssignment: builder.mutation({
      query: ({ assignmentId, status }) => ({
        url: `app/assignment/${assignmentId}/publish`,
        method: 'POST',
        data: { status },
      }),
      invalidatesTags: ['Assignment'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetAssignmentsQuery,
  useGetAssignmentByIdQuery,
  useAddAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  usePublishAssignmentMutation,
} = assignmentApi;
