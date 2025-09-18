import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import communicationData from '../../../../communicationData.json';

const isDev = process.env.NODE_ENV === 'development';

export const importanceLevelOptionsApi = createApi({
  reducerPath: 'ImportanceLevelOptionsApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/importanceLevelData') {
          return { data: communicationData.importanceLevelData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['ImportanceLevelOptions'],
  endpoints: (builder) => ({
    getImportanceLevelOptions: builder.query({
      query: () => ({
        url: '/importanceLevelData',
        method: 'GET',
      }),
      providesTags: ['ImportanceLevelOptions'],
    }),
  }),
});

export const { useGetImportanceLevelOptionsQuery } = importanceLevelOptionsApi;
