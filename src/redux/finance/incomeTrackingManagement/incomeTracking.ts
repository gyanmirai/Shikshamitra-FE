import { financeModuleApi } from '../financeModuleApi';

export const incomeTrackingApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getIncomeTracking: builder.query({
      query: ({ academicYearId, page = 1, pageSize = 20, search = '' }) => ({
        url: `/incomes`,
        method: 'GET',
        params: { academicYearId, page, pageSize, search },
      }),
      providesTags: ['IncomeTracking'],
    }),

    getIncomeTrackingById: builder.query({
      query: (incomeId) => ({
        url: `/incomes/${incomeId}`,
        method: 'GET',
      }),
      providesTags: ['IncomeTracking'],
    }),

    addIncomeTracking: builder.mutation({
      query: ({ academicYearId, body }: { academicYearId: string; body: any }) => ({
        url: `/incomes`,
        method: 'POST',
        params: { academicYearId },
        data: body,
      }),
      invalidatesTags: ['IncomeTracking'],
    }),
    updateIncomeTracking: builder.mutation({
      query: ({
        incomeId,
        academicYearId,
        body,
      }: {
        incomeId: string;
        academicYearId: string;
        body: any;
      }) => ({
        url: `/incomes/${incomeId}`,
        method: 'PUT',
        params: { academicYearId },
        data: body,
      }),
      invalidatesTags: ['IncomeTracking'],
    }),
    deleteIncomeTracking: builder.mutation({
      query: (incomeId) => ({
        url: `/incomes/${incomeId}`,
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
