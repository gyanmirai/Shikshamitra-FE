import { financeModuleApi } from '../financeModuleApi';

export const expenseTrackingApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenseDetails: builder.query({
      query: (params) => ({
        url: '/expenses',
        method: 'GET',
        params,
      }),
      providesTags: ['ExpenseDetails'],
    }),
    getExpenseById: builder.query({
      query: (expenseId: string) => ({
        url: `/expenses/${expenseId}`,
        method: 'GET',
      }),
      providesTags: ['ExpenseDetails'],
    }),
    postExpenseDetails: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/expenses',
        method: 'POST',
        data: body,
        params: { academicYearId },
      }),
      invalidatesTags: ['ExpenseDetails'],
    }),
    putExpenseDetails: builder.mutation({
      query: ({ expenseId, academicYearId, body }) => ({
        url: `/expenses/${expenseId}`,
        method: 'PUT',
        data: body,
        params: { academicYearId },
      }),
      invalidatesTags: ['ExpenseDetails'],
    }),
    deleteExpenseDetails: builder.mutation({
      query: (expenseId: string) => ({
        url: `/expenses/${expenseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ExpenseDetails'],
    }),
    getExpenseList: builder.query({
      query: () => ({
        url: '/expenseListData',
        method: 'GET',
      }),
      providesTags: ['ExpenseDetails'],
    }),
    getExpenseOptions: builder.query({
      query: () => ({
        url: '/expenseOptions',
        method: 'GET',
      }),
      providesTags: ['ExpenseOptions'],
    }),
    getPaymentMethodsConfig: builder.query({
      query: () => ({
        url: '/paymentMethodsConfig',
        method: 'GET',
      }),
      providesTags: ['paymentMethodsConfig'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetExpenseDetailsQuery,
  usePostExpenseDetailsMutation,
  usePutExpenseDetailsMutation,
  useDeleteExpenseDetailsMutation,
  useGetExpenseOptionsQuery,
  useGetExpenseByIdQuery,
  useGetExpenseListQuery,
  useGetPaymentMethodsConfigQuery,
} = expenseTrackingApi;
