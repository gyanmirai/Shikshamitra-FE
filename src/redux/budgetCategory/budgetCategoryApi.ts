import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const budgetCategoryApi = createApi({
  reducerPath: 'budgetCategoryApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['budgetCategory'],
  endpoints: (builder) => ({
    getbudgetCategory: builder.query({
      query: () => ({ url: '/app/budget-category', redirect: 'follow' }),
      providesTags: ['budgetCategory'],
    }),
    getbudgetCategoryById: builder.query({
      query: (id) => ({ url: `/app/budget-category/${id}`, redirect: 'follow' }),
      providesTags: ['budgetCategory'],
    }),
    addbudgetCategory: builder.mutation({
      query: (body) => ({
        url: '/app/budget-category',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['budgetCategory'],
    }),
    updatebudgetCategory: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/budget-category/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['budgetCategory'],
    }),
    deletebudgetCategory: builder.mutation({
      query: (id) => ({
        url: `/app/budget-category/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['budgetCategory'],
    }),
  }),
});

export const {
  useAddbudgetCategoryMutation,
  useDeletebudgetCategoryMutation,
  useGetbudgetCategoryByIdQuery,
  useGetbudgetCategoryQuery,
  useLazyGetbudgetCategoryByIdQuery,
  useLazyGetbudgetCategoryQuery,
  useUpdatebudgetCategoryMutation,
} = budgetCategoryApi;
