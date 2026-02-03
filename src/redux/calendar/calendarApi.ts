import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const calendarModuleApi = createApi({
  reducerPath: 'calendarModuleApi',
  baseQuery: axiosBaseQuery({ baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api` }),

  tagTypes: [
    'Employee',
    'Users',
    'Holiday',
    'HolidayType',
    'EventTypeOptions',
    'Events',
    'Groups',
    'GroupDetails',
  ],
  endpoints: () => ({}),
});
