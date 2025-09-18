import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import communicationData from '../../../../communicationData.json';

const isDev = process.env.NODE_ENV === 'development';

export const meetingTypeOptionsApi = createApi({
  reducerPath: 'MeetingTypeOptionsApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/meetingTypeData') {
          return { data: communicationData.meetingTypeData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['MeetingTypeOptions'],
  endpoints: (builder) => ({
    getMeetingTypeOptions: builder.query({
      query: () => ({
        url: '/meetingTypeData',
        method: 'GET',
      }),
      providesTags: ['MeetingTypeOptions'],
    }),
  }),
});

export const { useGetMeetingTypeOptionsQuery } = meetingTypeOptionsApi;
