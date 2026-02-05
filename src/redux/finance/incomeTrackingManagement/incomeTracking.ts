import { financeModuleApi } from '../financeModuleApi';

export const incomeTrackingApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getIncomeTracking: builder.query({
      query: (academicYearId) => ({
        url: `/finance/incomes?academicYearId=${academicYearId}`,
        method: 'GET',
      }),
      providesTags: ['IncomeTracking'],
    }),

    getIncomeTrackingById: builder.query({
      query: (incomeId) => ({
        url: `/finance/incomes/${incomeId}`,
        method: 'GET',
      }),
      providesTags: ['IncomeTracking'],
    }),

    addIncomeTracking: builder.mutation({
      query: (body: any) => ({
        url: `/finance/incomes`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['IncomeTracking'],
    }),
    updateIncomeTracking: builder.mutation({
      query: ({ incomeId, body }: { incomeId: string; body: any }) => ({
        url: `/finance/incomes/${incomeId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['IncomeTracking'],
    }),
    deleteIncomeTracking: builder.mutation({
      query: (incomeId) => ({
        url: `/finance/incomes/${incomeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['IncomeTracking'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetIncomeTrackingQuery,
  useGetIncomeTrackingByIdQuery,
  useAddIncomeTrackingMutation,
  useUpdateIncomeTrackingMutation,
  useDeleteIncomeTrackingMutation,
} = incomeTrackingApi;
