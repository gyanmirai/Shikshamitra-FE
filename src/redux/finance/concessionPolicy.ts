import type { IConcessionPolicy } from 'src/screens/finance/policies/types/finance-policy.types';

import { financePolicyType } from 'src/redux/tagTypes';

import { api } from '../service';

export interface ConcessionPolicyVersionResponse {
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

export interface ConcessionPolicyVersionListResponse {
  totalCount: number;
  items: ConcessionPolicyVersionResponse[];
}

export interface ConcessionPolicyListArgs {
  academicYearId: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ConcessionPolicyListResponse {
  totalCount: number;
  items: IConcessionPolicy[];
}

export interface ConcessionPolicySavePayload {
  academicYearId: string;
  policyName: string;
  policyCode?: string | null;
  description?: string;
  status: 'Draft' | 'Active';
  isDefault: boolean;
  valueSource: 'PolicyFixed' | 'RequestEnteredWithinLimits';
  calculationMethod: 'Percentage' | 'FixedAmount' | 'FullWaiver';
  percentageValue: number | null;
  fixedAmount: number | null;
  maximumPercentage: number | null;
  maximumFixedAmount: number | null;
  applyOn: 'AllOutstanding' | 'CurrentInstallment' | 'FutureInstallments';
  roundingMethod: 'None' | 'RoundUp' | 'RoundDown' | 'NearestRupee';
  changeReason?: string | null;
  concurrencyStamp?: string | null;
}

export interface ConcessionPolicyImpactResponse {
  policyId: string;
  policyName: string;
  status: string;
  currentVersion: number;
  attachedFeeStructureCount: number;
  studentAssignmentCount: number;
  concessionRequestCount: number;
  changeReasonRequired: boolean;
}

export interface ConcessionPolicyClonePayload {
  name?: string;
  targetAcademicYearId?: string;
}

export interface ConcessionPolicySimulationInput {
  eligibleBase: number;
  requestedBasis?: 'Percentage' | 'FixedAmount' | 'Flat';
  requestedValue?: number;
}

export interface ConcessionPolicySimulationResponse {
  eligibleBase: number;
  concessionAmount: number;
  newOutstanding: number;
  explanation: string;
}

export const concessionPolicyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getConcessionPolicies: builder.query<ConcessionPolicyListResponse, ConcessionPolicyListArgs>({
      query: ({ page = 1, pageSize = 10, ...params }) => ({
        url: '/finance/concession-policies',
        method: 'GET',
        params: {
          ...params,
          skipCount: (page - 1) * pageSize,
          maxResultCount: pageSize,
        },
      }),
      providesTags: [financePolicyType.financePolicy],
    }),
    getConcessionPolicyById: builder.query<IConcessionPolicy, string>({
      query: (id: string) => `/finance/concession-policies/${id}`,
      providesTags: [financePolicyType.financePolicy],
    }),
    createConcessionPolicy: builder.mutation<IConcessionPolicy, ConcessionPolicySavePayload>({
      query: (body) => ({ url: '/finance/concession-policies', method: 'POST', body }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),
    updateConcessionPolicy: builder.mutation<
      IConcessionPolicy,
      { id: string; body: ConcessionPolicySavePayload }
    >({
      query: ({ id, body }) => ({ url: `/finance/concession-policies/${id}`, method: 'PUT', body }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),
    cloneConcessionPolicy: builder.mutation<
      IConcessionPolicy,
      { id: string; body: ConcessionPolicyClonePayload }
    >({
      query: ({ id, body }) => ({
        url: `/finance/concession-policies/${id}/clone`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),
    archiveConcessionPolicy: builder.mutation<void, string>({
      query: (id) => ({ url: `/finance/concession-policies/${id}`, method: 'DELETE' }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),
    unarchiveConcessionPolicy: builder.mutation<IConcessionPolicy, string>({
      query: (id) => ({ url: `/finance/concession-policies/${id}/unarchive`, method: 'POST' }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),
    getConcessionPolicyVersions: builder.query<ConcessionPolicyVersionListResponse, string>({
      query: (id) => `/finance/concession-policies/${id}/versions`,
      providesTags: [financePolicyType.financePolicy],
    }),
    getConcessionPolicyImpact: builder.query<ConcessionPolicyImpactResponse, string>({
      query: (id) => `/finance/concession-policies/${id}/impact`,
      providesTags: [financePolicyType.financePolicy],
    }),
    simulateConcessionPolicy: builder.mutation<
      ConcessionPolicySimulationResponse,
      { id: string; body: ConcessionPolicySimulationInput }
    >({
      query: ({ id, body }) => ({
        url: `/finance/concession-policies/${id}/simulate`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetConcessionPoliciesQuery,
  useGetConcessionPolicyByIdQuery,
  useCreateConcessionPolicyMutation,
  useUpdateConcessionPolicyMutation,
  useCloneConcessionPolicyMutation,
  useArchiveConcessionPolicyMutation,
  useUnarchiveConcessionPolicyMutation,
  useGetConcessionPolicyVersionsQuery,
  useGetConcessionPolicyImpactQuery,
  useSimulateConcessionPolicyMutation,
} = concessionPolicyApi;
