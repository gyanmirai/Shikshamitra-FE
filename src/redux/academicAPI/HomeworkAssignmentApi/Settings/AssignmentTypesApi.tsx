import { academicApi } from '../../academicApi';
import { academicType } from 'src/redux/tagTypes';


export const assignmentTypesApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all assignment types under academic medium
    getAssignmentTypes: builder.query({
      query: () => ({
        url: `/assignment-type`,
        method: 'GET',
      }),
      providesTags: [academicType.assignmentType],
    }),

    // Get specific assignment type by ID
    getAssignmentTypeById: builder.query({
      query: ({ id }: { id: string }) => ({
        url: `/assignment-type/${id}`,
        method: 'GET',
      }),
      providesTags: [academicType.assignmentType],
    }),

    // Add new assignment type
    addAssignmentType: builder.mutation({
      query: ({ name }: { name: string }) => ({
        url: `/assignment-type`,
        method: 'POST',
        params: { name },
      }),
      invalidatesTags: [academicType.assignmentType],
    }),

    // Update assignment type
    updateAssignmentType: builder.mutation({
      query: ({ assignmentTypeId, name }: { assignmentTypeId: string; name: string }) => ({
        url: `/assignment-type/${assignmentTypeId}`,
        method: 'PUT',
        params: { name },
      }),
      invalidatesTags: [academicType.assignmentType],
    }),

    // Delete assignment type
    deleteAssignmentType: builder.mutation({
      query: ({ assignmentTypeId }: { assignmentTypeId: string }) => ({
        url: `/assignment-type/${assignmentTypeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [academicType.assignmentType],
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
