import { financeModuleApi } from '../financeModuleApi';

export const concessionApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getConcessions: builder.query({
      query: () => ({
        url: '/concessionData',
        method: 'GET',
      }),
      providesTags: ['Concession'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetConcessionsQuery } = concessionApi;
