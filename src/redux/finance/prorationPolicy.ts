import type { IProrationPolicy } from 'src/screens/finance/policies/types/finance-policy.types';

import { financePolicyType } from 'src/redux/tagTypes';

import { api } from '../service';
import { policyCacheTags } from './policyCacheTags';

const policyTags = policyCacheTags(financePolicyType.prorationPolicy);

export interface ProrationPolicyRulePayload {
  feeHeadId: string;
  ruleType: 'FullCharge' | 'Daily' | 'MonthlyCutoff' | 'FullMonthCharge';
  roundingMode: 'Currency' | 'NearestRupee' | 'RoundUpRupee' | 'RoundDownRupee';
  minimumChargeDays?: number | null;
  cutoffDay?: number | null;
  afterCutoffAction?: 'NoCharge' | 'HalfCharge' | null;
  applyOnAdmission?: boolean;
  applyOnEarlyWithdrawal?: boolean;
  earlyWithdrawalRuleType?: 'FullCharge' | 'Daily' | 'MonthlyCutoff' | 'FullMonthCharge' | null;
  earlyWithdrawalMinimumChargeDays?: number | null;
  earlyWithdrawalCutoffDay?: number | null;
  earlyWithdrawalBeforeCutoffAction?: 'NoCharge' | 'HalfCharge' | null;
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
      providesTags: policyTags.list,
    }),
    getProrationPolicyById: builder.query<IProrationPolicy, string>({
      query: (id) => `/finance/proration-policies/${id}`,
      providesTags: policyTags.detail,
    }),
    createProrationPolicy: builder.mutation<IProrationPolicy, ProrationPolicySavePayload>({
      query: (body) => ({ url: '/finance/proration-policies', method: 'POST', body }),
      invalidatesTags: policyTags.changed,
    }),
    updateProrationPolicy: builder.mutation<
      IProrationPolicy,
      { id: string; body: ProrationPolicySavePayload }
    >({
      query: ({ id, body }) => ({ url: `/finance/proration-policies/${id}`, method: 'PUT', body }),
      invalidatesTags: policyTags.changed,
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
      invalidatesTags: policyTags.changed,
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
      invalidatesTags: policyTags.changed,
    }),
    archiveProrationPolicy: builder.mutation<void, string>({
      query: (id) => ({ url: `/finance/proration-policies/${id}`, method: 'DELETE' }),
      invalidatesTags: policyTags.changed,
    }),
    unarchiveProrationPolicy: builder.mutation<IProrationPolicy, string>({
      query: (id) => ({ url: `/finance/proration-policies/${id}/unarchive`, method: 'POST' }),
      invalidatesTags: policyTags.changed,
    }),
    getProrationPolicyVersions: builder.query<
      { totalCount: number; items: ProrationPolicyVersionResponse[] },
      string
    >({
      query: (id) => `/finance/proration-policies/${id}/versions`,
      providesTags: policyTags.detail,
    }),
    getProrationPolicyImpact: builder.query<ProrationPolicyImpactResponse, string>({
      query: (id) => `/finance/proration-policies/${id}/impact`,
      providesTags: policyTags.detail,
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
} = prorationPolicyApi;
