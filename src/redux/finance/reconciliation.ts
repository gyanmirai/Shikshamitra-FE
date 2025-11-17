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
        if (url === '/cheueDetails') {
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
    getChequeDetails: builder.query({
      query: () => ({
        url: '/chequeDetails',
        method: 'GET',
      }),
      providesTags: ['Reconciliation'],
    }),
    getBankStatements: builder.query({
      query: () => ({
        url: '/bankStatements',
        method: 'GET',
      }),
      providesTags: ['Reconciliation'],
    }),
    getDemandDraft: builder.query({
      query: () => ({
        url: '/demandDraft',
        method: 'GET',
      }),
      providesTags: ['Reconciliation'],
    }),
    getBankTransfer: builder.query({
      query: () => ({
        url: '/bankTransferData',
        method: 'GET',
      }),
      providesTags: ['Reconciliation'],
    }),
    getCreditCard: builder.query({
      query: () => ({
        url: '/creditCardData',
        method: 'GET',
      }),
      providesTags: ['Reconciliation'],
    }),
    getUpi: builder.query({
      query: () => ({
        url: '/upiData',
        method: 'GET',
      }),
      providesTags: ['Reconciliation'],
    }),

    getOnlineGateway: builder.query({
      query: () => ({
        url: '/onlineGatewayData',
        method: 'GET',
      }),
      providesTags: ['Reconciliation'],
    }),
    getWallet: builder.query({
      query: () => ({
        url: '/walletData',
        method: 'GET',
      }),
      providesTags: ['Reconciliation'],
    }),
  }),
});

export const {
  useGetChequeDetailsQuery,
  useGetBankStatementsQuery,
  useGetDemandDraftQuery,
  useGetBankTransferQuery,
  useGetUpiQuery,
  useGetCreditCardQuery,
  useGetOnlineGatewayQuery,
  useGetWalletQuery,
} = ReconciliationApi;
