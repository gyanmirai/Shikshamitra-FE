import { communicationApi } from '../communicationApi';

export const eventAnnouncementApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getEventAnnouncements: builder.query({
      query: () => ({
        url: '/eventData',
        method: 'GET',
      }),
      providesTags: ['EventAnnouncement'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetEventAnnouncementsQuery } = eventAnnouncementApi;
