import { financeModuleApi } from './financeModuleApi';
import { financeModuleType } from 'src/redux/tagTypes';


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
      providesTags: [financeModuleType.incomeCategoryData],
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
      invalidatesTags: [financeModuleType.incomeCategoryData],
    }),

    putIncomeCategory: builder.mutation({
      query: ({ incomeCategoryId, body }) => ({
        url: `/income-categories/${incomeCategoryId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [financeModuleType.incomeCategoryData],
    }),

    deleteIncomeCategory: builder.mutation({
      query: (incomeCategoryId: string) => ({
        url: `/income-categories/${incomeCategoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financeModuleType.incomeCategoryData],
    }),
    getBudgetOptions: builder.query({
      query: () => ({ url: '/incomeOptions', method: 'GET' }),
      providesTags: [financeModuleType.incomeCategoryData],
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
