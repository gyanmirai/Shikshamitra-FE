import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import reconciliationData from '../../json/finance/reconicilation/reconicilationData.json';

const isDev = process.env.NODE_ENV === 'development';

export const ReconciliationApi = createApi({
  reducerPath: 'ReconciliationApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock routes
        if (url === '/bankStatements') {
          return { data: reconciliationData.bankStatements };
        }
        if (url === '/chequeDetails') {
          return { data: reconciliationData.chequeDetails };
        }
        if (url === '/demandDraft') {
          return { data: reconciliationData.demandDraft };
        }
        if (url === '/bankTransferData') {
          return { data: reconciliationData.bankTransferData };
        }
        if (url === '/creditCardData') {
          return { data: reconciliationData.creditCardData };
        }
        if (url === '/upiData') {
          return { data: reconciliationData.upiData };
        }
        if (url === '/onlineGatewayData') {
          return { data: reconciliationData.onlineGatewayData };
        }
        if (url === '/walletData') {
          return { data: reconciliationData.walletData };
        }

        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['Reconciliation'],
  endpoints: (builder) => ({
    getReconciliationList: builder.query({
      query: ({
        month,
        year,
        paymentMethod,
      }: {
        month: string;
        year: string;
        paymentMethod: string;
      }) => ({
        url: `/finance/reconciliations?month=${month}&year=${year}&paymentMethod=${paymentMethod}`,
        method: 'GET',
      }),
      providesTags: ['Reconciliation'],
    }),
  }),
});

export const { useGetReconciliationListQuery } = ReconciliationApi;
