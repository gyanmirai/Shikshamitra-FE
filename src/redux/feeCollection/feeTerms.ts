import { api } from 'src/redux/service';
import { feeTermsType } from 'src/redux/tagTypes';

export const feeTermsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFeeTerms: builder.query({
      query: () => ({
        url: '/terms',
        method: 'GET',
      }),
      providesTags: [feeTermsType.feeTerms],
    }),
  }),
});

export const { useGetFeeTermsQuery } = feeTermsApi;
