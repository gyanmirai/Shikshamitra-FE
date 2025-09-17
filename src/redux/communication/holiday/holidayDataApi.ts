import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import communicationData from '../../../../communicationData.json'; // your mock holiday JSON file

const isDev = process.env.NODE_ENV === 'development';

export const holidayApi = createApi({
  reducerPath: 'HolidayApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/holidayData') {
          return { data: communicationData.holidayData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['holiday'],
  endpoints: (builder) => ({
    getHolidays: builder.query({
      query: () => ({
        url: '/holidayData',
        method: 'GET',
      }),
      providesTags: ['holiday'],
    }),
  }),
});

export const { useGetHolidaysQuery } = holidayApi;
