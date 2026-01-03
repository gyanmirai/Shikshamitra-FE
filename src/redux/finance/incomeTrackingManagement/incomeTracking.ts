import { financeModuleApi } from '../financeModuleApi';

export const incomeCategoryApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getIncomeCategories: builder.query({
      query: (academicYearId) => ({
        url: `/finance/incomes?academicYearId=${academicYearId}`,
        method: 'GET',
      }),
      providesTags: ['IncomeCategories'],
    }),

    getIncomeCategoryById: builder.query({
      query: (incomeId) => ({
        url: `/finance/incomes/${incomeId}`,
        method: 'GET',
      }),
      providesTags: ['IncomeCategories'],
    }),

    addIncomeCategory: builder.mutation({
      query: (body: any) => ({
        url: `/finance/incomes`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['IncomeCategories'],
    }),
    updateIncomeCategory: builder.mutation({
      query: ({ incomeId, body }: { incomeId: string; body: any }) => ({
        url: `/finance/incomes/${incomeId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['IncomeCategories'],
    }),
    deleteIncomeCategory: builder.mutation({
      query: (incomeId) => ({
        url: `/finance/incomes/${incomeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['IncomeCategories'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetIncomeCategoriesQuery,
  useGetIncomeCategoryByIdQuery,
  useAddIncomeCategoryMutation,
  useUpdateIncomeCategoryMutation,
  useDeleteIncomeCategoryMutation,
} = incomeCategoryApi;
