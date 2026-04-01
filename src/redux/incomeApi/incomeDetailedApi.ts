import { api } from 'src/redux/service';
import { incomeDetailsType } from 'src/redux/tagTypes';

import incomeDetailsData from '../../../financeIncomeData.json'; // your mock JSON


export const incomeDetailsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getIncomeDetails: builder.query({
      query: () => ({
        url: '/detailedIncomeData',
        method: 'GET',
      }),
      providesTags: [incomeDetailsType.incomeDetails],
    }),
  }),
});

export const { useGetIncomeDetailsQuery } = incomeDetailsApi;
