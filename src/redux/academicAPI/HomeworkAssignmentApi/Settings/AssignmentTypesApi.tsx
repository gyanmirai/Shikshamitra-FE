import { academicApi } from '../../academicApi';

export const assignmentTypesApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all assignment types under academic medium
    getAssignmentTypes: builder.query({
      query: ({ academicMediumId }: { academicMediumId: string }) => ({
        url: `/assignment-type`,
        method: 'GET',
        params: { academicMediumId },
      }),
      providesTags: ['AssignmentType'],
    }),

    // Get specific assignment type by ID
    getAssignmentTypeById: builder.query({
      query: ({ academicMediumId, id }: { academicMediumId: string; id: string }) => ({
        url: `/assignment-type/${id}`,
        method: 'GET',
        params: { academicMediumId },
      }),
      providesTags: ['AssignmentType'],
    }),

    // Add new assignment type
    addAssignmentType: builder.mutation({
      query: ({ academicMediumId, body }: { academicMediumId: string; body: any }) => ({
        url: `/assignment-type`,
        method: 'POST',
        params: { academicMediumId },
        data: body,
      }),
      invalidatesTags: ['AssignmentType'],
    }),

    // Update assignment type
    updateAssignmentType: builder.mutation({
      query: ({
        academicMediumId,
        id,
        body,
      }: {
        academicMediumId: string;
        id: string;
        body: any;
      }) => ({
        url: `/assignment-type/${id}`,
        method: 'PUT',
        params: { academicMediumId },
        data: body,
      }),
      invalidatesTags: ['AssignmentType'],
    }),

    // Delete assignment type
    deleteAssignmentType: builder.mutation({
      query: ({ academicMediumId, id }: { academicMediumId: string; id: string }) => ({
        url: `/assignment-type/${id}`,
        method: 'DELETE',
        params: { academicMediumId },
      }),
      invalidatesTags: ['AssignmentType'],
    }),
  }),
  overrideExisting: false,
});

// RTK query hooks
export const {
  useGetAssignmentTypesQuery,
  useGetAssignmentTypeByIdQuery,
  useAddAssignmentTypeMutation,
  useUpdateAssignmentTypeMutation,
  useDeleteAssignmentTypeMutation,
} = assignmentTypesApi;
