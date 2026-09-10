import type { IRefundPolicy } from 'src/screens/finance/policies/types/finance-policy.types';

import { financePolicyType } from 'src/redux/tagTypes';

import { api } from '../service';

export interface RefundPolicyListArgs {
  academicYearId: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface RefundPolicyListResponse {
  totalCount: number;
  items: IRefundPolicy[];
}

export type RefundPolicySavePayload = Omit<
  IRefundPolicy,
  | 'id'
  | 'policyType'
  | 'policyCode'
  | 'academicYearName'
  | 'version'
  | 'isUsedInDownstream'
  | 'creationTime'
  | 'lastModificationTime'
  | 'concurrencyStamp'
  | 'changeReason'
> & {
  policyCode?: string | null;
  changeReason?: string | null;
  concurrencyStamp?: string | null;
};

export interface RefundPolicyImpactResponse {
  policyId: string;
  policyName: string;
  status: string;
  currentVersion: number;
  attachedFeeStructureCount: number;
  studentAssignmentCount: number;
  changeReasonRequired: boolean;
}

export interface RefundPolicyVersionResponse {
  id: string;
  policyType: string;
  policyId: string;
  academicYearId: string;
  versionNumber: number;
  policyName: string;
  status: string;
  snapshotJson: string;
  changeAction: string;
  changeReason?: string | null;
  creationTime: string;
  creatorId?: string | null;
  creatorUserName?: string | null;
  creatorName?: string | null;
  creatorDisplayName?: string | null;
}

export interface RefundPolicySimulationInput {
  settledPaidAmount: number;
  priorProcessedRefund: number;
  activeReservation: number;
  studentYearRefundedOrReserved: number;
  requestedAmount?: number | null;
}

export interface RefundPolicySimulationResponse {
  settledPaidAmount: number;
  priorProcessedRefund: number;
  activeReservation: number;
  remainingEligible: number;
  rawRefund: number;
  deductionAmount: number;
  capAdjustment: number;
  finalRefund: number;
  explanation: string;
}

export const refundPolicyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRefundPolicies: builder.query<RefundPolicyListResponse, RefundPolicyListArgs>({
      query: ({ page = 1, pageSize = 10, ...params }) => ({
        url: '/finance/refund-policies',
        method: 'GET',
        params: {
          ...params,
          skipCount: (page - 1) * pageSize,
          maxResultCount: pageSize,
        },
      }),
      providesTags: [financePolicyType.financePolicy],
    }),
    getRefundPolicyById: builder.query<IRefundPolicy, string>({
      query: (id) => `/finance/refund-policies/${id}`,
      providesTags: [financePolicyType.financePolicy],
    }),
    createRefundPolicy: builder.mutation<IRefundPolicy, RefundPolicySavePayload>({
      query: (body) => ({ url: '/finance/refund-policies', method: 'POST', body }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),
    updateRefundPolicy: builder.mutation<
      IRefundPolicy,
      { id: string; body: RefundPolicySavePayload }
    >({
      query: ({ id, body }) => ({ url: `/finance/refund-policies/${id}`, method: 'PUT', body }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),
    cloneRefundPolicy: builder.mutation<
      IRefundPolicy,
      { id: string; body: { name?: string; targetAcademicYearId?: string } }
    >({
      query: ({ id, body }) => ({
        url: `/finance/refund-policies/${id}/clone`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),
    archiveRefundPolicy: builder.mutation<void, string>({
      query: (id) => ({ url: `/finance/refund-policies/${id}`, method: 'DELETE' }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),
    unarchiveRefundPolicy: builder.mutation<IRefundPolicy, string>({
      query: (id) => ({ url: `/finance/refund-policies/${id}/unarchive`, method: 'POST' }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),
    getRefundPolicyVersions: builder.query<
      { totalCount: number; items: RefundPolicyVersionResponse[] },
      string
    >({
      query: (id) => `/finance/refund-policies/${id}/versions`,
      providesTags: [financePolicyType.financePolicy],
    }),
    getRefundPolicyImpact: builder.query<RefundPolicyImpactResponse, string>({
      query: (id) => `/finance/refund-policies/${id}/impact`,
      providesTags: [financePolicyType.financePolicy],
    }),
    simulateRefundPolicy: builder.mutation<
      RefundPolicySimulationResponse,
      { id: string; body: RefundPolicySimulationInput }
    >({
      query: ({ id, body }) => ({
        url: `/finance/refund-policies/${id}/simulate`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetRefundPoliciesQuery,
  useGetRefundPolicyByIdQuery,
  useCreateRefundPolicyMutation,
  useUpdateRefundPolicyMutation,
  useCloneRefundPolicyMutation,
  useArchiveRefundPolicyMutation,
  useUnarchiveRefundPolicyMutation,
  useGetRefundPolicyVersionsQuery,
  useGetRefundPolicyImpactQuery,
  useSimulateRefundPolicyMutation,
} = refundPolicyApi;
