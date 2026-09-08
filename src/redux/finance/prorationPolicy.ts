import type { IProrationPolicy } from 'src/screens/finance/policies/types/finance-policy.types';

import { financePolicyType } from 'src/redux/tagTypes';

import { api } from '../service';

export interface ProrationPolicyRulePayload {
  feeHeadId: string;
  ruleType: 'FullCharge' | 'Daily' | 'MonthlyCutoff';
  roundingMode: 'Currency' | 'NearestRupee' | 'RoundUpRupee' | 'RoundDownRupee';
  minimumChargeDays?: number | null;
  cutoffDay?: number | null;
  afterCutoffAction?: 'NoCharge' | 'HalfCharge' | null;
}

export interface ProrationPolicySavePayload {
  academicYearId: string;
  policyName: string;
  policyCode?: string | null;
  description?: string | null;
  status: 'Draft' | 'Active';
  isDefault: boolean;
  feeHeadRules: ProrationPolicyRulePayload[];
  changeReason?: string | null;
  concurrencyStamp?: string | null;
}

export interface ProrationPolicyListArgs {
  academicYearId: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ProrationPolicyListResponse {
  totalCount: number;
  items: IProrationPolicy[];
}

export interface ProrationPolicyImpactResponse {
  policyId: string;
  policyName: string;
  status: string;
  currentVersion: number;
  attachedFeeStructureCount: number;
  studentAssignmentCount: number;
  changeReasonRequired: boolean;
}

export interface ProrationPolicyVersionResponse {
  id: string;
  versionNumber: number;
  snapshotJson: string;
  changeAction: string;
  changeReason?: string | null;
  creationTime: string;
  creatorId?: string | null;
  creatorUserName?: string | null;
  creatorName?: string | null;
  creatorDisplayName?: string | null;
}

export interface ProrationPolicySimulationInput {
  feeHeadId: string;
  scheduledAmount: number;
  coverageStartDate: string;
  coverageEndDate: string;
  chargeStartDate: string;
  chargeEndDate: string;
}

export interface ProrationPolicySimulationResponse {
  feeHeadId: string;
  scheduledAmount: number;
  proratedAmount: number;
  reductionAmount: number;
  rawAmount: number;
  factor: number;
  coverageStartDate: string;
  coverageEndDate: string;
  eligibleStartDate?: string | null;
  eligibleEndDate?: string | null;
  coverageDays: number;
  actualEligibleDays: number;
  chargedDays: number;
  ruleType: string;
  roundingMode: string;
  explanation: string;
  policyId: string;
  policyVersion: number;
}

export interface ProrationPolicyAttachmentImpactResponse {
  policyId: string;
  policyVersion: number;
  isAttachable: boolean;
  proratedFeeHeadIds: string[];
  fullChargeFeeHeadIds: string[];
  oneTimeFeeHeadIds: string[];
  policyFeeHeadsNotInStructure: string[];
  warnings: string[];
}

export const prorationPolicyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProrationPolicies: builder.query<ProrationPolicyListResponse, ProrationPolicyListArgs>({
      query: ({ page = 1, pageSize = 10, ...params }) => ({
        url: '/finance/proration-policies',
        method: 'GET',
        params: {
          ...params,
          skipCount: (page - 1) * pageSize,
          maxResultCount: pageSize,
        },
      }),
      providesTags: [financePolicyType.financePolicy],
    }),
    getProrationPolicyById: builder.query<IProrationPolicy, string>({
      query: (id) => `/finance/proration-policies/${id}`,
      providesTags: [financePolicyType.financePolicy],
    }),
    createProrationPolicy: builder.mutation<IProrationPolicy, ProrationPolicySavePayload>({
      query: (body) => ({ url: '/finance/proration-policies', method: 'POST', body }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),
    updateProrationPolicy: builder.mutation<
      IProrationPolicy,
      { id: string; body: ProrationPolicySavePayload }
    >({
      query: ({ id, body }) => ({ url: `/finance/proration-policies/${id}`, method: 'PUT', body }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),
    activateProrationPolicy: builder.mutation<
      IProrationPolicy,
      { id: string; changeReason?: string | null }
    >({
      query: ({ id, changeReason }) => ({
        url: `/finance/proration-policies/${id}/activate`,
        method: 'POST',
        params: changeReason ? { changeReason } : undefined,
      }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),
    cloneProrationPolicy: builder.mutation<
      IProrationPolicy,
      { id: string; body: { name?: string; targetAcademicYearId?: string } }
    >({
      query: ({ id, body }) => ({
        url: `/finance/proration-policies/${id}/clone`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),
    archiveProrationPolicy: builder.mutation<void, string>({
      query: (id) => ({ url: `/finance/proration-policies/${id}`, method: 'DELETE' }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),
    unarchiveProrationPolicy: builder.mutation<IProrationPolicy, string>({
      query: (id) => ({ url: `/finance/proration-policies/${id}/unarchive`, method: 'POST' }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),
    getProrationPolicyVersions: builder.query<
      { totalCount: number; items: ProrationPolicyVersionResponse[] },
      string
    >({
      query: (id) => `/finance/proration-policies/${id}/versions`,
      providesTags: [financePolicyType.financePolicy],
    }),
    getProrationPolicyImpact: builder.query<ProrationPolicyImpactResponse, string>({
      query: (id) => `/finance/proration-policies/${id}/impact`,
      providesTags: [financePolicyType.financePolicy],
    }),
    simulateProrationPolicy: builder.mutation<
      ProrationPolicySimulationResponse,
      { id: string; body: ProrationPolicySimulationInput }
    >({
      query: ({ id, body }) => ({
        url: `/finance/proration-policies/${id}/simulate`,
        method: 'POST',
        body,
      }),
    }),
    getProrationAttachmentImpact: builder.mutation<
      ProrationPolicyAttachmentImpactResponse,
      { id: string; feeStructureId: string }
    >({
      query: ({ id, feeStructureId }) => ({
        url: `/finance/proration-policies/${id}/attachment-impact`,
        method: 'POST',
        body: { feeStructureId },
      }),
    }),
  }),
});

export const {
  useGetProrationPoliciesQuery,
  useGetProrationPolicyByIdQuery,
  useCreateProrationPolicyMutation,
  useUpdateProrationPolicyMutation,
  useActivateProrationPolicyMutation,
  useCloneProrationPolicyMutation,
  useArchiveProrationPolicyMutation,
  useUnarchiveProrationPolicyMutation,
  useGetProrationPolicyVersionsQuery,
  useGetProrationPolicyImpactQuery,
  useSimulateProrationPolicyMutation,
  useGetProrationAttachmentImpactMutation,
} = prorationPolicyApi;
