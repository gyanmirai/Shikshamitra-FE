import type {
  AdjustmentAuditLogInput,
  AdjustmentPendingFeeDto,
  ApplyAdjustmentRequestInput,
} from 'src/screens/finance/adjustments/types/adjustmentApply.types';

import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../financeModuleApi';

export interface GetAdjustmentPendingFeesInput {
  studentId: string;
  adjustmentId: string;
}

export interface GetAdjustmentPendingFeesOutput {
  studentId: string;
  adjustmentId: string;
  pendingFees: AdjustmentPendingFeeDto[];
}

export interface ApplyAdjustmentOutput {
  adjustmentId: string;
  status: string;
  appliedAmount: number;
  remainingAdjustmentBalance: number;
}

export const adjustmentApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdjustmentPendingFees: builder.query<
      GetAdjustmentPendingFeesOutput,
      GetAdjustmentPendingFeesInput
    >({
      query: (params) => ({
        url: '/adjustments/pending-fees',
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.feeDetails],
    }),

    applyAdjustment: builder.mutation<ApplyAdjustmentOutput, ApplyAdjustmentRequestInput>({
      query: ({ adjustmentId, ...body }) => ({
        url: `/adjustments/${adjustmentId}/apply`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [financeModuleType.feeDetails, financeModuleType.feeCollection],
    }),

    createAdjustmentAuditLog: builder.mutation<void, AdjustmentAuditLogInput>({
      query: (body) => ({
        url: '/adjustments/audit-logs',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLazyGetAdjustmentPendingFeesQuery,
  useApplyAdjustmentMutation,
  useCreateAdjustmentAuditLogMutation,
} = adjustmentApi;
