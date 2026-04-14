import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../financeModuleApi';

export const concessionApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getConcessions: builder.query({
      query: () => ({
        url: '/concessionData',
        method: 'GET',
      }),
      providesTags: [financeModuleType.concession],
    }),
  }),
  overrideExisting: false,
});

export const { useGetConcessionsQuery } = concessionApi;
