import { api } from 'src/redux/service';
import { incomeType } from 'src/redux/tagTypes';

import incomeData from '../../../financeIncomeData.json';


export const incomeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getIncomes: builder.query({
      query: () => ({
        url: '/incomeData',
        method: 'GET',
      }),
      providesTags: [incomeType.income],
    }),
    getIncomePaymentMethodsConfig: builder.query({
      query: () => ({
        url: '/paymentMethodsConfig',
        method: 'GET',
      }),
      providesTags: [incomeType.paymentMethodsConfig],
    }),
  }),
});

export const { useGetIncomesQuery, useGetIncomePaymentMethodsConfigQuery } = incomeApi;
