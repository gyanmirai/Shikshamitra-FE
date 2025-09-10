import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import settingsData from '../../json/library/settingsData.json';

const isDev = process.env.NODE_ENV === 'development';

export const librarySettingsApi = createApi({
  reducerPath: 'LibrarySettingsApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/librarySettingsData') {
          return { data: settingsData.librarySettingsData };
        }
        if (url === '/libraryTimingData') {
          return { data: settingsData.libraryTimingData };
        }
        if (url === '/borrowingReturnRulesData') {
          return { data: settingsData.borrowingReturnRulesData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['LibrarySettings'],
  endpoints: (builder) => ({
    getLibrarySettings: builder.query({
      query: () => ({
        url: '/librarySettingsData',
        method: 'GET',
      }),
      providesTags: ['LibrarySettings'],
    }),
    getLibraryTiming: builder.query({
      query: () => ({
        url: '/libraryTimingData',
        method: 'GET',
      }),
      providesTags: ['LibrarySettings'],
    }),
    getBorrowingReturnRules: builder.query({
      query: () => ({
        url: '/borrowingReturnRulesData',
        method: 'GET',
      }),
      providesTags: ['LibrarySettings'],
    }),
  }),
});

export const {
  useGetLibrarySettingsQuery,
  useGetLibraryTimingQuery,
  useGetBorrowingReturnRulesQuery,
} = librarySettingsApi;
