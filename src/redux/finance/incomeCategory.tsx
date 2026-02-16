import { financeModuleApi } from './financeModuleApi';

export const incomeCategoryApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getIncomeCategories: builder.query({
      query: ({ academicYearId }: { academicYearId: string }) => ({
        url: '/income-categories',
        method: 'GET',
        params: {
          academicYearId,
        },
      }),
      providesTags: ['incomeCategoryData'],
    }),

    postIncomeCategory: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/income-categories',
        method: 'POST',
        data: body,
        params: {
          academicYearId,
        },
      }),
      invalidatesTags: ['incomeCategoryData'],
    }),

    putIncomeCategory: builder.mutation({
      query: ({ incomeCategoryId, body }) => ({
        url: `/income-categories/${incomeCategoryId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['incomeCategoryData'],
    }),

    deleteIncomeCategory: builder.mutation({
      query: (incomeCategoryId: string) => ({
        url: `/income-categories/${incomeCategoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['incomeCategoryData'],
    }),
    getBudgetOptions: builder.query({
      query: () => ({ url: '/incomeOptions', method: 'GET' }),
      providesTags: ['incomeCategoryData'],
    }),
  }),
  overrideExisting: false,
});
export const {
  useGetIncomeCategoriesQuery,
  usePostIncomeCategoryMutation,
  usePutIncomeCategoryMutation,
  useDeleteIncomeCategoryMutation,
  useGetBudgetOptionsQuery,
} = incomeCategoryApi;
