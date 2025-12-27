import { academicApi } from '../../academicApi';

export const homeworkTypesApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all homework types under academic medium
    getHomeworkTypes: builder.query({
      query: ({ academicMediumId }: { academicMediumId: string }) => ({
        url: `/homework-type`,
        method: 'GET',
        params: { academicMediumId },
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
      query: ({ academicMediumId, body }: { academicMediumId: string; body: any }) => ({
        url: `/homework-type`,
        method: 'POST',
        params: { academicMediumId },
        data: body,
      }),
      invalidatesTags: ['HomeworkType'],
    }),

    // Update homework type
    updateHomeworkType: builder.mutation({
      query: ({
        academicMediumId,
        id,
        body,
      }: {
        academicMediumId: string;
        id: string;
        body: any;
      }) => ({
        url: `/homework-type/${id}`,
        method: 'PUT',
        params: { academicMediumId },
        data: body,
      }),
      invalidatesTags: ['HomeworkType'],
    }),

    // Delete homework type
    deleteHomeworkType: builder.mutation({
      query: ({ academicMediumId, id }: { academicMediumId: string; id: string }) => ({
        url: `/homework-type/${id}`,
        method: 'DELETE',
        params: { academicMediumId },
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
