import { financeModuleType, financePolicyType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../financeModuleApi';

import type {
  ApiDataResponse,
  ConcessionListResponse,
  ConcessionDraftCommand,
  ConcessionRequestDetail,
  RejectConcessionCommand,
  ConcessionRequestContext,
  ConcessionRequestPreview,
  ApproveConcessionCommand,
  ReverseConcessionCommand,
  ConcessionApprovalContext,
  ConcessionApprovalPreview,
  ConcessionApprovalResponse,
  ConcessionReversalPreview,
  ConcessionApplicationsResponse,
  PreviewConcessionApprovalCommand,
} from './types';

type PreviewCommand = Pick<
  ConcessionDraftCommand,
  | 'academicYearId'
  | 'studentId'
  | 'studentFeeStructureId'
  | 'concessionPolicyId'
  | 'concessionPolicyVersionId'
  | 'concessionTypeId'
  | 'feeHeadConcessions'
  | 'dueFeeConcessions'
>;

type UpdateDraftCommand = ConcessionDraftCommand & {
  concessionRequestId: string;
  concurrencyStamp: string;
};

export const concessionManagementApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    createConcessionRefundRequests: builder.mutation<
      ApiDataResponse<ConcessionRequestDetail>,
      {
        concessionRequestId: string;
        body: { requestConcurrencyStamp: string; idempotencyKey: string };
      }
    >({
      query: ({ concessionRequestId, body }) => ({
        url: `/concession-request/${concessionRequestId}/refund-requests`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [financeModuleType.concessionRequest, financeModuleType.feeRefund],
    }),
    getConcessionRequestContext: builder.query<
      ConcessionRequestContext,
      {
        academicYearId: string;
        studentId: string;
        studentFeeStructureId?: string;
        concessionTypeId?: string;
        concessionPolicyId?: string;
        concessionPolicyVersionId?: string;
      }
    >({
      query: (params) => ({ url: '/concession-request/context', method: 'GET', params }),
      providesTags: (_result, _error, arg) => [
        { type: financePolicyType.concessionPolicy, id: `year:${arg.academicYearId}` },
      ],
    }),

    createConcessionRequest: builder.mutation<
      ApiDataResponse<ConcessionRequestDetail>,
      ConcessionDraftCommand
    >({
      query: ({ academicYearId, ...body }) => ({
        url: '/concession-request',
        method: 'POST',
        params: { academicYearId },
        body,
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    createConcessionDraft: builder.mutation<
      ApiDataResponse<ConcessionRequestDetail>,
      ConcessionDraftCommand
    >({
      query: ({ academicYearId, ...body }) => ({
        url: '/concession-request/drafts',
        method: 'POST',
        params: { academicYearId },
        body,
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    submitConcessionRequest: builder.mutation<
      ApiDataResponse<ConcessionRequestDetail>,
      {
        concessionRequestId: string;
        concurrencyStamp: string;
        previewFingerprint?: string;
        idempotencyKey?: string;
      }
    >({
      query: ({ concessionRequestId, ...body }) => ({
        url: `/concession-request/${concessionRequestId}/submit`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    previewConcessionRequest: builder.mutation<ConcessionRequestPreview, PreviewCommand>({
      query: ({ academicYearId, ...body }) => ({
        url: '/concession-request/preview',
        method: 'POST',
        params: { academicYearId },
        body,
      }),
    }),

    updateConcessionRequest: builder.mutation<
      ApiDataResponse<ConcessionRequestDetail>,
      UpdateDraftCommand
    >({
      query: ({ concessionRequestId, academicYearId, ...body }) => ({
        url: `/concession-request/${concessionRequestId}`,
        method: 'PUT',
        params: { academicYearId },
        body,
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    getConcessionRequestById: builder.query<
      ApiDataResponse<ConcessionRequestDetail>,
      { concessionRequestId: string }
    >({
      query: ({ concessionRequestId }) => ({
        url: `/concession-request/${concessionRequestId}`,
        method: 'GET',
      }),
      providesTags: [financeModuleType.concessionRequest],
    }),

    uploadConcessionDocuments: builder.mutation<
      void,
      {
        concessionRequestId: string;
        documents: ConcessionDraftCommand['documents'];
        concurrencyStamp: string;
        idempotencyKey?: string;
      }
    >({
      query: ({ concessionRequestId, ...body }) => ({
        url: `/concession-request/${concessionRequestId}/documents`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    uploadConcessionDocumentFile: builder.mutation<
      { url: string },
      { concessionTypeId: string; documentId: string; file: File }
    >({
      query: ({ concessionTypeId, documentId, file }) => {
        const body = new FormData();
        body.append('File', file);
        return {
          url: `/concession-request/types/${concessionTypeId}/documents/${documentId}/file`,
          method: 'POST',
          body,
        };
      },
    }),

    getStudentConcessionDetails: builder.query<
      ConcessionListResponse,
      { studentId: string; academicYearId: string; page?: number; pageSize?: number }
    >({
      query: ({ studentId, ...params }) => ({
        url: `/concession-requests/${studentId}`,
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.concessionRequest],
    }),

    getConcessionApprovalContext: builder.query<ConcessionApprovalContext, string>({
      query: (concessionRequestId) => ({
        url: `/concession-request/${concessionRequestId}/approval-context`,
        method: 'GET',
      }),
      providesTags: [financeModuleType.concessionRequest],
    }),

    approveConcessionRequest: builder.mutation<
      ConcessionApprovalResponse,
      { studentConcessionTypeRequestId: string; body: ApproveConcessionCommand }
    >({
      query: ({ studentConcessionTypeRequestId, body }) => ({
        url: `/concession-requests/${studentConcessionTypeRequestId}/approve`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        financeModuleType.concessionRequest,
        financeModuleType.feeRefund,
        financeModuleType.accountPosting,
        financeModuleType.draftPosting,
      ],
    }),

    previewConcessionApproval: builder.mutation<
      ConcessionApprovalPreview,
      { concessionRequestId: string; body: PreviewConcessionApprovalCommand }
    >({
      query: ({ concessionRequestId, body }) => ({
        url: `/concession-requests/${concessionRequestId}/approval-preview`,
        method: 'POST',
        body,
      }),
    }),

    rejectConcessionRequest: builder.mutation<
      unknown,
      { studentConcessionTypeRequestId: string; body: RejectConcessionCommand }
    >({
      query: ({ studentConcessionTypeRequestId, body }) => ({
        url: `/concession-requests/${studentConcessionTypeRequestId}/reject`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    getConcessionApplications: builder.query<
      ConcessionApplicationsResponse,
      Record<string, unknown>
    >({
      query: (params) => ({
        url: '/concession-request/concession-applications',
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.concessionRequest],
    }),

    deleteConcessionApplication: builder.mutation<
      void,
      { concessionRequestId: string; requestConcurrencyStamp: string; idempotencyKey: string }
    >({
      query: ({ concessionRequestId, ...body }) => ({
        url: `/concession-request/${concessionRequestId}`,
        method: 'DELETE',
        body,
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    cancelConcessionRequest: builder.mutation<
      unknown,
      {
        studentConcessionTypeRequestId: string;
        reason: string;
        requestConcurrencyStamp: string;
        idempotencyKey?: string;
      }
    >({
      query: ({ studentConcessionTypeRequestId, ...body }) => ({
        url: `/concession-requests/${studentConcessionTypeRequestId}/cancel`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    reverseConcessionRequest: builder.mutation<
      unknown,
      { concessionRequestId: string; body: ReverseConcessionCommand }
    >({
      query: ({ concessionRequestId, body }) => ({
        url: `/concession-requests/${concessionRequestId}/reverse`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        financeModuleType.concessionRequest,
        financeModuleType.accountPosting,
        financeModuleType.draftPosting,
      ],
    }),

    previewConcessionReversal: builder.mutation<
      ConcessionReversalPreview,
      {
        concessionRequestId: string;
        body: Pick<ReverseConcessionCommand, 'requestConcurrencyStamp' | 'lines'>;
      }
    >({
      query: ({ concessionRequestId, body }) => ({
        url: `/concession-requests/${concessionRequestId}/reversal-preview`,
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateConcessionRefundRequestsMutation,
  useGetConcessionRequestContextQuery,
  useCreateConcessionRequestMutation,
  useCreateConcessionDraftMutation,
  useSubmitConcessionRequestMutation,
  usePreviewConcessionRequestMutation,
  useUpdateConcessionRequestMutation,
  useUploadConcessionDocumentsMutation,
  useUploadConcessionDocumentFileMutation,
  useGetStudentConcessionDetailsQuery,
  useGetConcessionApprovalContextQuery,
  useApproveConcessionRequestMutation,
  usePreviewConcessionApprovalMutation,
  useRejectConcessionRequestMutation,
  useGetConcessionApplicationsQuery,
  useDeleteConcessionApplicationMutation,
  useGetConcessionRequestByIdQuery,
  useCancelConcessionRequestMutation,
  useReverseConcessionRequestMutation,
  usePreviewConcessionReversalMutation,
} = concessionManagementApi;
