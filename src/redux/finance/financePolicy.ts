import { financePolicyType } from 'src/redux/tagTypes';

import { api } from '../service';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FinancePolicyType =
  | 'payment'
  | 'late-fee'
  | 'concession'
  | 'refund'
  | 'collection'
  | 'proration';

export type FinancePolicyStatus = 'Active' | 'Inactive' | 'Draft' | 'Published' | 'Archived';

export interface IFinancePolicyListParams {
  policyType: FinancePolicyType;
  academicYearId?: string;
  status?: FinancePolicyStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const FinancePolicyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // List all finance policies (filtered by policyType)
    getFinancePolicies: builder.query({
      query: (params: IFinancePolicyListParams) => ({
        url: '/finance-policies',
        method: 'GET',
        params,
      }),
      providesTags: [financePolicyType.financePolicy],
    }),

    // Get a single policy by id
    getFinancePolicyById: builder.query({
      query: (id: string) => ({
        url: `/finance-policies/${id}`,
        method: 'GET',
      }),
      providesTags: [financePolicyType.financePolicy],
    }),

    // Create a new policy
    createFinancePolicy: builder.mutation({
      query: (body: any) => ({
        url: '/finance-policies',
        method: 'POST',
        body,
      }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),

    // Update an existing policy (full update)
    updateFinancePolicy: builder.mutation({
      query: ({ id, body }: { id: string; body: any }) => ({
        url: `/finance-policies/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),

    // Patch a policy (status change, publish, etc.)
    patchFinancePolicy: builder.mutation({
      query: ({ id, body }: { id: string; body: any }) => ({
        url: `/finance-policies/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),

    // Delete a policy (only allowed if not in use)
    deleteFinancePolicy: builder.mutation({
      query: (id: string) => ({
        url: `/finance-policies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),

    // Clone policy from another academic year
    cloneFinancePolicy: builder.mutation({
      query: (body: { sourcePolicyId: string; targetAcademicYearId: string }) => ({
        url: '/finance-policies/clone',
        method: 'POST',
        body,
      }),
      invalidatesTags: [financePolicyType.financePolicy],
    }),
  }),
});

export const {
  useGetFinancePoliciesQuery,
  useGetFinancePolicyByIdQuery,
  useCreateFinancePolicyMutation,
  useUpdateFinancePolicyMutation,
  usePatchFinancePolicyMutation,
  useDeleteFinancePolicyMutation,
  useCloneFinancePolicyMutation,
} = FinancePolicyApi;
