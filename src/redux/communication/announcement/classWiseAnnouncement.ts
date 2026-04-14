import { communicationType } from 'src/redux/tagTypes';

import { communicationApi } from '../communicationApi';

export const classWiseAnnouncementApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getClassWiseAnnouncements: builder.query({
      query: () => ({
        url: '/classWiseAnnouncementData',
        method: 'GET',
      }),
      providesTags: [communicationType.classWiseAnnouncement],
    }),
  }),
  overrideExisting: false,
});

export const { useGetClassWiseAnnouncementsQuery } = classWiseAnnouncementApi;
