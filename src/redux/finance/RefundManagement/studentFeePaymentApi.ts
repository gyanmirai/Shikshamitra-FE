import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../financeModuleApi';

export const studentFeePaymentApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentFeePayments: builder.query({
      query: (studentId: string) => ({
        url: `/studentFeePaymentData?studentId=${studentId}`,
        method: 'GET',
      }),
      transformResponse: (response: any[]) => response?.[0] ?? null,
      providesTags: [financeModuleType.feeRefund],
    }),

    submitFeeRefund: builder.mutation({
      query: (body) => ({
        url: '/fee-refund',
        method: 'POST',
        body,
      }),
      invalidatesTags: [financeModuleType.feeRefund],
    }),
  }),
  overrideExisting: false,
});

export const { useGetStudentFeePaymentsQuery, useSubmitFeeRefundMutation } = studentFeePaymentApi;
