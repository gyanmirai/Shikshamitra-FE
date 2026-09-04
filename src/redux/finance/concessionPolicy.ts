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

export const concessionPolicyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getConcessionPolicies: builder.query({
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
    getConcessionPolicyById: builder.query({
      query: (id: string) => `/finance/concession-policies/${id}`,
      providesTags: [financePolicyType.financePolicy],
    }),
    createConcessionPolicy: builder.mutation({
      query: (body) => ({ url: '/finance/concession-policies', method: 'POST', body }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),
    updateConcessionPolicy: builder.mutation({
      query: ({ id, body }) => ({ url: `/finance/concession-policies/${id}`, method: 'PUT', body }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),
    cloneConcessionPolicy: builder.mutation({
      query: ({ id, body }) => ({
        url: `/finance/concession-policies/${id}/clone`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),
		archiveConcessionPolicy: builder.mutation({
			query: (id) => ({ url: `/finance/concession-policies/${id}`, method: 'DELETE' }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),
    unarchiveConcessionPolicy: builder.mutation({
      query: (id) => ({ url: `/finance/concession-policies/${id}/unarchive`, method: 'POST' }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),
    getConcessionPolicyVersions: builder.query<ConcessionPolicyVersionListResponse, string>({
      query: (id) => `/finance/concession-policies/${id}/versions`,
      providesTags: [financePolicyType.financePolicy],
    }),
    simulateConcessionPolicy: builder.mutation({
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
  useSimulateConcessionPolicyMutation,
} = concessionPolicyApi;
