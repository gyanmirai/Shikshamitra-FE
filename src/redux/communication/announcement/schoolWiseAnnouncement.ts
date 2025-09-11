import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import communicationData from '../../../../communicationData.json';

const isDev = process.env.NODE_ENV === 'development';

export const schoolWiseAnnouncementApi = createApi({
  reducerPath: 'SchoolWiseAnnouncementApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/schoolWiseAnnouncementData') {
          return { data: communicationData.schoolWiseAnnouncementData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['SchoolWiseAnnouncement'],
  endpoints: (builder) => ({
    getSchoolWiseAnnouncements: builder.query({
      query: () => ({
        url: '/schoolWiseAnnouncementData',
        method: 'GET',
      }),
      providesTags: ['SchoolWiseAnnouncement'],
    }),
  }),
});

export const { useGetSchoolWiseAnnouncementsQuery } = schoolWiseAnnouncementApi;
