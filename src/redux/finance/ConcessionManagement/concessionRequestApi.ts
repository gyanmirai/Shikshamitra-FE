import { financeModuleApi } from '../financeModuleApi';

export const concessionRequestApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getConcessionRequests: builder.query({
      query: () => ({
        url: '/concessionRequestData',
        method: 'GET',
      }),
      providesTags: ['ConcessionRequest'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetConcessionRequestsQuery } = concessionRequestApi;
