import { budgetCategoryType } from 'src/redux/tagTypes';

import { api } from '../service';

export const budgetCategoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getbudgetCategory: builder.query({
      query: () => ({ url: '/app/budget-category', redirect: 'follow' }),
      providesTags: [budgetCategoryType.budgetCategoryData],
    }),
    getbudgetCategoryById: builder.query({
      query: (id) => ({ url: `/app/budget-category/${id}`, redirect: 'follow' }),
      providesTags: [budgetCategoryType.budgetCategoryData],
    }),
    addbudgetCategory: builder.mutation({
      query: (body) => ({
        url: '/app/budget-category',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [budgetCategoryType.budgetCategoryData],
    }),
    updatebudgetCategory: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/budget-category/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [budgetCategoryType.budgetCategoryData],
    }),
    deletebudgetCategory: builder.mutation({
      query: (id) => ({
        url: `/app/budget-category/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [budgetCategoryType.budgetCategoryData],
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
