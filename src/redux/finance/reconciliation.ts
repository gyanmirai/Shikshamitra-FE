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

    /** Head-based reconciliation endpoints */
    getReconciliationByHead: builder.query<
      any,
      { headId: string; academicYearId: string; month?: number; year?: number }
    >({
      query: (params) => ({
        url: `/v1/finance/reconciliations/by-head/${params.headId}`,
        method: 'GET',
        params,
      }),
      providesTags: [reconciliationType.reconciliation],
    }),

    matchTransaction: builder.mutation<
      any,
      { id: string; body: { matched: boolean; statementReference?: string } }
    >({
      query: ({ id, body }) => ({
        url: `/v1/finance/reconciliations/${id}/match`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [reconciliationType.reconciliation],
    }),

    createPostingFromStatement: builder.mutation<any, { headId: string; body: any }>({
      query: ({ headId, body }) => ({
        url: `/v1/finance/reconciliations/by-head/${headId}/post-statement`,
        method: 'POST',
        body,
      }),
      // Invalidate both reconciliation and posting tags since we are creating a posting
      invalidatesTags: [
        reconciliationType.reconciliation,
        'AccountPosting' as any,
        'AccountHead' as any,
      ],
    }),

    /** Download receipt PDF for reconciliation item */
    downloadReconciliationReceiptPdf: builder.mutation<Blob, { receiptId: string }>({
      query: ({ receiptId }) => ({
        url: `/v1/finance/receipts/${receiptId}/pdf`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetReconciliationListQuery,
  useGetReconciliationTabCountsQuery,
  useApproveReconciliationMutation,
  useRejectReconciliationMutation,
  useDownloadReconciliationReceiptPdfMutation,
  useGetReconciliationByHeadQuery,
  useMatchTransactionMutation,
  useCreatePostingFromStatementMutation,
} = ReconciliationApi;
