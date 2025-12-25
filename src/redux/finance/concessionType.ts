import { financeModuleApi } from './financeModuleApi';

export const concessionTypeApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getConcessionTypes: builder.query({
      query: () => ({
        url: '/concessionTypeData',
        method: 'GET',
      }),
      providesTags: ['Concession-Type'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetConcessionTypesQuery } = concessionTypeApi;
