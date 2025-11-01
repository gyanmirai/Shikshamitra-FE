import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import calendarData from '../../../calendarData.json'; // mock JSON file

const isDev = process.env.NODE_ENV === 'development';

export const calendarModuleApi = createApi({
  reducerPath: 'calendarModuleApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        switch (url) {
          case '/employeeData':
            return { data: calendarData.employeeData };
          default:
            return {
              error: {
                status: 404,
                data: 'No mock data found for this calendar route',
              },
            };
        }
      },
  tagTypes: ['Employee', 'Users'],
  endpoints: () => ({}),
});
