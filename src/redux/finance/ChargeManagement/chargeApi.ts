import { financeModuleApi } from '../financeModuleApi';

export const chargesApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getCharges: builder.query({
      query: () => ({
        url: '/chargesData',
        method: 'GET',
      }),
      providesTags: ['Charges'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetChargesQuery } = chargesApi;
