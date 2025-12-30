import { academicApi } from '../../academicApi';

export const homeworkTypesApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all homework types under academic medium
    getHomeworkTypes: builder.query({
      query: () => ({
        url: `/homework-type`,
        method: 'GET',
      }),
      providesTags: ['HomeworkType'],
    }),

    // Get specific homework type by ID
    getHomeworkTypeById: builder.query({
      query: ({ academicMediumId, id }: { academicMediumId: string; id: string }) => ({
        url: `/homework-type/${id}`,
        method: 'GET',
        params: { academicMediumId },
      }),
      providesTags: ['HomeworkType'],
    }),

    // Add new homework type
    addHomeworkType: builder.mutation({
      query: ({ name }: { name: string }) => ({
        url: `/homework-type`,
        method: 'POST',
        params: { name },
      }),
      invalidatesTags: ['HomeworkType'],
    }),

    // Update homework type
    updateHomeworkType: builder.mutation({
      query: ({ homeworkTypeId, name }: { homeworkTypeId: string; name: string }) => ({
        url: `/homework-type/${homeworkTypeId}`,
        method: 'PUT',
        params: { name },
      }),
      invalidatesTags: ['HomeworkType'],
    }),

    // Delete homework type
    deleteHomeworkType: builder.mutation({
      query: ({ homeworkTypeId }: { homeworkTypeId: string }) => ({
        url: `/homework-type/${homeworkTypeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['HomeworkType'],
    }),
  }),
  overrideExisting: false,
});

// RTK query hooks
export const {
  useGetHomeworkTypesQuery,
  useGetHomeworkTypeByIdQuery,
  useAddHomeworkTypeMutation,
  useUpdateHomeworkTypeMutation,
  useDeleteHomeworkTypeMutation,
} = homeworkTypesApi;
