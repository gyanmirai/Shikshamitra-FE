import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import libraryChargesData from '../../../../libraryChargeData.json';

const isDev = process.env.NODE_ENV === 'development';

export const LibraryChargeApi = createApi({
  reducerPath: 'LibraryChargeApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/libraryChargesData') {
          return { data: libraryChargesData.libraryChargesData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['LibraryCharge'],
  endpoints: (builder) => ({
    getLibraryCharges: builder.query({
      query: () => ({
        url: '/libraryChargesData',
        method: 'GET',
      }),
      providesTags: ['LibraryCharge'],
    }),
  }),
});

export const { useGetLibraryChargesQuery } = LibraryChargeApi;
