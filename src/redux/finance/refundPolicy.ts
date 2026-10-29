import type { IRefundPolicy } from 'src/screens/finance/policies/types/finance-policy.types';

import { financePolicyType } from 'src/redux/tagTypes';

import { api } from '../service';
import { policyCacheTags } from './policyCacheTags';

const policyTags = policyCacheTags(financePolicyType.refundPolicy);

export interface RefundPolicyListArgs {
  includeArchived?: boolean;
  academicYearId: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sorting?: string;
  policyNameFilter?: string;
  policyNameOperator?: string;
  amountMode?: string;
  feeHeadScope?: string;
  allowedPayoutMethod?: string;
  allowPartialRefund?: boolean;
  updatedAtOperator?: string;
  updatedAt?: string;
  updatedAtEnd?: string;
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
  | 'feeHeadNames'
  | 'feeHeadStatuses'
  | 'expenseCategoryName'
  | 'defaultPayingBankAccountName'
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
      providesTags: policyTags.list,
    }),
    getRefundPolicyById: builder.query<IRefundPolicy, string>({
      query: (id) => `/finance/refund-policies/${id}`,
      providesTags: policyTags.detail,
    }),
    createRefundPolicy: builder.mutation<IRefundPolicy, RefundPolicySavePayload>({
      query: (body) => ({ url: '/finance/refund-policies', method: 'POST', body }),
      invalidatesTags: policyTags.changed,
    }),
    updateRefundPolicy: builder.mutation<
      IRefundPolicy,
      { id: string; body: RefundPolicySavePayload }
    >({
      query: ({ id, body }) => ({ url: `/finance/refund-policies/${id}`, method: 'PUT', body }),
      invalidatesTags: policyTags.changed,
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
      invalidatesTags: policyTags.changed,
    }),
    archiveRefundPolicy: builder.mutation<void, string>({
      query: (id) => ({ url: `/finance/refund-policies/${id}`, method: 'DELETE' }),
      invalidatesTags: policyTags.changed,
    }),
    unarchiveRefundPolicy: builder.mutation<IRefundPolicy, string>({
      query: (id) => ({ url: `/finance/refund-policies/${id}/unarchive`, method: 'POST' }),
      invalidatesTags: policyTags.changed,
    }),
    getRefundPolicyVersions: builder.query<
      { totalCount: number; items: RefundPolicyVersionResponse[] },
      string
    >({
      query: (id) => `/finance/refund-policies/${id}/versions`,
      providesTags: policyTags.detail,
    }),
    getRefundPolicyImpact: builder.query<RefundPolicyImpactResponse, string>({
      query: (id) => `/finance/refund-policies/${id}/impact`,
      providesTags: policyTags.detail,
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
