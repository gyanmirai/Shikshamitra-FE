import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const calendarModuleApi = createApi({
  reducerPath: 'calendarModuleApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`, // adjust base path as needed
  }),
  tagTypes: ['Employee', 'Users', 'EventTypeOptions', 'Events'],
  endpoints: () => ({}),
});
