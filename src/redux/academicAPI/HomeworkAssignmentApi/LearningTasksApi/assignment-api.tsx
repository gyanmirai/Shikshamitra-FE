import { academicType } from 'src/redux/tagTypes';

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
      providesTags: [academicType.assignment],
    }),

    // GET assignment by id
    getAssignmentById: builder.query({
      query: (assignmentId) => ({
        url: `app/assignment/${assignmentId}`,
        method: 'GET',
      }),
      providesTags: [academicType.assignment],
    }),

    // CREATE assignment
    addAssignment: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: `app/assignment?academicMediumId=${academicMediumId}`,
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: [academicType.assignment],
    }),

    // UPDATE assignment
    updateAssignment: builder.mutation({
      query: ({ assignmentId, body }) => ({
        url: `app/assignment/${assignmentId}`,
        method: 'PUT',
        body,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: [academicType.assignment],
    }),

    // DELETE assignment
    deleteAssignment: builder.mutation({
      query: (assignmentId) => ({
        url: `app/assignment/${assignmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [academicType.assignment],
    }),

    // PUBLISH assignment
    publishAssignment: builder.mutation({
      query: ({ assignmentId, status }) => ({
        url: `app/assignment/${assignmentId}/publish`,
        method: 'POST',
        data: { status },
      }),
      invalidatesTags: [academicType.assignment],
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
