import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../financeModuleApi';

export const concessionManagementApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    createConcessionRequest: builder.mutation({
      query: ({ academicYearId, ...body }) => ({
        url: '/concession-request',
        method: 'POST',
        params: { academicYearId },
        body,
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    updateConcessionRequest: builder.mutation({
      query: ({ concessionRequestId, academicYearId, ...body }) => ({
        url: `/concession-request/${concessionRequestId}`,
        method: 'PUT',
        params: { academicYearId },
        body,
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    getConcessionRequestById: builder.query({
      query: ({ concessionRequestId }: { concessionRequestId: string }) => ({
        url: `/concession-request/${concessionRequestId}`,
        method: 'GET',
      }),
      providesTags: [financeModuleType.concessionRequest],
    }),

    uploadConcessionDocuments: builder.mutation({
      query: ({ concessionRequestId, documents }) => ({
        url: `/concession-request/${concessionRequestId}/documents`,
        method: 'PUT',
        body: { documents },
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    uploadConcessionDocumentFile: builder.mutation({
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

    getStudentConcessionDetails: builder.query({
      query: ({ studentId, ...params }) => ({
        url: `/concession-requests/${studentId}`,
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.concessionRequest],
    }),

    getConcessionApprovalContext: builder.query({
      query: (concessionRequestId) => ({
        url: `/concession-request/${concessionRequestId}/approval-context`,
        method: 'GET',
      }),
      providesTags: [financeModuleType.concessionRequest],
    }),

    approveConcessionRequest: builder.mutation({
      query: ({ studentConcessionTypeRequestId, body }) => ({
        url: `/concession-requests/${studentConcessionTypeRequestId}/approve`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        financeModuleType.concessionRequest,
        financeModuleType.accountPosting,
        financeModuleType.draftPosting,
      ],
    }),

    rejectConcessionRequest: builder.mutation({
      query: ({ studentConcessionTypeRequestId, body }) => ({
        url: `/concession-requests/${studentConcessionTypeRequestId}/reject`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    getConcessionApplications: builder.query({
      query: (params) => ({
        url: '/concession-request/concession-applications',
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.concessionRequest],
    }),

    deleteConcessionApplication: builder.mutation({
      query: (concessionRequestId) => ({
        url: `/concession-request/${concessionRequestId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    cancelConcessionRequest: builder.mutation({
      query: (studentConcessionTypeRequestId) => ({
        url: `/concession-requests/${studentConcessionTypeRequestId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateConcessionRequestMutation,
  useUpdateConcessionRequestMutation,
  useUploadConcessionDocumentsMutation,
  useUploadConcessionDocumentFileMutation,
  useGetStudentConcessionDetailsQuery,
  useGetConcessionApprovalContextQuery,
  useApproveConcessionRequestMutation,
  useRejectConcessionRequestMutation,
  useGetConcessionApplicationsQuery,
  useDeleteConcessionApplicationMutation,
  useGetConcessionRequestByIdQuery,
  useCancelConcessionRequestMutation,
} = concessionManagementApi;
