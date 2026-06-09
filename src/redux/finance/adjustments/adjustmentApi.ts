import type {
  ApplyFeeAdjustmentDto,
  CreateFeeAdjustmentDto,
  FeeAdjustmentDetailDto,
  RejectFeeAdjustmentDto,
  AdjustmentEligibilityDto,
  ApplyFeeAdjustmentResultDto,
  FeeAdjustmentApplicationsDto,
  FeeAdjustmentApplyContextDto,
  RejectFeeAdjustmentResultDto,
  GetFeeAdjustmentApplicationsInput,
} from 'src/screens/finance/adjustments/types/adjustmentApi.types';

import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../financeModuleApi';

export const adjustmentApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdjustmentEligibility: builder.query<
      AdjustmentEligibilityDto,
      { studentId: string; academicYearId: string }
    >({
      query: (params) => ({
        url: '/fee-adjustments/eligibility',
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.feeAdjustment],
    }),

    getAdjustmentApplications: builder.query<
      FeeAdjustmentApplicationsDto,
      GetFeeAdjustmentApplicationsInput
    >({
      query: (params) => ({
        url: '/fee-adjustments/applications',
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.feeAdjustment],
    }),

    getFeeAdjustment: builder.query<FeeAdjustmentDetailDto, string>({
      query: (id) => ({
        url: `/fee-adjustments/${id}`,
        method: 'GET',
      }),
      providesTags: (_r, _e, id) => [{ type: financeModuleType.feeAdjustment, id }],
    }),

    createFeeAdjustment: builder.mutation<
      FeeAdjustmentDetailDto,
      { academicYearId: string; body: CreateFeeAdjustmentDto }
    >({
      query: ({ academicYearId, body }) => ({
        url: '/fee-adjustments',
        method: 'POST',
        params: { academicYearId },
        body,
      }),
      invalidatesTags: [financeModuleType.feeAdjustment, financeModuleType.feeCollection],
    }),

    updateFeeAdjustment: builder.mutation<
      FeeAdjustmentDetailDto,
      { id: string; academicYearId: string; body: CreateFeeAdjustmentDto }
    >({
      query: ({ id, academicYearId, body }) => ({
        url: `/fee-adjustments/${id}`,
        method: 'PUT',
        params: { academicYearId },
        body,
      }),
      invalidatesTags: [financeModuleType.feeAdjustment],
    }),

    deleteFeeAdjustment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/fee-adjustments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financeModuleType.feeAdjustment],
    }),

    getAdjustmentApplyContext: builder.query<FeeAdjustmentApplyContextDto, string>({
      query: (id) => ({
        url: `/fee-adjustments/${id}/apply-context`,
        method: 'GET',
      }),
      providesTags: [financeModuleType.feeDetails],
    }),

    applyFeeAdjustment: builder.mutation<
      ApplyFeeAdjustmentResultDto,
      { id: string; body: ApplyFeeAdjustmentDto; idempotencyKey: string }
    >({
      query: ({ id, body, idempotencyKey }) => ({
        url: `/fee-adjustments/${id}/apply`,
        method: 'POST',
        body,
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      }),
      invalidatesTags: [
        financeModuleType.feeAdjustment,
        financeModuleType.feeDetails,
        financeModuleType.feeCollection,
      ],
    }),

    rejectFeeAdjustment: builder.mutation<
      RejectFeeAdjustmentResultDto,
      { id: string; body: RejectFeeAdjustmentDto }
    >({
      query: ({ id, body }) => ({
        url: `/fee-adjustments/${id}/reject`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [financeModuleType.feeAdjustment],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdjustmentEligibilityQuery,
  useLazyGetAdjustmentEligibilityQuery,
  useGetAdjustmentApplicationsQuery,
  useLazyGetAdjustmentApplicationsQuery,
  useGetFeeAdjustmentQuery,
  useLazyGetFeeAdjustmentQuery,
  useGetAdjustmentApplyContextQuery,
  useLazyGetAdjustmentApplyContextQuery,
  useCreateFeeAdjustmentMutation,
  useApplyFeeAdjustmentMutation,
  useRejectFeeAdjustmentMutation,
} = adjustmentApi;
