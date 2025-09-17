import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import communicationData from '../../../../communicationData.json';

const isDev = process.env.NODE_ENV === 'development';

export const meetingDetailsApi = createApi({
  reducerPath: 'MeetingDetailsApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/meetingData') {
          return { data: communicationData.meetingData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['MeetingDetails'],
  endpoints: (builder) => ({
    getMeetingDetails: builder.query({
      query: () => ({
        url: '/meetingData',
        method: 'GET',
      }),
      providesTags: ['MeetingDetails'],
    }),
  }),
});

export const { useGetMeetingDetailsQuery } = meetingDetailsApi;
