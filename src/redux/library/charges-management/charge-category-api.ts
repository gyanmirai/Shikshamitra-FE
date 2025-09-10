import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import libraryData from '../../../../libraryChargeData.json';

const isDev = process.env.NODE_ENV === 'development';

export const libraryChargeCategoryOptionsApi = createApi({
  reducerPath: 'LibraryChargeCategoryOptionsApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/libraryChargeCategory') {
          return { data: libraryData.libraryChargeCategory };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['LibraryChargeCategoryOptions'],
  endpoints: (builder) => ({
    getLibraryChargeCategoryOptions: builder.query({
      query: () => ({
        url: '/libraryChargeCategory',
        method: 'GET',
      }),
      providesTags: ['LibraryChargeCategoryOptions'],
    }),
  }),
});

export const { useGetLibraryChargeCategoryOptionsQuery } = libraryChargeCategoryOptionsApi;
