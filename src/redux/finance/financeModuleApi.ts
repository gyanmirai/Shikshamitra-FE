import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import chargesData from '../../../chargesData.json';
import financeData from '../../../feeRefundData.json';
import concessionData from '../../../concession.json';

const isDev = process.env.NODE_ENV === 'development';

export const financeModuleApi = createApi({
  reducerPath: 'financeModuleApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        switch (url) {
          case '/chargesData':
            return { data: chargesData.chargesData };
          case '/feeRefundData':
            return { data: financeData.feeRefundData };
          case '/concessionData':
            return { data: concessionData.concessionData };
          default:
            return {
              error: {
                status: 404,
                data: 'No mock data found for this route',
              },
            };
        }
      },
  tagTypes: ['Charges', 'FeeRefund', 'Concession'],
  endpoints: () => ({}), // inject later
});
