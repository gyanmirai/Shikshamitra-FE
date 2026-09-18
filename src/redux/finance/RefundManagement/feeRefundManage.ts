import type { IFeeRefundApiPayload } from 'src/screens/finance/feeRefund/NewRefundForm/initialValuesAndValidation';

import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../financeModuleApi';

// ─── API response types ───────────────────────────────────────────────────────

export interface FeeRefundLineDto {
  id: string;
  dueFeeId: string;
  amount: number;
  calculatedAmount: number;
  sourceAllocationId?: string;
  sourceReceiptId?: string;
  feeHeadId: string;
  feeHeadName: string;
  installmentLabel: string;
  settledPaidAmount: number;
  approvedAmount: number;
  processedAmount: number;
  reversedAmount: number;
}

export interface FeeRefundRequestDto {
  id: string;
  studentId: string;
  academicYearId: string;
  boardId: string;
  educationMediumId: string;
  standardId: string;
  divisionId: string;
  status: number;
  voucherNumber: string;
  totalAmount: number;
  calculatedAmount: number;
  approvedAmount: number;
  processedAmount: number;
  reversedAmount: number;
  studentFeeStructureId?: string;
  refundPolicyId?: string;
  refundPolicyVersionId?: string;
  refundPolicyName?: string;
  originalReceiptId?: string;
  originalReceiptNumber?: string;
  currency: string;
  refundMethod: string | null;
  reason: string | null;
  approverNotes: string | null;

  processedByUserId: string | null;
  processedAt: string | null;
  creationTime: string;
  submittedAt?: string;
  reviewStartedAt?: string;
  reversedAt?: string;
  failureReason?: string;
  reversalReason?: string;
  availableActions: string[];
  settlements: FeeRefundSettlementDto[];
  lines: FeeRefundLineDto[];
  paymentDetails?: Record<string, any>;

  // Student snapshot populated by the backend
  studentName: string;
  studentGrNo: number | null;
  studentRollNo: number | null;
  className: string | null;
  boardName: string | null;
  educationMediumName: string | null;
  standardName: string | null;
  divisionName: string | null;
  studentContactNo: string | null;

  // Extended view fields
  refundRequestId: string | null;
  totalFeeHeads: number | null;
  totalPaidAmount: number | null;
  totalRefundedAmount: number | null;
  feeHeads: FeeRefundFeeHeadDto[] | null;
}

export interface FeeRefundFeeHeadMonthDto {
  installmentId: string;
  month: string;
  total: number;
  paid: number;
  refundAmount: number;
  status: number;
}

export interface FeeRefundFeeHeadDto {
  feeHeadId: string;
  feeHeadName: string;
  totalPaid: number;
  totalRefunded: number;
  items: FeeRefundFeeHeadMonthDto[];
}

export interface PagedRefundResult {
  totalCount: number;
  items: FeeRefundRequestDto[];
}

export interface RefundEligibilityMonthDto {
  dueFeeId: string;
  sourceAllocationId: string;
  sourceReceiptId: string;
  receiptNumber: string;
  month: number;
  year: number;
  total: number;
  paid: number;
  refunded: number;
  refundable: number;
}

export interface RefundEligibilityFeeHeadDto {
  feeHeadId: string;
  feeHeadName: string;
  totalPaid: number;
  totalRefunded: number;
  totalRefundable: number;
  months: RefundEligibilityMonthDto[];
}

export interface RefundEligibilityDto {
  studentId: string;
  academicYearId: string;
  totalPaid: number;
  totalRefunded: number;
  totalRefundable: number;
  studentFeeStructureId?: string;
  refundPolicyId?: string;
  refundPolicyVersionId?: string;
  refundPolicyName?: string;
  allowedPayoutMethods: string[];
  processingTargetDays?: number;
  allowPartialRefund: boolean;
  receipts: RefundEligibleReceiptDto[];
  feeHeads: RefundEligibilityFeeHeadDto[];
}

export interface RefundEligibleReceiptDto {
  receiptId: string;
  receiptNumber: string;
  receiptDate: string;
  paidAmount: number;
  refundableAmount: number;
}

export interface FeeRefundSettlementDto {
  id: string;
  attemptNumber: number;
  status: number;
  method: string;
  amount: number;
  settlementDate: string;
  externalReference?: string;
  failureReason?: string;
}

export interface GetFeeRefundsInput {
  studentId?: string;
  /** Filter to students enrolled in a specific academic medium. */
  academicMediumId?: string;
  standardId?: string;
  divisionId?: string;
  status?: number;
  search?: string;
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
}

export interface UpdateFeeRefundStatusInput {
  status: number;
  notes?: string;
}

export interface UpdateFeeRefundInput {
  id: string;
  body: IFeeRefundApiPayload;
}

// ─── API slice ────────────────────────────────────────────────────────────────

export const feeRefundApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeeRefunds: builder.query<PagedRefundResult, GetFeeRefundsInput>({
      query: (params) => ({
        url: '/fee-refunds',
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.feeRefund],
    }),

    getFeeRefundById: builder.query<FeeRefundRequestDto, string>({
      query: (id) => ({
        url: `/fee-refunds/${id}`,
        method: 'GET',
      }),
      providesTags: [financeModuleType.feeRefund],
    }),

    getRefundEligibility: builder.query<
      RefundEligibilityDto,
      { studentId: string; academicYearId: string }
    >({
      query: ({ studentId, academicYearId }) => ({
        url: '/fee-refunds/eligibility',
        method: 'GET',
        params: { studentId, academicYearId },
      }),
    }),

    createFeeRefund: builder.mutation<FeeRefundRequestDto, IFeeRefundApiPayload>({
      query: (body) => ({
        url: '/fee-refunds',
        method: 'POST',
        body,
      }),
      invalidatesTags: [financeModuleType.feeRefund],
    }),

    previewFeeRefund: builder.mutation<any, IFeeRefundApiPayload>({
      query: (body) => ({ url: '/fee-refunds/preview', method: 'POST', body }),
    }),

    submitFeeRefund: builder.mutation<FeeRefundRequestDto, string>({
      query: (id) => ({ url: `/fee-refunds/${id}/submit`, method: 'POST' }),
      invalidatesTags: [financeModuleType.feeRefund],
    }),

    startReviewFeeRefund: builder.mutation<FeeRefundRequestDto, string>({
      query: (id) => ({ url: `/fee-refunds/${id}/start-review`, method: 'POST' }),
      invalidatesTags: [financeModuleType.feeRefund],
    }),

    approveFeeRefund: builder.mutation<FeeRefundRequestDto, { id: string; notes?: string }>({
      query: ({ id, notes }) => ({
        url: `/fee-refunds/${id}/approve`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: [financeModuleType.feeRefund],
    }),

    rejectFeeRefund: builder.mutation<FeeRefundRequestDto, { id: string; notes: string }>({
      query: ({ id, notes }) => ({
        url: `/fee-refunds/${id}/reject`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: [financeModuleType.feeRefund],
    }),

    cancelFeeRefund: builder.mutation<FeeRefundRequestDto, { id: string; notes?: string }>({
      query: ({ id, notes }) => ({
        url: `/fee-refunds/${id}/cancel`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: [financeModuleType.feeRefund],
    }),

    processFeeRefund: builder.mutation<
      FeeRefundRequestDto,
      { id: string; body: Record<string, unknown> }
    >({
      query: ({ id, body }) => ({ url: `/fee-refunds/${id}/process`, method: 'POST', body }),
      invalidatesTags: [financeModuleType.feeRefund, financeModuleType.accountPosting],
    }),

    reverseFeeRefund: builder.mutation<
      FeeRefundRequestDto,
      { id: string; settlementId: string; reason: string }
    >({
      query: ({ id, settlementId, reason }) => ({
        url: `/fee-refunds/${id}/reverse`,
        method: 'POST',
        body: { settlementId, reason },
      }),
      invalidatesTags: [financeModuleType.feeRefund, financeModuleType.accountPosting],
    }),

    updateFeeRefund: builder.mutation<FeeRefundRequestDto, UpdateFeeRefundInput>({
      query: ({ id, body }) => ({
        url: `/fee-refunds/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [financeModuleType.feeRefund],
    }),

    deleteFeeRefund: builder.mutation<void, string>({
      query: (id) => ({
        url: `/fee-refunds/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financeModuleType.feeRefund],
    }),

    updateFeeRefundStatus: builder.mutation<
      FeeRefundRequestDto,
      { id: string; body: UpdateFeeRefundStatusInput }
    >({
      query: ({ id, body }) => ({
        url: `/fee-refunds/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [
        financeModuleType.feeRefund,
        financeModuleType.accountPosting,
        financeModuleType.draftPosting,
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFeeRefundsQuery,
  useLazyGetFeeRefundsQuery,
  useGetFeeRefundByIdQuery,
  useLazyGetFeeRefundByIdQuery,
  useGetRefundEligibilityQuery,
  useLazyGetRefundEligibilityQuery,
  useCreateFeeRefundMutation,
  usePreviewFeeRefundMutation,
  useSubmitFeeRefundMutation,
  useStartReviewFeeRefundMutation,
  useApproveFeeRefundMutation,
  useRejectFeeRefundMutation,
  useCancelFeeRefundMutation,
  useProcessFeeRefundMutation,
  useReverseFeeRefundMutation,
  useUpdateFeeRefundMutation,
  useDeleteFeeRefundMutation,
  useUpdateFeeRefundStatusMutation,
} = feeRefundApi;
