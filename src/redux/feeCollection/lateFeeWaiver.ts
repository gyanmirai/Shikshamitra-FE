import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../finance/financeModuleApi';

export const LATE_FEE_WAIVERS_BASE_URL = '/finance/late-fee-waivers';

export interface LateFeeWaiverApplication {
  id: string;
  studentId: string;
  dueFeeId: string;
  collectionPolicyId: string;
  academicYearId: string;
  studentName: string;
  grNumber?: string;
  rollNo?: number;
  feeHeadId: string;
  feeHeadName: string;
  dueDate?: string;
  computedLateFeeAmount: number;
  requestedAmount: number;
  effectiveAmount: number;
  reason: string;
  status: 'Applied' | 'PendingApproval' | 'Rejected';
  appliedByUserId: string;
  approvedByUserId?: string;
  approvedAt?: string;
  decisionReason?: string;
  creationTime: string;
}

export interface GetLateFeeWaiversInput {
  academicYearId?: string;
  status?: 'Applied' | 'PendingApproval' | 'Rejected' | '';
  search?: string;
  skipCount?: number;
  maxResultCount?: number;
}

export interface PagedLateFeeWaivers {
  items: LateFeeWaiverApplication[];
  totalCount: number;
}

export interface ApplyLateFeeWaiverInput {
  dueFeeId: string;
  /** Absolute amount to waive. Takes precedence over requestedPercentage if both are set. */
  requestedAmount?: number;
  /** Percentage (0-100) of the currently-outstanding computed late fee to waive. */
  requestedPercentage?: number;
  reason: string;
}

export const lateFeeWaiverApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getLateFeeWaivers: builder.query<PagedLateFeeWaivers, GetLateFeeWaiversInput>({
      query: (params) => ({
        url: `${LATE_FEE_WAIVERS_BASE_URL}/list`,
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.feeCollection],
    }),
    getLateFeeWaiversForDueFee: builder.query<LateFeeWaiverApplication[], { dueFeeId: string }>({
      query: ({ dueFeeId }) => ({
        url: LATE_FEE_WAIVERS_BASE_URL,
        method: 'GET',
        params: { dueFeeId },
      }),
      providesTags: [financeModuleType.feeCollection],
    }),

    applyLateFeeWaiver: builder.mutation<LateFeeWaiverApplication, ApplyLateFeeWaiverInput>({
      query: (body) => ({
        url: LATE_FEE_WAIVERS_BASE_URL,
        method: 'POST',
        body,
      }),
      invalidatesTags: [financeModuleType.feeCollection, financeModuleType.financeAudit],
    }),

    approveLateFeeWaiver: builder.mutation<LateFeeWaiverApplication, string>({
      query: (id) => ({
        url: `${LATE_FEE_WAIVERS_BASE_URL}/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: [financeModuleType.feeCollection, financeModuleType.financeAudit],
    }),

    rejectLateFeeWaiver: builder.mutation<LateFeeWaiverApplication, { id: string; reason: string }>(
      {
        query: ({ id, reason }) => ({
          url: `${LATE_FEE_WAIVERS_BASE_URL}/${id}/reject`,
          method: 'POST',
          body: { reason },
        }),
        invalidatesTags: [financeModuleType.feeCollection, financeModuleType.financeAudit],
      }
    ),
  }),
  overrideExisting: true,
});

export const {
  useGetLateFeeWaiversQuery,
  useGetLateFeeWaiversForDueFeeQuery,
  useApplyLateFeeWaiverMutation,
  useApproveLateFeeWaiverMutation,
  useRejectLateFeeWaiverMutation,
} = lateFeeWaiverApi;
