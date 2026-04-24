import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const assignmentApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET all assignments
    getAssignments: builder.query({
      query: ({ academicMediumId, StandardId, DivisionId, SubjectId, AssignmentDate }) => ({
        url: `/academic/assignments`,
        method: 'GET',
        params: {
          ...(academicMediumId && { academicMediumId }),
          ...(StandardId && { StandardId }),
          ...(DivisionId && { DivisionId }),
          ...(SubjectId && { SubjectId }),
          ...(AssignmentDate && { AssignmentDate }),
        },
      }),
      providesTags: [academicType.assignment],
    }),

    // GET assignment by id
    getAssignmentById: builder.query({
      query: ({
        assignmentId,
        academicMediumId,
      }: {
        assignmentId: string;
        academicMediumId?: string;
      }) => ({
        url: `/academic/assignments/${assignmentId}`,
        method: 'GET',
        params: {
          ...(academicMediumId && { academicMediumId }),
        },
      }),
      providesTags: [academicType.assignment],
    }),

    // CREATE assignment (multipart/form-data)
    addAssignment: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: `/academic/assignments`,
        method: 'POST',
        params: { academicMediumId },
        body,
      }),
      invalidatesTags: [academicType.assignment],
    }),

    // DELETE assignment
    deleteAssignment: builder.mutation({
      query: (assignmentId) => ({
        url: `/academic/assignments/${assignmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [academicType.assignment],
    }),

    // UPDATE assignment status
    updateAssignmentStatus: builder.mutation({
      query: (assignmentId: string) => ({
        url: `/academic/assignments/${assignmentId}/status`,
        method: 'PATCH',
        body: {},
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
  useDeleteAssignmentMutation,
  useUpdateAssignmentStatusMutation,
} = assignmentApi;
