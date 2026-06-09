import type { IFeeRefundApiPayload } from 'src/screens/finance/feeRefund/NewRefundForm/initialValuesAndValidation';

import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../financeModuleApi';

// ─── API response types ───────────────────────────────────────────────────────

export interface FeeRefundLineDto {
  id: string;
  dueFeeId: string;
  amount: number;
}

export interface FeeRefundRequestDto {
  id: string;
  studentId: string;
  academicYearId: string;
  /** 0=Pending, 1=UnderReview, 2=Approved, 3=Rejected, 4=Cancelled */
  status: number;
  voucherNumber: string;
  totalAmount: number;
  refundMethod: string | null;
  reason: string | null;
  approverNotes: string | null;
  processedByUserId: string | null;
  processedAt: string | null;
  creationTime: string;
  lines: FeeRefundLineDto[];

  // Student snapshot populated by the backend
  studentName: string;
  studentGrNo: number | null;
  studentRollNo: number | null;
  className: string | null;
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
  feeHeads: RefundEligibilityFeeHeadDto[];
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

    updateFeeRefundStatus: builder.mutation<
      FeeRefundRequestDto,
      { id: string; body: UpdateFeeRefundStatusInput }
    >({
      query: ({ id, body }) => ({
        url: `/fee-refunds/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [financeModuleType.feeRefund],
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
  useUpdateFeeRefundStatusMutation,
} = feeRefundApi;
