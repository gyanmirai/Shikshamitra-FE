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
          academicMediumId,
          StandardId,
          DivisionId,
          SubjectId,
          AssignmentDate,
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
          academicMediumId,
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
      invalidatesTags: [academicType.assignment, academicType.chapter],
    }),

    // DELETE assignment
    deleteAssignment: builder.mutation({
      query: (assignmentId) => ({
        url: `/academic/assignments/${assignmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [academicType.assignment, academicType.chapter],
    }),

    // UPDATE assignment (multipart/form-data)
    updateAssignment: builder.mutation({
      query: ({ assignmentId, body }: { assignmentId: string; body: FormData }) => ({
        url: `/academic/assignments/${assignmentId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.assignment, academicType.chapter],
    }),

    // UPDATE assignment status
    updateAssignmentStatus: builder.mutation<any, { assignmentId: string; status: number }>({
      query: ({ assignmentId, status }) => ({
        url: `/academic/assignments/${assignmentId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: [academicType.assignment, academicType.chapter],
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
  useUpdateAssignmentStatusMutation,
} = assignmentApi;
