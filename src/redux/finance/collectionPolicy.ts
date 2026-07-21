import { financePolicyType } from 'src/redux/tagTypes';

import { api } from '../service';

// ─── Types ────────────────────────────────────────────────────────────────────
// Mirrors ICollectionPolicy (screens/finance/policies/types/finance-policy.types.ts)
// field-for-field — this is the real backend contract for Collection Policy,
// replacing the generic, non-existent `/finance-policies` endpoint for this
// policy kind specifically (Phase 1, collection-policy-implementation-plan.md).

export interface ICollectionPolicyListParams {
  academicYearId: string;
  status?: string;
  search?: string;
  skipCount?: number;
  maxResultCount?: number;
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
      providesTags: [financePolicyType.financePolicy],
    }),

    getCollectionPolicyById: builder.query({
      query: (id: string) => ({
        url: `/finance/collection-policies/${id}`,
        method: 'GET',
      }),
      providesTags: [financePolicyType.financePolicy],
    }),

    createCollectionPolicy: builder.mutation({
      query: (body: any) => ({
        url: '/finance/collection-policies',
        method: 'POST',
        body,
      }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),

    updateCollectionPolicy: builder.mutation({
      query: ({ id, body }: { id: string; body: any }) => ({
        url: `/finance/collection-policies/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [financePolicyType.financePolicy],
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
      invalidatesTags: [financePolicyType.financePolicy],
    }),

    archiveCollectionPolicy: builder.mutation({
      query: (id: string) => ({
        url: `/finance/collection-policies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),

    unarchiveCollectionPolicy: builder.mutation({
      query: (id: string) => ({
        url: `/finance/collection-policies/${id}/unarchive`,
        method: 'POST',
      }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),

    getCollectionPolicyVersions: builder.query({
      query: ({ id, ...params }: { id: string; skipCount?: number; maxResultCount?: number }) => ({
        url: `/finance/collection-policies/${id}/versions`,
        method: 'GET',
        params,
      }),
      providesTags: [financePolicyType.financePolicy],
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
      providesTags: [financePolicyType.financePolicy],
    }),

    createExceptionWindow: builder.mutation({
      query: (body: any) => ({
        url: '/finance/collection-policies/exception-windows',
        method: 'POST',
        body,
      }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),

    deleteExceptionWindow: builder.mutation({
      query: (id: string) => ({
        url: `/finance/collection-policies/exception-windows/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financePolicyType.financePolicy],
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
