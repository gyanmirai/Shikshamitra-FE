import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';
import chargeCategoryData from 'src/json/finance/settings/charges/chargeCategoryData.json';

const isDev = process.env.NODE_ENV === 'development';

export const ChargeCategoryApi = createApi({
  reducerPath: 'ChargeCategoryApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock routes
        if (url === '/chargeCategories') {
          return { data: chargeCategoryData.chargeCategories };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['charge-category'],
  endpoints: (builder) => ({
    getChargeCategory: builder.query({
      query: () => ({
        url: '/chargeCategories',
        method: 'GET',
      }),
      providesTags: ['charge-category'],
    }),
  }),
});

export const { useGetChargeCategoryQuery } = ChargeCategoryApi;
