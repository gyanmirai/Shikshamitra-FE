import { communicationApi } from '../communicationApi';

export const schoolWiseAnnouncementApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getSchoolWiseAnnouncements: builder.query({
      query: () => ({
        url: '/schoolWiseAnnouncementData',
        method: 'GET',
      }),
      providesTags: ['SchoolWiseAnnouncement'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetSchoolWiseAnnouncementsQuery } = schoolWiseAnnouncementApi;
