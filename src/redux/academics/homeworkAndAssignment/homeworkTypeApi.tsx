import { api } from 'src/redux/service';
import { homeworkType } from 'src/redux/tagTypes';

export const homeworkTypeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHomeworkTypes: builder.query<any, void>({
      query: () => ({ url: '/homework-type', method: 'GET' }),
      providesTags: [homeworkType.homeworkType],
    }),
    getHomeworkTypeById: builder.query<any, string | number>({
      query: (id) => ({ url: `/homework-type/${id}`, method: 'GET' }),
      providesTags: [homeworkType.homeworkType],
    }),
    addHomeworkType: builder.mutation({
      query: (body) => ({
        url: '/homework-type',
        method: 'POST',
        body,
      }),
      invalidatesTags: [homeworkType.homeworkType],
    }),
    updateHomeworkType: builder.mutation({
      query: ({ id, body }) => ({
        url: `/homework-type/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [homeworkType.homeworkType],
    }),
    deleteHomeworkType: builder.mutation({
      query: (id) => ({
        url: `/homework-type/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [homeworkType.homeworkType],
    }),
  }),
});

export const {
  useGetHomeworkTypesQuery,
  useGetHomeworkTypeByIdQuery,
  useLazyGetHomeworkTypeByIdQuery,
  useAddHomeworkTypeMutation,
  useUpdateHomeworkTypeMutation,
  useDeleteHomeworkTypeMutation,
} = homeworkTypeApi;
