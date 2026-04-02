import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../financeModuleApi';

export const expenseTrackingApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenseDetails: builder.query({
      query: (params) => ({
        url: '/expenses',
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.expenseDetails],
    }),
    getExpenseById: builder.query({
      query: (expenseId: string) => ({
        url: `/expenses/${expenseId}`,
        method: 'GET',
      }),
      providesTags: [financeModuleType.expenseDetails],
    }),
    postExpenseDetails: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/expenses',
        method: 'POST',
        body,
        params: { academicYearId },
      }),
      invalidatesTags: [financeModuleType.expenseDetails],
    }),
    putExpenseDetails: builder.mutation({
      query: ({ expenseId, academicYearId, body }) => ({
        url: `/expenses/${expenseId}`,
        method: 'PUT',
        body,
        params: { academicYearId },
      }),
      invalidatesTags: [financeModuleType.expenseDetails],
    }),
    deleteExpenseDetails: builder.mutation({
      query: (expenseId: string) => ({
        url: `/expenses/${expenseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financeModuleType.expenseDetails],
    }),
    getExpenseList: builder.query({
      query: () => ({
        url: '/expenseListData',
        method: 'GET',
      }),
      providesTags: [financeModuleType.expenseDetails],
    }),
    getExpenseOptions: builder.query({
      query: () => ({
        url: '/expenseOptions',
        method: 'GET',
      }),
      providesTags: [financeModuleType.expenseOptions],
    }),
    getPaymentMethodsConfig: builder.query({
      query: () => ({
        url: '/paymentMethodsConfig',
        method: 'GET',
      }),
      providesTags: [financeModuleType.paymentMethodsConfig],
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
