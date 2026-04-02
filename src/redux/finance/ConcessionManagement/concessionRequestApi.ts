import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../financeModuleApi';

export const concessionRequestApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getConcessionRequestsList: builder.query({
      query: (params) => ({
        url: '/finance/concessions',
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.concessionRequest],
    }),

    getConcessionRequestById: builder.query({
      query: (concessionRequestId) => ({
        url: `/finance/concessions/${concessionRequestId}`,
        method: 'GET',
      }),
      providesTags: [financeModuleType.concessionRequest],
    }),

    createConcessionRequest: builder.mutation({
      query: (body) => ({
        url: '/finance/concessions',
        method: 'POST',
        body,
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    updateConcessionRequest: builder.mutation({
      query: ({ concessionRequestId, body }) => ({
        url: `/finance/concessions/${concessionRequestId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),

    // approveConcessionRequest: builder.mutation({
    //   query: ({ concessionRequestId, body }) => ({
    //     url: `/finance/concessions/${concessionRequestId}/approve`,
    //     method: 'POST',
    //     body,
    //   }),
    //   invalidatesTags: [financeModuleType.concessionRequest],
    // }),

    // rejectConcessionRequest: builder.mutation({
    //   query: ({ concessionRequestId, body }) => ({
    //     url: `/finance/concessions/${concessionRequestId}/reject`,
    //     method: 'POST',
    //     body,
    //   }),
    //   invalidatesTags: [financeModuleType.concessionRequest],
    // }),

    deleteConcessionRequest: builder.mutation({
      query: (concessionRequestId) => ({
        url: `/finance/concessions/${concessionRequestId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financeModuleType.concessionRequest],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetConcessionRequestsListQuery,
  useGetConcessionRequestByIdQuery,
  useCreateConcessionRequestMutation,
  useUpdateConcessionRequestMutation,
  useDeleteConcessionRequestMutation,
} = concessionRequestApi;
