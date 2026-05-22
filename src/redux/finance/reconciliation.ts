import type {
  RejectReconciliationInput,
  ReconciliationListResponse,
  ReconciliationTabCountsDto,
  ApproveReconciliationInput,
  GetReconciliationListParams,
  ReconciliationActionResponse,
} from 'src/types/finance/reconciliation';

import { api } from 'src/redux/service';
import { reconciliationType } from 'src/redux/tagTypes';

export const ReconciliationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /** Paged list with embedded tab counts. */
    getReconciliationList: builder.query<ReconciliationListResponse, GetReconciliationListParams>({
      query: (params) => ({
        url: '/v1/finance/reconciliations',
        method: 'GET',
        params,
      }),
      providesTags: [reconciliationType.reconciliation],
    }),

    /** Lightweight badge-count refresh for the 7 tabs. */
    getReconciliationTabCounts: builder.query<
      ReconciliationTabCountsDto,
      { academicYearId: string; month?: number; year?: number }
    >({
      query: (params) => ({
        url: '/v1/finance/reconciliations/tab-counts',
        method: 'GET',
        params,
      }),
      providesTags: [reconciliationType.reconciliation],
    }),

    /** Approve a provisional fee receipt. */
    approveReconciliation: builder.mutation<
      ReconciliationActionResponse,
      { id: string; body: ApproveReconciliationInput }
    >({
      query: ({ id, body }) => ({
        url: `/v1/finance/reconciliations/${id}/approve`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [reconciliationType.reconciliation],
    }),

    /** Reject a provisional fee receipt with mandatory remarks. */
    rejectReconciliation: builder.mutation<
      ReconciliationActionResponse,
      { id: string; body: RejectReconciliationInput }
    >({
      query: ({ id, body }) => ({
        url: `/v1/finance/reconciliations/${id}/reject`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [reconciliationType.reconciliation],
    }),
  }),
});

export const {
  useGetReconciliationListQuery,
  useGetReconciliationTabCountsQuery,
  useApproveReconciliationMutation,
  useRejectReconciliationMutation,
} = ReconciliationApi;
