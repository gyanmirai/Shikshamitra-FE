import type {
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

export interface FeeAdjustmentApplicationItemDto {
  id: string;
  studentId: string;
  studentName: string;
  grNumber: string;
  rollNo: string;
  standardName: string;
  divisionName: string;
  adjustmentType: number;
  adjustmentTypeName: string;
  requestedAmount: number;
  appliedAmount: number;
  remainingAmount: number;
  status: number;
  statusName: string;
  requestedByName?: string;
  createdAt: string;
}

export interface FeeAdjustmentApplicationsDto {
  pendingCount: number;
  partiallyAppliedCount: number;
  appliedCount: number;
  rejectedCount: number;
  cancelledCount: number;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  items: FeeAdjustmentApplicationItemDto[];
}

export interface GetFeeAdjustmentApplicationsInput {
  boardId: string;
  educationMediumId: string;
  academicYearId: string;
  standardId?: string;
  divisionId?: string;
  status?: number;
  completedOnly?: boolean;
  filter?: string;
  page?: number;
  pageSize?: number;
}

export const adjustmentApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdjustmentApplications: builder.query<
      FeeAdjustmentApplicationsDto,
      GetFeeAdjustmentApplicationsInput
    >({
      query: (params) => ({
        url: '/fee-adjustments/applications',
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.feeDetails],
    }),

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
  }),
  overrideExisting: false,
});

export const {
  useGetAdjustmentApplicationsQuery,
  useLazyGetAdjustmentPendingFeesQuery,
  useApplyAdjustmentMutation,
} = adjustmentApi;
