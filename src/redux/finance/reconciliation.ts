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
        if (url === '/overviewData') {
          return { data: reconciliationData.overviewData };
        }
        if (url === '/months') {
          return { data: reconciliationData.months };
        }
        if (url === '/summaryCards') {
          return { data: reconciliationData.summaryCards };
        }
        if (url === '/discrepancy') {
          return { data: reconciliationData.discrepancy };
        }
        if (url === '/bankStatements') {
          return { data: reconciliationData.bankStatements };
        }
        if (url === '/uploadDialog') {
          return { data: reconciliationData.uploadDialog };
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
    getOverviewData: builder.query({
      query: () => ({
        url: '/overviewData',
        method: 'GET',
      }),
      providesTags: ['Reconciliation'],
    }),
    getMonths: builder.query({
      query: () => ({
        url: '/months',
        method: 'GET',
      }),
      providesTags: ['Reconciliation'],
    }),
    getSummaryCards: builder.query({
      query: () => ({
        url: '/summaryCards',
        method: 'GET',
      }),
      providesTags: ['Reconciliation'],
    }),
    getDiscrepancy: builder.query({
      query: () => ({
        url: '/discrepancy',
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
    getUploadDialog: builder.query({
      query: () => ({
        url: '/uploadDialog',
        method: 'GET',
      }),
      providesTags: ['Reconciliation'],
    }),
  }),
});

export const {
  useGetOverviewDataQuery,
  useGetMonthsQuery,
  useGetSummaryCardsQuery,
  useGetDiscrepancyQuery,
  useGetBankStatementsQuery,
  useGetUploadDialogQuery,
} = ReconciliationApi;
