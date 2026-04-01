import { financeModuleApi } from '../financeModuleApi';
import { financeModuleType } from 'src/redux/tagTypes';


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
