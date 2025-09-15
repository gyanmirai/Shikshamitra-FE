import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import communicationData from '../../../../communicationData.json';

const isDev = process.env.NODE_ENV === 'development';

export const eventAnnouncementApi = createApi({
  reducerPath: 'EventAnnouncementApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/eventData') {
          return { data: communicationData.eventData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['EventAnnouncement'],
  endpoints: (builder) => ({
    getEventAnnouncements: builder.query({
      query: () => ({
        url: '/eventData',
        method: 'GET',
      }),
      providesTags: ['EventAnnouncement'],
    }),
  }),
});

export const { useGetEventAnnouncementsQuery } = eventAnnouncementApi;
