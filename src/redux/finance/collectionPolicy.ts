import { financePolicyType } from 'src/redux/tagTypes';

import { api } from '../service';
import { policyCacheTags } from './policyCacheTags';

const policyTags = policyCacheTags(financePolicyType.collectionPolicy);

// ─── Types ────────────────────────────────────────────────────────────────────
// Mirrors ICollectionPolicy (screens/finance/policies/types/finance-policy.types.ts)
// field-for-field — this is the real backend contract for Collection Policy,
// replacing the generic, non-existent `/finance-policies` endpoint for this
// policy kind specifically (Phase 1, collection-policy-implementation-plan.md).

export interface ICollectionPolicyListParams {
  academicYearId: string;
  status?: string;
  includeArchived?: boolean;
  search?: string;
  skipCount?: number;
  maxResultCount?: number;
}

export interface CollectionPolicyVersionResponse {
  id: string;
  policyType: 'collection';
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

export interface CollectionPolicyVersionListResponse {
  totalCount: number;
  items: CollectionPolicyVersionResponse[];
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const CollectionPolicyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCollectionPolicies: builder.query({
      query: (params: ICollectionPolicyListParams) => ({
        url: '/finance/collection-policies',
        method: 'GET',
        params,
      }),
      transformResponse: (response: { items: any[]; totalCount: number }) => ({
        items: response.items,
        totalCount: response.totalCount,
      }),
      providesTags: policyTags.list,
    }),

    getCollectionPolicyById: builder.query({
      query: (id: string) => ({
        url: `/finance/collection-policies/${id}`,
        method: 'GET',
      }),
      providesTags: policyTags.detail,
    }),

    createCollectionPolicy: builder.mutation({
      query: (body: any) => ({
        url: '/finance/collection-policies',
        method: 'POST',
        body,
      }),
      invalidatesTags: policyTags.changed,
    }),

    updateCollectionPolicy: builder.mutation({
      query: ({ id, body }: { id: string; body: any }) => ({
        url: `/finance/collection-policies/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: policyTags.changed,
    }),

    cloneCollectionPolicy: builder.mutation({
      query: ({
        id,
        body,
      }: {
        id: string;
        body: { name?: string; targetAcademicYearId?: string };
      }) => ({
        url: `/finance/collection-policies/${id}/clone`,
        method: 'POST',
        body,
      }),
      invalidatesTags: policyTags.changed,
    }),

    archiveCollectionPolicy: builder.mutation({
      query: (id: string) => ({
        url: `/finance/collection-policies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: policyTags.changed,
    }),

    unarchiveCollectionPolicy: builder.mutation({
      query: (id: string) => ({
        url: `/finance/collection-policies/${id}/unarchive`,
        method: 'POST',
      }),
      invalidatesTags: policyTags.changed,
    }),

    getCollectionPolicyVersions: builder.query<
      CollectionPolicyVersionListResponse,
      { id: string; skipCount?: number; maxResultCount?: number }
    >({
      query: ({ id, ...params }: { id: string; skipCount?: number; maxResultCount?: number }) => ({
        url: `/finance/collection-policies/${id}/versions`,
        method: 'GET',
        params,
      }),
      providesTags: policyTags.detail,
    }),

    // ── Exception Windows (Phase 4j) ──────────────────────────────────────────
    // Visually and functionally distinct from Bulk Waiver: Bulk Waiver forgives what's
    // already charged, an Exception Window prevents charging in the first place.

    getExceptionWindows: builder.query({
      query: (params: { scope?: string; activeOn?: string }) => ({
        url: '/finance/collection-policies/exception-windows',
        method: 'GET',
        params,
      }),
      providesTags: [{ type: financePolicyType.collectionPolicy, id: 'exception-windows' }],
    }),

    createExceptionWindow: builder.mutation({
      query: (body: any) => ({
        url: '/finance/collection-policies/exception-windows',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: financePolicyType.collectionPolicy, id: 'exception-windows' }],
    }),

    deleteExceptionWindow: builder.mutation({
      query: (id: string) => ({
        url: `/finance/collection-policies/exception-windows/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: financePolicyType.collectionPolicy, id: 'exception-windows' }],
    }),
  }),
});

export const {
  useGetCollectionPoliciesQuery,
  useGetCollectionPolicyByIdQuery,
  useCreateCollectionPolicyMutation,
  useUpdateCollectionPolicyMutation,
  useCloneCollectionPolicyMutation,
  useArchiveCollectionPolicyMutation,
  useUnarchiveCollectionPolicyMutation,
  useGetCollectionPolicyVersionsQuery,
  useGetExceptionWindowsQuery,
  useCreateExceptionWindowMutation,
  useDeleteExceptionWindowMutation,
} = CollectionPolicyApi;
