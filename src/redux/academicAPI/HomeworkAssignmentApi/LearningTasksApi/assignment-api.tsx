import { academicApi } from '../../academicApi';

export const assignmentApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET all assignments
    getAssignments: builder.query({
      query: ({ academicMediumId, classId }) => ({
        url: `app/assignment`,
        method: 'GET',
        params: {
          academicMediumId,
          classId,
        },
      }),
      providesTags: ['Assignment'],
    }),

    // GET assignment by id
    getAssignmentById: builder.query({
      query: ({ id, academicMediumId }) => ({
        url: `app/assignment/${id}`,
        method: 'GET',
        params: {
          academicMediumId,
        },
      }),
      providesTags: ['Assignment'],
    }),

    // CREATE assignment
    addAssignment: builder.mutation({
      query: ({ academicMediumId, ...body }) => ({
        url: `app/assignment?academicMediumId=${academicMediumId}`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Assignment'],
    }),

    // UPDATE assignment
    updateAssignment: builder.mutation({
      query: ({ id, academicMediumId, body }) => ({
        url: `app/assignment/${id}`,
        method: 'PUT',
        data: body,
        params: {
          academicMediumId,
        },
      }),
      invalidatesTags: ['Assignment'],
    }),

    // DELETE assignment
    deleteAssignment: builder.mutation({
      query: ({ id, academicMediumId }) => ({
        url: `app/assignment/${id}`,
        method: 'DELETE',
        params: {
          academicMediumId,
        },
      }),
      invalidatesTags: ['Assignment'],
    }),

    // PUBLISH assignment
    publishAssignment: builder.mutation({
      query: ({ id, academicMediumId }) => ({
        url: `app/assignment/${id}/publish/${academicMediumId}`,
        method: 'POST',
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
