import { api } from 'src/redux/service';
import { outstandingFeeType } from 'src/redux/tagTypes';

import feeCollection from '../../../financeFeeCollection.json';

export const outstandingFeeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOutstandingFees: builder.query({
      query: () => ({
        url: '/outstandingFeeData',
        method: 'GET',
      }),
      providesTags: [outstandingFeeType.outstandingFee],
    }),
  }),
});

export const { useGetOutstandingFeesQuery } = outstandingFeeApi;
