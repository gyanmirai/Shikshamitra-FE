import { communicationApi } from '../communicationApi';

export const classWiseAnnouncementApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getClassWiseAnnouncements: builder.query({
      query: () => ({
        url: '/classWiseAnnouncementData',
        method: 'GET',
      }),
      providesTags: ['ClassWiseAnnouncement'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetClassWiseAnnouncementsQuery } = classWiseAnnouncementApi;
