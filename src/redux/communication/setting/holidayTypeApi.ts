import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import communicationData from '../../../../communicationData.json';

const isDev = process.env.NODE_ENV === 'development';

export const holidayTypeOptionsApi = createApi({
  reducerPath: 'HolidayTypeOptionsApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/holidayTypeData') {
          return { data: communicationData.holidayTypeData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['HolidayTypeOptions'],
  endpoints: (builder) => ({
    getHolidayTypeOptions: builder.query({
      query: () => ({
        url: '/holidayTypeData',
        method: 'GET',
      }),
      providesTags: ['HolidayTypeOptions'],
    }),
  }),
});

export const { useGetHolidayTypeOptionsQuery } = holidayTypeOptionsApi;
