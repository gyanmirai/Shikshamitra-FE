import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import communicationData from '../../../../communicationData.json';

const isDev = process.env.NODE_ENV === 'development';

export const announcementTypeOptionsApi = createApi({
  reducerPath: 'AnnouncementTypeOptionsApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/announcementTypeData') {
          return { data: communicationData.announcementTypeData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['AnnouncementTypeOptions'],
  endpoints: (builder) => ({
    getAnnouncementTypeOptions: builder.query({
      query: () => ({
        url: '/announcementTypeData',
        method: 'GET',
      }),
      providesTags: ['AnnouncementTypeOptions'],
    }),
  }),
});

export const { useGetAnnouncementTypeOptionsQuery } = announcementTypeOptionsApi;
