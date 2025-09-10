import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import communicationData from '../../../../communicationData.json';

const isDev = process.env.NODE_ENV === 'development';

export const classWiseAnnouncementApi = createApi({
  reducerPath: 'ClassWiseAnnouncementApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/classWiseAnnouncementData') {
          return { data: communicationData.classWiseAnnouncementData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['ClassWiseAnnouncement'],
  endpoints: (builder) => ({
    getClassWiseAnnouncements: builder.query({
      query: () => ({
        url: '/classWiseAnnouncementData',
        method: 'GET',
      }),
      providesTags: ['ClassWiseAnnouncement'],
    }),
  }),
});

export const { useGetClassWiseAnnouncementsQuery } = classWiseAnnouncementApi;
