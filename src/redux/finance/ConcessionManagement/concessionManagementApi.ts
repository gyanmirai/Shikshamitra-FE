import { financeModuleApi } from '../financeModuleApi';

export const concessionManagementApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    createBasicDetails: builder.mutation({
      query: (body) => ({
        url: '/concession-request/basic-details',
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
        url: `/concession-requests/${concessionRequestId}/feeHeadsData`,
        method: 'PUT',
        data: { feeHeadsData },
      }),
      invalidatesTags: ['ConcessionRequest'],
    }),

    updateValueEntry: builder.mutation({
      query: ({ concessionRequestId, concessionTypeValues }) => ({
        url: `/concession-requests/${concessionRequestId}/value-entry`,
        method: 'PUT',
        data: { concessionTypeValues },
      }),
      invalidatesTags: ['ConcessionRequest'],
    }),

    getStudentConcessionRequests: builder.query({
      query: ({ studentId, ...params }) => ({
        url: `/concession-requests/${studentId}`,
        method: 'GET',
        params,
      }),
      providesTags: ['ConcessionRequest'],
    }),

    getStudentConcessionDetails: builder.query({
      query: ({ studentId, ...params }) => ({
        url: `/concession-requests/${studentId}`,
        method: 'GET',
        params,
      }),
      providesTags: ['ConcessionRequest'],
    }),

    approveConcessionRequest: builder.mutation({
      query: ({ studentConcessionTypeRequestId, body }) => ({
        url: `/concession-requests/${studentConcessionTypeRequestId}/approve`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['ConcessionRequest'],
    }),

    rejectConcessionRequest: builder.mutation({
      query: ({ studentConcessionTypeRequestId, body }) => ({
        url: `/concession-requests/${studentConcessionTypeRequestId}/reject`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['ConcessionRequest'],
    }),

    getConcessionApplications: builder.query({
      query: (params) => ({
        url: '/concession-applications',
        method: 'GET',
        params,
      }),
      providesTags: ['ConcessionRequest'],
    }),

    deleteConcessionApplication: builder.mutation({
      query: (studentConcessionTypeRequestId) => ({
        url: `/concession-requests/delete-concession/${studentConcessionTypeRequestId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ConcessionRequest'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateBasicDetailsMutation,
  useGetBasicDetailsQuery,
  useSaveConcessionTypesMutation,
  useUpdateFeeHeadfeeHeadsDataMutation,
  useUpdateValueEntryMutation,
  useGetStudentConcessionRequestsQuery,
  useGetStudentConcessionDetailsQuery,
  useApproveConcessionRequestMutation,
  useRejectConcessionRequestMutation,
  useGetConcessionApplicationsQuery,
  useDeleteConcessionApplicationMutation,
} = concessionManagementApi;
