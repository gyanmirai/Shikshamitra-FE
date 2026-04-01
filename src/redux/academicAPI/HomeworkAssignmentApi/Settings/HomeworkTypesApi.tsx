import { academicApi } from '../../academicApi';
import { academicType } from 'src/redux/tagTypes';


export const homeworkTypesApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all homework types under academic medium
    getHomeworkTypes: builder.query({
      query: () => ({
        url: `/homework-type`,
        method: 'GET',
      }),
      providesTags: [academicType.homeworkType],
    }),

    // Get specific homework type by ID
    getHomeworkTypeById: builder.query({
      query: ({ academicMediumId, id }: { academicMediumId: string; id: string }) => ({
        url: `/homework-type/${id}`,
        method: 'GET',
        params: { academicMediumId },
      }),
      providesTags: [academicType.homeworkType],
    }),

    // Add new homework type
    addHomeworkType: builder.mutation({
      query: ({ name }: { name: string }) => ({
        url: `/homework-type`,
        method: 'POST',
        params: { name },
      }),
      invalidatesTags: [academicType.homeworkType],
    }),

    // Update homework type
    updateHomeworkType: builder.mutation({
      query: ({ homeworkTypeId, name }: { homeworkTypeId: string; name: string }) => ({
        url: `/homework-type/${homeworkTypeId}`,
        method: 'PUT',
        params: { name },
      }),
      invalidatesTags: [academicType.homeworkType],
    }),

    // Delete homework type
    deleteHomeworkType: builder.mutation({
      query: ({ homeworkTypeId }: { homeworkTypeId: string }) => ({
        url: `/homework-type/${homeworkTypeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [academicType.homeworkType],
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
