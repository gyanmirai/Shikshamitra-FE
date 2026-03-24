import { financeModuleApi } from '../financeModuleApi';

export const concessionRequestApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getConcessionRequestsList: builder.query({
      query: (params) => ({
        url: '/finance/concessions',
        method: 'GET',
        params,
      }),
      providesTags: ['ConcessionRequest'],
    }),

    getConcessionRequestById: builder.query({
      query: (concessionRequestId) => ({
        url: `/finance/concessions/${concessionRequestId}`,
        method: 'GET',
      }),
      providesTags: ['ConcessionRequest'],
    }),

    createConcessionRequest: builder.mutation({
      query: (body) => ({
        url: '/finance/concessions',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['ConcessionRequest'],
    }),

    updateConcessionRequest: builder.mutation({
      query: ({ concessionRequestId, body }) => ({
        url: `/finance/concessions/${concessionRequestId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['ConcessionRequest'],
    }),

    // approveConcessionRequest: builder.mutation({
    //   query: ({ concessionRequestId, body }) => ({
    //     url: `/finance/concessions/${concessionRequestId}/approve`,
    //     method: 'POST',
    //     data: body,
    //   }),
    //   invalidatesTags: ['ConcessionRequest'],
    // }),

    // rejectConcessionRequest: builder.mutation({
    //   query: ({ concessionRequestId, body }) => ({
    //     url: `/finance/concessions/${concessionRequestId}/reject`,
    //     method: 'POST',
    //     data: body,
    //   }),
    //   invalidatesTags: ['ConcessionRequest'],
    // }),

    deleteConcessionRequest: builder.mutation({
      query: (concessionRequestId) => ({
        url: `/finance/concessions/${concessionRequestId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ConcessionRequest'],
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
