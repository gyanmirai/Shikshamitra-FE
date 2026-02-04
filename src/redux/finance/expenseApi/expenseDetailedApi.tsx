import { financeModuleApi } from '../financeModuleApi';

export const expenseTrackingApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenseDetails: builder.query({
      query: () => ({
        url: '/finance/expenses',
        method: 'GET',
      }),
      providesTags: ['ExpenseDetails'],
    }),
    getExpenseById: builder.query({
      query: (expenseId: string) => ({
        url: `/finance/expenses/${expenseId}`,
        method: 'GET',
      }),
      providesTags: ['ExpenseDetails'],
    }),
    postExpenseDetails: builder.mutation({
      query: (body) => ({
        url: '/finance/expenses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ExpenseDetails'],
    }),
    putExpenseDetails: builder.mutation({
      query: ({ expenseId, body }) => ({
        url: `/finance/expenses/${expenseId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['ExpenseDetails'],
    }),
    deleteExpenseDetails: builder.mutation({
      query: (expenseId: string) => ({
        url: `/finance/expenses/${expenseId}`,
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
