import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../financeModuleApi';

export const concessionManagementApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    createConcessionRequest: builder.mutation({
      query: (body) => ({
        url: '/concession-request',
        method: 'POST',
        body,
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    updateConcessionRequest: builder.mutation({
      query: ({ concessionRequestId, ...body }) => ({
        url: `/concession-request/${concessionRequestId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    getBasicDetails: builder.query({
      query: (concessionRequestId) => ({
        url: `/concession-request/basic-details/${concessionRequestId}`,
        method: 'GET',
      }),
      providesTags: [financeModuleType.concessionRequest],
    }),

    getConcessionRequestById: builder.query({
      query: (concessionRequestId) => ({
        url: `/concession-request/${concessionRequestId}`,
        method: 'GET',
      }),
      providesTags: [financeModuleType.concessionRequest],
    }),

    getConcessionRequestValueEntries: builder.query({
      query: (concessionRequestId) => ({
        url: `/concession-request/${concessionRequestId}/value-entries`,
        method: 'GET',
      }),
      providesTags: [financeModuleType.concessionRequest],
    }),

    getConcessionRequestFeeHeads: builder.query({
      query: (concessionRequestId) => ({
        url: `/concession-request/${concessionRequestId}/fee-heads`,
        method: 'GET',
      }),
      providesTags: [financeModuleType.concessionRequest],
    }),

    // kept for backward compatibility if needed, otherwise can be removed
    saveConcessionTypes: builder.mutation({
      query: ({ concessionRequestId, concessionTypeIds }) => ({
        url: `/concession-request/${concessionRequestId}/concession-types`,
        method: 'PUT',
        data: { concessionTypeIds },
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    updateFeeHeadfeeHeadsData: builder.mutation({
      query: ({ concessionRequestId, feeHeadsData }) => ({
        url: `/concession-request/${concessionRequestId}/fee-heads`,
        method: 'PUT',
        data: { feeHeadsData },
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    updateValueEntry: builder.mutation({
      query: ({ concessionRequestId, concessionTypeValues }) => ({
        url: `/concession-request/${concessionRequestId}/value-entry`,
        method: 'PUT',
        data: { concessionTypeValues },
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    uploadDocuments: builder.mutation({
      query: ({ concessionRequestId, concessionTypeDocuments }) => ({
        url: `/concession-request/${concessionRequestId}/document-upload`,
        method: 'PUT',
        data: { concessionTypeDocuments },
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    getStudentConcessionRequests: builder.query({
      query: ({ studentId, ...params }) => ({
        url: `/concession-request/students/${studentId}`,
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.concessionRequest],
    }),

    getStudentConcessionDetails: builder.query({
      query: ({ studentId, ...params }) => ({
        url: `/concession-request/students/${studentId}`,
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.concessionRequest],
    }),

    approveConcessionRequest: builder.mutation({
      query: ({ studentConcessionTypeRequestId, body }) => ({
        url: `/concession-request/${studentConcessionTypeRequestId}/approve`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    rejectConcessionRequest: builder.mutation({
      query: ({ studentConcessionTypeRequestId, body }) => ({
        url: `/concession-request/${studentConcessionTypeRequestId}/reject`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    getConcessionApplications: builder.query({
      query: (params) => ({
        url: '/concession-request',
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.concessionRequest],
    }),

    deleteConcessionApplication: builder.mutation({
      query: (studentConcessionTypeRequestId) => ({
        url: `/concession-request/${studentConcessionTypeRequestId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    cancelConcessionRequest: builder.mutation({
      query: ({ studentConcessionTypeRequestId, body }) => ({
        url: `/concession-request/${studentConcessionTypeRequestId}/cancel`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateConcessionRequestMutation,
  useUpdateConcessionRequestMutation,
  useGetBasicDetailsQuery,
  useSaveConcessionTypesMutation,
  useUpdateFeeHeadfeeHeadsDataMutation,
  useUpdateValueEntryMutation,
  useUploadDocumentsMutation,
  useGetStudentConcessionRequestsQuery,
  useGetStudentConcessionDetailsQuery,
  useApproveConcessionRequestMutation,
  useRejectConcessionRequestMutation,
  useGetConcessionApplicationsQuery,
  useDeleteConcessionApplicationMutation,
  useGetConcessionRequestByIdQuery,
  useGetConcessionRequestValueEntriesQuery,
  useGetConcessionRequestFeeHeadsQuery,
  useCancelConcessionRequestMutation,
} = concessionManagementApi;
