import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const homeworkTypeApi = createApi({
  reducerPath: 'homeworkTypeApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['HomeworkType'],
  endpoints: (builder) => ({
    getHomeworkTypes: builder.query<any, void>({
      query: () => ({ url: '/homework-type', method: 'GET' }),
      providesTags: ['HomeworkType'],
    }),
    getHomeworkTypeById: builder.query<any, string | number>({
      query: (id) => ({ url: `/homework-type/${id}`, method: 'GET' }),
      providesTags: ['HomeworkType'],
    }),
    addHomeworkType: builder.mutation({
      query: (body) => ({
        url: '/homework-type',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['HomeworkType'],
    }),
    updateHomeworkType: builder.mutation({
      query: ({ id, body }) => ({
        url: `/homework-type/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['HomeworkType'],
    }),
    deleteHomeworkType: builder.mutation({
      query: (id) => ({
        url: `/homework-type/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['HomeworkType'],
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
