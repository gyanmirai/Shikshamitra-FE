import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import communicationData from '../../../../communicationData.json';

const isDev = process.env.NODE_ENV === 'development';

export const eventTypeOptionsApi = createApi({
  reducerPath: 'EventTypeOptionsApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/eventTypeData') {
          return { data: communicationData.eventTypeData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['EventTypeOptions'],
  endpoints: (builder) => ({
    getEventTypeOptions: builder.query({
      query: () => ({
        url: '/eventTypeData',
        method: 'GET',
      }),
      providesTags: ['EventTypeOptions'],
    }),
  }),
});

export const { useGetEventTypeOptionsQuery } = eventTypeOptionsApi;
