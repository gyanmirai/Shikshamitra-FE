import { api } from 'src/redux/service';
import { studentAdmissionsCrmType as tags } from 'src/redux/tagTypes';

import { unwrapPayment, paymentStageUrl } from './admission-payment-types';

import type { AdmissionPaymentStage, AdmissionPaymentCommand, AdmissionPaymentStageKey } from './admission-payment-types';

const paymentTags = [tags.admissionApplication];
export const admissionPaymentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionPaymentStage: builder.query<AdmissionPaymentStage, AdmissionPaymentStageKey>({
      query: paymentStageUrl,
      transformResponse: unwrapPayment<AdmissionPaymentStage>,
      providesTags: paymentTags,
    }),
    recordAdmissionPayment: builder.mutation<AdmissionPaymentStage, AdmissionPaymentCommand & {
      amount: number; method: string; externalReference?: string; notes?: string; idempotencyKey: string;
    }>({
      query: ({ applicationId, stageId, ...body }) => ({
        url: `${paymentStageUrl({ applicationId, stageId })}/transactions`, method: 'POST', body,
      }),
      transformResponse: unwrapPayment<AdmissionPaymentStage>, invalidatesTags: paymentTags,
    }),
    reviewAdmissionPayment: builder.mutation<AdmissionPaymentStage, {
      transactionId: string; approved: boolean; reason?: string; concurrencyStamp: string;
      transactionConcurrencyStamp: string; idempotencyKey: string;
    }>({
      query: ({ transactionId, ...body }) => ({
        url: `/student/enrollment/admissions/payments/transactions/${transactionId}/review`, method: 'POST', body,
      }),
      transformResponse: unwrapPayment<AdmissionPaymentStage>, invalidatesTags: paymentTags,
    }),
    waiveAdmissionPayment: builder.mutation<AdmissionPaymentStage, AdmissionPaymentCommand & { reason: string; idempotencyKey: string }>({
      query: ({ applicationId, stageId, ...body }) => ({
        url: `${paymentStageUrl({ applicationId, stageId })}/waive`, method: 'POST', body,
      }),
      transformResponse: unwrapPayment<AdmissionPaymentStage>, invalidatesTags: paymentTags,
    }),
    reverseAdmissionPayment: builder.mutation<AdmissionPaymentStage, {
      transactionId: string; reason: string; idempotencyKey: string; concurrencyStamp: string;
      transactionConcurrencyStamp: string;
    }>({
      query: ({ transactionId, ...body }) => ({
        url: `/student/enrollment/admissions/payments/transactions/${transactionId}/reverse`, method: 'POST', body,
      }),
      transformResponse: unwrapPayment<AdmissionPaymentStage>, invalidatesTags: paymentTags,
    }),
  }),
});
export const { useGetAdmissionPaymentStageQuery, useRecordAdmissionPaymentMutation,
  useReviewAdmissionPaymentMutation, useWaiveAdmissionPaymentMutation,
  useReverseAdmissionPaymentMutation } = admissionPaymentApi;
