import { financeModuleApi } from '../financeModuleApi';

export const concessionManagementApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    createConcessionRequest: builder.mutation({
      query: (body) => ({
        url: '/concession-request',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['ConcessionRequest'],
    }),

    getBasicDetails: builder.query({
      query: (concessionRequestId) => ({
        url: `/concession-request/basic-details/${concessionRequestId}`,
        method: 'GET',
      }),
      providesTags: ['ConcessionRequest'],
    }),

    // kept for backward compatibility if needed, otherwise can be removed
    saveConcessionTypes: builder.mutation({
      query: ({ concessionRequestId, concessionTypeIds }) => ({
        url: `/concession-request/${concessionRequestId}/concession-types`,
        method: 'PUT',
        data: { concessionTypeIds },
      }),
      invalidatesTags: ['ConcessionRequest'],
    }),

    updateFeeHeadfeeHeadsData: builder.mutation({
      query: ({ concessionRequestId, feeHeadsData }) => ({
        url: `/concession-request/${concessionRequestId}/fee-heads`,
        method: 'PUT',
        data: { feeHeadsData },
      }),
      invalidatesTags: ['ConcessionRequest'],
    }),

    updateValueEntry: builder.mutation({
      query: ({ concessionRequestId, concessionTypeValues }) => ({
        url: `/concession-request/${concessionRequestId}/value-entry`,
        method: 'PUT',
        data: { concessionTypeValues },
      }),
      invalidatesTags: ['ConcessionRequest'],
    }),

    uploadDocuments: builder.mutation({
      query: ({ concessionRequestId, concessionTypeDocuments }) => ({
        url: `/concession-request/${concessionRequestId}/document-upload`,
        method: 'PUT',
        data: { concessionTypeDocuments },
      }),
      invalidatesTags: ['ConcessionRequest'],
    }),

    getStudentConcessionRequests: builder.query({
      query: ({ studentId, ...params }) => ({
        url: `/concession-request/students/${studentId}`,
        method: 'GET',
        params,
      }),
      providesTags: ['ConcessionRequest'],
    }),

    getStudentConcessionDetails: builder.query({
      query: ({ studentId, ...params }) => ({
        url: `/concession-request/students/${studentId}`,
        method: 'GET',
        params,
      }),
      providesTags: ['ConcessionRequest'],
    }),

    approveConcessionRequest: builder.mutation({
      query: ({ studentConcessionTypeRequestId, body }) => ({
        url: `/concession-request/${studentConcessionTypeRequestId}/approve`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['ConcessionRequest'],
    }),

    rejectConcessionRequest: builder.mutation({
      query: ({ studentConcessionTypeRequestId, body }) => ({
        url: `/concession-request/${studentConcessionTypeRequestId}/reject`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['ConcessionRequest'],
    }),

    getConcessionApplications: builder.query({
      query: (params) => ({
        url: '/concession-request/applications',
        method: 'GET',
        params,
      }),
      providesTags: ['ConcessionRequest'],
    }),

    deleteConcessionApplication: builder.mutation({
      query: (studentConcessionTypeRequestId) => ({
        url: `/concession-request/${studentConcessionTypeRequestId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ConcessionRequest'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateConcessionRequestMutation,
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
} = concessionManagementApi;
